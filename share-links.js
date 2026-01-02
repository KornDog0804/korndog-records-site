// share-links.js
// - Makes record titles clickable links to product.html?pid=...
// - Uses products.json2 as the source of truth (does NOT touch product.json)
// - Works even when ids have spaces/apostrophes by using normalization + fallback matching

(function () {
  let productsPromise = null;

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      // normalize apostrophes and odd unicode punctuation
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
      // remove quotes/apostrophes/punctuation except alphanumerics/spaces
      .replace(/[^a-z0-9\s]/g, "")
      // collapse whitespace
      .replace(/\s+/g, " ");
  }

  function getTitleText(card) {
    const titleEl = card.querySelector(".record-title") || card.querySelector("h3");
    return titleEl ? titleEl.textContent.trim() : "";
  }

  function getArtistText(card) {
    // If you have an artist element, use it. Otherwise attempt to parse "Artist — Title"
    const artistEl =
      card.querySelector(".record-artist") ||
      card.querySelector("[data-artist]");

    if (artistEl) return (artistEl.textContent || artistEl.getAttribute("data-artist") || "").trim();

    const title = getTitleText(card);
    // common patterns: "Artist — Title" or "Artist - Title"
    const m = title.split("—");
    if (m.length >= 2) return m[0].trim();
    const m2 = title.split(" - ");
    if (m2.length >= 2) return m2[0].trim();

    return "";
  }

  async function loadProducts() {
    if (productsPromise) return productsPromise;

    productsPromise = (async () => {
      const res = await fetch("products.json2", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load products.json2");
      const data = await res.json();
      return Array.isArray(data) ? data : data?.products || data?.items || [];
    })();

    return productsPromise;
  }

  function bestKey(p) {
    // Always prefer a true pid if it exists, otherwise fall back to id
    return (p && (p.pid || p.slug || p.id)) ? (p.pid || p.slug || p.id) : "";
  }

  function findProductMatch(products, card) {
    const titleText = getTitleText(card);
    const artistText = getArtistText(card);

    const nTitle = norm(titleText);
    const nArtist = norm(artistText);

    // 1) If card already has a usable pid/id in dataset, try that first
    const datasetKey =
      card.getAttribute("data-pid") ||
      card.getAttribute("data-id") ||
      card.getAttribute("data-product-id") ||
      card.getAttribute("data-sku") ||
      "";

    if (datasetKey) {
      const dk = datasetKey.trim();
      const direct =
        products.find(p => (p.pid || p.slug || "") === dk) ||
        products.find(p => (p.id || "") === dk);
      if (direct) return direct;
    }

    // 2) Match by exact normalized "artist + title"
    if (nArtist && nTitle) {
      const combo1 = norm(`${artistText} ${titleText}`);
      const byCombo = products.find(p => norm(`${p.artist || ""} ${p.title || ""}`) === combo1);
      if (byCombo) return byCombo;
    }

    // 3) Match by normalized title only (fallback)
    if (nTitle) {
      const byTitle = products.find(p => norm(p.title || "") === nTitle);
      if (byTitle) return byTitle;
    }

    // 4) Last resort: match by normalized id (handles Commodore's / Johnny Cash Collection cases)
    if (titleText) {
      const byIdLoose = products.find(p => norm(p.id || "") === nTitle);
      if (byIdLoose) return byIdLoose;
    }

    return null;
  }

  async function linkifyTitles() {
    const grid = document.getElementById("products");
    if (!grid) return;

    let products = [];
    try {
      products = await loadProducts();
    } catch (e) {
      // If products can't load, don't create bad links.
      return;
    }

    const cards = grid.querySelectorAll(".record-card");
    cards.forEach((card) => {
      const titleEl = card.querySelector(".record-title") || card.querySelector("h3");
      if (!titleEl) return;
      if (titleEl.closest("a")) return; // already linked

      const product = findProductMatch(products, card);
      if (!product) return;

      const key = bestKey(product);
      if (!key) return;

      const a = document.createElement("a");
      a.className = "record-link";
      a.href = `product.html?pid=${encodeURIComponent(key)}`;
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
