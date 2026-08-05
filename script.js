// Menu Data
const menuItems = [
  { id: 1, name: "Lasagna", category: "pasta", price: 200, emoji: "\uD83C\uDF5D" },
  { id: 2, name: "Carbonara", category: "pasta", price: 180, emoji: "\uD83C\uDF5D" },
  { id: 3, name: "Mango Graham", category: "dessert", price: 150, emoji: "\uD83C\uDF70" },
  { id: 4, name: "Oreo Cheesecake", category: "dessert", price: 150, emoji: "\uD83C\uDF70" },
];

const DELIVERY_FEE = 50;

// State
let cart = [];
let selectedDelivery = "pickup";
let selectedPayment = "cash";

// DOM Elements
const menuGrid = document.getElementById("menuGrid");
const cartBtn = document.getElementById("cartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const overlay = document.getElementById("overlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");
const deliveryFeeEl = document.getElementById("deliveryFee");
const checkoutBtn = document.getElementById("checkoutBtn");
const modalOverlay = document.getElementById("modalOverlay");
const closeModalBtn = document.getElementById("closeModal");
const orderSummary = document.getElementById("orderSummary");
const menuToggle = document.getElementById("menuToggle");
const fullscreenNav = document.getElementById("fullscreenNav");
const navClose = document.getElementById("navClose");
const contactForm = document.getElementById("contactForm");
const header = document.getElementById("header");

// Scroll Header
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 50);
});

// Fullscreen Nav
menuToggle.addEventListener("click", () => {
  fullscreenNav.classList.add("open");
  document.body.style.overflow = "hidden";
});

navClose.addEventListener("click", () => {
  fullscreenNav.classList.remove("open");
  document.body.style.overflow = "";
});

fullscreenNav.querySelectorAll(".fullscreen-link").forEach(link => {
  link.addEventListener("click", () => {
    fullscreenNav.classList.remove("open");
    document.body.style.overflow = "";
  });
});

// Render Menu
function renderMenu(category = "all") {
  const items = category === "all" ? menuItems : menuItems.filter(i => i.category === category);
  menuGrid.innerHTML = items.map((item, idx) => `
    <div class="menu-card" data-category="${item.category}" style="animation-delay: ${idx * 0.08}s">
      <div class="menu-card-image">${item.emoji}</div>
      <div class="menu-card-body">
        <span class="category">${item.category}</span>
        <h3>${item.name}</h3>
        <div class="price">\u20B1${item.price}</div>
        <button class="add-btn" onclick="addToCart(${item.id}, this)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Add to Order
        </button>
      </div>
    </div>
  `).join("");
}

// Cart Functions
function addToCart(id, btnEl) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  updateCart();

  if (btnEl) {
    btnEl.classList.add("added");
    btnEl.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      Added!
    `;
    setTimeout(() => {
      btnEl.classList.remove("added");
      btnEl.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Add to Order
      `;
    }, 1200);
  }

  cartCount.classList.add("show");
  cartCount.style.transform = "scale(1.3)";
  setTimeout(() => { cartCount.style.transform = "scale(1)"; }, 200);

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

  if (totalItems > 0) {
    cartCount.classList.add("show");
  } else {
    cartCount.classList.remove("show");
  }

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
      </div>
    `;
    cartSubtotal.textContent = "0";
    cartTotal.textContent = "0";
    deliveryFeeEl.textContent = "-";
    return;
  }

  let subtotal = 0;
  cartItems.innerHTML = cart.map(ci => {
    const item = menuItems.find(m => m.id === ci.id);
    const itemTotal = item.price * ci.qty;
    subtotal += itemTotal;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="item-price">\u20B1${itemTotal} ${ci.qty > 1 ? `(x${ci.qty})` : ""}</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
          </button>
          <span>${ci.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");

  const delivery = selectedDelivery === "lalamove" ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  cartSubtotal.textContent = subtotal;
  deliveryFeeEl.textContent = delivery > 0 ? `\u20B1${delivery}` : "Free";
  cartTotal.textContent = total;
}

function openCart() {
  cartSidebar.classList.add("open");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCartSidebar() {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

// Delivery Options
document.querySelectorAll(".delivery-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".delivery-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedDelivery = btn.dataset.delivery;
    updateCart();
  });
});

// Payment Options
document.querySelectorAll(".payment-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".payment-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPayment = btn.dataset.payment;
  });
});

// Checkout
function checkout() {
  if (cart.length === 0) return;

  const subtotal = cart.reduce((sum, ci) => {
    const item = menuItems.find(m => m.id === ci.id);
    return sum + item.price * ci.qty;
  }, 0);

  const delivery = selectedDelivery === "lalamove" ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  const itemsList = cart.map(ci => {
    const item = menuItems.find(m => m.id === ci.id);
    return `${item.emoji} ${item.name} x${ci.qty}`;
  }).join("<br>");

  const deliveryLabel = selectedDelivery === "pickup" ? "Pickup" : "Lalamove Delivery (+\u20B150)";
  const paymentLabel = selectedPayment.charAt(0).toUpperCase() + selectedPayment.slice(1);

  orderSummary.innerHTML = `
    <strong>Items:</strong><br>${itemsList}<br><br>
    <strong>Subtotal:</strong> \u20B1${subtotal}<br>
    <strong>Delivery:</strong> ${delivery > 0 ? `\u20B1${delivery}` : "Free"}<br>
    <strong>Total:</strong> \u20B1${total}<br><br>
    <strong>Delivery:</strong> ${deliveryLabel}<br>
    <strong>Payment:</strong> ${paymentLabel}
  `;

  modalOverlay.classList.add("open");
  closeCartSidebar();
  cart = [];
  selectedDelivery = "pickup";
  selectedPayment = "cash";
  updateCart();

  document.querySelectorAll(".delivery-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('.delivery-btn[data-delivery="pickup"]').classList.add("active");
  document.querySelectorAll(".payment-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('.payment-btn[data-payment="cash"]').classList.add("active");
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
closeModalBtn.addEventListener("click", () => modalOverlay.classList.remove("open"));

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector("button");
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    Sent!
  `;
  btn.style.background = "#16a34a";
  setTimeout(() => {
    btn.innerHTML = `Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;
    btn.style.background = "";
    contactForm.reset();
  }, 2000);
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

function initScrollAnimations() {
  document.querySelectorAll(".feature-card, .menu-card, .about-card, .contact-form").forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
    observer.observe(el);
  });
}

// Init
renderMenu();
initScrollAnimations();
