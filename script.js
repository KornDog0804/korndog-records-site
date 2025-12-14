/* ================================
   KORNDOG RECORDS — script.js (FULL)
   - LOCKED: uses products.json2 ONLY
   - Shop: shuffle + pagination + only available items
   - Cart:
       Shipping = $7.99 up to 3, then +$0.50 per record AFTER 3
       3 for $25 = ANY record priced $10.00
       10% off $130+ = ONLY premium records (does not need to “bundle” with other discounts)
   - PayPal: builds cart from contents + applies shipping + combined discount amount
================================== */

(() => {
  // ----------------------------
  // CONFIG
  // ----------------------------
  const PRODUCTS_URL = "products.json2"; // 🔥 NEVER products.json
  const CART_KEY = "korndog_cart_v2";
  const PAGE_SIZE = 6;

  const PAYPAL_BUSINESS = "titans.rule1215@gmail.com";
  const PAYPAL_CURRENCY = "USD";

  // ----------------------------
  // HELPERS
  // ----------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const money = (n) => (Number(n || 0)).toFixed(2);

  function safeNum(n, fallback = 0) {
    const x = Number(n);
    return Number.isFinite(x) ? x : fallback;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function normalize(str) {
    return String(str || "").toLowerCase().trim();
  }

  function isTenDollar(price) {
    // tolerate tiny float drift
    return Math.abs(safeNum(price, 0) - 10) < 0.001;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getImageFront(p) {
    return p.imageFront || (p.images && p.images.front) || p.image || "";
  }
  function getImageBack(p) {
    return p.imageBack || (p.images && p.images.back) || getImageFront(p) || "";
  }

  // ----------------------------
  // CART STORAGE
  // ----------------------------
  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return [];
      return data
        .filter((x) => x && x.id)
        .map((x) => ({ id: String(x.id), qty: Math.max(1, parseInt(x.qty || 1, 10)) }));
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCountPills();
  }

  function clearCart() {
    writeCart([]);
    renderCartIfOnPage();
  }
  window.clearCart = clearCart;

  function cartTotalQty(cart) {
    return cart.reduce((sum, line) => sum + (Number(line.qty) || 0), 0);
  }

  function updateCartCountPills() {
    const cart = readCart();
    const count = cartTotalQty(cart);
    $$("[data-cart-count]").forEach((el) => (el.textContent = String(count)));
  }

  // ----------------------------
  // PRODUCTS LOAD
  // ----------------------------
  async function loadProducts() {
    const url = `${PRODUCTS_URL}?v=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${PRODUCTS_URL}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("products.json2 must be an array");
    return data;
  }

  function productsById(products) {
    const map = {};
    for (const p of products) {
      if (p && p.id) map[String(p.id)] = p;
    }
    return map;
  }

  // ----------------------------
  // SHIPPING + DISCOUNTS
  // ----------------------------

  // Shipping: $7.99 up to 3 records, then +$0.50 each record AFTER 3
  function calcShipping(totalQty) {
    const base = 7.99;
    const extraPer = 0.50;
    if (totalQty <= 0) return 0;
    if (totalQty <= 3) return base;
    return +(base + (totalQty - 3) * extraPer).toFixed(2);
  }

  // 3-for-$25 discount: ANY record priced $10.00
  function calcTenDollarBundleDiscount(cartItems, byId) {
    const unitPrices = [];

    for (const line of cartItems) {
      const p = byId[line.id];
      if (!p) continue;

      const price = safeNum(p.price, 0);
      if (!isTenDollar(price)) continue;

      const q = Math.max(1, Number(line.qty) || 1);
      for (let i = 0; i < q; i++) unitPrices.push(price);
    }

    // Sorting high->low makes discount never worse if you ever mix $10-ish items
    unitPrices.sort((a, b) => b - a);

    const bundles = Math.floor(unitPrices.length / 3);
    let discount = 0;

    for (let b = 0; b < bundles; b++) {
      const i = b * 3;
      const groupSum = unitPrices[i] + unitPrices[i + 1] + unitPrices[i + 2];
      discount += Math.max(0, groupSum - 25);
    }

    return +discount.toFixed(2);
  }

  // 10% off $130+ — ONLY premium records
  function calcPremiumOnlyDiscount(cartItems, byId) {
    let premiumSubtotal = 0;

    for (const line of cartItems) {
      const p = byId[line.id];
      if (!p) continue;

      const tier = normalize(p.tier || "premium"); // default premium if missing
      if (tier !== "premium") continue;

      const price = safeNum(p.price, 0);
      const qty = Math.max(1, Number(line.qty) || 1);

      premiumSubtotal += price * qty;
    }

    premiumSubtotal = +premiumSubtotal.toFixed(2);

    if (premiumSubtotal >= 130) {
      return +(premiumSubtotal * 0.10).toFixed(2);
    }
    return 0;
  }

  function calcCartTotals(cartItems, byId) {
    let subtotal = 0;
    let totalQty = 0;

    for (const line of cartItems) {
      const p = byId[line.id];
      if (!p) continue;

      const price = safeNum(p.price, 0);
      const qty = Math.max(1, Number(line.qty) || 1);

      subtotal += price * qty;
      totalQty += qty;
    }

    subtotal = +subtotal.toFixed(2);

    const tenDollarDiscount = calcTenDollarBundleDiscount(cartItems, byId);

    // Premium discount is computed independently (not “bundled” for eligibility)
    const premiumDiscount = calcPremiumOnlyDiscount(cartItems, byId);

    const shipping = calcShipping(totalQty);

    const total = Math.max(
      0,
      +(subtotal - tenDollarDiscount - premiumDiscount + shipping).toFixed(2)
    );

    return {
      subtotal,
      totalQty,
      tenDollarDiscount,
      premiumDiscount,
      shipping,
      total
    };
  }

  // ----------------------------
  // SHOP PAGE RENDER
  // ----------------------------
  async function renderShop() {
    const grid = $("#products");
    const pager = $("#pagination");
    if (!grid || !pager) return;

    updateCartCountPills();

    let products = await loadProducts();

    // ONLY show items not hidden
    products = products.filter((p) => p && p.id && p.available !== false);

    // shuffle so it feels fresh
    products = shuffle(products);

    const stateKey = "korndog_shop_page";
    let currentPage = parseInt(sessionStorage.getItem(stateKey) || "1", 10);
    if (!Number.isFinite(currentPage) || currentPage < 1) currentPage = 1;

    const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    currentPage = clamp(currentPage, 1, totalPages);

    function renderPage(page) {
      currentPage = clamp(page, 1, totalPages);
      sessionStorage.setItem(stateKey, String(currentPage));

      grid.innerHTML = "";

      const start = (currentPage - 1) * PAGE_SIZE;
      const pageItems = products.slice(start, start + PAGE_SIZE);

      for (const p of pageItems) {
        const front = getImageFront(p);
        const back = getImageBack(p);
        const qtyAvail = Math.max(0, parseInt(p.quantity ?? 1, 10) || 1);

        const card = document.createElement("article");
        card.className = "record-card";

        const imgWrap = document.createElement("div");
        imgWrap.className = "record-image";

        const flipWrap = document.createElement("div");
        flipWrap.className = "flip-wrapper";

        const flipInner = document.createElement("div");
        flipInner.className = "flip-inner";

        const frontDiv = document.createElement("div");
        frontDiv.className = "flip-front " + (front ? "" : "image-missing");

        const backDiv = document.createElement("div");
        backDiv.className = "flip-back " + (back ? "" : "image-missing");

        if (front) {
          const img = document.createElement("img");
          img.src = front;
          img.alt = `${p.artist || ""} ${p.title || ""}`.trim() || "Record";
          frontDiv.appendChild(img);
        }

        if (back) {
          const img2 = document.createElement("img");
          img2.src = back;
          img2.alt = "Back / vinyl";
          backDiv.appendChild(img2);
        }

        flipInner.appendChild(frontDiv);
        flipInner.appendChild(backDiv);
        flipWrap.appendChild(flipInner);
        imgWrap.appendChild(flipWrap);

        const title = document.createElement("h3");
        title.textContent =
          `${p.artist ? p.artist + " — " : ""}${p.title || ""}`.trim() || p.id;

        const grade = document.createElement("div");
        grade.className = "record-grade";
        grade.textContent = `Grade: ${p.grade || "—"}`;

        const price = document.createElement("div");
        price.className = "record-price";
        price.textContent = `$${money(p.price)}`;

        const desc = document.createElement("div");
        desc.className = "record-desc";
        desc.textContent = p.description || "";

        const qty = document.createElement("div");
        qty.className = "qty-text";
        qty.textContent = `Qty available: ${qtyAvail}`;

        const btn = document.createElement("button");
        btn.className = "btn-primary";
        btn.textContent = "Add to Cart";

        if (qtyAvail <= 0) {
          btn.disabled = true;
          btn.textContent = "Sold Out";
          btn.style.opacity = "0.6";
          btn.style.cursor = "not-allowed";
        }

        btn.addEventListener("click", () => {
          addToCart(p, qtyAvail);
        });

        card.appendChild(imgWrap);
        card.appendChild(title);
        card.appendChild(grade);
        card.appendChild(price);
        if (p.description) card.appendChild(desc);
        card.appendChild(qty);
        card.appendChild(btn);

        grid.appendChild(card);
      }

      renderPager();
    }

    function renderPager() {
      pager.innerHTML = "";
      for (let i = 1; i <= totalPages; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = String(i);
        if (i === currentPage) b.classList.add("active");
        b.addEventListener("click", () => renderPage(i));
        pager.appendChild(b);
      }
    }

    function addToCart(product, maxQty) {
      const cart = readCart();
      const idx = cart.findIndex((x) => x.id === product.id);

      if (idx === -1) {
        cart.push({ id: String(product.id), qty: 1 });
      } else {
        cart[idx].qty = Math.min(maxQty || 9999, (cart[idx].qty || 1) + 1);
      }

      writeCart(cart);
    }

    renderPage(currentPage);
  }

  // ----------------------------
  // CART PAGE RENDER
  // ----------------------------
  async function renderCartIfOnPage() {
    const itemsEl = $("#cart-items");
    const summaryEl = $("#cart-summary");
    if (!itemsEl || !summaryEl) {
      updateCartCountPills();
      return;
    }

    updateCartCountPills();

    let products = [];
    try {
      products = await loadProducts();
    } catch {
      itemsEl.innerHTML = `<p style="color:#a1a1c5;">Couldn’t load inventory. Try refreshing.</p>`;
      summaryEl.innerHTML = "";
      return;
    }

    const byId = productsById(products);
    let cart = readCart();

    cart = cart.filter((line) => !!byId[line.id]);
    writeCart(cart);

    cart = cart.map((line) => {
      const p = byId[line.id];
      const maxQty = Math.max(0, parseInt(p.quantity ?? 1, 10) || 1);
      return { ...line, qty: clamp(line.qty, 1, Math.max(1, maxQty)) };
    });
    writeCart(cart);

    function setQty(id, newQty) {
      const p = byId[id];
      if (!p) return;

      const maxQty = Math.max(0, parseInt(p.quantity ?? 1, 10) || 1);
      const qty = clamp(newQty, 0, Math.max(0, maxQty));

      let next = readCart();
      const idx = next.findIndex((x) => x.id === id);
      if (idx === -1) return;

      if (qty <= 0) next.splice(idx, 1);
      else next[idx].qty = qty;

      writeCart(next);
      renderNow();
    }

    function renderNow() {
      cart = readCart();
      itemsEl.innerHTML = "";

      if (!cart.length) {
        itemsEl.innerHTML = `<p style="color:#a1a1c5;">Cart is empty. Grab some wax.</p>`;
      } else {
        for (const line of cart) {
          const p = byId[line.id];
          if (!p) continue;

          const qtyAvail = Math.max(0, parseInt(p.quantity ?? 1, 10) || 1);
          const title = `${p.artist ? p.artist + " — " : ""}${p.title || ""}`.trim() || p.id;
          const grade = p.grade || "—";
          const unit = safeNum(p.price, 0);
          const lineTotal = +(unit * line.qty).toFixed(2);

          const row = document.createElement("div");
          row.className = "cart-row";

          const left = document.createElement("div");
          left.style.flex = "1";

          const t = document.createElement("p");
          t.className = "cart-title";
          t.textContent = title;

          const g = document.createElement("p");
          g.className = "cart-grade";
          g.textContent = `Grade: ${grade}`;

          left.appendChild(t);
          left.appendChild(g);

          const qtyWrap = document.createElement("div");
          qtyWrap.className = "cart-qty";

          const minus = document.createElement("button");
          minus.type = "button";
          minus.textContent = "–";
          minus.addEventListener("click", () => setQty(line.id, line.qty - 1));

          const num = document.createElement("span");
          num.textContent = String(line.qty);
          num.style.minWidth = "18px";
          num.style.textAlign = "center";

          const plus = document.createElement("button");
          plus.type = "button";
          plus.textContent = "+";
          plus.addEventListener("click", () => setQty(line.id, line.qty + 1));

          if (line.qty >= qtyAvail) {
            plus.style.opacity = "0.4";
            plus.style.cursor = "not-allowed";
          }

          qtyWrap.appendChild(minus);
          qtyWrap.appendChild(num);
          qtyWrap.appendChild(plus);

          const priceEl = document.createElement("div");
          priceEl.className = "cart-line-price";
          priceEl.textContent = `$${money(lineTotal)}`;

          row.appendChild(left);
          row.appendChild(qtyWrap);
          row.appendChild(priceEl);

          itemsEl.appendChild(row);
        }
      }

      const totals = calcCartTotals(cart, byId);

      summaryEl.innerHTML = `
        <div class="cart-total">
          <div>Subtotal: $${money(totals.subtotal)}</div>
          <div>Shipping (7.99 up to 3, +0.50 after): $${money(totals.shipping)}</div>
          <div>3 for $25 ($10 records): -$${money(totals.tenDollarDiscount)}</div>
          <div>10% Discount (Premium $130+): -$${money(totals.premiumDiscount)}</div>
          <div style="margin-top:6px;font-weight:800;">Total: $${money(totals.total)}</div>
        </div>
      `;

      wirePayPal(cart, byId, totals);
    }

    renderNow();
  }

  // ----------------------------
  // PAYPAL CART BUILDER
  // ----------------------------
  function wirePayPal(cart, byId, totals) {
    const payBtn = $("#paypal-button");
    const form = $("#paypal-form");
    if (!payBtn || !form) return;

    if (!cart.length || totals.total <= 0) {
      payBtn.disabled = true;
      payBtn.style.opacity = "0.6";
      payBtn.style.cursor = "not-allowed";
      return;
    }

    payBtn.disabled = false;
    payBtn.style.opacity = "1";
    payBtn.style.cursor = "pointer";

    function buildForm() {
      form.innerHTML = "";
      form.method = "POST";
      form.action = "https://www.paypal.com/cgi-bin/webscr";

      const add = (name, value) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
      };

      add("cmd", "_cart");
      add("upload", "1");
      add("business", PAYPAL_BUSINESS);
      add("currency_code", PAYPAL_CURRENCY);

      let itemIndex = 1;
      for (const line of cart) {
        const p = byId[line.id];
        if (!p) continue;

        const title = `${p.artist ? p.artist + " — " : ""}${p.title || ""}`.trim() || p.id;
        const unit = safeNum(p.price, 0);
        const qty = Math.max(1, Number(line.qty) || 1);

        add(`item_name_${itemIndex}`, title);
        add(`amount_${itemIndex}`, money(unit));
        add(`quantity_${itemIndex}`, String(qty));
        itemIndex++;
      }

      add("handling_cart", money(totals.shipping));

      // PayPal only accepts one cart discount number, so we send the combined *amount* (eligibility is handled in our math)
      const combinedDiscount = +(safeNum(totals.tenDollarDiscount, 0) + safeNum(totals.premiumDiscount, 0)).toFixed(2);
      if (combinedDiscount > 0) add("discount_amount_cart", money(combinedDiscount));

      add("no_note", "0");
      add("cn", "Order notes for Joey");
    }

    buildForm();

    payBtn.onclick = (e) => {
      e.preventDefault();
      buildForm();
      form.submit();
    };
  }

  // ----------------------------
  // BOOT
  // ----------------------------
  async function boot() {
    updateCartCountPills();

    try {
      await renderShop();
    } catch {
      const grid = $("#products");
      if (grid) grid.innerHTML = `<p style="color:#a1a1c5;">Couldn’t load inventory. Check products.json2.</p>`;
    }

    try {
      await renderCartIfOnPage();
    } catch {
      const itemsEl = $("#cart-items");
      if (itemsEl) itemsEl.innerHTML = `<p style="color:#a1a1c5;">Cart error. Refresh and try again.</p>`;
    }
  }

  window.addEventListener("focus", updateCartCountPills);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateCartCountPills();
  });

  boot();
})();
