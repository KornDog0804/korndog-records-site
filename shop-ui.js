// shop-ui.js
// - Injects Quick View modal once
// - Auto-builds flip HTML on cards (front/back) without touching products.json
// - Mobile: 1st tap flips, 2nd tap opens Quick View
// - Links (titles/share links) remain clickable and normal

(function () {
  let productsMapPromise = null;

  function safeText(str) {
    return String(str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function getPidFromCard(card) {
    // 1) data-pid if present
    const dp = card?.dataset?.pid;
    if (dp) return dp;

    // 2) share/product link href with ?pid=
    const a =
      card.querySelector('a[href*="product.html?pid="]') ||
      card.querySelector('a.share-link[href*="pid="]') ||
      card.querySelector('a[href*="pid="]');
    if (!a) return "";

    try {
      const url = new URL(a.getAttribute("href"), window.location.origin);
      return url.searchParams.get("pid") || "";
    } catch {
      return "";
    }
  }

  async function loadProductsMap() {
    if (productsMapPromise) return productsMapPromise;

    productsMapPromise = (async () => {
      const candidates = ["products.json2", "products.json"];
      for (const file of candidates) {
        try {
          const res = await fetch(file, { cache: "no-store" });
          if (!res.ok) continue;

          const data = await res.json();
          const arr = Array.isArray(data) ? data : data?.products || data?.items || [];
          const map = new Map();

          for (const p of arr) {
            const pid = p.pid || p.id || p.slug || "";
            if (!pid) continue;

            const back =
              p.backImage ||
              p.back ||
              p.backImg ||
              p.imageBack ||
              p.photoBack ||
              (Array.isArray(p.images) ? p.images[1] : "") ||
              "";

            map.set(pid, {
              back: back || "",
            });
          }

          return map;
        } catch (e) {
          // try next file
        }
      }

      // If both fail, return empty map (flip still works, backs fallback to front)
      return new Map();
    })();

    return productsMapPromise;
  }

  function ensureModal() {
    if (document.getElementById("kdModal")) return;

    const modalHTML = `
      <div id="kdModal" class="kd-modal" aria-hidden="true">
        <div class="kd-modal-card" role="dialog" aria-modal="true" aria-label="Product details">
          <div class="kd-modal-topbar">
            <p class="kd-modal-title">KornDog Quick View</p>
            <button id="kdClose" class="kd-close" type="button">✕ Close</button>
          </div>
          <div class="kd-modal-inner">
            <div class="kd-modal-media">
              <img id="kdModalImg" alt="Record image" />
            </div>
            <div class="kd-modal-details">
              <h3 id="kdModalName">Artist — Title</h3>
              <div class="muted" id="kdModalGrade">Grade: —</div>
              <div class="price" id="kdModalPrice">$0.00</div>
              <div class="desc" id="kdModalDesc"></div>
              <div class="qty" id="kdModalQty"></div>
              <div class="kd-modal-actions">
                <button id="kdModalAdd" class="btn-primary" type="button">Add to Cart</button>
                <button id="kdModalBack" class="btn-outline" type="button">Back to Grid</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  async function enhanceFlipCards(grid) {
    if (!grid) return;

    const map = await loadProductsMap();
    const cards = grid.querySelectorAll(".record-card");

    cards.forEach((card) => {
      // Find the existing image area
      const recordImage = card.querySelector(".record-image") || card;
      const existingWrapper = card.querySelector(".flip-wrapper");
      if (existingWrapper) {
        // If wrapper exists, try to set back image if it’s still missing
        const pid = getPidFromCard(card);
        const backFromMap = map.get(pid)?.back || "";
        const frontImg = card.querySelector(".flip-front img") || card.querySelector("img");
        const backImg = card.querySelector(".flip-back img");
        if (frontImg && backImg) {
          const frontSrc = frontImg.getAttribute("src") || "";
          const desiredBack = backFromMap || backImg.getAttribute("src") || "";
          backImg.setAttribute("src", desiredBack || frontSrc);
        }
        return;
      }

      // Find the first img inside the card
      const img = card.querySelector("img");
      if (!img) return;

      const frontSrc = img.getAttribute("src") || "";
      if (!frontSrc) return;

      const pid = getPidFromCard(card);
      const backFromMap = map.get(pid)?.back || "";
      const backSrc = backFromMap || frontSrc;

      // Build flip structure
      const flipHTML = document.createElement("div");
      flipHTML.className = "record-image";
      flipHTML.innerHTML = `
        <div class="flip-wrapper">
          <div class="flip-inner">
            <div class="flip-front">
              <img src="${frontSrc}" alt="${safeText(img.getAttribute("alt") || "Record")}" loading="lazy">
            </div>
            <div class="flip-back">
              <img src="${backSrc}" alt="${safeText((img.getAttribute("alt") || "Record") + " (Back)")}" loading="lazy">
            </div>
          </div>
        </div>
      `;

      // Replace the old image node with the flip structure
      // If the original img was already inside .record-image, replace that container; else replace the img itself
      const oldContainer = card.querySelector(".record-image");
      if (oldContainer) {
        oldContainer.replaceWith(flipHTML);
      } else {
        img.replaceWith(flipHTML);
      }
    });
  }

  function bindOnce() {
    const grid = document.getElementById("products");
    if (!grid) return;

    if (grid.dataset.kdBound === "1") return;
    grid.dataset.kdBound = "1";

    ensureModal();

    const modal = document.getElementById("kdModal");
    const closeBtn = document.getElementById("kdClose");
    const backBtn = document.getElementById("kdModalBack");
    const imgEl = document.getElementById("kdModalImg");
    const nameEl = document.getElementById("kdModalName");
    const gradeEl = document.getElementById("kdModalGrade");
    const priceEl = document.getElementById("kdModalPrice");
    const descEl = document.getElementById("kdModalDesc");
    const qtyEl = document.getElementById("kdModalQty");
    const addBtn = document.getElementById("kdModalAdd");

    let lastCard = null;

    function openModalFromCard(card) {
      lastCard = card;

      const img =
        card.querySelector(".flip-front img") ||
        card.querySelector(".record-image img") ||
        card.querySelector("img");

      const title = card.querySelector("h3")?.textContent || "Record";
      const grade = card.querySelector(".record-grade")?.textContent || "Grade: —";
      const price = card.querySelector(".record-price")?.textContent || "";
      const desc = card.querySelector(".record-desc")?.textContent || "";
      const qty = card.querySelector(".qty-text")?.textContent || "";

      imgEl.src = img?.getAttribute("src") || "";
      nameEl.textContent = title.trim();
      gradeEl.textContent = grade.trim() || "Grade: —";
      priceEl.textContent = price.trim();
      descEl.textContent = desc.trim();
      qtyEl.textContent = qty.trim();

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lastCard = null;
    }

    window.kdOpenModalFromCard = openModalFromCard;

    closeBtn?.addEventListener("click", closeModal);
    backBtn?.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      const card = modal.querySelector(".kd-modal-card");
      if (card && !card.contains(e.target)) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });

    addBtn?.addEventListener("click", () => {
      if (!lastCard) return;
      const realBtn = lastCard.querySelector("button.btn-primary") || lastCard.querySelector("button");
      realBtn?.click();
    });

    // Flip + Quick View behavior on image taps (mobile friendly)
    const lastTap = new WeakMap(); // card -> timestamp

    grid.addEventListener(
      "click",
      async (e) => {
        // Never hijack link clicks (titles/share links must work)
        if (e.target.closest("a")) return;

        const card = e.target.closest(".record-card");
        if (!card) return;

        const tappedImage =
          e.target.closest(".record-image") ||
          e.target.closest(".flip-wrapper") ||
          e.target.closest(".flip-inner") ||
          e.target.tagName === "IMG";

        if (!tappedImage) return;

        // Make sure flip structure exists before we do anything
        await enhanceFlipCards(grid);

        const now = Date.now();
        const prev = lastTap.get(card) || 0;

        // If tapped quickly twice: open Quick View
        if (now - prev < 900) {
          e.preventDefault();
          e.stopPropagation();
          openModalFromCard(card);
          lastTap.set(card, 0);
          return;
        }

        // First tap: flip
        e.preventDefault();
        e.stopPropagation();
        card.classList.toggle("is-flipped");
        lastTap.set(card, now);
      },
      true
    );

    // Run once after bind to rebuild flips (covers cases where script.js stopped outputting flip HTML)
    enhanceFlipCards(grid);
  }

  document.addEventListener("DOMContentLoaded", bindOnce);
  document.addEventListener("kd:shopRendered", bindOnce);
  document.addEventListener("kd:ready", bindOnce);
})();
