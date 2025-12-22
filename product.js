// product.js
// Shareable product page: product.html?id=PRODUCT_ID
// Requires script.js (for loadProducts + addToCart)

(function(){
  const PRODUCTS_FILE = "./products.json2";

  function qs(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function safeText(el, txt){
    if (!el) return;
    el.textContent = txt || "";
  }

  function pickImages(p){
    const front = p.imageFront || (p.images && p.images.front) || p.image || "";
    const back  = p.imageBack  || (p.images && p.images.back)  || "";
    return { front, back };
  }

  async function getProducts(){
    // Prefer the global loader if script.js created it
    if (typeof window.loadProducts === "function") {
      try {
        const loaded = await window.loadProducts();
        if (Array.isArray(loaded) && loaded.length) return loaded;
      } catch {}
    }

    // Fallback direct load
    const res = await fetch(PRODUCTS_FILE, { cache: "no-store" });
    const raw = await res.json();
    return Array.isArray(raw) ? raw : [];
  }

  function setStage(src){
    const stage = document.getElementById("kd-stage-img");
    if (!stage) return;
    stage.onerror = () => {
      stage.removeAttribute("src");
      stage.style.background =
        "repeating-linear-gradient(45deg,#1f102f,#1f102f 6px,#12061f 6px,#12061f 12px)";
    };
    stage.style.background = "";
    stage.src = src || "";
  }

  function addThumb(container, src, label, onClick){
    if (!src) return null;
    const t = document.createElement("div");
    t.className = "kd-thumb";
    t.title = label;
    t.innerHTML = `<img alt="${label}">`;
    const img = t.querySelector("img");
    img.src = src;
    img.onerror = () => (t.style.opacity = ".35");
    t.addEventListener("click", onClick);
    container.appendChild(t);
    return t;
  }

  function toast(){
    const t = document.getElementById("kd-toast");
    if (!t) return;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 1200);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const id = qs("id");
    if (!id) {
      safeText(document.getElementById("kd-title"), "Missing product id.");
      return;
    }

    const products = await getProducts();
    const p = products.find(x => String(x.id) === String(id));
    if (!p) {
      safeText(document.getElementById("kd-title"), "Record not found.");
      return;
    }

    const titleText = (p.artist ? `${p.artist} – ` : "") + (p.title || p.id || "Record");
    safeText(document.getElementById("kd-title"), titleText);
    safeText(document.getElementById("kd-price"), "$" + Number(p.price || 0).toFixed(2));
    safeText(document.getElementById("kd-grade"), "Grade: " + (p.grade || "—"));
    safeText(document.getElementById("kd-qty"), "Qty available: " + (p.quantity ?? 1));
    safeText(document.getElementById("kd-desc"), p.description || "");

    const thumbs = document.getElementById("kd-thumbs");
    thumbs.innerHTML = "";

    const { front, back } = pickImages(p);

    const setActive = (el) => {
      [...thumbs.querySelectorAll(".kd-thumb")].forEach(x => x.classList.remove("active"));
      if (el) el.classList.add("active");
    };

    const tFront = addThumb(thumbs, front, "Front", () => { setStage(front); setActive(tFront); });
    const tBack  = addThumb(thumbs, back,  "Back",  () => { setStage(back);  setActive(tBack);  });

    // Default
    if (tFront) { setActive(tFront); setStage(front); }
    else if (tBack) { setActive(tBack); setStage(back); }
    else setStage("");

    // Add to cart
    const addBtn = document.getElementById("kd-add");
    const available = (p.available !== false);
    addBtn.disabled = !available;
    addBtn.textContent = available ? "Add to Cart" : "Unavailable";
    addBtn.addEventListener("click", () => {
      if (!available) return;
      if (typeof window.addToCart === "function") window.addToCart(p.id);
      else alert("Cart is not available.");
    });

    // Copy link
    document.getElementById("kd-copy").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast();
      } catch {
        alert("Couldn’t copy automatically. Copy the URL from the address bar.");
      }
    });
  });
})();
