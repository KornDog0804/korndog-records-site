// ================== KORNDOG SCRIPT (SHOP + CART) ==================
// - All records default to quantity 1 (10 Dolla Holla gets 3)
// - Shop is paginated
// - Cart respects quantity limits
// - Shipping + discount + PayPal flow
// - Hides products with available === false
// - NEW: Uses artist + title, and supports front/back flip images
// ================================================================

const CART_KEY = "korndog_cart_v1";
const PRODUCTS_PER_PAGE = 10;

let allProducts = [];
let currentPage = 1;

// ----------------------- UTIL: SHUFFLE ----------------------------
function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// -------------------- LOAD PRODUCTS + QUANTITY --------------------
async function loadProducts() {
  try {
    const res = await fetch("./products.json");
    if (!res.ok) {
      console.error("Failed to load products");
      allProducts = [];
      return [];
    }

    const raw = await res.json();

    const mapped = raw
      .filter((p) => p.available !== false)
      .map((p) => {
        if (typeof p.quantity === "number") return p;

        let qty = 1;
        const id = (p.id || "").toLowerCase();
        const title = (p.title || "").toLowerCase();

        if (id.includes("10-dolla") || title.includes("10 dolla holla")) {
          qty = 3;
        }

        return { ...p, quantity: qty };
      });

    allProducts = shuffleArray(mapped);
    return allProducts;
  } catch (e) {
    console.error("Failed to load products", e);
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
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = count;
}

// Add one item to cart, respecting stock quantity
function addToCart(productId) {
  if (!allProducts || allProducts.length === 0) return;

  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const maxQty = typeof product.quantity === "number" ? product.quantity : 1;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    if (existing.qty >= maxQty) {
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
      title: product.title,
      price: product.price,
      grade: product.grade,
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

// ----------------- SHIPPING + DISCOUNT RULES ----------------------
function calcShipping(itemCount) {
  if (itemCount === 0) return 0;
  if (itemCount <= 3) return 7.99;
  return 7.99 + (itemCount - 3) * 2;
}

function calcDiscount(subtotal) {
  return subtotal >= 130 ? subtotal * 0.1 : 0;
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

    // --------- IMAGE FLIP ----------
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

    if (frontSrc) {
      const frontImg = document.createElement("img");
      frontImg.src = frontSrc;
      frontImg.alt = prod.title || prod.id || "Record front";
      frontImg.onerror = () => {
        frontImg.classList.add("image-missing");
      };
      frontDiv.appendChild(frontImg);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "image-missing";
      frontDiv.appendChild(placeholder);
    }

    if (backSrc) {
      const backImg = document.createElement("img");
      backImg.src = backSrc;
      backImg.alt = prod.title || prod.id || "Record back";
      backImg.onerror = () => {
        backImg.classList.add("image-missing");
      };
      backDiv.appendChild(backImg);
    } else {
      const placeholderBack = document.createElement("div");
      placeholderBack.className = "image-missing";
      backDiv.appendChild(placeholderBack);
    }

    flipInner.appendChild(frontDiv);
    flipInner.appendChild(backDiv);
    flipWrapper.appendChild(flipInner);
    recordImage.appendChild(flipWrapper);

    // --------- TEXT ----------
    const title = document.createElement("h3");
    if (prod.artist) {
      title.textContent = `${prod.artist} – ${prod.title}`;
    } else {
      title.textContent = prod.title || prod.id || "Untitled";
    }

    const grade = document.createElement("p");
    grade.className = "record-grade";
    grade.textContent = "Grade: " + (prod.grade || "—");

    const price = document.createElement("p");
    price.className = "record-price";
    price.textContent = "$" + Number(prod.price || 0).toFixed(2);

    const desc = document.createElement("p");
    desc.className = "record-desc";
    desc.textContent = prod.description || "";

    const qtyNote = document.createElement("p");
    qtyNote.className = "qty-text";
    qtyNote.textContent = "Qty available: " + (prod.quantity ?? 1);

    const btn = document.createElement("button");
    btn.textContent = "Add to Cart";
    btn.className = "btn-primary";
    btn.addEventListener("click", () => addToCart(prod.id));

    // assemble card
    card.appendChild(recordImage);
    card.appendChild(title);
    card.appendChild(grade);
    card.appendChild(price);
    if (prod.description) card.appendChild(desc);
    card.appendChild(qtyNote);
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
    btn.textContent = i;
    if (i === currentPage) {
      btn.classList.add("active");
    }

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
      title.textContent = item.title;

      const grade = document.createElement("p");
      grade.className = "cart-grade";
      grade.textContent = "Grade: " + item.grade;

      info.appendChild(title);
      info.appendChild(grade);

      const qtyBox = document.createElement("div");
      qtyBox.className = "cart-qty";

      const minus = document.createElement("button");
      minus.textContent = "-";
      minus.addEventListener("click", () => {
        if (item.qty > 1) {
          item.qty -= 1;
        } else {
          cart.splice(index, 1);
        }
        saveCart(cart);
        renderCart();
      });

      const qty = document.createElement("span");
      qty.textContent = item.qty;

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.addEventListener("click", () => {
        const product = allProducts.find((p) => p.id === item.id);
        const maxQty =
          product && typeof product.quantity === "number" ? product.quantity : 1;

        if (item.qty >= maxQty) {
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

      const linePrice = document.createElement("p");
      linePrice.className = "cart-line-price";
      linePrice.textContent = "$" + (item.price * item.qty).toFixed(2);

      row.appendChild(info);
      row.appendChild(qtyBox);
      row.appendChild(linePrice);

      container.appendChild(row);
    });
  }

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = calcShipping(itemCount);
  const discount = calcDiscount(subtotal);
  const total = subtotal + shipping - discount;

  summaryBox.innerHTML =
    `Subtotal: $${subtotal.toFixed(2)}<br>` +
    `Shipping: $${shipping.toFixed(2)}<br>` +
    `Discount (10% @ $130+): -$${discount.toFixed(2)}<br>` +
    `<strong>Total: $${total.toFixed(2)}</strong>`;

  const payBtn = document.getElementById("paypal-button");
  if (payBtn) {
    payBtn.onclick = () => submitPayPal(cart, shipping, discount);
  }
}

// -------------------------- PAYPAL SUBMIT -------------------------
function submitPayPal(cart, shipping, discount) {
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const form = document.getElementById("paypal-form");
  if (!form) return;

  while (form.firstChild) {
    form.removeChild(form.firstChild);
  }

  const addField = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addField("cmd", "_cart");
  addField("upload", "1");
  addField("business", "titans.rule1215@gmail.com");
  addField("currency_code", "USD");

  let index = 1;
  cart.forEach((item) => {
    addField(`item_name_${index}`, item.title);
    addField(`amount_${index}`, item.price.toFixed(2));
    addField(`quantity_${index}`, item.qty);
    index++;
  });

  const shippingTotal = calcShipping(cart.reduce((s, i) => s + i.qty, 0));
  if (shippingTotal > 0) {
    addField(`item_name_${index}`, "Shipping");
    addField(`amount_${index}`, shippingTotal.toFixed(2));
    addField(`quantity_${index}`, 1);
  }

  form.action = "https://www.paypal.com/cgi-bin/webscr";
  form.method = "post";
  form.submit();
}

// ---------------------- ADMIN PAGE (NOP) ------------------
async function initAdmin() {
  return;
}

// ----------------------------- INIT -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderShop();
  renderCart();
  initAdmin();
});
