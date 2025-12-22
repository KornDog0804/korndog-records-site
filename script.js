// ================== KORNDOG RECORDS — MASTER SCRIPT ==================
// SHOP + CART + PAYPAL + QUICK VIEW + SHARE LINKS + ZOMBIE KITTY
// USES products.json2 ONLY
// ================================================================

const SITE_BASE = "https://korndogrecords.com";
const PRODUCTS_FILE = "./products.json2";
const CART_KEY = "korndog_cart_v1";
const PRODUCTS_PER_PAGE = 10;

// PayPal
const PAYPAL_BUSINESS_EMAIL = "korndogrecords@gmail.com";
const PAYPAL_RETURN_URL = `${SITE_BASE}/thank-you.html`;
const PAYPAL_CANCEL_URL = `${SITE_BASE}/cart.html`;

// Zombie Kitty phone (personal)
const ZK_PHONE = "12707843283";

// ------------------------------------------------------------
// GLOBALS
// ------------------------------------------------------------
let allProducts = [];
let currentPage = 1;
window.allProducts = allProducts;

// ------------------------------------------------------------
// UTIL
// ------------------------------------------------------------
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ------------------------------------------------------------
// LOAD PRODUCTS
// ------------------------------------------------------------
async function loadProducts() {
  const res = await fetch(PRODUCTS_FILE, { cache: "no-store" });
  const raw = await res.json();

  allProducts = shuffle(
    raw.map(p => ({
      ...p,
      tier: (p.tier || "premium").toLowerCase(),
      quantity: typeof p.quantity === "number" ? p.quantity : 1,
      imageFront: p.imageFront || p.image || "",
      imageBack: p.imageBack || ""
    }))
  );

  window.allProducts = allProducts;
}

// ------------------------------------------------------------
// CART
// ------------------------------------------------------------
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
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

window.addToCart = function (id) {
  const product = allProducts.find(p => p.id === id);
  if (!product || product.available === false) return;

  const cart = getCart();
  const existing = cart.find(i => i.id === id);

  if (existing) {
    if (existing.qty >= product.quantity) return alert("Only one copy available.");
    existing.qty++;
  } else {
    cart.push({
      id,
      title: product.title,
      artist: product.artist || "",
      price: Number(product.price),
      grade: product.grade || "",
      tier: product.tier,
      qty: 1,
      image: product.imageFront
    });
  }

  saveCart(cart);
  alert("Added to cart 🤘");
};

// ------------------------------------------------------------
// SHIPPING + DISCOUNTS
// ------------------------------------------------------------
function calcShipping(count) {
  if (count <= 0) return 0;
  if (count <= 3) return 7.99;
  return 7.99 + (count - 3) * 0.5;
}

function calcTenBundle(cart) {
  const ten = cart.reduce((s, i) => s + (i.price === 10 ? i.qty : 0), 0);
  return Math.floor(ten / 3) * 5;
}

function calcPremiumDiscount(cart) {
  const subtotal = cart.reduce((s, i) => {
    if (i.price === 10) return s;
    if (i.tier !== "premium") return s;
    return s + i.price * i.qty;
  }, 0);

  return subtotal >= 130 ? subtotal * 0.1 : 0;
}

// ------------------------------------------------------------
// SHOP RENDER
// ------------------------------------------------------------
function renderShop() {
  const grid = document.getElementById("products");
  if (!grid) return;

  grid.innerHTML = "";
  const visible = allProducts.filter(p => p.available !== false);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const page = visible.slice(start, start + PRODUCTS_PER_PAGE);

  page.forEach(p => {
    const card = document.createElement("div");
    card.className = "record-card";
    card.dataset.pid = p.id;

    // IMAGE (opens modal)
    const imgWrap = document.createElement("div");
    imgWrap.className = "record-image";
    imgWrap.innerHTML = `<img src="${p.imageFront}" alt="${p.title}">`;
    imgWrap.addEventListener("click", () => openQuickView(p.id));

    // TEXT (shareable link)
    const title = document.createElement("h3");
    title.innerHTML = `<a href="${SITE_BASE}/shop.html?record=${p.id}">${p.artist ? p.artist + " – " : ""}${p.title}</a>`;

    const price = document.createElement("p");
    price.className = "record-price";
    price.textContent = `$${Number(p.price).toFixed(2)}`;

    const desc = document.createElement("p");
    desc.className = "record-desc";
    desc.innerHTML = `<a href="${SITE_BASE}/shop.html?record=${p.id}">${p.description || ""}</a>`;

    const btn = document.createElement("button");
    btn.textContent = "Add to Cart";
    btn.className = "btn-primary";
    btn.onclick = () => addToCart(p.id);

    card.append(imgWrap, title, price, desc, btn);
    grid.appendChild(card);
  });

  renderPagination(visible.length);
}

function renderPagination(count) {
  const el = document.getElementById("pagination");
  if (!el) return;
  el.innerHTML = "";

  const pages = Math.ceil(count / PRODUCTS_PER_PAGE);
  for (let i = 1; i <= pages; i++) {
    const b = document.createElement("button");
    b.textContent = i;
    if (i === currentPage) b.classList.add("active");
    b.onclick = () => {
      currentPage = i;
      renderShop();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    el.appendChild(b);
  }
}

// ------------------------------------------------------------
// QUICK VIEW MODAL (FRONT + BACK)
// ------------------------------------------------------------
function openQuickView(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  let modal = document.getElementById("qv");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "qv";
    modal.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,.7);
      display:flex; align-items:center; justify-content:center; z-index:99999;
    `;
    modal.innerHTML = `
      <div style="background:#12061f;border-radius:18px;padding:16px;max-width:520px;width:100%">
        <button id="qv-close" style="float:right">X</button>
        <img id="qv-img" style="width:100%;border-radius:12px">
        <div id="qv-thumbs" style="display:flex;gap:10px;margin-top:10px"></div>
        <h2 id="qv-title"></h2>
        <p id="qv-desc"></p>
        <button id="qv-add" class="btn-primary">Add to Cart</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => e.target === modal && modal.remove());
  }

  modal.querySelector("#qv-title").textContent = `${p.artist ? p.artist + " – " : ""}${p.title}`;
  modal.querySelector("#qv-desc").textContent = p.description || "";
  modal.querySelector("#qv-img").src = p.imageFront;

  const thumbs = modal.querySelector("#qv-thumbs");
  thumbs.innerHTML = "";

  [p.imageFront, p.imageBack].forEach(src => {
    if (!src) return;
    const t = document.createElement("img");
    t.src = src;
    t.style.width = "64px";
    t.style.cursor = "pointer";
    t.onclick = () => modal.querySelector("#qv-img").src = src;
    thumbs.appendChild(t);
  });

  modal.querySelector("#qv-add").onclick = () => addToCart(p.id);
  modal.querySelector("#qv-close").onclick = () => modal.remove();
}

// ------------------------------------------------------------
// ZOMBIE KITTY (NEW)
// ------------------------------------------------------------
document.addEventListener("click", e => {
  if (!e.target.closest('[data-zk="true"]')) return;

  const msg = prompt("Text Joey:");
  if (!msg) return;
  window.location.href = `sms:${ZK_PHONE}?body=${encodeURIComponent(msg)}`;
});

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  updateCartBadge();
  renderShop();
});
