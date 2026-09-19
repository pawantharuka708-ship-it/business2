/* ==========================================================================
   FC SAREE STORE — script.js  (vanilla JavaScript, no frameworks)
   --------------------------------------------------------------------------
   ★ CUSTOMIZE HERE — everything you need to change is in CONFIG & PRODUCTS ★
   ========================================================================== */

/* ------------------------- 1. CONFIG (EDIT ME!) ------------------------- */
const CONFIG = {
  WHATSAPP_NUMBER: "947XXXXXXXX",      // ★ REPLACE with your WhatsApp number (country code + number, no '+')
  FACEBOOK_URL: "https://facebook.com/fcsareestore", // ★ REPLACE with your Facebook page
  DELIVERY_FEE: 350,                   // ★ Delivery fee in LKR (0 = free)
  CART_KEY: "fc_saree_cart",           // localStorage key for the cart
  COUNTDOWN_HOURS: 48,                 // ★ Offer length in hours (from first visit)
};

/* ---------------------- 2. PRODUCTS (EDIT ME!) --------------------------
   To add a new saree, copy one block and change the values.
   - price    : current selling price in LKR
   - oldPrice : original price (shows a SALE badge + strikethrough), or null
   - badge    : "new" | "best" | null   (extra "sale" badge shows automatically)
   - isNew / popularity : used by "Newest" / "Popular" sorting
-------------------------------------------------------------------------- */
const PRODUCTS = [
  {
    id: 1,
    name: "Royal Red Silk Saree",
    category: "silk",
    price: 12500, oldPrice: 14900,
    img: "images/royal-red-silk.jpg",
    desc: "Rich royal red silk with a graceful modern drape — perfect for grand evenings.",
    longDesc: "Woven from premium soft silk, this royal red saree features a sleek contemporary drape and a lustrous finish. Includes an unstitched matching blouse piece.",
    colors: ["#8f1d2c", "#b3402e", "#5c0f1c"],
    sizes: ["Free Size"],
    isNew: false, popularity: 92, badge: "best",
  },
  {
    id: 2,
    name: "Golden Bridal Saree",
    category: "bridal",
    price: 18900, oldPrice: null,
    img: "images/golden-bridal.jpg",
    desc: "Regal Banarasi-style golden saree with elegant zari motifs and rich pallu.",
    longDesc: "A breathtaking bridal saree in radiant gold with intricate zari motifs and a richly woven pallu. The perfect centerpiece for your wedding day.",
    colors: ["#c9962e", "#8a6a1f", "#e6cf9a"],
    sizes: ["Free Size"],
    isNew: true, popularity: 98, badge: "best",
  },
  {
    id: 3,
    name: "Elegant Blue Party Saree",
    category: "party",
    price: 9500, oldPrice: 11200,
    img: "images/blue-party.jpg",
    desc: "Deep navy party saree with golden floral butti and ornate border work.",
    longDesc: "Stunning navy blue saree adorned with golden floral butti and a grand woven border. Lightweight and easy to drape — a party favourite.",
    colors: ["#1f2a5c", "#31418c", "#0e1533"],
    sizes: ["Free Size"],
    isNew: false, popularity: 85, badge: null,
  },
  {
    id: 4,
    name: "Traditional Maroon Saree",
    category: "silk",
    price: 11500, oldPrice: null,
    img: "images/maroon-traditional.jpg",
    desc: "Classic maroon silk with traditional gold border — timeless heritage charm.",
    longDesc: "A heritage-inspired maroon saree with a shimmering gold zari border and delicate butti work. Ideal for poojas, weddings and traditional occasions.",
    colors: ["#6d1a2d", "#4a1020", "#8f2c40"],
    sizes: ["Free Size"],
    isNew: false, popularity: 88, badge: "best",
  },
  {
    id: 5,
    name: "Floral Pink Saree",
    category: "casual",
    price: 7900, oldPrice: null,
    img: "images/pink-floral.jpg",
    desc: "Dreamy pink chiffon with hand-painted style rose prints — soft and feminine.",
    longDesc: "Airy chiffon saree in blush pink with romantic floral prints. Feather-light and effortlessly elegant for daytime events and garden parties.",
    colors: ["#f2a7bb", "#e2799b", "#fbe3ea"],
    sizes: ["Free Size"],
    isNew: true, popularity: 76, badge: "new",
  },
  {
    id: 6,
    name: "Premium Black Saree",
    category: "party",
    price: 13500, oldPrice: 15800,
    img: "images/black-premium.jpg",
    desc: "Sophisticated black saree with golden embroidered scalloped border.",
    longDesc: "Understated luxury — a flowing black saree finished with an exquisite gold embroidered scalloped border. Perfect for cocktail evenings and receptions.",
    colors: ["#1a1a1a", "#3a2e1f", "#0d0d0d"],
    sizes: ["Free Size"],
    isNew: false, popularity: 90, badge: null,
  },
  {
    id: 7,
    name: "Soft Green Cotton Saree",
    category: "cotton",
    price: 6500, oldPrice: null,
    img: "images/green-cotton.jpg",
    desc: "Breathable soft cotton in deep green with a contrasting magenta border.",
    longDesc: "Everyday elegance in pure soft cotton. Deep green body with small woven motifs and a vibrant magenta border — comfortable from morning to night.",
    colors: ["#2f5d3a", "#6d1a2d", "#3f7a4c"],
    sizes: ["Free Size"],
    isNew: true, popularity: 70, badge: "new",
  },
  {
    id: 8,
    name: "Luxury Purple Saree",
    category: "bridal",
    price: 15900, oldPrice: null,
    img: "images/purple-luxury.jpg",
    desc: "Opulent purple pattu silk with silver-gold minakari woven design.",
    longDesc: "A luxurious pattu silk saree in majestic purple, covered in fine minakari-style weaving with a grand silver-gold pallu. Truly a collector's piece.",
    colors: ["#6b4a8c", "#4a2f66", "#8f6fb3"],
    sizes: ["Free Size"],
    isNew: true, popularity: 95, badge: "new",
  },
];

/* ------------------------- 3. HELPERS ------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Format numbers as LKR currency, e.g. 12500 -> "LKR 12,500"
const lkr = (n) => "LKR " + Number(n).toLocaleString("en-LK");

const getProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));

function toast(msg) {
  const t = $("#toast");
  t.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
  t.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* --------------------- 4. CART (localStorage) --------------------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CONFIG.CART_KEY)) || []; }
catch (e) { cart = []; }

const saveCart = () => localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(cart));
const cartQty  = () => cart.reduce((sum, item) => sum + item.qty, 0);
const cartSubtotal = () =>
  cart.reduce((sum, item) => sum + getProduct(item.id).price * item.qty, 0);

function addToCart(id, qty = 1, silent = false) {
  const item = cart.find((i) => i.id === Number(id));
  if (item) item.qty += qty;
  else cart.push({ id: Number(id), qty });
  saveCart();
  renderCart();
  bumpCartIcon();
  if (!silent) toast(`${getProduct(id).name} added to cart`);
}

function setQty(id, qty) {
  const item = cart.find((i) => i.id === Number(id));
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== Number(id));
  saveCart();
  renderCart();
}

function bumpCartIcon() {
  const c = $("#cartCount");
  c.classList.remove("bump");
  void c.offsetWidth; // restart animation
  c.classList.add("bump");
}

/* --------------------- 5. RENDER CART DRAWER --------------------- */
function renderCart() {
  $("#cartCount").textContent = cartQty();

  const wrap = $("#cartItems");
  const footer = $("#cartFooter");

  if (cart.length === 0) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        Your cart is empty.<br>Let's find your perfect saree!
      </div>`;
    footer.style.display = "none";
    return;
  }
  footer.style.display = "flex";

  wrap.innerHTML = cart.map((item) => {
    const p = getProduct(item.id);
    return `
      <div class="cart-item" data-id="${p.id}">
        <img src="${p.img}" alt="${p.name}" />
        <div>
          <div class="ci-name">${p.name}</div>
          <div class="ci-price">${lkr(p.price)} each</div>
          <div class="qty-row">
            <button class="qty-btn" data-action="dec" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
        <div class="ci-right">
          <span class="ci-total">${lkr(p.price * item.qty)}</span>
          <button class="ci-remove" data-action="remove" aria-label="Remove ${p.name}"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>`;
  }).join("");

  const sub = cartSubtotal();
  const delivery = CONFIG.DELIVERY_FEE;
  $("#cartSubtotal").textContent = lkr(sub);
  $("#cartDelivery").textContent = delivery === 0 ? "FREE" : lkr(delivery);
  $("#cartTotal").textContent = lkr(sub + delivery);
}

// Cart item buttons (delegation)
$("#cartItems").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = btn.closest(".cart-item").dataset.id;
  const item = cart.find((i) => i.id === Number(id));
  if (btn.dataset.action === "inc") setQty(id, item.qty + 1);
  if (btn.dataset.action === "dec") setQty(id, item.qty - 1);
  if (btn.dataset.action === "remove") { removeFromCart(id); toast("Item removed from cart"); }
});

/* ----------------- 6. WHATSAPP CHECKOUT ----------------- */
$("#checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) { toast("Your cart is empty"); return; }

  const lines = cart.map((item) => {
    const p = getProduct(item.id);
    return `• ${p.name}  x${item.qty}  —  ${lkr(p.price * item.qty)}`;
  });

  const sub = cartSubtotal();
  const delivery = CONFIG.DELIVERY_FEE;
  const message =
    `Hello FC Saree Store! 💛%0A%0AI would like to place an order:%0A%0A` +
    lines.join("%0A") +
    `%0A%0ASubtotal: ${lkr(sub)}` +
    `%0ADelivery: ${delivery === 0 ? "FREE" : lkr(delivery)}` +
    `%0A*Grand Total: ${lkr(sub + delivery)}*` +
    `%0A%0APlease confirm availability. Thank you!`;

  window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`, "_blank");
});

/* ----------------- 7. CART DRAWER OPEN / CLOSE ----------------- */
const drawer = $("#cartDrawer"), overlay = $("#cartOverlay");
const openCart  = () => { drawer.classList.add("open"); overlay.classList.add("show"); drawer.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; };
const closeCart = () => { drawer.classList.remove("open"); overlay.classList.remove("show"); drawer.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };

$("#cartBtn").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#continueBtn").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

/* ----------------- 8. PRODUCT GRID + SEARCH / FILTER / SORT ----------------- */
const state = { search: "", price: "all", sort: "featured", category: "all" };

function priceMatch(p) {
  if (state.price === "under10k") return p.price < 10000;
  if (state.price === "10k-15k")  return p.price >= 10000 && p.price <= 15000;
  if (state.price === "above15k") return p.price > 15000;
  return true; // "all"
}

function getVisibleProducts() {
  const q = state.search.trim().toLowerCase();
  let list = PRODUCTS.filter((p) => {
    const matchesCategory = state.category === "all" || p.category === state.category ||
      (state.category === "new" && p.isNew) || (state.category === "best" && p.badge === "best");
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.price.toString().includes(q);
    return matchesCategory && matchesSearch && priceMatch(p);
  });

  switch (state.sort) {
    case "low-high": list.sort((a, b) => a.price - b.price); break;
    case "high-low": list.sort((a, b) => b.price - a.price); break;
    case "newest":   list.sort((a, b) => b.isNew - a.isNew || b.id - a.id); break;
    case "popular":  list.sort((a, b) => b.popularity - a.popularity); break;
  }
  return list;
}

function badgeHTML(p) {
  // Sale badge appears automatically when oldPrice exists
  let badges = "";
  if (p.oldPrice) badges += `<span class="badge sale">Sale</span>`;
  if (p.badge === "new") badges += `<span class="badge new">New</span>`;
  if (p.badge === "best") badges += `<span class="badge best">Best Seller</span>`;
  return badges;
}

function renderProducts() {
  const grid = $("#productGrid");
  const list = getVisibleProducts();
  $("#noResults").hidden = list.length > 0;

  grid.innerHTML = list.map((p, i) => `
    <article class="product-card" style="animation-delay:${i * 0.06}s" data-id="${p.id}">
      <div class="product-thumb">
        <img src="${p.img}" alt="${p.name} — ${p.category} saree from FC Saree Store" loading="lazy" />
        ${badgeHTML(p)}
        <button class="fav-btn" data-fav="${p.id}" aria-label="Add ${p.name} to favourites"><i class="fa-regular fa-heart"></i></button>
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="price-row">
          <span class="price">${lkr(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${lkr(p.oldPrice)}</span>` : ""}
        </div>
        <div class="card-actions">
          <button class="btn-add" data-add="${p.id}"><i class="fa-solid fa-bag-shopping"></i> Add to Cart</button>
          <button class="btn-view" data-view="${p.id}">View Details</button>
        </div>
      </div>
    </article>`).join("");
}

// Toolbar events
$("#searchInput").addEventListener("input", (e) => { state.search = e.target.value; renderProducts(); });
$("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; renderProducts(); });

$$(".chip[data-price]").forEach((chip) => chip.addEventListener("click", () => {
  $$(".chip[data-price]").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  state.price = chip.dataset.price;
  renderProducts();
}));

// Category cards & nav shortcuts
function setCategory(cat) {
  state.category = cat;
  state.price = "all";
  $$(".chip[data-price]").forEach((c) => c.classList.toggle("active", c.dataset.price === "all"));
  renderProducts();
}
$$("[data-category-link]").forEach((el) => el.addEventListener("click", () => setCategory(el.dataset.categoryLink)));
$$("[data-filter-link]").forEach((el) => el.addEventListener("click", () => setCategory(el.dataset.filterLink)));

// Product grid buttons (delegation)
$("#productGrid").addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  const viewBtn = e.target.closest("[data-view]");
  const favBtn = e.target.closest("[data-fav]");
  if (addBtn) addToCart(addBtn.dataset.add);
  if (viewBtn) openModal(viewBtn.dataset.view);
  if (favBtn) {
    favBtn.classList.toggle("active");
    const icon = favBtn.querySelector("i");
    icon.className = favBtn.classList.contains("active") ? "fa-solid fa-heart" : "fa-regular fa-heart";
    toast(favBtn.classList.contains("active") ? "Added to favourites" : "Removed from favourites");
  }
});

/* ----------------- 9. PRODUCT DETAILS MODAL ----------------- */
const modalOverlay = $("#modalOverlay");

function openModal(id) {
  const p = getProduct(id);
  if (!p) return;

  $("#modalBody").innerHTML = `
    <div class="modal-img"><img src="${p.img}" alt="${p.name}" /></div>
    <div class="modal-info">
      <span class="product-cat">${p.category}</span>
      <h3 id="modalName">${p.name}</h3>
      <div class="modal-price">
        <span class="price">${lkr(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old">${lkr(p.oldPrice)}</span>` : ""}
      </div>
      <p class="modal-desc">${p.longDesc || p.desc}</p>
      <div>
        <span class="modal-label">Available Colours</span>
        <div class="modal-colors">
          ${p.colors.map((c, i) => `<span class="color-dot ${i === 0 ? "selected" : ""}" style="background:${c}" title="Colour option ${i + 1}"></span>`).join("")}
        </div>
      </div>
      <div>
        <span class="modal-label">Size</span>
        <div class="modal-sizes">
          ${p.sizes.map((s, i) => `<button class="size-chip ${i === 0 ? "selected" : ""}">${s}</button>`).join("")}
        </div>
      </div>
      <div class="modal-qty">
        <span class="modal-label">Qty</span>
        <button class="qty-btn" id="mDec" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
        <span class="qty-val" id="mQty">1</span>
        <button class="qty-btn" id="mInc" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
      </div>
      <button class="btn btn-gold full" id="mAdd"><i class="fa-solid fa-bag-shopping"></i> Add to Cart</button>
    </div>`;

  modalOverlay.classList.add("show");
  document.body.style.overflow = "hidden";

  let qty = 1;
  const qtyEl = $("#mQty");
  $("#mInc").onclick = () => { qty++; qtyEl.textContent = qty; };
  $("#mDec").onclick = () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; };
  $("#mAdd").onclick = () => { addToCart(p.id, qty); closeModal(); openCart(); };

  // colour / size selection
  $$(".color-dot", modalOverlay).forEach((d) => (d.onclick = () => {
    $$(".color-dot", modalOverlay).forEach((x) => x.classList.remove("selected"));
    d.classList.add("selected");
  }));
  $$(".size-chip", modalOverlay).forEach((s) => (s.onclick = () => {
    $$(".size-chip", modalOverlay).forEach((x) => x.classList.remove("selected"));
    s.classList.add("selected");
  }));
}

function closeModal() {
  modalOverlay.classList.remove("show");
  document.body.style.overflow = "";
}
$("#modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

// Esc key closes modal & cart
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeModal(); closeCart(); }
});

/* ----------------- 10. OFFER COUNTDOWN TIMER ----------------- */
(function countdown() {
  const KEY = "fc_offer_deadline";
  let deadline = Number(localStorage.getItem(KEY));
  if (!deadline || deadline < Date.now()) {
    deadline = Date.now() + CONFIG.COUNTDOWN_HOURS * 3600 * 1000;
    localStorage.setItem(KEY, deadline);
  }

  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    let diff = Math.max(0, deadline - Date.now());
    if (diff === 0) { // restart the offer when it expires
      deadline = Date.now() + CONFIG.COUNTDOWN_HOURS * 3600 * 1000;
      localStorage.setItem(KEY, deadline);
      diff = deadline - Date.now();
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    $("#cdDays").textContent = pad(d);
    $("#cdHours").textContent = pad(h);
    $("#cdMins").textContent = pad(m);
    $("#cdSecs").textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
})();

// "Shop Offer" scrolls to products
$("#shopOfferBtn").addEventListener("click", () => {
  state.price = "all"; state.category = "all"; state.search = "";
  $("#searchInput").value = "";
  $$(".chip[data-price]").forEach((c) => c.classList.toggle("active", c.dataset.price === "all"));
  renderProducts();
});

/* ----------------- 11. NAVBAR: sticky, mobile menu, scrollspy ----------------- */
const navbar = $("#navbar"), hamburger = $("#hamburger"), navLinks = $("#navLinks");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

hamburger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", open);
});

navLinks.addEventListener("click", (e) => {
  if (e.target.classList.contains("nav-link")) {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }
});

// Scrollspy: highlight the active nav link
const sections = ["home", "categories", "sarees", "about", "contact"].map((id) => $("#" + id));
window.addEventListener("scroll", () => {
  const pos = window.scrollY + 120;
  let current = "home";
  sections.forEach((sec) => { if (sec && sec.offsetTop <= pos) current = sec.id; });
  $$(".nav-link").forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
}, { passive: true });

/* ----------------- 12. CONTACT FORM VALIDATION ----------------- */
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  let valid = true;

  const rules = [
    { el: $("#cName"),    test: (v) => v.trim().length >= 2, msg: "Please enter your name." },
    { el: $("#cPhone"),   test: (v) => /^[0-9+\-\s()]{9,15}$/.test(v.trim()), msg: "Enter a valid phone number." },
    { el: $("#cEmail"),   test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: "Enter a valid email address." },
    { el: $("#cMessage"), test: (v) => v.trim().length >= 10, msg: "Message should be at least 10 characters." },
  ];

  rules.forEach(({ el, test, msg }) => {
    const group = el.closest(".form-group");
    const errEl = group.querySelector(".error-msg");
    if (!test(el.value)) {
      group.classList.add("invalid");
      errEl.textContent = msg;
      valid = false;
    } else {
      group.classList.remove("invalid");
      errEl.textContent = "";
    }
  });

  const status = $("#formStatus");
  if (valid) {
    status.textContent = "Thank you! Your message has been sent. We will contact you soon. 💛";
    form.reset();
    toast("Message sent successfully");
    setTimeout(() => (status.textContent = ""), 5000);
  } else {
    status.textContent = "";
  }
});

// Clear error styling while typing
$$("#contactForm input, #contactForm textarea").forEach((el) =>
  el.addEventListener("input", () => {
    el.closest(".form-group").classList.remove("invalid");
    el.closest(".form-group").querySelector(".error-msg").textContent = "";
  })
);

/* ----------------- 13. SCROLL REVEAL ANIMATIONS ----------------- */
const observer = new IntersectionObserver(
  (entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); observer.unobserve(en.target); }
  }),
  { threshold: 0.12 }
);
$$(".reveal").forEach((el) => observer.observe(el));

/* ----------------- 14. INIT ----------------- */
renderProducts();
renderCart();
