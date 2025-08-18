async function loadRecords() {
  const res = await fetch('data/records.json');
  const records = await res.json();
  const shop = document.getElementById('shop-records');
  const featured = document.getElementById('featured-records');

  records.forEach(record => {
    const card = document.createElement('div');
    card.className = 'record';
    card.innerHTML = `
      <img src="images/${record.image || 'bobross.jpg'}" alt="${record.title}">
      <h3>${record.title}</h3>
      <p>${record.grade}</p>
      <p>$${record.price}</p>
      <button onclick="addToCart('${record.title}', ${record.price})">Add to Cart</button>
    `;
    if (shop) shop.appendChild(card);
    if (featured) featured.appendChild(card.cloneNode(true));
  });
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(title, price) {
  cart.push({ title, price });
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${title} added to cart`);
}

function loadCart() {
  const cartDiv = document.getElementById('cart');
  if (!cartDiv) return;
  cartDiv.innerHTML = cart.map(item => `<p>${item.title} - $${item.price}</p>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadRecords();
  loadCart();
});
