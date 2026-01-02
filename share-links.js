// share-links.js
// Makes record titles clickable links to product.html?id=...
// Does NOT modify products.json or your render code.

(function () {
  function getCardId(card) {
    return (
      card.getAttribute("data-id") ||
      card.getAttribute("data-product-id") ||
      card.getAttribute("data-sku") ||
      card.querySelector("[data-id]")?.getAttribute("data-id") ||
      card.querySelector("button[data-id]")?.getAttribute("data-id") ||
      null
    );
  }

  function linkifyTitles() {
    const grid = document.getElementById("products");
    if (!grid) return;

    const cards = grid.querySelectorAll(".record-card");
    cards.forEach((card) => {
      const titleEl =
        card.querySelector(".record-title") ||
        card.querySelector("h3");

      if (!titleEl) return;
      if (titleEl.closest("a")) return; // already linked

      const id = getCardId(card);
      if (!id) return; // if your cards don't have ids, we won't guess and break stuff

      const a = document.createElement("a");
      a.className = "record-link";
      a.href = `product.html?id=${encodeURIComponent(id)}`;
      a.setAttribute("aria-label", `Open ${titleEl.textContent?.trim() || "record"}`);

      // wrap the title element in the link
      titleEl.parentNode.insertBefore(a, titleEl);
      a.appendChild(titleEl);
    });
  }

  document.addEventListener("DOMContentLoaded", linkifyTitles);
  document.addEventListener("kd:shopRendered", linkifyTitles);
  document.addEventListener("kd:ready", linkifyTitles);
})();
