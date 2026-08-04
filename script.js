// Menu Data
const menuItems = [
  { id: 1, name: "Classic Burger", category: "burgers", price: 8.99, emoji: "\uD83C\uDF54" },
  { id: 2, name: "Cheese Burger", category: "burgers", price: 9.99, emoji: "\uD83C\uDF54" },
  { id: 3, name: "BBQ Bacon Burger", category: "burgers", price: 11.99, emoji: "\uD83C\uDF54" },
  { id: 4, name: "Margherita Pizza", category: "pizza", price: 12.99, emoji: "\uD83C\uDF55" },
  { id: 5, name: "Pepperoni Pizza", category: "pizza", price: 13.99, emoji: "\uD83C\uDF55" },
  { id: 6, name: "Hawaiian Pizza", category: "pizza", price: 13.99, emoji: "\uD83C\uDF55" },
  { id: 7, name: "French Fries", category: "sides", price: 4.99, emoji: "\uD83C\uDF5F" },
  { id: 8, name: "Onion Rings", category: "sides", price: 5.49, emoji: "\uD83E\uDDC5" },
  { id: 9, name: "Coleslaw", category: "sides", price: 3.49, emoji: "\uD83E\uDD57" },
  { id: 10, name: "Cola", category: "drinks", price: 2.49, emoji: "\uD83E\uDD64" },
  { id: 11, name: "Lemonade", category: "drinks", price: 3.49, emoji: "\uD83C\uDF4B" },
  { id: 12, name: "Iced Tea", category: "drinks", price: 2.99, emoji: "\uD83C\uDF75" },
];

// State
let cart = [];

// DOM Elements
const menuGrid = document.getElementById("menuGrid");
const cartBtn = document.getElementById("cartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const overlay = document.getElementById("overlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const orderSummary = document.getElementById("orderSummary");
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
const contactForm = document.getElementById("contactForm");

// Render Menu
function renderMenu(category = "all") {
  const items = category === "all" ? menuItems : menuItems.filter(i => i.category === category);
  menuGrid.innerHTML = items.map(item => `
    <div class="menu-card" data-category="${item.category}">
      <div class="menu-card-image">${item.emoji}</div>
      <div class="menu-card-body">
        <span class="category">${item.category}</span>
        <h3>${item.name}</h3>
        <div class="price">$${item.price.toFixed(2)}</div>
        <button class="add-btn" onclick="addToCart(${item.id})">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

// Cart Functions
function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  updateCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    updateCart();
  }
}

function updateCart() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    cartTotal.textContent = "0.00";
    return;
  }

  let total = 0;
  cartItems.innerHTML = cart.map(ci => {
    const item = menuItems.find(m => m.id === ci.id);
    const subtotal = item.price * ci.qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="item-price">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
          <span>${ci.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
    `;
  }).join("");

  cartTotal.textContent = total.toFixed(2);
}

function openCart() {
  cartSidebar.classList.add("open");
  overlay.classList.add("open");
}

function closeCartSidebar() {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("open");
}

// Checkout
function checkout() {
  if (cart.length === 0) return;

  const pickupTime = document.getElementById("pickupTime").value || "ASAP";
  const total = cart.reduce((sum, ci) => {
    const item = menuItems.find(m => m.id === ci.id);
    return sum + item.price * ci.qty;
  }, 0);

  const itemsList = cart.map(ci => {
    const item = menuItems.find(m => m.id === ci.id);
    return `${item.name} x${ci.qty}`;
  }).join(", ");

  orderSummary.innerHTML = `
    <strong>Items:</strong> ${itemsList}<br><br>
    <strong>Total:</strong> $${total.toFixed(2)}<br>
    <strong>Pickup:</strong> ${pickupTime}<br><br>
    Thank you for your order!
  `;

  modalOverlay.classList.add("open");
  closeCartSidebar();
  cart = [];
  updateCart();
}

// Filter Buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderMenu(btn.dataset.category);
  });
});

// Event Listeners
cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartSidebar);
overlay.addEventListener("click", closeCartSidebar);
checkoutBtn.addEventListener("click", checkout);
closeModal.addEventListener("click", () => modalOverlay.classList.remove("open"));

hamburger.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
});

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Message sent! We'll get back to you soon.");
  contactForm.reset();
});

// Init
renderMenu();
