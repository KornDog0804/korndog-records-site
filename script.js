
// Global cart storage key
const CART_KEY = 'korndog_cart_v1';

async function loadProducts() {
  try {
    const res = await fetch('./products.json'); // FIXED PATH

    if (!res.ok) {
      console.error('Failed to load products');
      return [];
    }

    return await res.json();
  } catch (e) {
    console.error('Failed to load products', e);
    return [];
  }
}

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

function addToCart(productId, products) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    const product = products.find(p => p.id === productId);
    if (!product) return;
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

function calcShipping(itemCount) {
  if (itemCount === 0) return 0;
  if (itemCount <= 3) return 7.99;
  return 7.99 + (itemCount - 3) * 2;
}

function calcDiscount(subtotal) {
  return subtotal >= 130 ? subtotal * 0.10 : 0;
}

async function renderShop() {
  const container = document.getElementById('products');
  if (!container) return;
  const products = await loadProducts();

  container.innerHTML = '';
  products.forEach(prod => {
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

    const btn = document.createElement('button');
    btn.textContent = 'Add to Cart';
    btn.className = 'btn-primary';
    btn.addEventListener('click', () => addToCart(prod.id, products));

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(grade);
    card.appendChild(price);
    if (prod.description) card.appendChild(desc);
    card.appendChild(btn);
    container.appendChild(card);
  });
}

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
  cart.forEach(item => {
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

  // Discount is already baked into total, so we don't send separately,
  // or we could send a negative line item (PayPal doesn't like that).

  form.action = 'https://www.paypal.com/cgi-bin/webscr';
  form.method = 'post';
  form.submit();
}

// ADMIN PAGE LOGIC
async function initAdmin() {
  const adminRoot = document.getElementById('admin-root');
  if (!adminRoot) return;

  // TEMP: auto-allow admin (we'll add a real form later)
const password = 'korndog2024!';
// no check – just proceed

  const products = await loadProducts();

  const list = document.createElement('div');
  list.id = 'admin-product-list';

  const renderAdminList = () => {
    list.innerHTML = '';
    products.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'admin-card';

      const heading = document.createElement('h3');
      heading.textContent = `Record ${idx + 1}`;
      card.appendChild(heading);

      const makeInput = (labelText, value, onChange) => {
        const wrapper = document.createElement('label');
        wrapper.className = 'admin-field';
        const span = document.createElement('span');
        span.textContent = labelText;
        const input = document.createElement('input');
        input.value = value ?? '';
        input.addEventListener('input', e => onChange(e.target.value));
        wrapper.appendChild(span);
        wrapper.appendChild(input);
        return wrapper;
      };

      card.appendChild(makeInput('ID', p.id, v => p.id = v));
      card.appendChild(makeInput('Title', p.title, v => p.title = v));
      card.appendChild(makeInput('Price', p.price, v => p.price = parseFloat(v) || 0));
      card.appendChild(makeInput('Grade', p.grade, v => p.grade = v));
      card.appendChild(makeInput('Image (images/...)', p.image, v => p.image = v));

      const descWrap = document.createElement('label');
      descWrap.className = 'admin-field';
      const span = document.createElement('span');
      span.textContent = 'Description';
      const textarea = document.createElement('textarea');
      textarea.value = p.description || '';
      textarea.addEventListener('input', e => p.description = e.target.value);
      descWrap.appendChild(span);
      descWrap.appendChild(textarea);
      card.appendChild(descWrap);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete Record';
      delBtn.className = 'btn-danger';
      delBtn.addEventListener('click', () => {
        products.splice(idx, 1);
        renderAdminList();
      });
      card.appendChild(delBtn);

      list.appendChild(card);
    });
  };

  renderAdminList();

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add New Record';
  addBtn.className = 'btn-primary';
  addBtn.addEventListener('click', () => {
    products.push({
      id: 'new-record-' + (products.length + 1),
      title: 'New Record',
      price: 0,
      grade: 'VG/VG',
      image: 'images/example.jpg',
      description: ''
    });
    renderAdminList();
  });

  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = 'Download JSON';
  downloadBtn.className = 'btn-secondary';
  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert('products.json downloaded. Upload this to your GitHub repo to go live.');
  });

  adminRoot.appendChild(list);
  const actions = document.createElement('div');
  actions.className = 'admin-actions';
  actions.appendChild(addBtn);
  actions.appendChild(downloadBtn);
  adminRoot.appendChild(actions);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderShop();
  renderCart();
  initAdmin();
});
