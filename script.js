// ================== KORNDOG SCRIPT (SHOP + CART) ==================
// - Uses ONLY products.json2 (never products.json / product.json)
// - Pagination + scroll-to-top fix
// - Shipping (LOCKED):
//    $7.99 flat up to 3 records, then $0.50 per record after that
// - Discounts:
//    1) 3 for $25 => any record priced EXACTLY $10 (by quantity)
//    2) 10% off $130+ => PREMIUM tier subtotal only (excludes $10 items)
// - PayPal submits correct totals using discount_amount_cart + handling_cart
// - PayPal returns to thank-you.html + cancel returns to cart
// ================================================================

// ================= LIVE MODE =================
const TEST_MODE = false;      // ✅ MUST stay false for live
const TEST_SHIPPING = 0.01;   // kept for future tests (ignored when TEST_MODE=false)

// Your LIVE PayPal receiver email:
const PAYPAL_BUSINESS_EMAIL = "korndogrecords@gmail.com";

// Your live site base:
const SITE_BASE = "https://korndogrecords.com";

// Where PayPal should send them back:
const PAYPAL_RETURN_URL = `${SITE_BASE}/thank-you.html`; // ✅ hyphen filename
const PAYPAL_CANCEL_URL = `${SITE_BASE}/cart.html`;

const CART_KEY = "korndog_cart_v1";
const PRODUCTS_PER_PAGE = 10;

// 🔥 LOCKED: never products.json, never product.json
const PRODUCTS_FILE = "./products.json2";

let allProducts = [];
let currentPage = 1;

// expose for modal + debugging (safe)
window.allProducts = allProducts;

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
      window.allProducts = allProducts;
      return [];
    }

    const raw = await res.json();
    if (!Array.isArray(raw)) {
      console.error("products.json2 is not an array");
      allProducts = [];
      window.allProducts = allProducts;
      return [];
    }

    const mapped = raw.map((p) => {
      const qty = typeof p.quantity === "number" ? p.quantity : 1;
      const tier = (p.tier || "premium").toLowerCase();

      return {
        ...p,
        quantity: qty,
        tier,
        imageFront: p.imageFront || (p.images && p.images.front) || p.image || "",
        imageBack: p.imageBack || (p.images && p.images.back) || p.imageFront || p.image || "",
      };
    });

    allProducts = shuffleArray(mapped);
    window.allProducts = allProducts;
    return allProducts;
  } catch (e) {
    console.error("Failed to load products.json2", e);
    allProducts = [];
    window.allProducts = allProducts;
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
  // Optional test override (OFF in live)
  if (TEST_MODE) return TEST_SHIPPING;

  if (itemCount <= 0) return 0;

  const BASE = 7.99;
  const AFTER_3 = 0.50; // ✅ new rule

  if (itemCount <= 3) return BASE;
  return BASE + (itemCount - 3) * AFTER_3;
}

// 3 for $25 applies to ANY item priced exactly $10 (by quantity)
function calcTenBundleDiscount(cart) {
  const tenCount = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    return sum + (price === 10 ? qty : 0);
  }, 0);

  const bundles = Math.floor(tenCount / 3);
  return bundles * 5; // $30 -> $25 = $5 off per bundle
}

// Premium 10% discount only on premium-tier subtotal >= 130,
// and DOES NOT apply to $10 items (those are bundle-eligible)
function calcPremiumDiscount(cart) {
  const premiumSubtotal = cart.reduce((sum, item) => {
    const tier = String(item.tier || "premium").toLowerCase();
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;

    if (price === 10) return sum;        // exclude $10 items
    if (tier !== "premium") return sum;  // premium only

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
    const imageForCart = product.imageFront || product.image || product.imageBack || "";

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

window.addToCart = addToCart; // ✅ expose for modal

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

  const visible = allProducts.filter((p) => p.available !== false);
  const pageProducts = visible.slice(start, end);

  pageProducts.forEach((prod) => {
    const card = document.createElement("div");
    card.className = "record-card";
    card.dataset.pid = prod.id; // ✅ needed for Quick View modal

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

    // TEXT
    const title = document.createElement("h3");
    title.textContent = prod.artist ? `${prod.artist} – ${prod.title}` : (prod.title || prod.id || "Untitled");

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
    title.textContent = (item.artist ? `${item.artist} – ` : "") + (item.title || item.id);

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
      if ((Number(item.qty) || 1) > 1) item.qty -= 1;
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
      const maxQty = product && typeof product.quantity === "number" ? product.quantity : 99;

      if ((Number(item.qty) || 0) >= maxQty) {
        alert(maxQty === 1 ? "You only have 1 copy of this record in stock." : `You only have ${maxQty} copies of this record in stock.`);
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
    linePrice.textContent = "$" + ((Number(item.price) || 0) * (Number(item.qty) || 0)).toFixed(2);

    row.appendChild(info);
    row.appendChild(qtyBox);
    row.appendChild(linePrice);

    container.appendChild(row);
  });

  // Totals
  const itemCount = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const regularSubtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);

  const shipping = calcShipping(itemCount);
  const tenBundleDiscount = calcTenBundleDiscount(cart);
  const premiumDiscount = calcPremiumDiscount(cart);

  const discountTotal = tenBundleDiscount + premiumDiscount;
  const safeDiscountTotal = Math.min(discountTotal, regularSubtotal); // PayPal safety
  const total = regularSubtotal + shipping - safeDiscountTotal;

  summaryBox.innerHTML =
    `Subtotal: $${regularSubtotal.toFixed(2)}<br>` +
    `Shipping: $${shipping.toFixed(2)}<br>` +
    `3 for $25 Discount: -$${tenBundleDiscount.toFixed(2)}<br>` +
    `Premium $130+ Discount (10%): -$${premiumDiscount.toFixed(2)}<br>` +
    `<strong>Total: $${total.toFixed(2)}</strong>` +
    (TEST_MODE ? `<br><span style="color:#7bff5a;font-weight:600;">TEST MODE: Shipping forced to $${TEST_SHIPPING.toFixed(2)}</span>` : "");

  const payBtn = document.getElementById("paypal-button");
  if (payBtn) {
    payBtn.onclick = () => submitPayPal(cart, shipping, safeDiscountTotal);
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

  while (form.firstChild) form.removeChild(form.firstChild);

  const addField = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  // PayPal "Add to Cart" POST
  addField("cmd", "_cart");
  addField("upload", "1");
  addField("business", PAYPAL_BUSINESS_EMAIL);
  addField("currency_code", "USD");

  // Return experience
  addField("return", PAYPAL_RETURN_URL);
  addField("cancel_return", PAYPAL_CANCEL_URL);
  addField("rm", "2");       // PayPal POST back to return URL
  addField("no_note", "0");  // allow customer note
  addField("charset", "utf-8");

  // Item lines
  let index = 1;
  cart.forEach((item) => {
    addField(`item_name_${index}`, (item.artist ? `${item.artist} – ` : "") + (item.title || item.id || "Record"));
    addField(`amount_${index}`, (Number(item.price) || 0).toFixed(2));
    addField(`quantity_${index}`, String(Number(item.qty) || 1));
    index++;
  });

  // Shipping as handling_cart
  if (shipping > 0) addField("handling_cart", shipping.toFixed(2));

  // Discount as one cart discount
  if (discountTotal > 0) addField("discount_amount_cart", discountTotal.toFixed(2));

  form.action = "https://www.paypal.com/cgi-bin/webscr";
  form.method = "post";
  form.submit();
}
// ================= QUICK VIEW (GO BIG) MODAL =====================
// - No shop.html rewrite needed
// - Click/tap a record card (not the button) -> opens big view
// - Front/back supported; if back missing, it gracefully uses front
// ================================================================

(function setupQuickViewModal(){
  // Inject CSS once
  if (!document.getElementById("kd-qv-style")) {
    const style = document.createElement("style");
    style.id = "kd-qv-style";
    style.textContent = `
      .kd-qv-backdrop{
        position:fixed; inset:0; z-index:99999;
        background:rgba(0,0,0,.72);
        display:none;
        align-items:center; justify-content:center;
        padding:16px;
      }
      .kd-qv-backdrop.open{ display:flex; }
      .kd-qv{
        width:min(980px, 100%);
        border-radius:18px;
        border:1px solid rgba(123,255,90,.35);
        background: rgba(10,1,30,.95);
        box-shadow: 0 24px 70px rgba(0,0,0,.65);
        overflow:hidden;
      }
      .kd-qv-head{
        display:flex; align-items:center; justify-content:space-between;
        gap:12px;
        padding:12px 14px;
        border-bottom:1px solid rgba(255,255,255,.10);
        background: linear-gradient(to right, rgba(10,1,30,.95), rgba(10,1,25,.90));
      }
      .kd-qv-title{
        font-weight:900;
        letter-spacing:.02em;
        font-size:1rem;
        color:#f5f5ff;
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
      }
      .kd-qv-close{
        border:none;
        background:rgba(123,255,90,.12);
        color:#7bff5a;
        border:1px solid rgba(123,255,90,.45);
        border-radius:999px;
        padding:8px 12px;
        font-weight:900;
        cursor:pointer;
      }
      .kd-qv-body{
        display:grid;
        grid-template-columns: 1.2fr .8fr;
        gap:16px;
        padding:16px;
      }
      @media (max-width: 860px){
        .kd-qv-body{ grid-template-columns: 1fr; }
      }

      .kd-qv-media{
        border-radius:16px;
        border:1px solid rgba(255,255,255,.10);
        overflow:hidden;
        background: rgba(0,0,0,.18);
      }
      .kd-qv-stage{
        width:100%;
        aspect-ratio:1/1;
        display:flex; align-items:center; justify-content:center;
        position:relative;
      }
      .kd-qv-stage img{
        width:100%; height:100%;
        object-fit:cover;
        display:block;
      }
      .kd-qv-thumbs{
        display:flex;
        gap:10px;
        padding:10px;
        border-top:1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.03);
      }
      .kd-qv-thumb{
        width:64px; height:64px;
        border-radius:12px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.14);
        background: rgba(0,0,0,.2);
        cursor:pointer;
        opacity:.85;
        flex:0 0 auto;
      }
      .kd-qv-thumb.active{
        border-color: rgba(123,255,90,.65);
        opacity:1;
        box-shadow: 0 0 0 2px rgba(123,255,90,.15) inset;
      }
      .kd-qv-thumb img{ width:100%; height:100%; object-fit:cover; display:block; }

      .kd-qv-info{
        padding:6px 2px;
      }
      .kd-qv-line{
        color:#a1a1c5;
        font-size:.92rem;
        margin:6px 0;
        line-height:1.35;
      }
      .kd-qv-price{
        font-weight:900;
        color:#f5f5ff;
        font-size:1.25rem;
        margin-top:10px;
      }
      .kd-qv-badges{
        display:flex; flex-wrap:wrap; gap:8px;
        margin:10px 0 6px;
      }
      .kd-qv-badge{
        font-size:.75rem;
        padding:4px 10px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.14);
        background: rgba(0,0,0,.18);
        color:#a1a1c5;
      }
      .kd-qv-badge.live{ border-color: rgba(123,255,90,.35); color:#7bff5a; }
      .kd-qv-badge.hidden{ border-color: rgba(255,75,106,.35); color:#ff4b6a; }

      .kd-qv-actions{
        display:flex; gap:10px; flex-wrap:wrap;
        margin-top:14px;
      }
      .kd-qv-actions .btn-primary{ margin-top:0; }
      .kd-qv-actions .btn-outline{
        border-radius:999px;
        padding:0.6rem 1.3rem;
        font-size:0.92rem;
        cursor:pointer;
        font-weight:700;
        background: transparent;
        color: #7bff5a;
        border: 1px solid rgba(123,255,90,.55);
      }
      .kd-qv-actions .btn-outline:hover{ filter: brightness(1.05); }
    `;
    document.head.appendChild(style);
  }

  // Inject modal HTML once
  if (!document.getElementById("kd-qv-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.id = "kd-qv-backdrop";
    backdrop.className = "kd-qv-backdrop";
    backdrop.innerHTML = `
      <div class="kd-qv" role="dialog" aria-modal="true" aria-label="Record quick view">
        <div class="kd-qv-head">
          <div class="kd-qv-title" id="kd-qv-title">Quick View</div>
          <button class="kd-qv-close" type="button" id="kd-qv-close">X</button>
        </div>
        <div class="kd-qv-body">
          <div class="kd-qv-media">
            <div class="kd-qv-stage">
              <img id="kd-qv-img" alt="Record image" />
            </div>
            <div class="kd-qv-thumbs" id="kd-qv-thumbs"></div>
          </div>
          <div class="kd-qv-info">
            <div class="kd-qv-price" id="kd-qv-price">$0.00</div>
            <div class="kd-qv-badges" id="kd-qv-badges"></div>
            <div class="kd-qv-line" id="kd-qv-grade"></div>
            <div class="kd-qv-line" id="kd-qv-qty"></div>
            <div class="kd-qv-line" id="kd-qv-desc"></div>

            <div class="kd-qv-actions">
              <button class="btn-primary" type="button" id="kd-qv-add">Add to Cart</button>
              <button class="btn-outline" type="button" id="kd-qv-close2">Back to Grid</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    // Close helpers
    const close = () => backdrop.classList.remove("open");
    document.getElementById("kd-qv-close").addEventListener("click", close);
    document.getElementById("kd-qv-close2").addEventListener("click", close);

    // Click outside closes
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function pickImageSources(p){
    const front = p.imageFront || (p.images && p.images.front) || p.image || "";
    const back  = p.imageBack  || (p.images && p.images.back)  || "";
    // If back missing, we just don't show a back thumb.
    return { front, back };
  }

  function openQuickView(productId){
    const backdrop = document.getElementById("kd-qv-backdrop");
    const p = (window.allProducts || []).find(x => x.id === productId);
    if (!p) return;

    // Basic fields
    const titleText = (p.artist ? `${p.artist} – ` : "") + (p.title || p.id || "Record");
    document.getElementById("kd-qv-title").textContent = titleText;
    document.getElementById("kd-qv-price").textContent = "$" + Number(p.price || 0).toFixed(2);
    document.getElementById("kd-qv-grade").textContent = "Grade: " + (p.grade || "—");
    document.getElementById("kd-qv-qty").textContent = "Qty available: " + (p.quantity ?? 1);
    document.getElementById("kd-qv-desc").textContent = p.description || "";

    // Badges
    const badges = document.getElementById("kd-qv-badges");
    badges.innerHTML = "";
    const avail = (p.available === false) ? "HIDDEN" : "LIVE";
    const b1 = document.createElement("span");
    b1.className = "kd-qv-badge " + ((p.available === false) ? "hidden" : "live");
    b1.textContent = avail;
    badges.appendChild(b1);

    const b2 = document.createElement("span");
    b2.className = "kd-qv-badge";
    b2.textContent = "Tier: " + (p.tier || "premium");
    badges.appendChild(b2);

    if (Number(p.price) === 10) {
      const b3 = document.createElement("span");
      b3.className = "kd-qv-badge live";
      b3.textContent = "$10 PRICE";
      badges.appendChild(b3);
    }

    // Images
    const { front, back } = pickImageSources(p);
    const stageImg = document.getElementById("kd-qv-img");
    const thumbs = document.getElementById("kd-qv-thumbs");
    thumbs.innerHTML = "";

    function setStage(src){
      stageImg.src = src || "";
      stageImg.onerror = () => {
        stageImg.removeAttribute("src");
        stageImg.style.background = "repeating-linear-gradient(45deg,#1f102f,#1f102f 6px,#12061f 6px,#12061f 12px)";
      };
      stageImg.style.background = "";
    }

    // Thumb builder
    function addThumb(src, label){
      if (!src) return;
      const t = document.createElement("div");
      t.className = "kd-qv-thumb";
      t.title = label;
      t.innerHTML = `<img alt="${label}" />`;
      const img = t.querySelector("img");
      img.src = src;
      img.onerror = () => t.style.opacity = ".35";
      t.addEventListener("click", () => {
        [...thumbs.querySelectorAll(".kd-qv-thumb")].forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        setStage(src);
      });
      thumbs.appendChild(t);
      return t;
    }

    const tFront = addThumb(front, "Front");
    const tBack  = addThumb(back, "Back");

    // Default stage
    if (tFront) tFront.classList.add("active");
    setStage(front || back || "");

    // Add to cart button (uses your existing logic)
    const addBtn = document.getElementById("kd-qv-add");
    addBtn.disabled = (p.available === false);
    addBtn.textContent = (p.available === false) ? "Unavailable" : "Add to Cart";
    addBtn.onclick = () => {
      if (p.available === false) return;
      window.addToCart(productId);
    };

    backdrop.classList.add("open");
  }

  // Event delegation: click card to open modal (ignore buttons)
  document.addEventListener("click", (e) => {
    const grid = document.getElementById("products");
    if (!grid) return;

    const card = e.target.closest(".record-card");
    if (!card) return;

    // Don't open modal if they clicked the Add to Cart button
    if (e.target.closest("button")) return;

    const pid = card.dataset.pid;
    if (!pid) return;

    openQuickView(pid);
  }, true);
})();
// ----------------------------- INIT -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  window.scrollTo(0, 0);
  updateCartBadge();

  // Load products once so cart qty limits work
  await loadProducts();

  renderShop();
  renderCart();
});
// =========================
// ZOMBIE KITTY MESSAGE BOX (SHOP) - CLICK + SMS + THANK YOU MODAL
// - Uses event delegation so it won't break if elements load later
// - Works on mobile (opens SMS app)
// =========================
(function zombieKittyFix(){
  const PHONE = "12705866000"; // Joey @ RAC line (format: 1 + area + number)

  // Create modal once (if not already in DOM)
  function ensureModal(){
    if (document.getElementById("zk-modal")) return;

    const modal = document.createElement("div");
    modal.id = "zk-modal";
    modal.style.cssText = `
      position:fixed; inset:0; z-index:99999; display:none;
      align-items:center; justify-content:center; padding:16px;
      background:rgba(0,0,0,.65); backdrop-filter:blur(10px);
    `;
    modal.innerHTML = `
      <div style="
        width:min(560px,100%);
        background:rgba(10,1,30,.95);
        border:1px solid rgba(255,255,255,.12);
        border-radius:18px;
        padding:16px;
        box-shadow:0 18px 40px rgba(0,0,0,.55);
        color:#f5f5ff;
        font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
      ">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="font-weight:950; font-size:1.1rem;">Zombie Kitty Message</div>
          <button id="zk-close" type="button" style="
            border:none; background:transparent; color:#a1a1c5; font-size:1.4rem; cursor:pointer;
          ">×</button>
        </div>

        <div style="margin-top:10px; color:#a1a1c5; font-size:.92rem; line-height:1.35;">
          Type your message and it’ll open your phone’s text app pre-filled.
        </div>

        <textarea id="zk-text" style="
          margin-top:12px; width:100%; min-height:120px; resize:vertical;
          border-radius:14px; padding:10px 12px;
          background:rgba(5,0,15,.92); color:#f5f5ff;
          border:1px solid rgba(255,255,255,.16); outline:none;
          font-size:1rem; line-height:1.35;
        " placeholder="Yo Joey — I’m trying to grab a record…"></textarea>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
          <button id="zk-send" type="button" style="
            padding:10px 16px; border-radius:999px; border:none; cursor:pointer;
            font-weight:900; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem;
            background:#7bff5a; color:#02010a;
          ">Text Joey</button>

          <button id="zk-copy" type="button" style="
            padding:10px 16px; border-radius:999px; cursor:pointer;
            font-weight:900; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem;
            background:transparent; color:#7bff5a;
            border:1px solid rgba(123,255,90,.55);
          ">Copy Message</button>
        </div>

        <div id="zk-toast" style="display:none; margin-top:10px; color:#7bff5a; font-size:.9rem;">
          Copied ✅
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Modal handlers
    const close = () => { modal.style.display = "none"; };

    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });

    modal.querySelector("#zk-close").addEventListener("click", close);

    modal.querySelector("#zk-copy").addEventListener("click", async () => {
      const msg = modal.querySelector("#zk-text").value || "";
      try {
        await navigator.clipboard.writeText(msg);
        const toast = modal.querySelector("#zk-toast");
        toast.style.display = "block";
        setTimeout(() => (toast.style.display = "none"), 1200);
      } catch (err) {
        // fallback
        modal.querySelector("#zk-text").select();
        document.execCommand("copy");
        const toast = modal.querySelector("#zk-toast");
        toast.style.display = "block";
        setTimeout(() => (toast.style.display = "none"), 1200);
      }
    });

    modal.querySelector("#zk-send").addEventListener("click", () => {
      const msg = modal.querySelector("#zk-text").value || "";
      // sms: links are the cleanest mobile way
      // Android: sms:NUMBER?body=...
      // iOS: sms:NUMBER&body=... (but ? also works often)
      const url = `sms:${PHONE}?body=${encodeURIComponent(msg)}`;
      window.location.href = url;
    });
  }

  function openModal(prefill){
    ensureModal();
    const modal = document.getElementById("zk-modal");
    const box = modal.querySelector("#zk-text");
    box.value = prefill || box.value || "";
    modal.style.display = "flex";
    box.focus();
  }

  // Event delegation: click anything with data-zk="true"
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest('[data-zk="true"]');
    if (!trigger) return;

    e.preventDefault();

    // optional prefill from attribute
    const prefill = trigger.getAttribute("data-zk-prefill") || "";
    openModal(prefill);
  }, { passive: false });

})();
