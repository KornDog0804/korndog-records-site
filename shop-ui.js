// shop-ui.js
// - Injects Quick View modal
// - Exposes window.kdOpenModalFromCard(card)
// - Handles image tap -> opens modal
// - Leaves title/desc links alone

(function () {
  const grid = document.getElementById("products");
  if (!grid) return;

  // Inject modal once
  if (!document.getElementById("kdModal")) {
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

    // be tolerant: ANY img inside card
    const img = card.querySelector("img");
    const title = card.querySelector("h3")?.textContent || "Record";
    const grade = card.querySelector(".record-grade")?.textContent || "";
    const price = card.querySelector(".record-price")?.textContent || "";
    const desc = card.querySelector(".record-desc")?.textContent || "";
    const qty = card.querySelector(".qty-text")?.textContent || "";

    imgEl.src = img?.getAttribute("src") || "";
    nameEl.textContent = title.trim();
    gradeEl.textContent = grade.trim() || "Grade: —";
    priceEl.textContent = price.trim() || "";
    descEl.textContent = desc.trim() || "";
    qtyEl.textContent = qty.trim() || "";

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

  // IMAGE TAP opens modal. Links still navigate.
  grid.addEventListener(
    "click",
    (e) => {
      if (e.target.closest("a.share-link")) return;

      const card = e.target.closest(".record-card");
      if (!card) return;

      const isImageTap =
        e.target.closest(".record-image") ||
        e.target.tagName === "IMG";

      if (!isImageTap) return;

      e.preventDefault();
      e.stopPropagation();
      openModalFromCard(card);
    },
    true
  );
})();
