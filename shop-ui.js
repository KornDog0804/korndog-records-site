// shop-ui.js
// - Injects Quick View modal + CSS (fixed overlay)
// - Exposes window.kdOpenModalFromCard(card)
// - Image tap -> opens modal (mobile safe)
// - Title/desc links still navigate

(function () {
  function injectStylesOnce() {
    if (document.getElementById("kdModalStyles")) return;

    const css = `
      .kd-modal{
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(0,0,0,.65);
        backdrop-filter: blur(10px);
      }
      .kd-modal.open{ display: flex; }

      .kd-modal-card{
        width: min(920px, 100%);
        max-height: 90vh;
        overflow: auto;
        border-radius: 18px;
        background: #12052b;
        border: 1px solid rgba(123,255,90,.25);
        box-shadow: 0 10px 40px rgba(0,0,0,.45);
      }

      .kd-modal-topbar{
        display:flex;
        align-items:center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(123,255,90,.18);
        position: sticky;
        top: 0;
        background: rgba(18,5,43,.92);
        backdrop-filter: blur(10px);
        z-index: 2;
      }

      .kd-modal-title{
        margin:0;
        font-weight: 700;
        color: #f5f5ff;
      }

      .kd-close{
        border: 1px solid rgba(123,255,90,.55);
        background: rgba(123,255,90,.12);
        color: #7bff5a;
        border-radius: 999px;
        padding: 8px 12px;
        font-weight: 700;
        cursor:pointer;
      }

      .kd-modal-inner{
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 16px;
      }
      @media (min-width: 800px){
        .kd-modal-inner{ grid-template-columns: 1fr 1fr; }
      }

      .kd-modal-media img{
        width: 100%;
        aspect-ratio: 1/1;
        object-fit: cover;
        border-radius: 14px;
        border: 1px solid rgba(123,255,90,.18);
        display:block;
      }

      .kd-modal-details h3{
        margin: 0 0 8px 0;
        font-size: 1.2rem;
        color: #f5f5ff;
      }
      .kd-modal-details .muted{ color: #a1a1c5; margin-bottom: 6px; }
      .kd-modal-details .price{ font-weight: 800; margin: 6px 0 10px; }
      .kd-modal-details .desc{ color:#a1a1c5; line-height: 1.45; }
      .kd-modal-details .qty{ color:#a1a1c5; margin-top: 8px; }

      .kd-modal-actions{
        display:flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }

      .btn-outline{
        border-radius:999px;
        padding:0.6rem 1.1rem;
        font-size:0.92rem;
        border:1px solid rgba(123,255,90,.55);
        background: rgba(123,255,90,.12);
        color: #7bff5a;
        font-weight:700;
        cursor:pointer;
      }
    `;

    const style = document.createElement("style");
    style.id = "kdModalStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function injectModalOnce() {
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

  function setup() {
    const grid = document.getElementById("products");
    if (!grid) return;

    injectStylesOnce();
    injectModalOnce();

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

    function getPidFromCard(card) {
      return card?.dataset?.pid || card?.getAttribute?.("data-pid") || "";
    }

    function openModalFromCard(card) {
      lastCard = card;

      const pid = getPidFromCard(card);
      const p =
        (pid && typeof window.kdGetProductById === "function" && window.kdGetProductById(pid)) ||
        null;

      // Prefer real product data if available
      const titleText =
        p
          ? (p.artist ? `${p.artist} – ${p.title}` : (p.title || p.id || "Record"))
          : (card.querySelector("h3")?.textContent || "Record");

      const gradeText =
        p ? `Grade: ${p.grade || "—"}` : (card.querySelector(".record-grade")?.textContent || "Grade: —");

      const priceText =
        p ? `$${Number(p.price || 0).toFixed(2)}` : (card.querySelector(".record-price")?.textContent || "$0.00");

      const descText =
        p ? (p.description || "") : (card.querySelector(".record-desc")?.textContent || "");

      const qtyText =
        p ? `Qty available: ${p.quantity ?? 1}` : (card.querySelector(".qty-text")?.textContent || "");

      const imgSrc =
        p
          ? (p.imageFront || p.image || p.imageBack || "")
          : (card.querySelector("img")?.getAttribute("src") || "");

      imgEl.src = imgSrc;
      nameEl.textContent = String(titleText).trim();
      gradeEl.textContent = String(gradeText).trim() || "Grade: —";
      priceEl.textContent = String(priceText).trim() || "$0.00";
      descEl.textContent = String(descText).trim();
      qtyEl.textContent = String(qtyText).trim();

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

    // Expose globally for any other scripts
    window.kdOpenModalFromCard = openModalFromCard;

    // Button bindings
    closeBtn?.addEventListener("click", closeModal);
    backBtn?.addEventListener("click", closeModal);

    // Click outside card closes
    modal.addEventListener("click", (e) => {
      const cardEl = modal.querySelector(".kd-modal-card");
      if (cardEl && !cardEl.contains(e.target)) closeModal();
    });

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });

    // Add-to-cart triggers the real card button
    addBtn?.addEventListener("click", () => {
      if (!lastCard) return;
      const realBtn = lastCard.querySelector("button.btn-primary") || lastCard.querySelector("button");
      realBtn?.click();
    });

    // ✅ Bind click ONCE (prevents double binding + weird mobile “lock”)
    if (grid.dataset.kdBound === "1") return;
    grid.dataset.kdBound = "1";

    // IMAGE TAP opens modal. Links still navigate.
    grid.addEventListener(
      "click",
      (e) => {
        // if they tapped the share link, let it navigate
        if (e.target.closest("a.share-link")) return;

        const card = e.target.closest(".record-card");
        if (!card) return;

        const isImageTap = e.target.closest(".record-image") || e.target.tagName === "IMG";
        if (!isImageTap) return;

        e.preventDefault();
        e.stopPropagation();
        window.kdOpenModalFromCard(card);
      },
      true
    );
  }

  // Run when ready
  document.addEventListener("DOMContentLoaded", setup);
})();
