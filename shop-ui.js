// shop-ui.js
// ✅ Fixes flip being blocked by modal tap-capture
// - 1st tap on image = flip (mobile-friendly)
// - 2nd tap (within 600ms) = open Quick View modal
// - DOES NOT touch products.json

(function () {
  const DOUBLE_TAP_MS = 600;

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

  function bindOnce() {
    const grid = document.getElementById("products");
    if (!grid) return;

    // Rebind is fine after re-render, but prevent stacking listeners on the SAME grid element
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

      // Prefer front image (flip front). If not found, grab any img.
      const img =
        card.querySelector(".flip-front img") ||
        card.querySelector(".record-image img") ||
        card.querySelector("img");

      const title =
        card.querySelector(".record-title")?.textContent ||
        card.querySelector("h3")?.textContent ||
        "Record";

      // Support both new and old class names
      const grade =
        card.querySelector(".record-meta")?.textContent ||
        card.querySelector(".record-grade")?.textContent ||
        "Grade: —";

      const price =
        card.querySelector(".record-price")?.textContent ||
        "";

      const desc =
        card.querySelector(".record-notes")?.textContent ||
        card.querySelector(".record-desc")?.textContent ||
        "";

      const qty =
        card.querySelector(".record-qty")?.textContent ||
        card.querySelector(".qty-text")?.textContent ||
        "";

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
      const realBtn =
        lastCard.querySelector("button.btn-primary") ||
        lastCard.querySelector("button");
      realBtn?.click();
    });

    // ---- TAP LOGIC: Flip first, modal on double-tap ----
    // Store last-tap timestamps per card id
    const lastTapMap = new Map();

    grid.addEventListener(
      "click",
      (e) => {
        // Never hijack normal links
        if (e.target.closest("a")) return;

        const card = e.target.closest(".record-card");
        if (!card) return;

        const isImageTap =
          e.target.closest(".record-image") ||
          e.target.closest(".flip-wrapper") ||
          e.target.closest(".flip-inner") ||
          e.target.closest(".flip-front") ||
          e.target.closest(".flip-back") ||
          e.target.tagName === "IMG";

        if (!isImageTap) return;

        const key = card.getAttribute("data-id") || card.querySelector(".record-title")?.textContent || "card";
        const now = Date.now();
        const last = lastTapMap.get(key) || 0;

        // Double tap -> open modal
        if (now - last <= DOUBLE_TAP_MS) {
          lastTapMap.set(key, 0);

          // Only now do we block the event
          e.preventDefault();
          e.stopPropagation();
          openModalFromCard(card);
          return;
        }

        // Single tap -> flip (do NOT prevent default; let other scripts run)
        lastTapMap.set(key, now);
        card.classList.toggle("is-flipped");
      },
      true
    );
  }

  document.addEventListener("DOMContentLoaded", bindOnce);
  document.addEventListener("kd:shopRendered", bindOnce);
  document.addEventListener("kd:ready", bindOnce);
})();
