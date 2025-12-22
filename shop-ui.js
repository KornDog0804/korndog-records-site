(function () {
  const grid = document.getElementById("products");
  if (!grid) return; // only on shop page

  // Inject modal HTML once
  function ensureModal() {
    if (document.getElementById("kdModal")) return;

    const modal = document.createElement("div");
    modal.id = "kdModal";
    modal.style.cssText = `
      position:fixed; inset:0; z-index:99999; display:none;
      align-items:center; justify-content:center; padding:18px;
      background:rgba(0,0,0,.72); backdrop-filter:blur(6px);
    `;

    modal.innerHTML = `
      <div class="kd-modal-card" style="
        width:min(980px,100%); max-height:92vh; overflow:auto;
        border-radius:22px; border:1px solid rgba(255,255,255,.14);
        background:rgba(18,5,43,.96); box-shadow:0 24px 70px rgba(0,0,0,.55);
      " role="dialog" aria-modal="true" aria-label="Product details">
        <div style="
          position:sticky; top:0; z-index:2;
          display:flex; align-items:center; justify-content:space-between; gap:10px;
          padding:14px 16px;
          background:linear-gradient(to right, rgba(10,1,30,.96), rgba(10,1,25,.92));
          border-bottom:1px solid rgba(123,255,90,.18);
        ">
          <p style="font-weight:900; letter-spacing:.02em; font-size:1rem; margin:0; color:#f5f5ff;">KornDog Quick View</p>
          <button id="kdClose" type="button" style="
            border:1px solid rgba(123,255,90,.55);
            background:rgba(123,255,90,.12);
            color:#7bff5a; border-radius:999px; padding:8px 12px;
            cursor:pointer; font-weight:800;
          ">✕ Close</button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px; padding:16px;" id="kdInner">
          <div style="border-radius:18px; overflow:hidden; border:1px solid rgba(255,255,255,.10); background:rgba(0,0,0,.18);">
            <img id="kdModalImg" alt="Record image" style="width:100%; height:auto; display:block;" />
            <div id="kdThumbs" style="display:flex; gap:10px; padding:10px; border-top:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03);"></div>
          </div>

          <div>
            <h3 id="kdModalName" style="margin:0 0 6px; font-size:1.35rem; color:#f5f5ff;">Artist — Title</h3>
            <div id="kdModalGrade" style="color:#a1a1c5; font-size:.95rem;">Grade:</div>
            <div id="kdModalPrice" style="margin-top:10px; font-weight:900; font-size:1.15rem; color:#f5f5ff;">$0.00</div>
            <div id="kdModalDesc" style="margin-top:10px; color:#a1a1c5; line-height:1.4;"></div>
            <div id="kdModalQty" style="margin-top:10px; color:#a1a1c5;"></div>

            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
              <button id="kdModalAdd" type="button" style="
                border-radius:999px; padding:0.6rem 1.3rem; font-size:0.92rem;
                border:none; cursor:pointer; font-weight:600;
                background:#7bff5a; color:#02010a;
              ">Add to Cart</button>

              <button id="kdModalBack" type="button" style="
                border-radius:999px; padding:0.6rem 1.3rem; font-size:0.92rem;
                border:1px solid rgba(123,255,90,.55); background:transparent;
                color:#7bff5a; cursor:pointer; font-weight:700;
              ">Back to Grid</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Mobile layout
    const applyResponsive = () => {
      const inner = document.getElementById("kdInner");
      if (!inner) return;
      if (window.innerWidth <= 860) inner.style.gridTemplateColumns = "1fr";
      else inner.style.gridTemplateColumns = "1fr 1fr";
    };
    window.addEventListener("resize", applyResponsive);
    applyResponsive();

    // Close handlers
    const close = () => {
      modal.style.display = "none";
      document.body.style.overflow = "";
      modal.setAttribute("aria-hidden", "true");
    };

    document.getElementById("kdClose").addEventListener("click", close);
    document.getElementById("kdModalBack").addEventListener("click", close);

    // Click outside closes
    modal.addEventListener("click", (e) => {
      const card = modal.querySelector(".kd-modal-card");
      if (card && !card.contains(e.target)) close();
    });

    // Escape closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "flex") close();
    });

    // expose
    window.kdCloseModal = close;
  }

  function openModalForPid(pid) {
    ensureModal();

    const p = window.kdGetProductById ? window.kdGetProductById(pid) : null;
    if (!p) return;

    const modal = document.getElementById("kdModal");
    const imgEl = document.getElementById("kdModalImg");
    const thumbs = document.getElementById("kdThumbs");

    const nameEl = document.getElementById("kdModalName");
    const gradeEl = document.getElementById("kdModalGrade");
    const priceEl = document.getElementById("kdModalPrice");
    const descEl = document.getElementById("kdModalDesc");
    const qtyEl = document.getElementById("kdModalQty");
    const addBtn = document.getElementById("kdModalAdd");

    const title = (p.artist ? `${p.artist} – ` : "") + (p.title || p.id || "Record");
    nameEl.textContent = title;
    gradeEl.textContent = "Grade: " + (p.grade || "—");
    priceEl.textContent = "$" + Number(p.price || 0).toFixed(2);
    descEl.textContent = p.description || "";
    qtyEl.textContent = "Qty available: " + (p.quantity ?? 1);

    // Build front/back thumbs
    thumbs.innerHTML = "";

    const front = p.imageFront || p.image || "";
    const back = p.imageBack || "";

    function setStage(src) {
      imgEl.src = src || "";
    }

    function addThumb(src, label) {
      if (!src) return null;
      const t = document.createElement("button");
      t.type = "button";
      t.setAttribute("aria-label", label);
      t.style.cssText = `
        width:64px; height:64px; border-radius:12px; overflow:hidden;
        border:1px solid rgba(255,255,255,.14);
        background:rgba(0,0,0,.2);
        cursor:pointer; opacity:.85; padding:0;
      `;
      t.innerHTML = `<img alt="${label}" style="width:100%; height:100%; object-fit:cover; display:block;" />`;
      const im = t.querySelector("img");
      im.src = src;

      t.addEventListener("click", (e) => {
        e.preventDefault();
        [...thumbs.querySelectorAll("button")].forEach(b => b.style.opacity = ".85");
        t.style.opacity = "1";
        setStage(src);
      });

      thumbs.appendChild(t);
      return t;
    }

    const tFront = addThumb(front, "Front cover");
    const tBack  = addThumb(back, "Back cover");

    // Default
    if (tFront) tFront.style.opacity = "1";
    setStage(front || back || "");

    // Add to cart
    addBtn.disabled = (p.available === false);
    addBtn.textContent = (p.available === false) ? "Unavailable" : "Add to Cart";
    addBtn.onclick = (e) => {
      e.preventDefault();
      if (p.available === false) return;
      window.addToCart && window.addToCart(p.id);
    };

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  // Click rules:
  // - Title/Desc are links -> browser navigates to product.html (shareable)
  // - Add button -> cart only
  // - Image area -> opens modal
  grid.addEventListener("click", (e) => {
    const target = e.target;

    // Let real links navigate
    if (target.closest("a.share-link")) return;

    // If button clicked, do nothing here
    if (target.closest("button")) return;

    const card = target.closest(".record-card");
    if (!card) return;

    const clickedImageArea = target.closest(".record-image") || target.tagName === "IMG";
    if (!clickedImageArea) return;

    e.preventDefault();
    openModalForPid(card.dataset.pid);
  });

  // Deep link support:
  // shop.html?pid=ID opens modal after products load
  function tryOpenFromPid() {
    const pid = new URLSearchParams(window.location.search).get("pid");
    if (!pid) return;

    // Wait until script.js is ready + products loaded
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      const p = window.kdGetProductById ? window.kdGetProductById(pid) : null;
      if (p) {
        openModalForPid(pid);
        clearInterval(t);
      }
      if (tries > 60) clearInterval(t);
    }, 150);
  }

  tryOpenFromPid();
})();
