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

  // ✅ Live PayPal Checkout with your email
  if (document.getElementById("paypal-button-container")) {
    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: { value: total.toFixed(2) },
            payee: { email_address: "tians.rule1215@gmail.com" }
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
