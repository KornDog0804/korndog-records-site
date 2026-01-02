// shop-ui.js — LOCKED + DUMMYPROOF
// - Guaranteed back images in Quick View
// - Flip cards use back images when possible
// - Bulletproof ID detection
// - Safe with late renders / filters / pagination
// - No dependency on render order
// - Does NOT touch products.json2

(function () {
  let productsMapPromise = null;

  /* =========================
     SAFE UTILS
     ========================= */
  function safeText(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* =========================
     BULLETPROOF ID DETECTION
     ========================= */
  function getPidFromCard(card) {
    if (!card) return "";

    // 1) dataset (best case)
    const ds = card.dataset?.pid || card.dataset?.id;
    if (ds) return String(ds);

    // 2) attributes on card
    const direct =
      card.getAttribute("data-id") ||
      card.getAttribute("data-pid") ||
      card.getAttribute("data-product-id") ||
      card.getAttribute("data-sku");
    if (direct) return String(direct);

    // 3) any child element with data-id / data-pid
    const inside =
      card.querySelector("[data-pid]")?.getAttribute("data-pid") ||
      card.querySelector("[data-id]")?.getAttribute("data-id") ||
      card.querySelector("button[data-id]")?.getAttribute("data-id") ||
      card.querySelector("button[data-pid]")?.getAttribute("data-pid");
    if (inside) return String(inside);

    // 4) product links (?id= or ?pid=)
    const a =
      card.querySelector('a[href*="product.html?pid="]') ||
      card.querySelector('a[href*="product.html?id="]') ||
      card.querySelector('a[href*="pid="]') ||
      card.querySelector('a[href*="id="]');
    if (!a) return "";

    try {
      const url = new URL(a.getAttribute("href"), window.location.origin);
      return url.searchParams.get("pid") || url.searchParams.get("id") || "";
    } catch {
      return "";
    }
  }

  /* =========================
     LOAD PRODUCTS MAP
     ========================= */
  async function loadProductsMap() {
    if (productsMapPromise) return productsMapPromise;

    productsMapPromise = (async () => {
      const files = ["products.json2", "products.json"];
      for (const file of files) {
        try {
          const res = await fetch(file, { cache: "no-store" });
          if (!res.ok) continue;

          const data = await res.json();
          const arr = Array.isArray(data)
            ? data
            : data?.products || data?.items || [];

          const map = new Map();

          arr.forEach((p) => {
            const id = p.id || p.pid || p.slug;
            if (!id) return;

            const back =
              p.imageBack ||
              p.images?.back ||
              p.images?.Back ||
              p.backImage ||
              p.back ||
              "";

            const front =
              p.imageFront ||
              p.image ||
              p.images?.front ||
              "";

            map.set(String(id), {
              front,
              back: back || front,
            });
          });

          return map;
        } catch (e) {}
      }

      return new Map();
    })();

    return productsMapPromise;
  }

  /* =========================
     QUICK VIEW MODAL
     ========================= */
  function ensureModal() {
    if (document.getElementById("kdModal")) return;

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div id="kdModal" class="kd-modal" aria-hidden="true">
        <div class="kd-modal-card">
          <div class="kd-modal-topbar">
            <p>KornDog Quick View</p>
            <button id="kdClose">✕ Close</button>
          </div>
          <div class="kd-modal-inner">
            <div class="kd-modal-media">
              <img id="kdModalImg" />
              <img id="kdModalImgBack" style="display:none;margin-top:12px" />
            </div>
            <div class="kd-modal-details">
              <h3 id="kdModalName"></h3>
              <div id="kdModalGrade"></div>
              <div id="kdModalPrice"></div>
              <div id="kdModalDesc"></div>
              <div id="kdModalQty"></div>
              <div class="kd-modal-actions">
                <button id="kdModalAdd">Add to Cart</button>
                <button id="kdModalBack">Back to Grid</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    );
  }

  /* =========================
     FLIP BUILDER
     ========================= */
  async function enhanceFlipCards(grid) {
    if (!grid) return;

    const map = await loadProductsMap();

    grid.querySelectorAll(".record-card").forEach((card) => {
      if (card.querySelector(".flip-wrapper")) return;

      const img = card.querySelector("img");
      if (!img) return;

      const pid = getPidFromCard(card);
      const data = map.get(pid);

      const frontSrc = img.src;
      const backSrc = data?.back || frontSrc;

      const wrap = document.createElement("div");
      wrap.className = "record-image";
      wrap.innerHTML = `
        <div class="flip-wrapper">
          <div class="flip-inner">
            <div class="flip-front"><img src="${frontSrc}" /></div>
            <div class="flip-back"><img src="${backSrc}" /></div>
          </div>
        </div>
      `;

      img.replaceWith(wrap);
    });
  }

  /* =========================
     MAIN BIND
     ========================= */
  function bindOnce() {
    const grid = document.getElementById("products");
    if (!grid || grid.dataset.kdBound) return;
    grid.dataset.kdBound = "1";

    ensureModal();

    const modal = document.getElementById("kdModal");
    const imgFront = document.getElementById("kdModalImg");
    const imgBack = document.getElementById("kdModalImgBack");

    const nameEl = document.getElementById("kdModalName");
    const gradeEl = document.getElementById("kdModalGrade");
    const priceEl = document.getElementById("kdModalPrice");
    const descEl = document.getElementById("kdModalDesc");
    const qtyEl = document.getElementById("kdModalQty");

    let lastCard = null;

    async function openModal(card) {
      lastCard = card;

      const pid = getPidFromCard(card);
      const map = await loadProductsMap();
      const data = map.get(pid) || {};

      imgFront.src = data.front || card.querySelector("img")?.src || "";
      imgBack.src = data.back || "";
      imgBack.style.display =
        data.back && data.back !== data.front ? "block" : "none";

      nameEl.textContent = card.querySelector("h3")?.textContent || "";
      gradeEl.textContent =
        card.querySelector(".record-grade")?.textContent || "";
      priceEl.textContent =
        card.querySelector(".record-price")?.textContent || "";
      descEl.textContent =
        card.querySelector(".record-desc")?.textContent || "";
      qtyEl.textContent =
        card.querySelector(".qty-text")?.textContent || "";

      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    document.getElementById("kdClose").onclick =
      document.getElementById("kdModalBack").onclick =
      () => {
        modal.classList.remove("open");
        document.body.style.overflow = "";
      };

    grid.addEventListener("click", async (e) => {
      if (e.target.closest("a")) return;

      const card = e.target.closest(".record-card");
      if (!card) return;

      if (
        e.target.closest(".record-image") ||
        e.target.tagName === "IMG"
      ) {
        e.preventDefault();
        await openModal(card);
      }
    });

    enhanceFlipCards(grid);

    new MutationObserver(() => enhanceFlipCards(grid)).observe(grid, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("DOMContentLoaded", bindOnce);
  document.addEventListener("kd:shopRendered", bindOnce);
  document.addEventListener("kd:ready", bindOnce);
})();
