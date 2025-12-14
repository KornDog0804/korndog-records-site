// ================== KORNDOG SCRIPT (SHOP + CART) ==================
// - Uses ONLY products.json2 (never products.json)
// - Pagination + scroll-to-top fix
// - Shipping: $7.99 up to 3 records, then $0.50 per record after that
// - Discounts:
//    1) 3 for $25 => any record priced EXACTLY $10 (by quantity)
//    2) 10% off $130+ => PREMIUM tier subtotal only (doesn't apply to $10 items)
// - PayPal submits correct totals using discount_amount_cart
// ================================================================

const CART_KEY = "korndog_cart_v1";
const PRODUCTS_PER_PAGE = 10;

// 🔥 LOCKED: never products.json, never product.json
const PRODUCTS_FILE = "./products.json2";

let allProducts = [];
let currentPage = 1;

// ----------------------- UTIL: SHUFFLE ----------------------------
function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// -------------------- LOAD PRODUCTS + QUANTITY --------------------
async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_FILE, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to load products.json2");
      allProducts = [];
      return [];
    }

    const raw = await res.json();
    if (!Array.isArray(raw)) {
      console.error("products.json2 is not an array");
      allProducts = [];
      return [];
    }

    // NOTE: We do NOT hide available=false here automatically,
    // because YOU decide what’s live from your admin / data.
    // If you want to hide sold items, set available:false in the JSON.

    const mapped = raw.map((p) => {
      // default quantity to 1 if missing
      const qty = typeof p.quantity === "number" ? p.quantity : 1;

      // normalize tier
      const tier = (p.tier || "premium").toLowerCase();

      // Support legacy fields but keep what you already use
      return {
        ...p,
        quantity: qty,
        tier,
        // make sure front/back fields exist if provided
        imageFront: p.imageFront || (p.images && p.images.front) || p.image || "",
        imageBack: p.imageBack || (p.images && p.images.back) || p.imageFront || p.image || "",
      };
    });

    allProducts = shuffleArray(mapped);
    return allProducts;
  } catch (e) {
    console.error("Failed to load products.json2", e);
    allProducts = [];
    return [];
  }
}

// ------------------------ CART HELPERS ----------------------------
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Cart parse error", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = count;
}

// ---------------------- PRICING RULES -----------------------------
function calcShipping(itemCount) {
  if (itemCount <= 0) return 0;
  if (itemCount <= 3) return 7.99;
  return 7.99 + (itemCount - 3) * 0.5; // ✅ $0.50 after 3
}

// 3 for $25 applies to ANY item priced exactly $10 (by quantity)
function calcTenBundleDiscount(cart) {
  const tenCount = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    return sum + (price === 10 ? qty : 0);
  }, 0);

  const bundles = Math.floor(tenCount / 3);
  // Regular price for 3 items is $30, bundle price is $25 => discount $5 per bundle
  return bundles * 5;
}

// Premium 10% discount only on premium-tier subtotal >= 130,
// and DOES NOT apply to $10 items (those are bundle-eligible)
function calcPremiumDiscount(cart) {
  const premiumSubtotal = cart.reduce((sum, item) => {
    const tier = String(item.tier || "premium").toLowerCase();
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;

    // Exclude $10 items from premium discount
    if (price === 10) return sum;

    // Only premium tier counts
    if (tier !== "premium") return sum;

    return sum + price * qty;
  }, 0);

  if (premiumSubtotal >= 130) return premiumSubtotal * 0.1;
  return 0;
}

// ----------------------- ADD TO CART ------------------------------
function addToCart(productId) {
  if (!allProducts || allProducts.length === 0) return;

  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  // If a product is marked available:false, don’t add it
  if (product.available === false) {
    alert("That record is not available right now.");
    return;
  }

  const maxQty = typeof product.quantity === "number" ? product.quantity : 1;

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    if ((Number(existing.qty) || 0) >= maxQty) {
      alert(
        maxQty === 1
          ? "You only have 1 copy of this record in stock."
          : `You only have ${maxQty} copies of this record in stock.`
      );
      return;
    }
    existing.qty += 1;
  } else {
    const imageForCart =
      product.imageFront || product.image || product.imageBack || "";

    cart.push({
      id: product.id,
      title: product.title,
      artist: product.artist || "",
      price: Number(product.price || 0),
      grade: product.grade || "",
      tier: (product.tier || "premium").toLowerCase(),
      image: imageForCart,
      qty: 1,
    });
  }

  saveCart(cart);
  alert("Dropped in the cart.");
}

function clearCart() {
  saveCart([]);
  renderCart();
}

// -------------------- SHOP RENDERING + PAGES ----------------------
async function renderShop() {
  const container = document.getElementById("products");
  if (!container) return; // not on shop page

  if (!allProducts || allProducts.length === 0) {
    await loadProducts();
  }

  currentPage = 1;
  renderShopPage();
}

function renderShopPage() {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;

  // only show items that are NOT explicitly available:false
  const visible = allProducts.filter((p) => p.available !== false);

  const pageProducts = visible.slice(start, end);

  pageProducts.forEach((prod) => {
    const card = document.createElement("div");
    card.className = "record-card";

    // --------- IMAGE FLIP ----------
    const recordImage = document.createElement("div");
    recordImage.className = "record-image";

    const flipWrapper = document.createElement("div");
    flipWrapper.className = "flip-wrapper";

    const flipInner = document.createElement("div");
    flipInner.className = "flip-inner";

    const frontDiv = document.createElement("div");
    frontDiv.className = "flip-front";

    const backDiv = document.createElement("div");
    backDiv.className = "flip-back";

    const frontSrc = prod.imageFront || prod.image || prod.imageBack || "";
    const backSrc = prod.imageBack || prod.imageFront || prod.image || "";

    if (frontSrc) {
      const frontImg = document.createElement("img");
      frontImg.src = frontSrc;
      frontImg.alt = prod.title || prod.id || "Record front";
      frontImg.onerror = () => frontImg.classList.add("image-missing");
      frontDiv.appendChild(frontImg);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "image-missing";
      frontDiv.appendChild(placeholder);
    }

    if (backSrc) {
      const backImg = document.createElement("img");
      backImg.src = backSrc;
      backImg.alt = prod.title || prod.id || "Record back";
      backImg.onerror = () => backImg.classList.add("image-missing");
      backDiv.appendChild(backImg);
    } else {
      const placeholderBack = document.createElement("div");
      placeholderBack.className = "image-missing";
      backDiv.appendChild(placeholderBack);
    }

    flipInner.appendChild(frontDiv);
    flipInner.appendChild(backDiv);
    flipWrapper.appendChild(flipInner);
    recordImage.appendChild(flipWrapper);

    // --------- TEXT ----------
    const title = document.createElement("h3");
    title.textContent = prod.artist
      ? `${prod.artist} – ${prod.title}`
      : (prod.title || prod.id || "Untitled");

    const grade = document.createElement("p");
    grade.className = "record-grade";
    grade.textContent = "Grade: " + (prod.grade || "—");

    const price = document.createElement("p");
    price.className = "record-price";
    price.textContent = "$" + Number(prod.price || 0).toFixed(2);

    const desc = document.createElement("p");
    desc.className = "record-desc";
    desc.textContent = prod.description || "";

    const qtyNote = document.createElement("p");
    qtyNote.className = "qty-text";
    qtyNote.textContent = "Qty available: " + (prod.quantity ?? 1);

    const btn = document.createElement("button");
    btn.textContent = "Add to Cart";
    btn.className = "btn-primary";
    btn.addEventListener("click", () => addToCart(prod.id));

    card.appendChild(recordImage);
    card.appendChild(title);
    card.appendChild(grade);
    card.appendChild(price);
    if (prod.description) card.appendChild(desc);
    card.appendChild(qtyNote);
    card.appendChild(btn);

    container.appendChild(card);
  });

  renderPagination(visible.length);
}

function renderPagination(visibleCount) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  const totalPages = Math.ceil(visibleCount / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      renderShopPage();

      // ✅ FIX: always go back to top on page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pagination.appendChild(btn);
  }
}

// -------------------------- CART RENDERING ------------------------
function renderCart() {
  const container = document.getElementById("cart-items");
  const summaryBox = document.getElementById("cart-summary");
  if (!container || !summaryBox) return; // not on cart page

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Cart is empty. Grab some wax.</p>";
    summaryBox.innerHTML = "";
    updateCartBadge();
    return;
  }

  // Render cart rows
  cart.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "cart-row";

    const info = document.createElement("div");
    info.className = "cart-info";

    const title = document.createElement("p");
    title.className = "cart-title";
    title.textContent =
      (item.artist ? `${item.artist} – ` : "") + (item.title || item.id);

    const grade = document.createElement("p");
    grade.className = "cart-grade";
    grade.textContent = "Grade: " + (item.grade || "—");

    info.appendChild(title);
    info.appendChild(grade);

    const qtyBox = document.createElement("div");
    qtyBox.className = "cart-qty";

    const minus = document.createElement("button");
    minus.textContent = "-";
    minus.addEventListener("click", () => {
      if ((Number(item.qty) || 1) > 1) {
        item.qty -= 1;
      } else {
        cart.splice(index, 1);
      }
      saveCart(cart);
      renderCart();
    });

    const qty = document.createElement("span");
    qty.textContent = item.qty;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.addEventListener("click", () => {
      // Respect max quantity if product list is loaded
      const product = allProducts.find((p) => p.id === item.id);
      const maxQty =
        product && typeof product.quantity === "number" ? product.quantity : 99;

      if ((Number(item.qty) || 0) >= maxQty) {
        alert(
          maxQty === 1
            ? "You only have 1 copy of this record in stock."
            : `You only have ${maxQty} copies of this record in stock.`
        );
        return;
      }

      item.qty += 1;
      saveCart(cart);
      renderCart();
    });

    qtyBox.appendChild(minus);
    qtyBox.appendChild(qty);
    qtyBox.appendChild(plus);

    const linePrice = document.createElement("p");
    linePrice.className = "cart-line-price";
    linePrice.textContent =
      "$" + ((Number(item.price) || 0) * (Number(item.qty) || 0)).toFixed(2);

    row.appendChild(info);
    row.appendChild(qtyBox);
    row.appendChild(linePrice);

    container.appendChild(row);
  });

  // Totals
  const itemCount = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const regularSubtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
    0
  );

  const shipping = calcShipping(itemCount);

  const tenBundleDiscount = calcTenBundleDiscount(cart);
  const premiumDiscount = calcPremiumDiscount(cart);

  const discountTotal = tenBundleDiscount + premiumDiscount;
  const total = regularSubtotal + shipping - discountTotal;

  summaryBox.innerHTML =
    `Subtotal: $${regularSubtotal.toFixed(2)}<br>` +
    `Shipping: $${shipping.toFixed(2)}<br>` +
    `3 for $25 Discount: -$${tenBundleDiscount.toFixed(2)}<br>` +
    `Premium $130+ Discount (10%): -$${premiumDiscount.toFixed(2)}<br>` +
    `<strong>Total: $${total.toFixed(2)}</strong>`;

  const payBtn = document.getElementById("paypal-button");
  if (payBtn) {
    payBtn.onclick = () => submitPayPal(cart, shipping, discountTotal);
  }

  updateCartBadge();
}

// -------------------------- PAYPAL SUBMIT -------------------------
function submitPayPal(cart, shipping, discountTotal) {
  if (!cart || cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const form = document.getElementById("paypal-form");
  if (!form) return;

  // clear
  while (form.firstChild) form.removeChild(form.firstChild);

  const addField = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addField("cmd", "_cart");
  addField("upload", "1");
  addField("business", "titans.rule1215@gmail.com");
  addField("currency_code", "USD");

  // Item lines (regular prices)
  let index = 1;
  cart.forEach((item) => {
    addField(`item_name_${index}`, (item.artist ? `${item.artist} – ` : "") + item.title);
    addField(`amount_${index}`, (Number(item.price) || 0).toFixed(2));
    addField(`quantity_${index}`, String(Number(item.qty) || 1));
    index++;
  });

  // Shipping
  if (shipping > 0) {
    addField("handling_cart", shipping.toFixed(2));
  }

  // Total discount as a single cart discount
  if (discountTotal > 0) {
    addField("discount_amount_cart", discountTotal.toFixed(2));
  }

  form.action = "https://www.paypal.com/cgi-bin/webscr";
  form.method = "post";
  form.submit();
}

// ----------------------------- INIT -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Fix annoying "page 2 stays at bottom" behavior on load
  window.scrollTo(0, 0);

  updateCartBadge();

  // Load products once so cart qty limits work too
  await loadProducts();

  // Only run what exists on that page
  renderShop();
  renderCart();
});
