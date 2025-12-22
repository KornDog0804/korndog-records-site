// shop-ui.js
// Handles ONLY UI clicks on shop grid:
// - Click image -> modal with front/back + close works
// - Click text -> navigates to shareable product.html?id=...

(function(){
  // Inject modal CSS/HTML once
  function ensureModal(){
    if (document.getElementById("kd-img-modal")) return;

    const style = document.createElement("style");
    style.id = "kd-img-modal-style";
    style.textContent = `
      .kd-img-backdrop{
        position:fixed; inset:0; z-index:99999;
        display:none; align-items:center; justify-content:center;
        padding:16px;
        background:rgba(0,0,0,.72);
        backdrop-filter: blur(10px);
      }
      .kd-img-backdrop.open{ display:flex; }
      .kd-img-modal{
        width:min(980px, 100%);
        border-radius:18px;
        border:1px solid rgba(123,255,90,.35);
        background: rgba(10,1,30,.95);
        box-shadow: 0 24px 70px rgba(0,0,0,.65);
        overflow:hidden;
      }
      .kd-img-head{
        display:flex; align-items:center; justify-content:space-between;
        gap:12px;
        padding:12px 14px;
        border-bottom:1px solid rgba(255,255,255,.10);
      }
      .kd-img-title{
        font-weight:950;
        color:#f5f5ff;
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
      }
      .kd-img-close{
        border:none;
        background:rgba(123,255,90,.12);
        color:#7bff5a;
        border:1px solid rgba(123,255,90,.45);
        border-radius:999px;
        padding:8px 12px;
        font-weight:950;
        cursor:pointer;
      }
      .kd-img-body{
        display:grid;
        grid-template-columns: 1fr;
        gap:12px;
        padding:14px;
      }
      .kd-stage{
        width:100%;
        aspect-ratio:1/1;
        border-radius:16px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
      }
      .kd-stage img{
        width:100%; height:100%;
        object-fit:cover;
        display:block;
      }
      .kd-thumbs{
        display:flex; gap:10px;
        padding:10px;
        border-top:1px solid rgba(255,255,255,.08);
      }
      .kd-thumb{
        width:72px; height:72px;
        border-radius:14px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.14);
        cursor:pointer;
        opacity:.85;
        background: rgba(0,0,0,.20);
      }
      .kd-thumb.active{
        border-color: rgba(123,255,90,.70);
        opacity:1;
        box-shadow: 0 0 0 2px rgba(123,255,90,.15) inset;
      }
      .kd-thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
    `;
    document.head.appendChild(style);

    const backdrop = document.createElement("div");
    backdrop.id = "kd-img-modal";
    backdrop.className = "kd-img-backdrop";
    backdrop.innerHTML = `
      <div class="kd-img-modal" role="dialog" aria-modal="true">
        <div class="kd-img-head">
          <div class="kd-img-title" id="kd-img-title">Record</div>
          <button class="kd-img-close" type="button" id="kd-img-close">X</button>
        </div>
        <div class="kd-img-body">
          <div class="kd-stage">
            <img id="kd-stage-img" alt="Record image" />
          </div>
          <div class="kd-thumbs" id="kd-img-thumbs"></div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const close = () => backdrop.classList.remove("open");
    document.getElementById("kd-img-close").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  function pickImages(p){
    const front = p.imageFront || (p.images && p.images.front) || p.image || "";
    const back  = p.imageBack  || (p.images && p.images.back)  || "";
    return { front, back };
  }

  function openImageModal(p){
    ensureModal();
    const backdrop = document.getElementById("kd-img-modal");
    const title = document.getElementById("kd-img-title");
    const stage = document.getElementById("kd-stage-img");
    const thumbs = document.getElementById("kd-img-thumbs");

    const titleText = (p.artist ? `${p.artist} – ` : "") + (p.title || p.id || "Record");
    title.textContent = titleText;

    const { front, back } = pickImages(p);
    thumbs.innerHTML = "";

    function setStage(src){
      stage.onerror = () => {
        stage.removeAttribute("src");
        stage.style.background =
          "repeating-linear-gradient(45deg,#1f102f,#1f102f 6px,#12061f 6px,#12061f 12px)";
      };
      stage.style.background = "";
      stage.src = src || "";
    }

    function addThumb(src, label){
      if (!src) return null;
      const t = document.createElement("div");
      t.className = "kd-thumb";
      t.title = label;
      t.innerHTML = `<img alt="${label}">`;
      const img = t.querySelector("img");
      img.src = src;
      img.onerror = () => (t.style.opacity = ".35");
      t.addEventListener("click", () => {
        [...thumbs.querySelectorAll(".kd-thumb")].forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        setStage(src);
      });
      thumbs.appendChild(t);
      return t;
    }

    const tFront = addThumb(front, "Front");
    const tBack  = addThumb(back,  "Back");

    if (tFront) tFront.classList.add("active");
    setStage(front || back || "");

    backdrop.classList.add("open");
  }

  function goToSharePage(p){
    const url = `./product.html?id=${encodeURIComponent(p.id)}`;
    window.location.href = url;
  }

  // MAIN CLICK LOGIC (event delegation)
  document.addEventListener("click", (e) => {
    const grid = document.getElementById("products");
    if (!grid) return;

    const card = e.target.closest(".record-card");
    if (!card) return;

    // Don't hijack Add to Cart button
    if (e.target.closest("button")) return;

    const pid = card.dataset.pid;
    if (!pid) return;

    const p = (window.allProducts || []).find(x => String(x.id) === String(pid));
    if (!p) return;

    // If click happened in/near image area -> modal
    if (e.target.closest(".record-image") || e.target.closest("img") || e.target.classList.contains("flip-wrapper")) {
      e.preventDefault();
      e.stopPropagation();
      openImageModal(p);
      return;
    }

    // If click happened on text -> share page
    if (e.target.closest("h3") || e.target.closest(".record-desc") || e.target.closest(".record-grade") || e.target.closest(".record-price")) {
      e.preventDefault();
      e.stopPropagation();
      goToSharePage(p);
      return;
    }

    // Otherwise do nothing
  }, true);

})();
