/* ============================
   KornDog Records — shop-ui.js
   - Stable shuffle + restore scroll/page when coming back from product page
   - Saves shop state before navigating away
   ============================ */

(function () {
  const PRODUCTS_URL = "products.json";
  const SOLD_URL = "sold.json";
  const SHOP_STATE_KEY = "kd_shop_state_v1";
  const SHOP_SEED_KEY = "kd_shop_seed_v1"; // persistent across reloads until changed

  const grid = document.getElementById("products");
  const pager = document.getElementById("pagination");

  if (!grid) return;

  // ---------- Seeded RNG (mulberry32) ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, seed) {
    const a = arr.slice();
    const rand = mulberry32(seed);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Shop state ----------
  function getSeed() {
    const existing = localStorage.getItem(SHOP_SEED_KEY);
    if (existing) return Number(existing);

    // New seed persists until you manually change it
    const seed = Math.floor(Math.random() * 1e9);
    localStorage.setItem(SHOP_SEED_KEY, String(seed));
    return seed;
  }

  function saveShopState(extra = {}) {
    const state = {
      ts: Date.now(),
      seed: getSeed(),
      page: window.__KD_CURRENT_PAGE__ || 1,
      scrollY: window.scrollY || 0,
      ...extra,
    };
    sessionStorage.setItem(SHOP_STATE_KEY, JSON.stringify(state));
  }

  function readShopState() {
    try {
      const raw = sessionStorage.getItem(SHOP_STATE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);

      // keep it fresh (2 hours)
      if (!state.ts || Date.now() - state.ts > 2 * 60 * 60 * 1000) return null;
      return state;
    } catch {
      return null;
    }
  }

  function restoreSeedIfNeeded() {
    const state = readShopState();
    if (state && state.seed) {
      localStorage.setItem(SHOP_SEED_KEY, String(state.seed));
    }
  }

  // ---------- Data loading ----------
  async function safeFetchJSON(url) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }

  function normalizeProducts(data) {
    // Accepts either array or {products:[...]}
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.products)) return data.products;
    return [];
  }

  function soldSetFrom(data) {
    // Accept array of ids, or object keyed by id
    if (!data) return new Set();
    if (Array.isArray(data)) return new Set(data.map(String));
    if (typeof data === "object") return new Set(Object.keys(data).map(String));
    return new Set();
  }

  // ---------- Rendering ----------
  const PER_PAGE = 8;

  function money(n) {
    const num = Number(n);
    if (Number.isNaN(num)) return String(n || "");
    return "$" + num.toFixed(2);
  }

  function text(x) {
    return (x ?? "").toString().trim();
  }

  function slugify(s) {
    return text(s)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function productId(p, idx) {
    // Prefer explicit id if you have it
    if (p && (p.id || p.pid)) return String(p.id || p.pid);
    // fallback derived id
    const base = slugify(`${p.artist || ""}-${p.title || ""}-${p.name || ""}`) || `item-${idx}`;
    return base;
  }

  function buildProductLink(pid) {
    // Deep link goes to product page
    return `product.html?pid=${encodeURIComponent(pid)}`;
  }

  function buildCard(p, pid) {
    const name = text(p.name) || `${text(p.artist)} — ${text(p.title)}`.trim() || "Record";
    const grade = text(p.grade) || "—";
    const price = p.price != null ? money(p.price) : text(p.priceText) || "";
    const desc = text(p.desc || p.description);
    const qty = p.qty != null ? Number(p.qty) : 1;

    const front = text(p.image || p.img || p.frontImage || p.front) || "";
    const back = text(p.backImage || p.back) || "";

    const shareUrl = buildProductLink(pid);

    // NOTE:
    // - Image tap area should open Quick View modal (handled in shop.html script/modal handler)
    // - Title/desc should be a share link to product.html?pid=...
    const el = document.createElement("div");
    el.className = "record-card";
    el.setAttribute("data-pid", pid);

    el.innerHTML = `
      <div class="record-image" role="button" aria-label="View photos">
        <div class="flip-wrapper">
          <div class="flip-inner">
            <div class="flip-front ${front ? "" : "image-missing"}">
              ${front ? `<img src="${front}" alt="${name} front">` : ``}
            </div>
            <div class="flip-back ${back ? "" : "image-missing"}">
              ${back ? `<img src="${back}" alt="${name} back">` : (front ? `<img src="${front}" alt="${name}">` : ``)}
            </div>
          </div>
        </div>
      </div>

      <a class="share-link" href="${shareUrl}">
        <h3>${name}</h3>
      </a>

      <div class="record-grade">Grade: ${grade}</div>
      <div class="record-price">${price}</div>

      ${desc ? `<a class="share-link" href="${shareUrl}"><div class="record-desc">${desc}</div></a>` : `<div class="record-desc"></div>`}

      <div class="qty-text">Qty available: ${qty}</div>

      <button class="btn-primary" type="button" data-add="${pid}">Add to Cart</button>
    `;

    // Save shop state before leaving via share links
    const shareLinks = el.querySelectorAll("a.share-link");
    shareLinks.forEach((a) => {
      a.addEventListener("click", () => {
        saveShopState({ lastPid: pid });
      });
    });

    // Add to cart button
    const addBtn = el.querySelector(`button[data-add="${pid}"]`);
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        // Try to call existing cart logic if it exists:
        if (typeof window.addToCart === "function") {
          window.addToCart(pid);
        } else if (window.KD && typeof window.KD.addToCart === "function") {
          window.KD.addToCart(pid);
        } else {
          // fallback minimal cart in localStorage
          const key = "korndog_cart";
          const raw = localStorage.getItem(key);
          const cart = raw ? JSON.parse(raw) : [];
          cart.push({ pid, qty: 1 });
          localStorage.setItem(key, JSON.stringify(cart));
        }

        // update cart badge if present
        if (typeof window.updateCartCount === "function") window.updateCartCount();
        const badge = document.querySelector("[data-cart-count]");
        if (badge && typeof window.getCartCount === "function") {
          badge.textContent = String(window.getCartCount());
        }
      });
    }

    return el;
  }

  function renderPagination(totalPages, currentPage) {
    if (!pager) return;
    pager.innerHTML = "";
    if (totalPages <= 1) return;

    for (let p = 1; p <= totalPages; p++) {
      const btn = document.createElement("button");
      btn.textContent = String(p);
      if (p === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        window.__KD_CURRENT_PAGE__ = p;
        saveShopState({ page: p, scrollY: 0 });
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      pager.appendChild(btn);
    }
  }

  let ALL = [];
  let SOLD = new Set();

  function currentPageFromState() {
    const state = readShopState();
    if (state && state.page) return Number(state.page) || 1;
    return window.__KD_CURRENT_PAGE__ || 1;
  }

  function render() {
    const seed = getSeed();
    const page = currentPageFromState();
    window.__KD_CURRENT_PAGE__ = page;

    // Shuffle deterministically
    const shuffled = seededShuffle(ALL, seed);

    // Remove sold items if sold.json exists
    const filtered = shuffled.filter((p) => {
      const pid = productId(p, 0);
      return !SOLD.has(String(pid));
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(Math.max(1, page), totalPages);
    window.__KD_CURRENT_PAGE__ = safePage;

    const start = (safePage - 1) * PER_PAGE;
    const pageItems = filtered.slice(start, start + PER_PAGE);

    grid.innerHTML = "";
    pageItems.forEach((p, idx) => {
      const pid = productId(p, start + idx);
      const card = buildCard(p, pid);
      grid.appendChild(card);
    });

    renderPagination(totalPages, safePage);
  }

  function restoreScrollIfNeeded() {
    const state = readShopState();
    if (!state) return;

    // Only restore if we're returning from product page OR if user used our back flow
    const params = new URLSearchParams(window.location.search);
    const restore = params.get("restore");
    const from = params.get("from");

    if (restore === "1" || from === "product") {
      const y = Number(state.scrollY || 0);
      // delay to let DOM render
      setTimeout(() => window.scrollTo(0, y), 120);
    }
  }

  // Before unloading shop, save state (best-effort)
  window.addEventListener("beforeunload", () => {
    saveShopState();
  });

  // Initial boot
  (async function init() {
    restoreSeedIfNeeded();

    const data = await safeFetchJSON(PRODUCTS_URL);
    const sold = await safeFetchJSON(SOLD_URL);

    ALL = normalizeProducts(data).map((p, i) => {
      // stamp pid if missing so it stays consistent
      const pid = productId(p, i);
      return { ...p, pid };
    });

    SOLD = soldSetFrom(sold);

    // If state exists, force the same seed
    const st = readShopState();
    if (st && st.seed) localStorage.setItem(SHOP_SEED_KEY, String(st.seed));

    render();
    restoreScrollIfNeeded();
  })();
})();
