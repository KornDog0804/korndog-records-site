// ================== KORNDOG SCRIPT (SHOP + CART) ==================
// Uses: products.json2 ONLY
// - Pagination
// - Flip front/back images
// - Stock limits via quantity
// - Shipping: 7.99 + 0.50 per record
// - Tier deal: 3 for $25 on tier === "tenbin"
// - No sold.json, no available flag hiding
// ================================================================

const CART_KEY = "korndog_cart_v2";
const PRODUCTS_URL = "./products.json2";
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

function money(n) {
  return "$" + Number(n || 0).toFixed(2);
}

// -------------------- LOAD PRODUCTS + NORMALIZE -------------------
async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load products.json2");

    const raw = await res.json();
    const mapped = (Array.isArray(raw) ? raw : [])
      .map((p) => {
        const qty = Number.isFinite(Number(p.quantity)) ? Number(p.quantity) : 1;

        // normalize images (support multiple schemas)
        const imageFront = p.imageFront || (p.images && p.images.front) || p.image || "";
        const imageBack = p.imageBack || (p.images && p.images.back) || p.imageBack || imageFront;

        return {
          id: String(p.id || "").trim(),
          artist: p.artist || "",
          title: p.title || "",
          price: Number(p.price || 0),
          grade: p.grade || "",
          description: p.description || "",
          tier: p.tier || "premium",
          quantity: qty,
          image: imageFront || p.image || "",
          imageFront,
          imageBack,
        };
      })
      // SOLD LOGIC NOW: qty <= 0 means don’t show
      .filter((p) => p.id && p.quantity > 0);

    // shop feels fresh every visit
    allProducts = shuffleArray(mapped);
    return allProducts;
  } catch (e) {
    console.error(e);
    allProducts = [];
    return [];
  }
}

// ------------------------ CART HELPERS ----------------------------
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
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

// Find product by id (from loaded list)
function findProduct(productId) {
  return allProducts.find((p) => p.id === productId);
}

// Add one item to cart, respecting stock quantity
function addToCart(productId) {
  if (!allProducts || allProducts.length === 0) return;

  const product = findProduct(productId);
  if (!product) return;

  const maxQty = Number.isFinite(Number(product.quantity)) ? Number(product.quantity) : 1;

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
      title: product.artist ? `${product.artist} – ${product.title}` : (product.title || product.id),
      price: Number(product.price || 0),
      grade: product.grade || "",
      tier: product.tier || "premium",
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

// ----------------- SHIPPING + TIER DISCOUNTS ----------------------
// Shipping: $7.99 + $0.50 per record
function calcShipping(itemCount) {
  if (itemCount <= 0) return 0;
  return 7.99 + (itemCount * 0.5);
}

// 3 for $25 deal on tier === "tenbin"
function calcTenBinDiscount(cart) {
  // explode to unit prices for tenbin
  const prices = [];
  cart.forEach((item) => {
    if ((item.tier || "").toLowerCase() === "tenbin") {
      const qty = Number(item.qty || 0);
      for (let i = 0; i < qty; i++) prices.push(Number(item.price || 0));
    }
  });

  if (prices.length < 3) return 0;

  // group in sets of 3 (best discount by taking highest priced together)
  prices.sort((a, b) => b - a);

  let discount = 0;
  const sets = Math.floor(prices.length / 3);
  for (let s = 0; s < sets; s++) {
    const p1 = prices[s * 3];
    const p2 = prices[s * 3 + 1];
    const p3 = prices[s * 3 + 2];
    const sum = p1 + p2 + p3;
    discount += Math.max(0, sum - 25);
  }

  return discount;
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

    // IMAGE FLIP
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
      const img = document.createElement("img");
      img.src = frontSrc;
      img.alt = prod.title || prod.id || "Record front";
      img.onerror = () => img.classList.add("image-missing");
      frontDiv.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "image-missing";
      frontDiv.appendChild(ph);
    }

    if (backSrc) {
      const img = document.createElement("img");
      img.src = backSrc;
      img.alt = prod.title || prod.id || "Record back";
      img.onerror = () => img.classList.add("image-missing");
      backDiv.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "image-missing";
      backDiv.appendChild(ph);
    }

    flipInner.appendChild(frontDiv);
    flipInner.appendChild(backDiv);
    flipWrapper.appendChild(flipInner);
    recordImage.appendChild(flipWrapper);

    const title = document.createElement("h3");
    title.textContent = prod.artist ? `${prod.artist} – ${prod.title}` : (prod.title || prod.id || "Untitled");

    const grade = document.createElement("p");
    grade.className = "record-grade";
    grade.textContent = "Grade: " + (prod.grade || "—");

    const price = document.createElement("p");
    price.className = "record-price";
    price.textContent = money(prod.price);

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

// -------------------------- CART RENDERING ------------------------
async function renderCart() {
  const container = document.getElementById("cart-items");
  const summaryBox = document.getElementById("cart-summary");
  if (!container || !summaryBox) return;

  // ensure products are loaded so we can enforce quantity limits on +/- buttons
  if (!allProducts || allProducts.length === 0) {
    await loadProducts();
  }

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

      const t = document.createElement("p");
      t.className = "cart-title";
      t.textContent = item.title || item.id;

      const g = document.createElement("p");
      g.className = "cart-grade";
      g.textContent = "Grade: " + (item.grade || "—");

      info.appendChild(t);
      info.appendChild(g);

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
        const product = findProduct(item.id);
        const maxQty = product && Number.isFinite(Number(product.quantity)) ? Number(product.quantity) : 1;

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
      linePrice.textContent = money((item.price || 0) * (item.qty || 0));

      row.appendChild(info);
      row.appendChild(qtyBox);
      row.appendChild(linePrice);

      container.appendChild(row);
    });
  }

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * (item.qty || 0)), 0);

  const shipping = calcShipping(itemCount);
  const tenbinDiscount = calcTenBinDiscount(cart);
  const total = subtotal + shipping - tenbinDiscount;

  summaryBox.innerHTML =
    `Subtotal: ${money(subtotal)}<br>` +
    `Shipping (7.99 + .50/record): ${money(shipping)}<br>` +
    `3 for $25 (Ten Bin): -${money(tenbinDiscount)}<br>` +
    `<strong>Total: ${money(total)}</strong>`;

  const payBtn = document.getElementById("paypal-button");
  if (payBtn) {
    payBtn.onclick = () => submitPayPal(cart, shipping, tenbinDiscount);
  }

  const clearBtn = document.getElementById("clear-cart");
  if (clearBtn) clearBtn.onclick = clearCart;
}

// -------------------------- PAYPAL SUBMIT -------------------------
function submitPayPal(cart, shipping, tenbinDiscount) {
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const form = document.getElementById("paypal-form");
  if (!form) {
    alert("PayPal form not found on this page.");
    return;
  }

  while (form.firstChild) form.removeChild(form.firstChild);

  const addField = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  };

  addField("cmd", "_cart");
  addField("upload", "1");
  addField("business", "titans.rule1215@gmail.com");
  addField("currency_code", "USD");

  let index = 1;
  cart.forEach((item) => {
    addField(`item_name_${index}`, item.title || item.id);
    addField(`amount_${index}`, Number(item.price || 0).toFixed(2));
    addField(`quantity_${index}`, Number(item.qty || 0));
    index++;
  });

  // Add shipping as a cart-level shipping value (PayPal supports these fields)
  // NOTE: Some PayPal flows show shipping separately if you use "handling_cart" or "shipping_1"
  addField("handling_cart", Number(shipping || 0).toFixed(2));

  // Apply discount to whole cart (works better than negative line items)
  if (tenbinDiscount > 0) {
    addField("discount_amount_cart", Number(tenbinDiscount).toFixed(2));
  }

  form.action = "https://www.paypal.com/cgi-bin/webscr";
  form.method = "post";
  form.submit();
}

// ----------------------------- INIT -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  updateCartBadge();

  // If you’re on shop page
  if (document.getElementById("products")) {
    await renderShop();
  }

  // If you’re on cart page
  if (document.getElementById("cart-items")) {
    await renderCart();
  }
});
