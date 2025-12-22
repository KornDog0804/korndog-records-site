// zk.js
// Restores Zombie Kitty bubble click -> opens SMS modal

(function(){
  const PHONE = "12705866000";

  function ensureModal(){
    if (document.getElementById("zk-modal")) return;

    const modal = document.createElement("div");
    modal.id = "zk-modal";
    modal.style.cssText = `
      position:fixed; inset:0; z-index:99999; display:none;
      align-items:center; justify-content:center; padding:16px;
      background:rgba(0,0,0,.65); backdrop-filter:blur(10px);
    `;
    modal.innerHTML = `
      <div style="
        width:min(560px,100%);
        background:rgba(10,1,30,.95);
        border:1px solid rgba(255,255,255,.12);
        border-radius:18px;
        padding:16px;
        box-shadow:0 18px 40px rgba(0,0,0,.55);
        color:#f5f5ff;
        font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
      ">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="font-weight:950; font-size:1.1rem;">Zombie Kitty Message</div>
          <button id="zk-close" type="button" style="
            border:none; background:transparent; color:#a1a1c5; font-size:1.6rem; cursor:pointer;
          ">×</button>
        </div>

        <div style="margin-top:10px; color:#a1a1c5; font-size:.92rem; line-height:1.35;">
          Type your message and it’ll open your phone’s text app pre-filled.
        </div>

        <textarea id="zk-text" style="
          margin-top:12px; width:100%; min-height:120px; resize:vertical;
          border-radius:14px; padding:10px 12px;
          background:rgba(5,0,15,.92); color:#f5f5ff;
          border:1px solid rgba(255,255,255,.16); outline:none;
          font-size:1rem; line-height:1.35;
        " placeholder="Yo Joey — I’m trying to grab a record…"></textarea>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
          <button id="zk-send" type="button" style="
            padding:10px 16px; border-radius:999px; border:none; cursor:pointer;
            font-weight:900; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem;
            background:#7bff5a; color:#02010a;
          ">Text Joey</button>

          <button id="zk-copy" type="button" style="
            padding:10px 16px; border-radius:999px; cursor:pointer;
            font-weight:900; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem;
            background:transparent; color:#7bff5a;
            border:1px solid rgba(123,255,90,.55);
          ">Copy Message</button>
        </div>

        <div id="zk-toast" style="display:none; margin-top:10px; color:#7bff5a; font-size:.9rem;">
          Copied ✅
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => (modal.style.display = "none");

    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    modal.querySelector("#zk-close").addEventListener("click", close);

    modal.querySelector("#zk-copy").addEventListener("click", async () => {
      const msg = modal.querySelector("#zk-text").value || "";
      try {
        await navigator.clipboard.writeText(msg);
      } catch {
        modal.querySelector("#zk-text").select();
        document.execCommand("copy");
      }
      const toast = modal.querySelector("#zk-toast");
      toast.style.display = "block";
      setTimeout(() => (toast.style.display = "none"), 1200);
    });

    modal.querySelector("#zk-send").addEventListener("click", () => {
      const msg = modal.querySelector("#zk-text").value || "";
      window.location.href = `sms:${PHONE}?body=${encodeURIComponent(msg)}`;
    });
  }

  function openModal(prefill){
    ensureModal();
    const modal = document.getElementById("zk-modal");
    const box = modal.querySelector("#zk-text");
    box.value = prefill || box.value || "";
    modal.style.display = "flex";
    box.focus();
  }

  // Bubble click: we support multiple possible markup styles
  document.addEventListener("click", (e) => {
    const bubble =
      e.target.closest('[data-zk="true"]') ||
      e.target.closest("#zk-bubble") ||
      e.target.closest(".zk-bubble") ||
      e.target.closest("#chat-bubble") ||
      e.target.closest(".chat-bubble");

    if (!bubble) return;

    e.preventDefault();
    e.stopPropagation();

    const prefill = bubble.getAttribute("data-zk-prefill") || "";
    openModal(prefill);
  }, true);
})();
