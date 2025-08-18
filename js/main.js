async function loadRecords() {
  try {
    const res = await fetch('/data/records.json');
    const records = await res.json();
    const shop = document.getElementById('shop-records');
    const featured = document.getElementById('featured-records');

    records.forEach(record => {
      const card = document.createElement('div');
      card.className = 'record';

      const cover = record.image && record.image.trim() !== "" 
        ? record.image 
        : "1000042083.png"; // Bob Ross fallback

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
  window.location.href = "cart.html"; // ✅ redirect to cart
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

  if (document.getElementById("paypal-button-container")) {
    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: { value: total.toFixed(2) },
            payee: { email_address: "tians.rule1215@gmail.com" } // ✅ your live PayPal
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          alert(`Thanks, ${details.payer.name.given_name}! Payment successful.`);
          clearCart();
        });
      }
    }).render('#paypal-button-container');
  }
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
