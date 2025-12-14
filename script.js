// ================== KORNDOG SCRIPT (SHOP + CART) ==================
// - Uses ONLY products.json2
// - All records default to quantity 1 (10 Dolla Holla defaults to 3)
// - Shop paginated
// - Cart respects quantity limits
// - Shipping: 7.99 up to 3, then +0.50 per additional
// - Discounts:
//    * 3-for-$25 bundle for tier === "tenbin" (never increases price)
//    * 10% off orders $130+ (after bundle)
// - Supports artist + title, and front/back flip images
// ================================================================

const CART_KEY = "korndog_cart_v1";
const PRODUCTS_PER_PAGE = 10;

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

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

// -------------------- LOAD PRODUCTS + QUANTITY --------------------
async function loadProducts() {
  try {
    const res = await fetch("./products.json2", { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to load products.json2");
      allProducts = [];
      return [];
    }

    const raw = await res.json();
    if (!Array.isArray(raw)) {
      console.error("products.json2 must be an array");
      allProducts = [];
      return [];
    }

    const mapped = raw.map((p) => {
      // Ensure quantity exists
      let qty = typeof p.quantity === "number" ? p.quantity : 1;

      const id = String(p.id || "").toLowerCase();
      const title = String(p.title || "").toLowerCase();

      // 10 Dolla Holla defaults to 3 available
      if (id.includes("ten-dolla-holla") || id.includes("10-dolla") || title.includes("10 dolla holla")) {
        qty = typeof p.quantity === "number" ? p.quantity : 3;
      }

      // Normalize tier
      const tier = (p.tier || "premium").toLowerCase();

      // Normalize image fields
      const imageFront = p.imageFront || (p.images && p.images.front) || p.image || "";
      const imageBack = p.imageBack || (p.images && p.images.back) || imageFront || p.image || "";

      return {
        ...p,
        tier,
        quantity: qty,
        imageFront,
        imageBack,
        images: { front: imageFront, back: imageBack },
        price: safeNumber(p.price, 0),
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
  const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = count;
}

// ----------------- SHIPPING + DISCOUNT RULES ----------------------
function calcShipping(itemCount) {
  if (itemCount <= 0) return 0;
  if (itemCount <= 3) return 7.99;
  return 7.99 + (itemCount - 3) * 0.5;
}

// 3-for-25 on tier tenbin — DISCOUNT ONLY (never increases price)
function calcTenBinBundleDiscount(cart) {
  // Expand prices for tenbin items by qty
  const tenbinUnitPrices = [];

  cart.forEach((item) => {
    if ((item.tier || "").toLowerCase() !== "tenbin") return;
    const unitPrice = safeNumber(item.price, 0);
    const qty = Math.max(0, parseInt(item.qty || 0, 10));
    for (let i = 0; i < qty; i++) tenbinUnitPrices.push(unitPrice);
  });

  if (tenbinUnitPrices.length < 3) return 0;

  // Sort descending to maximize customer discount fairness
  tenbinUnitPrices.sort((a, b) => b - a);

  let discount = 0;
  for (let i = 0; i + 2 < tenbinUnitPrices.length; i += 3) {
    const sum3 = tenbinUnitPrices[i] + tenbinUnitPrices[i + 1] + tenbinUnitPrices[i + 2];
    const bundlePrice = Math.min(25, sum3); // never increase
    discount += Math.max(0, sum3 - bundlePrice);
  }

  return Number(discount.toFixed(2));
}

function calcTenPercentDiscount(subtotalAfterBundle) {
  return subtotalAfterBundle >= 130 ? subtotalAfterBundle * 0.1 : 0;
}

// -------------------- SHOP RENDERING + PAGES ----------------------
async function renderShop() {
  const container = document.getElementById("products");
  if (!container) return;

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
  const pageProducts = allProducts.slice(start, end);

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
    title.textContent = prod.artist ? `${prod.artist} – ${prod.title}` : (prod.title || prod.id || "Untitled");

    const grade = document.createElement("p");
    grade.className = "record-grade";
    grade.textContent = "Grade: " + (prod.grade || "—");

    const price = document.createElement("p");
    price.className = "record-price";
    price.textContent = "$" + safeNumber(prod.price, 0).toFixed(2);

    const tier = document.createElement("p");
    tier.className = "record-tier";
    tier.textContent = (prod.tier === "tenbin") ? "Tier: $10 BIN (3 for $25)" : ("Tier: " + (prod.tier || "premium").toUpperCase());

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

    // assemble card
    card.appendChild(recordImage);
    card.appendChild(title);
    card.appendChild(grade);
    card.appendChild(price);
    card.appendChild(tier);
    if (prod.description) card.appendChild(desc);
    card.appendChild(qtyNote);
    card.appendChild(btn);

    container.appendChild(card);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      renderShopPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pagination.appendChild(btn);
  }
}

// ------------------------ ADD TO CART -----------------------------
function addToCart(productId) {
  if (!allProducts || allProducts.length === 0) return;

  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const maxQty = typeof product.quantity === "number" ? product.quantity : 1;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    if (existing.qty >= maxQty) {
      alert(maxQty === 1 ? "Only 1 copy in stock." : `Only ${maxQty} copies in stock.`);
      return;
    }
    existing.qty += 1;
  } else {
    const imageForCart = product.imageFront || product.image || product.imageBack || "";
    cart.push({
      id: product.id,
      artist: product.artist || "",
      title: product.title || product.id,
      price: safeNumber(product.price, 0),
      grade: product.grade || "",
      image: imageForCart,
      tier: product.tier || "premium",
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

// -------------------------- CART RENDERING ------------------------
function renderCart() {
  const container = document.getElementById("cart-items");
  const summaryBox = document.getElementById("cart-summary");
  if (!container || !summaryBox) return;

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Cart is empty. Grab some wax.</p>";
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-row";

      const info = document.createElement("div");
      info.className = "cart-info";

      const title = document.createElement("p");
      title.className = "cart-title";
      title.textContent = (item.artist ? item.artist + " – " : "") + (item.title || item.id);

      const grade = document.createElement("p");
      grade.className = "cart-grade";
      grade.textContent = "Grade: " + (item.grade || "—");

      const tier = document.createElement("p");
      tier.className = "cart-tier";
      tier.textContent = "Tier: " + ((item.tier || "premium").toUpperCase());

      info.appendChild(title);
      info.appendChild(grade);
      info.appendChild(tier);

      const qtyBox = document.createElement("div");
      qtyBox.className = "cart-qty";

      const minus = document.createElement("button");
      minus.textContent = "-";
      minus.addEventListener("click", () => {
        if (item.qty > 1) item.qty -= 1;
        else cart.splice(index, 1);
        saveCart(cart);
        renderCart();
      });

      const qty = document.createElement("span");
      qty.textContent = item.qty;

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.addEventListener("click", () => {
        const product = allProducts.find((p) => p.id === item.id);
        const maxQty = product && typeof product.quantity === "number" ? product.quantity : 1;

        if (item.qty >= maxQty) {
          alert(maxQty === 1 ? "Only 1 copy in stock." : `Only ${maxQty} copies in stock.`);
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
      linePrice.textContent = "$" + (safeNumber(item.price, 0) * item.qty).toFixed(2);

      row.appendChild(info);
      row.appendChild(qtyBox);
      row.appendChild(linePrice);

      container.appendChild(row);
    });
  }

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  const subtotalRaw = cart.reduce((sum, item) => sum + safeNumber(item.price, 0) * (item.qty || 0), 0);
  const bundleDiscount = calcTenBinBundleDiscount(cart);
  const subtotalAfterBundle = Math.max(0, subtotalRaw - bundleDiscount);

  const tenPercentDiscount = calcTenPercentDiscount(subtotalAfterBundle);
  const totalDiscount = bundleDiscount + tenPercentDiscount;

  const shipping = calcShipping(itemCount);
  const total = subtotalAfterBundle + shipping - tenPercentDiscount;

  summaryBox.innerHTML =
    `Subtotal: $${subtotalRaw.toFixed(2)}<br>` +
    (bundleDiscount > 0 ? `3-for-$25 Bundle Savings: -$${bundleDiscount.toFixed(2)}<br>` : "") +
    `Shipping: $${shipping.toFixed(2)}<br>` +
    (tenPercentDiscount > 0 ? `Discount (10% @ $130+): -$${tenPercentDiscount.toFixed(2)}<br>` : "") +
    `<strong>Total: $${total.toFixed(2)}</strong>`;

  const payBtn = document.getElementById("paypal-button");
  if (payBtn) {
    payBtn.onclick = () =>
      submitPayPal(cart, shipping, totalDiscount);
  }
}

// -------------------------- PAYPAL SUBMIT -------------------------
function submitPayPal(cart, shipping, totalDiscount) {
  if (!cart || cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const form = document.getElementById("paypal-form");
  if (!form) return;

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

  let index = 1;
  cart.forEach((item) => {
    const name = (item.artist ? item.artist + " – " : "") + (item.title || item.id);
    addField(`item_name_${index}`, name);
    addField(`amount_${index}`, safeNumber(item.price, 0).toFixed(2));
    addField(`quantity_${index}`, item.qty);
    index++;
  });

  // Shipping as a line item
  if (shipping > 0) {
    addField(`item_name_${index}`, "Shipping");
    addField(`amount_${index}`, Number(shipping).toFixed(2));
    addField(`quantity_${index}`, 1);
    index++;
  }

  // Total discount for entire cart (bundle + 10% discount)
  if (totalDiscount > 0) {
    addField("discount_amount_cart", Number(totalDiscount).toFixed(2));
  }

  form.action = "https://www.paypal.com/cgi-bin/webscr";
  form.method = "post";
  form.submit();
}

// ----------------------------- INIT -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  updateCartBadge();
  await loadProducts();      // ensure allProducts exists before cart +/-
  renderShop();
  renderCart();
});
