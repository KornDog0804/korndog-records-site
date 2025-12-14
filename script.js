// ================== KORNDOG SCRIPT (SHOP + CART + ADMIN) ==================
// ✅ ONLY uses products.json2 (never touches products.json)
// ✅ Shows ALL products (does NOT hide available=false)
// ✅ Shipping: $7.99 + $0.50 per record (0 items = $0)
// ✅ Tiers:
//    - tenbin      => forces $10 price
//    - threefor25  => every 3 items = $25 (remainder at item price)
// ✅ Quantity limits respected
// ✅ Admin: edit ALL products + download/copy updated products.json2
// ==========================================================================

const PRODUCTS_FILE = "./products.json2"; // <- LOCKED IN. DO NOT CHANGE.
const CART_KEY = "korndog_cart_v2";
const PRODUCTS_PER_PAGE = 10;

let allProducts = [];
let currentPage = 1;

// ----------------------- UTIL ----------------------------
function money(n) {
  const x = Number(n || 0);
  return x.toFixed(2);
}

function safeLower(s) {
  return String(s || "").toLowerCase();
}

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard.");
  } catch (e) {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    alert("Copied to clipboard.");
  }
}

// -------------------- LOAD PRODUCTS --------------------
async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_FILE, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load products.json2");

    const raw = await res.json();
    const mapped = (Array.isArray(raw) ? raw : []).map((p) => {
      // Defaults / normalization
      const id = String(p.id || "").trim();

      // Default quantity
      let qty = typeof p.quantity === "number" ? p.quantity : 1;
      const idL = safeLower(id);
      const titleL = safeLower(p.title);

      // Special rule: 10 Dolla Holla defaults to qty 3 if missing
      if (
        (typeof p.quantity !== "number") &&
        (idL.includes("ten-dolla") || titleL.includes("10 dolla holla"))
      ) {
        qty = 3;
      }

      // Normalize images
      const imgFront = p.imageFront || (p.images && p.images.front) || p.image || "";
      const imgBack = p.imageBack || (p.images && p.images.back) || p.image || "";

      return {
        ...p,
        id,
        artist: p.artist || "",
        title: p.title || "",
        price: Number(p.price || 0),
        grade: p.grade || "",
        description: p.description || "",
        available: typeof p.available === "boolean" ? p.available : true,
        tier: p.tier || "",

        quantity: qty,

        image: p.image || imgFront || "",
        imageFront: imgFront || "",
        imageBack: imgBack || "",
        images: {
          front: imgFront || "",
          back: imgBack || "",
        },
      };
    });

    // Shuffle shop display so it feels fresh
    allProducts = shuffleArray(mapped);

    return allProducts;
  } catch (e) {
    console.error("loadProducts error:", e);
    allProducts = [];
    return [];
  }
}

// ------------------------ CART HELPERS ----------------------------
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Cart parse error", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = String(count);
}

// Effective per-item price based on tier
function getEffectiveUnitPrice(item) {
  if (item.tier === "tenbin") return 10;
  return Number(item.price || 0);
}

// Add one item to cart, respecting stock quantity
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const maxQty = typeof product.quantity === "number" ? product.quantity : 1;

  const cart = getCart();
  const existing = cart.find((it) => it.id === productId);

  if (existing) {
    if ((existing.qty || 0) >= maxQty) {
      alert(
        maxQty === 1
          ? "You only have 1 copy of this record in stock."
          : `You only have ${maxQty} copies of this record in stock.`
      );
      return;
    }
    existing.qty += 1;
  } else {
    const imageForCart = product.imageFront || product.image || product.imageBack || "";
    cart.push({
      id: product.id,
      artist: product.artist || "",
      title: product.title || "",
      price: Number(product.price || 0),
      grade: product.grade || "",
      tier: product.tier || "",
      image: imageForCart,
      qty: 1,
    });
  }

  saveCart(cart);
  alert("Dropped in the cart.");
}

function clearCart() {
  saveCart([]);
  renderCart();
}

// ----------------- SHIPPING + TIER PRICING ----------------------
// Shipping: $7.99 + $0.50 per record
function calcShipping(itemCount) {
  if (!itemCount || itemCount <= 0) return 0;
  return 7.99 + itemCount * 0.5;
}

// threefor25: every 3 = $25, remainder at item price
function calcThreeFor25Subtotal(cart, productsById) {
  // Expand eligible items into unit prices
  const unitPrices = [];

  cart.forEach((item) => {
    if (item.tier !== "threefor25") return;
    const qty = Number(item.qty || 0);
    for (let i = 0; i < qty; i++) {
      // remainder price should use the item's normal effective price (not tenbin)
      unitPrices.push(Number(item.price || 0));
    }
  });

  const count = unitPrices.length;
  const bundles = Math.floor(count / 3);
  const remainder = count % 3;

  // Remainder: use highest prices first? (better for you or buyer?)
  // We'll do buyer-friendly: remainder uses the higher priced items as remainder = NOT discounted.
  // So we discount the cheapest 3s first.
  unitPrices.sort((a, b) => a - b);

  const discountedCount = bundles * 3;
  const discountedUnits = unitPrices.slice(0, discountedCount);
  const remainderUnits = unitPrices.slice(discountedCount); // 0-2 items

  const bundleTotal = bundles * 25;
  const remainderTotal = remainderUnits.reduce((s, p) => s + p, 0);

  // Normal price total (for discount calc)
  const normalTotal = unitPrices.reduce((s, p) => s + p, 0);
  const discountedTotal = bundleTotal + remainderTotal;
  const discount = Math.max(0, normalTotal - discountedTotal);

  return { discountedTotal, discount };
}

// Calculate subtotal + discounts across tiers
function calcCartPricing(cart) {
  // tenbin handled per-unit at $10
  let normalSubtotal = 0;

  // Build normal subtotal excluding threefor25 (we’ll handle it separately)
  cart.forEach((item) => {
    const qty = Number(item.qty || 0);
    if (item.tier === "threefor25") return;

    const unit = getEffectiveUnitPrice(item);
    normalSubtotal += unit * qty;
  });

  const three = calcThreeFor25Subtotal(cart);

  const subtotal = normalSubtotal + three.discountedTotal;
  const tierDiscount = three.discount;

  return { subtotal, tierDiscount };
}

// -------------------- SHOP RENDERING + PAGES ----------------------
async function renderShop() {
  const container = document.getElementById("products");
  if (!container) return;

  if (!allProducts || allProducts.length === 0) {
    await loadProducts();
  }

  currentPage = 1;
  renderShopPage();
}

function renderShopPage() {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const pageProducts = allProducts.slice(start, end);

  pageProducts.forEach((prod) => {
    const card = document.createElement("div");
    card.className = "record-card";

    // IMAGE FLIP (front/back)
    const recordImage = document.createElement("div");
    recordImage.className = "record-image";

    const flipWrapper = document.createElement("div");
    flipWrapper.className = "flip-wrapper";

    const flipInner = document.createElement("div");
    flipInner.className = "flip-inner";

    const frontDiv = document.createElement("div");
    frontDiv.className = "flip-front";

    const backDiv = document.createElement("div");
    backDiv.className = "flip-back";

    const frontSrc = prod.imageFront || prod.image || prod.imageBack || "";
    const backSrc = prod.imageBack || prod.imageFront || prod.image || "";

    const makeImg = (src, alt) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      img.onerror = () => img.classList.add("image-missing");
      return img;
    };

    if (frontSrc) frontDiv.appendChild(makeImg(frontSrc, `${prod.title} front`));
    else {
      const ph = document.createElement("div");
      ph.className = "image-missing";
      frontDiv.appendChild(ph);
    }

    if (backSrc) backDiv.appendChild(makeImg(backSrc, `${prod.title} back`));
    else {
      const ph = document.createElement("div");
      ph.className = "image-missing";
      backDiv.appendChild(ph);
    }

    flipInner.appendChild(frontDiv);
    flipInner.appendChild(backDiv);
    flipWrapper.appendChild(flipInner);
    recordImage.appendChild(flipWrapper);

    // TEXT
    const title = document.createElement("h3");
    title.textContent = prod.artist
      ? `${prod.artist} – ${prod.title}`
      : (prod.title || prod.id || "Untitled");

    const grade = document.createElement("p");
    grade.className = "record-grade";
    grade.textContent = "Grade: " + (prod.grade || "—");

    const price = document.createElement("p");
    price.className = "record-price";

    // Show tier pricing label
    if (prod.tier === "tenbin") {
      price.textContent = "$10.00 (10 Bin)";
    } else if (prod.tier === "threefor25") {
      price.textContent = `$${money(prod.price)} (3 for $25 tier)`;
    } else {
      price.textContent = "$" + money(prod.price);
    }

    const desc = document.createElement("p");
    desc.className = "record-desc";
    desc.textContent = prod.description || "";

    const qtyNote = document.createElement("p");
    qtyNote.className = "qty-text";
    qtyNote.textContent = "Qty available: " + (prod.quantity ?? 1);

    const avail = document.createElement("p");
    avail.className = "avail-text";
    avail.textContent = `Available: ${prod.available ? "Yes" : "No"}`;

    const btn = document.createElement("button");
    btn.textContent = "Add to Cart";
    btn.className = "btn-primary";
    btn.addEventListener("click", () => addToCart(prod.id));

    // If not available, still show it (per your request),
    // but disable add-to-cart to prevent selling it.
    if (prod.available === false) {
      btn.disabled = true;
      btn.textContent = "Not Available";
      btn.classList.add("disabled");
    }

    card.appendChild(recordImage);
    card.appendChild(title);
    card.appendChild(grade);
    card.appendChild(price);
    if (prod.description) card.appendChild(desc);
    card.appendChild(qtyNote);
    card.appendChild(avail);
    card.appendChild(btn);

    container.appendChild(card);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = String(i);
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      renderShopPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pagination.appendChild(btn);
  }
}

// -------------------------- CART RENDERING ------------------------
function renderCart() {
  const container = document.getElementById("cart-items");
  const summaryBox = document.getElementById("cart-summary");
  if (!container || !summaryBox) return;

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Cart is empty. Grab some wax.</p>";
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-row";

      const info = document.createElement("div");
      info.className = "cart-info";

      const title = document.createElement("p");
      title.className = "cart-title";
      const fullTitle = item.artist ? `${item.artist} – ${item.title}` : item.title;
      title.textContent = fullTitle || item.id;

      const grade = document.createElement("p");
      grade.className = "cart-grade";
      grade.textContent = "Grade: " + (item.grade || "—");

      const tier = document.createElement("p");
      tier.className = "cart-tier";
      tier.textContent = item.tier ? `Tier: ${item.tier}` : "";

      info.appendChild(title);
      info.appendChild(grade);
      if (item.tier) info.appendChild(tier);

      const qtyBox = document.createElement("div");
      qtyBox.className = "cart-qty";

      const minus = document.createElement("button");
      minus.textContent = "-";
      minus.addEventListener("click", () => {
        if ((item.qty || 0) > 1) item.qty -= 1;
        else cart.splice(index, 1);
        saveCart(cart);
        renderCart();
      });

      const qty = document.createElement("span");
      qty.textContent = String(item.qty || 0);

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.addEventListener("click", () => {
        // Respect stock from products list if loaded
        const prod = allProducts.find((p) => p.id === item.id);
        const maxQty = prod && typeof prod.quantity === "number" ? prod.quantity : 1;

        if ((item.qty || 0) >= maxQty) {
          alert(
            maxQty === 1
              ? "You only have 1 copy of this record in stock."
              : `You only have ${maxQty} copies of this record in stock.`
          );
          return;
        }

        item.qty += 1;
        saveCart(cart);
        renderCart();
      });

      qtyBox.appendChild(minus);
      qtyBox.appendChild(qty);
      qtyBox.appendChild(plus);

      const unit = getEffectiveUnitPrice(item);
      const linePrice = document.createElement("p");
      linePrice.className = "cart-line-price";
      linePrice.textContent = "$" + money(unit * (item.qty || 0));

      row.appendChild(info);
      row.appendChild(qtyBox);
      row.appendChild(linePrice);

      container.appendChild(row);
    });
  }

  const itemCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const pricing = calcCartPricing(cart);
  const subtotal = pricing.subtotal;
  const tierDiscount = pricing.tierDiscount;

  const shipping = calcShipping(itemCount);
  const total = subtotal + shipping;

  summaryBox.innerHTML =
    `Items: ${itemCount}<br>` +
    `Subtotal: $${money(subtotal)}<br>` +
    (tierDiscount > 0 ? `Tier Discount: -$${money(tierDiscount)}<br>` : "") +
    `Shipping: $${money(shipping)}<br>` +
    `<strong>Total: $${money(total)}</strong>`;

  const payBtn = document.getElementById("paypal-button");
  if (payBtn) {
    payBtn.onclick = () => submitPayPal(cart, shipping, tierDiscount);
  }
}

// -------------------------- PAYPAL SUBMIT -------------------------
// Uses PayPal cart upload. Adds a discount_amount_cart for tier discount.
function submitPayPal(cart, shipping, tierDiscount) {
  if (!cart || cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const form = document.getElementById("paypal-form");
  if (!form) {
    alert("PayPal form not found on page.");
    return;
  }

  while (form.firstChild) form.removeChild(form.firstChild);

  const addField = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  };

  addField("cmd", "_cart");
  addField("upload", "1");
  addField("business", "titans.rule1215@gmail.com");
  addField("currency_code", "USD");

  let index = 1;
  cart.forEach((item) => {
    const unit = getEffectiveUnitPrice(item);
    const fullTitle = item.artist ? `${item.artist} – ${item.title}` : item.title;

    addField(`item_name_${index}`, fullTitle || item.id);
    addField(`amount_${index}`, money(unit));
    addField(`quantity_${index}`, Number(item.qty || 0));
    index++;
  });

  // Shipping as its own line item
  if (shipping > 0) {
    addField(`item_name_${index}`, "Shipping");
    addField(`amount_${index}`, money(shipping));
    addField(`quantity_${index}`, 1);
    index++;
  }

  // Tier discount (3-for-25) as cart discount
  if (tierDiscount > 0) {
    addField("discount_amount_cart", money(tierDiscount));
  }

  form.action = "https://www.paypal.com/cgi-bin/webscr";
  form.method = "post";
  form.submit();
}

// ---------------------- ADMIN (EDIT + DOWNLOAD) ------------------
async function initAdmin() {
  const adminContainer = document.getElementById("admin-products");
  if (!adminContainer) return;

  if (!allProducts || allProducts.length === 0) {
    await loadProducts();
  }

  // Stable sort for admin (no shuffle)
  const adminList = allProducts.slice().sort((a, b) => {
    const A = (a.artist + a.title).toLowerCase();
    const B = (b.artist + b.title).toLowerCase();
    return A.localeCompare(B);
  });

  adminContainer.innerHTML = "";

  const note = document.createElement("div");
  note.className = "admin-note";
  note.innerHTML =
    `<p><strong>Editing products.json2 only.</strong> Make changes below, then download/copy the updated file and commit it to GitHub.</p>` +
    `<p>Tier options: <code>tenbin</code>, <code>threefor25</code>, or blank.</p>`;
  adminContainer.appendChild(note);

  const table = document.createElement("div");
  table.className = "admin-table";

  const header = document.createElement("div");
  header.className = "admin-row admin-header";
  header.innerHTML =
    `<div>ID</div><div>Artist</div><div>Title</div><div>Price</div><div>Grade</div>` +
    `<div>Tier</div><div>Qty</div><div>Avail</div><div>Front</div><div>Back</div>`;
  table.appendChild(header);

  const makeInput = (value) => {
    const inp = document.createElement("input");
    inp.value = value ?? "";
    return inp;
  };

  const makeSelect = (value) => {
    const sel = document.createElement("select");
    const opts = ["", "tenbin", "threefor25"];
    opts.forEach((o) => {
      const op = document.createElement("option");
      op.value = o;
      op.textContent = o === "" ? "(none)" : o;
      if (o === (value || "")) op.selected = true;
      sel.appendChild(op);
    });
    return sel;
  };

  const makeCheckbox = (checked) => {
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!checked;
    return cb;
  };

  // Keep references so we can build JSON on demand
  const rows = [];

  adminList.forEach((p) => {
    const row = document.createElement("div");
    row.className = "admin-row";

    const id = makeInput(p.id);
    id.disabled = true;

    const artist = makeInput(p.artist);
    const title = makeInput(p.title);
    const price = makeInput(p.price);
    price.type = "number";
    price.s
