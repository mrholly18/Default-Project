const menu = [
  { id: 1, name: "Lasagna", desc: "Classic layered pasta with rich meat sauce", price: 200, category: "pasta", icon: "🍝" },
  { id: 2, name: "Carbonara", desc: "Creamy egg-based pasta with crispy bits", price: 180, category: "pasta", icon: "🧀" },
  { id: 3, name: "Mango Graham", desc: "Sweet mangoes layered with graham crackers", price: 150, category: "dessert", icon: "🥭" },
  { id: 4, name: "Oreo Cheesecake", desc: "No-bake cheesecake with Oreo cookie crust", price: 150, category: "dessert", icon: "🍪" },
  { id: 5, name: "Champorado", desc: "Chocolate rice porridge", price: 50, category: "others", icon: "🍫" }
];

let cart = [];
let selectedDelivery = "pickup";
let selectedPayment = "cash";

// DOM
const menuGrid = document.getElementById("menuGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const deliveryFee = document.getElementById("deliveryFee");
const cartTotal = document.getElementById("cartTotal");
const cartSidebar = document.getElementById("cartSidebar");
const overlay = document.getElementById("overlay");
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const contactForm = document.getElementById("contactForm");
const menuToggle = document.getElementById("menuToggle");
const fullscreenNav = document.getElementById("fullscreenNav");
const navClose = document.getElementById("navClose");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const themeToggle = document.getElementById("themeToggle");

// Theme
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// Fullscreen Nav
menuToggle.addEventListener("click", () => fullscreenNav.classList.add("active"));
navClose.addEventListener("click", () => fullscreenNav.classList.remove("active"));
fullscreenNav.querySelectorAll(".fullscreen-link").forEach(link => {
  link.addEventListener("click", () => fullscreenNav.classList.remove("active"));
});

// Header scroll
window.addEventListener("scroll", () => {
  document.getElementById("header").classList.toggle("scrolled", window.scrollY > 10);
});

// Menu
function renderMenu(category = "all") {
  const filtered = category === "all" ? menu : menu.filter(m => m.category === category);
  menuGrid.innerHTML = filtered.map(item => `
    <div class="menu-card" data-id="${item.id}">
      <div class="menu-card-img">
        <span class="menu-card-icon">${item.icon}</span>
      </div>
      <div class="menu-card-info">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
        <div class="menu-card-bottom">
          <span class="menu-card-price">&#8369;${item.price}</span>
          <button class="add-btn" onclick="addToCart(${item.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderMenu(btn.dataset.category);
  });
});

// Cart
function addToCart(id) {
  const item = menu.find(m => m.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  updateCart();
  cartBtn.classList.add("added");
  setTimeout(() => cartBtn.classList.remove("added"), 300);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCart();
}

function getDeliveryFee() {
  if (selectedDelivery === "nearby") return 50;
  return 0;
}

function updateCart() {
  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);
  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const fee = getDeliveryFee();
  const total = subtotal + fee;

  cartCount.textContent = totalItems;
  cartCount.classList.toggle("visible", totalItems > 0);
  cartSubtotal.textContent = subtotal;
  deliveryFee.textContent = fee === 0 ? "Free" : fee;
  cartTotal.textContent = total;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>Your cart is empty</p>
        <span>Add items from the menu</span>
      </div>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <div class="cart-item-price">&#8369;${item.price * item.qty}</div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `).join("");
}

// Delivery buttons
document.querySelectorAll(".delivery-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".delivery-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedDelivery = btn.dataset.delivery;
    updateCart();
  });
});

// Payment buttons
document.querySelectorAll(".payment-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".payment-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPayment = btn.dataset.payment;
  });
});

// Cart open/close
cartBtn.addEventListener("click", () => {
  cartSidebar.classList.add("open");
  overlay.classList.add("active");
});

function closeCartSidebar() {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("active");
}

closeCart.addEventListener("click", closeCartSidebar);
overlay.addEventListener("click", closeCartSidebar);

// Receipt
function generateReceipt() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const orderId = "AJ-" + now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + "-" + String(Math.floor(Math.random() * 9000) + 1000);

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const fee = getDeliveryFee();
  const total = subtotal + fee;

  const deliveryLabels = { pickup: "Pickup (Free)", nearby: "Nearby Delivery (+&#8369;50)", lalamove: "Lalamove (Arrange with rider)" };
  const paymentLabels = { cash: "Cash", gcash: "GCash", bank: "Bank Transfer" };

  document.getElementById("receiptDate").textContent = dateStr + " " + timeStr;
  document.getElementById("receiptId").textContent = orderId;
  document.getElementById("receiptSubtotal").textContent = "\u20B1" + subtotal;
  document.getElementById("receiptDelivery").textContent = fee === 0 ? "Free" : "\u20B1" + fee;
  document.getElementById("receiptTotal").textContent = "\u20B1" + total;
  document.getElementById("receiptDeliveryType").textContent = deliveryLabels[selectedDelivery];
  document.getElementById("receiptPayment").textContent = paymentLabels[selectedPayment];

  document.getElementById("receiptItems").innerHTML = cart.map(item => `
    <div class="receipt-item">
      <div>
        <div class="receipt-item-name">${item.icon} ${item.name}</div>
        <div class="receipt-item-qty">x${item.qty} &#8369;${item.price} each</div>
      </div>
      <div class="receipt-item-price">&#8369;${item.price * item.qty}</div>
    </div>
  `).join("");
}

// Checkout
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  generateReceipt();
  closeCartSidebar();
  modalOverlay.classList.add("active");
});

closeModal.addEventListener("click", () => {
  modalOverlay.classList.remove("active");
  cart = [];
  selectedDelivery = "pickup";
  selectedPayment = "cash";
  document.querySelectorAll(".delivery-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(".delivery-btn[data-delivery='pickup']").classList.add("active");
  document.querySelectorAll(".payment-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(".payment-btn[data-payment='cash']").classList.add("active");
  updateCart();
});

// Contact
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector("button");
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Sent!`;
  btn.style.background = "#16a34a";
  setTimeout(() => {
    btn.innerHTML = `Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;
    btn.style.background = "";
    contactForm.reset();
  }, 2500);
});

// Init
renderMenu();
updateCart();
