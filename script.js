// ================== KORNDOG SCRIPT (SHOP + CART) ==================
// LOCKED – DO NOT PARTIALLY EDIT
// ================================================================

// ================= LIVE MODE =================
const TEST_MODE = false;
const TEST_SHIPPING = 0.01;

// PayPal
const PAYPAL_BUSINESS_EMAIL = "korndogrecords@gmail.com";
const SITE_BASE = "https://korndogrecords.com";
const PAYPAL_RETURN_URL = `${SITE_BASE}/thank-you.html`;
const PAYPAL_CANCEL_URL = `${SITE_BASE}/cart.html`;

const CART_KEY = "korndog_cart_v1";
const PRODUCTS_PER_PAGE = 10;
const PRODUCTS_FILE = "./products.json2";

let allProducts = [];
let currentPage = 1;
window.allProducts = allProducts;

// ----------------------- UTIL ----------------------------
function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// -------------------- LOAD PRODUCTS ----------------------
async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_FILE, { cache: "no-store" });
    const raw = await res.json();

    allProducts = shuffleArray(
      raw.map(p => ({
        ...p,
        quantity: typeof p.quantity === "number" ? p.quantity : 1,
        tier: (p.tier || "premium").toLowerCase(),
        imageFront: p.imageFront || p.image || "",
        imageBack: p.imageBack || p.imageFront || ""
      }))
    );

    window.allProducts = allProducts;
    return allProducts;
  } catch (e) {
    console.error("Product load failed", e);
    allProducts = [];
    return [];
  }
}

// ------------------------ CART ---------------------------
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = count;
}

function addToCart(pid) {
  const p = allProducts.find(x => x.id === pid);
  if (!p || p.available === false) return;

  const cart = getCart();
  const found = cart.find(i => i.id === pid);

  if (found) {
    if (found.qty >= p.quantity) return alert("Only one copy available.");
    found.qty++;
  } else {
    cart.push({
      id: p.id,
      title: p.title,
      artist: p.artist || "",
      price: Number(p.price),
      grade: p.grade || "",
      tier: p.tier,
      image: p.imageFront,
      qty: 1
    });
  }

  saveCart(cart);
  alert("Dropped in the cart.");
}
window.addToCart = addToCart;

// -------------------- SHOP RENDER ------------------------
async function renderShop() {
  if (!document.getElementById("products")) return;
  if (!allProducts.length) await loadProducts();
  currentPage = 1;
  renderShopPage();
}

function renderShopPage() {
  const grid = document.getElementById("products");
  grid.innerHTML = "";

  const visible = allProducts.filter(p => p.available !== false);
  const slice = visible.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  slice.forEach(p => {
    const card = document.createElement("div");
    card.className = "record-card";
    card.dataset.pid = p.id;

    const shareUrl = `shop.html?pid=${encodeURIComponent(p.id)}`;

    // IMAGE (modal trigger)
    const imgWrap = document.createElement("div");
    imgWrap.className = "record-image";
    const img = document.createElement("img");
    img.src = p.imageFront;
    imgWrap.appendChild(img);

    // TITLE (share link)
    const titleLink = document.createElement("a");
    titleLink.href = shareUrl;
    titleLink.className = "share-link";
    titleLink.innerHTML = `<h3>${p.artist ? p.artist + " – " : ""}${p.title}</h3>`;

    // DESC (share link)
    const descLink = document.createElement("a");
    descLink.href = shareUrl;
    descLink.className = "share-link";
    descLink.innerHTML = `<p class="record-desc">${p.description || ""}</p>`;

    const price = document.createElement("p");
    price.className = "record-price";
    price.textContent = `$${Number(p.price).toFixed(2)}`;

    const btn = document.createElement("button");
    btn.className = "btn-primary";
    btn.textContent = "Add to Cart";
    btn.onclick = () => addToCart(p.id);

    card.append(imgWrap, titleLink, price, descLink, btn);
    grid.appendChild(card);
  });

  renderPagination(visible.length);

  // auto-open modal from share link
  const pid = new URLSearchParams(location.search).get("pid");
  if (pid && window.kdOpenQuickView) window.kdOpenQuickView(pid);
}

function renderPagination(count) {
  const box = document.getElementById("pagination");
  if (!box) return;
  box.innerHTML = "";

  const pages = Math.ceil(count / PRODUCTS_PER_PAGE);
  for (let i = 1; i <= pages; i++) {
    const b = document.createElement("button");
    b.textContent = i;
    if (i === currentPage) b.classList.add("active");
    b.onclick = () => {
      currentPage = i;
      renderShopPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    box.appendChild(b);
  }
}

// ---------------- QUICK VIEW MODAL -----------------------
(function () {
  const modal = document.createElement("div");
  modal.id = "kd-qv";
  modal.style.cssText = `
    position:fixed; inset:0; display:none;
    background:rgba(0,0,0,.75); z-index:99999;
    align-items:center; justify-content:center;
  `;
  modal.innerHTML = `
    <div style="background:#12052b; border-radius:18px; padding:16px; max-width:90%;">
      <button id="qvClose">✕</button>
      <img id="qvImg" style="width:100%;border-radius:12px">
      <h2 id="qvTitle"></h2>
      <p id="qvDesc"></p>
      <button id="qvAdd" class="btn-primary">Add to Cart</button>
    </div>`;
  document.body.appendChild(modal);

  const close = () => modal.style.display = "none";
  document.getElementById("qvClose").onclick = close;

  window.kdOpenQuickView = pid => {
    const p = allProducts.find(x => x.id === pid);
    if (!p) return;
    document.getElementById("qvImg").src = p.imageFront;
    document.getElementById("qvTitle").textContent =
      `${p.artist ? p.artist + " – " : ""}${p.title}`;
    document.getElementById("qvDesc").textContent = p.description || "";
    document.getElementById("qvAdd").onclick = () => addToCart(pid);
    modal.style.display = "flex";
  };

  document.addEventListener("click", e => {
    if (e.target.closest("button")) return;
    if (e.target.closest("a.share-link")) return;
    const img = e.target.closest(".record-image");
    if (!img) return;
    const card = img.closest(".record-card");
    if (card) window.kdOpenQuickView(card.dataset.pid);
  }, true);
})();

// ---------------- ZOMBIE KITTY ---------------------------
(function () {
  const PHONE = "2707843283";
  const btn = document.getElementById("floatingJoey");
  if (!btn) return;

  btn.onclick = () => {
    window.location.href = `sms:${PHONE}?body=${encodeURIComponent("Yo Joey — I’m looking at a record on KornDog Records.")}`;
  };
})();

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", async () => {
  updateCartBadge();
  await loadProducts();
  renderShop();
});
