// Menu Data
const menuItems = [
  { id: 1, name: "Lasagna", category: "pasta", price: 200, emoji: "\uD83C\uDF5D" },
  { id: 2, name: "Carbonara", category: "pasta", price: 180, emoji: "\uD83C\uDF5D" },
  { id: 3, name: "Mango Graham", category: "dessert", price: 150, emoji: "\uD83C\uDF70" },
  { id: 4, name: "Oreo Cheesecake", category: "dessert", price: 150, emoji: "\uD83C\uDF70" },
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
const closeModalBtn = document.getElementById("closeModal");
const orderSummary = document.getElementById("orderSummary");
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
const contactForm = document.getElementById("contactForm");
const header = document.getElementById("header");

// Scroll Header
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 50);
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
        <div class="price">\u20B1${item.price.toFixed(0)}</div>
        <button class="add-btn" onclick="addToCart(${item.id}, this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Add to Cart
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

  // Button feedback
  if (btnEl) {
    btnEl.classList.add("added");
    btnEl.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      Added!
    `;
    setTimeout(() => {
      btnEl.classList.remove("added");
      btnEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Add to Cart
      `;
    }, 1200);
  }

  // Bounce cart count
  cartCount.classList.add("show");
  cartCount.style.transform = "scale(1.4)";
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="m1 1 4 0 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>Your cart is empty</p>
        <span>Add items from the menu to get started</span>
      </div>
    `;
    cartTotal.textContent = "0";
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
          <span class="item-price">\u20B1${subtotal.toFixed(0)}</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
          </button>
          <span>${ci.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");

    cartTotal.textContent = total.toFixed(0);
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
    return `${item.emoji} ${item.name} &times; ${ci.qty}`;
  }).join("<br>");

  orderSummary.innerHTML = `
    <strong>Items:</strong><br>${itemsList}<br><br>
    <strong>Total:</strong> \u20B1${total.toFixed(0)}<br>
    <strong>Pickup:</strong> ${pickupTime}
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
closeModalBtn.addEventListener("click", () => modalOverlay.classList.remove("open"));

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  mobileNav.classList.toggle("open");
});

// Close mobile nav on link click
mobileNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    mobileNav.classList.remove("open");
  });
});

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector("button");
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    Sent!
  `;
  btn.style.background = "#10b981";
  setTimeout(() => {
    btn.innerHTML = `Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;
    btn.style.background = "";
    contactForm.reset();
  }, 2000);
});

// Scroll reveal animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements for scroll animation
function initScrollAnimations() {
  const animateElements = document.querySelectorAll(".feature-card, .menu-card, .about-feature, .about-card, .contact-form");
  animateElements.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
    observer.observe(el);
  });
}

// Init
renderMenu();
initScrollAnimations();
