let cart = [];
function addToCart(item, price) {
  cart.push({item, price});
  renderCart();
}
function renderCart() {
  const cartDiv = document.getElementById("cart-items");
  if (!cartDiv) return;
  cartDiv.innerHTML = "";
  let total = 0;
  cart.forEach(c => {
    const div = document.createElement("div");
    div.textContent = `${c.item} - $${c.price}`;
    cartDiv.appendChild(div);
    total += c.price;
  });
  document.getElementById("cart-total").textContent = "Total: $" + total.toFixed(2);
}
