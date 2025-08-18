async function loadRecords() {
  try {
    const res = await fetch('data/records.json');
    const records = await res.json();
    const shop = document.getElementById('shop-records');
    const featured = document.getElementById('featured-records');

    records.forEach(record => {
      const card = document.createElement('div');
      card.className = 'record';

      // ✅ Always default to Bob Ross if no image found
      const cover = record.image && record.image.trim() !== "" 
        ? record.image 
        : "bobross.jpg";

      card.innerHTML = `
        <img src="images/${cover}" alt="${record.title}">
        <h3>${record.title}</h3>
        <p>${record.grade}</p>
        <p>$${record.price}</p>
        <button onclick="addToCart('${record.title}', ${record.price})">Add to Cart</button>
      `;

      if (shop) shop.appendChild(card);
      if (featured) featured.appendChild(card.cloneNode(true));
    });
  } catch (err) {
    console.error("Error loading records:", err);
  }
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(title, price) {
  cart.push({ title, price });
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${title} added to cart`);
  loadCart();
}

function loadCart() {
  const cartDiv = document.getElementById('cart');
  const totalDiv = document.getElementById('cart-total');
  if (!cartDiv) return;

  if (cart.length === 0) {
    cartDiv.innerHTML = "<p>Your cart is empty.</p>";
    totalDiv.textContent = "";
    return;
  }

  let total = 0;
  cartDiv.innerHTML = cart.map(item => {
    total += Number(item.price);
    return `<p>${item.title} - $${item.price}</p>`;
  }).join("");

  totalDiv.textContent = `Total: $${total}`;
}

function clearCart() {
  cart = [];
  localStorage.removeItem('cart');
  loadCart();
}

document.addEventListener('DOMContentLoaded', () => {
  loadRecords();
  loadCart();
});
