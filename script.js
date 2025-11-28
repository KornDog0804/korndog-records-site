// ================== KORNDOG SCRIPT (SHOP + CART) ==================
// - All records default to quantity 1
// - "10 dolla Holla" gets quantity 3
// - Shop is paginated: numbered pages instead of one long scroll
// - Cart respects quantity limits
// - Shipping + discount + PayPal flow preserved
// - Products are shuffled so the shop feels fresh every visit
// ================================================================

// Global cart storage key
const CART_KEY = 'korndog_cart_v1';

// Pagination settings
const PRODUCTS_PER_PAGE = 10;

// Global product list (filled by loadProducts)
let allProducts = [];

// Current Shop page
let currentPage = 1;

// ----------------------- UTIL: SHUFFLE ----------------------------
// Fisher–Yates shuffle so the product order is random each page load
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
    const res = await fetch('./products.json');

    if (!res.ok) {
      console.error('Failed to load products');
      allProducts = [];
      return [];
    }

    const raw = await res.json();

    // Attach quantity to each record
    const mapped = raw.map((p) => {
      // If quantity already exists in JSON, keep it
      if (typeof p.quantity === 'number') return p;

      // Default: every record is quantity 1
      let qty = 1;

      // Special case: 10 dolla Holla gets quantity 3
      const id = (p.id || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      if (id.includes('10-dolla') || title.includes('10 dolla holla')) {
        qty = 3;
      }

      return { ...p, quantity: qty };
    });

    // Randomize the order so the shop feels fresh
    allProducts = shuffleArray(mapped);

    return allProducts;
  } catch (e) {
    console.error('Failed to load products', e);
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
    console.error('Cart parse error', e);
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
  const badge = document.querySelector('[data-cart-count]');
  if (badge) badge.textContent = count;
}

// Add one item to cart, respecting stock quantity
function addToCart(productId) {
  if (!allProducts || allProducts.length === 0) return;

  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const maxQty = typeof product.quantity === 'number' ? product.quantity : 1;

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    if (existing.qty >= maxQty) {
      alert(
        maxQty === 1
          ? 'You only have 1 copy of this record in stock.'
          : `You only have ${maxQty} copies of this record in stock.`
      );
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      grade: product.grade,
      image: product.image,
      qty: 1
    });
  }

  saveCart(cart);
  alert('Dropped in the cart.');
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
  return subtotal >= 130 ? subtotal * 0.10 : 0;
}

// -------------------- SHOP RENDERING + PAGES ----------------------

async function renderShop() {
  const container = document.getElementById('products');
  if (!container) return;

  // Load products only once
  if (!allProducts || allProducts.length === 0) {
    await loadProducts();
  }

  currentPage = 1;
  renderShopPage();
}

function renderShopPage() {
  const container = document.getElementById('products');
  if (!container) return;

  container.innerHTML = '';

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const pageProducts = allProducts.slice(start, end);

  pageProducts.forEach((prod) => {
    const card = document.createElement('div');
    card.className = 'record-card';

    const img = document.createElement('img');
    img.src = prod.image;
    img.alt = prod.title;
    img.onerror = () => {
      img.classList.add('image-missing');
    };

    const title = document.createElement('h3');
    title.textContent = prod.title;

    const grade = document.createElement('p');
    grade.className = 'record-grade';
    grade.textContent = 'Grade: ' + prod.grade;

    const price = document.createElement('p');
    price.className = 'record-price';
    price.textContent = '$' + prod.price.toFixed(2);

    const desc = document.createElement('p');
    desc.className = 'record-desc';
    desc.textContent = prod.description || '';

    const qtyNote = document.createElement('p');
    qtyNote.className = 'record-qty';
    qtyNote.textContent = 'Qty available: ' + (prod.quantity ?? 1);

    const btn = document.createElement('button');
    btn.textContent = 'Add to Cart';
    btn.className = 'btn-primary';
    btn.addEventListener('click', () => addToCart(prod.id));

    card.appendChild(img);
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
  const container = document.getElementById('products');
  if (!container) return;

  // Remove any previous pagination bar
  const existing = document.querySelector('.shop-pagination');
  if (existing) existing.remove();

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  const nav = document.createElement('div');
  nav.className = 'shop-pagination';

  // Center the buttons at the bottom
  nav.style.display = 'flex';
  nav.style.justifyContent = 'center';
  nav.style.alignItems = 'center';
  nav.style.gap = '8px';
  nav.style.margin = '1.5rem 0 0.5rem';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'page-btn';

    // 🔥 Inline styles so nothing can override them
    btn.style.backgroundColor = '#a8ff60';     // neon-ish green
    btn.style.color = '#02010a';              // dark text
    btn.style.border = 'none';
    btn.style.padding = '12px 18px';
    btn.style.fontSize = '1.05rem';
    btn.style.fontWeight = '700';
    btn.style.borderRadius = '999px';
    btn.style.minWidth = '48px';
    btn.style.minHeight = '48px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 0 10px rgba(168,255,96,0.5)';

    if (i === currentPage) {
      btn.style.backgroundColor = '#7fff32';
      btn.style.transform = 'scale(1.1)';
    }

    btn.addEventListener('mouseenter', () => {
      if (i !== currentPage) {
        btn.style.backgroundColor = '#caff90';
        btn.style.transform = 'scale(1.08)';
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (i === currentPage) {
        btn.style.backgroundColor = '#7fff32';
        btn.style.transform = 'scale(1.1)';
      } else {
        btn.style.backgroundColor = '#a8ff60';
        btn.style.transform = 'scale(1.0)';
      }
    });

    btn.addEventListener('click', () => {
      currentPage = i;
      renderShopPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    nav.appendChild(btn);
  }

  container.appendChild(nav);
}

// -------------------------- CART RENDERING ------------------------

function renderCart() {
  const container = document.getElementById('cart-items');
  const summaryBox = document.getElementById('cart-summary');
  if (!container || !summaryBox) return;

  const cart = getCart();
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Cart is empty. Grab some wax.</p>';
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'cart-row';

      const info = document.createElement('div');
      info.className = 'cart-info';
      const title = document.createElement('p');
      title.className = 'cart-title';
      title.textContent = item.title;
      const grade = document.createElement('p');
      grade.className = 'cart-grade';
      grade.textContent = 'Grade: ' + item.grade;
      info.appendChild(title);
      info.appendChild(grade);

      const qtyBox = document.createElement('div');
      qtyBox.className = 'cart-qty';
      const minus = document.createElement('button');
      minus.textContent = '-';
      minus.addEventListener('click', () => {
        if (item.qty > 1) {
          item.qty -= 1;
        } else {
          cart.splice(index, 1);
        }
        saveCart(cart);
        renderCart();
      });
      const qty = document.createElement('span');
      qty.textContent = item.qty;
      const plus = document.createElement('button');
      plus.textContent = '+';
      plus.addEventListener('click', () => {
        // enforce the same max-quantity rule in the cart view
        const product = allProducts.find((p) => p.id === item.id);
        const maxQty =
          product && typeof product.quantity === 'number' ? product.quantity : 1;

        if (item.qty >= maxQty) {
          alert(
            maxQty === 1
              ? 'You only have 1 copy of this record in stock.'
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

      const linePrice = document.createElement('p');
      linePrice.className = 'cart-line-price';
      linePrice.textContent = '$' + (item.price * item.qty).toFixed(2);

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

  summaryBox.innerHTML = `
    <p>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
    <p>Shipping: <strong>$${shipping.toFixed(2)}</strong></p>
    <p>Discount (10% @ $130+): <strong>-$${discount.toFixed(2)}</strong></p>
    <p class="cart-total">Total: <strong>$${total.toFixed(2)}</strong></p>
  `;

  const payBtn = document.getElementById('paypal-button');
  if (payBtn) {
    payBtn.onclick = () => submitPayPal(cart, shipping, discount);
  }
}

// -------------------------- PAYPAL SUBMIT -------------------------

function submitPayPal(cart, shipping, discount) {
  if (cart.length === 0) {
    alert('Cart is empty.');
    return;
  }

  const form = document.getElementById('paypal-form');
  if (!form) return;

  // Clear old inputs
  while (form.firstChild) {
    form.removeChild(form.firstChild);
  }

  const addField = (name, value) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addField('cmd', '_cart');
  addField('upload', '1');
  addField('business', 'titans.rule1215@gmail.com');
  addField('currency_code', 'USD');

  let index = 1;
  cart.forEach((item) => {
    addField(`item_name_${index}`, item.title);
    addField(`amount_${index}`, item.price.toFixed(2));
    addField(`quantity_${index}`, item.qty);
    index++;
  });

  // Shipping as separate line
  const shippingTotal = calcShipping(cart.reduce((s, i) => s + i.qty, 0));
  if (shippingTotal > 0) {
    addField(`item_name_${index}`, 'Shipping');
    addField(`amount_${index}`, shippingTotal.toFixed(2));
    addField(`quantity_${index}`, 1);
  }

  form.action = 'https://www.paypal.com/cgi-bin/webscr';
  form.method = 'post';
  form.submit();
}

// ---------------------- ADMIN PAGE (PLACEHOLDER) ------------------
// Your new GitHub/token-based admin lives in admin.html now.
// This stub just keeps things from breaking if script.js is loaded.

async function initAdmin() {
  // No-op placeholder – real admin logic is in admin.html
  return;
}

// ----------------------------- INIT -------------------------------

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderShop();
  renderCart();
  initAdmin();
});
