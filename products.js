// Collins Clothing - Product Data, Cart & Checkout

const STORE = {
  name: "Collins Clothing",
  phone: "09047101249",
  whatsapp: "09047101249",
  email: "ajigocollins@gmail.com",
  address: "Lagos Island, Ikate, Lekki, Lagos",
  bank: {
    name: "PiggyVest",
    accountName: "Ajigo Collins Ojenya",
    accountNumber: "9043728140"
  }
};

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Slide Skate Blue Tee", brand: "COLLINS CLOTHING", price: 15000, image: "slide-skate-blue.jpg", available: true },
  { id: 2, name: "Bear Outline Maroon Tee", brand: "COLLINS CLOTHING", price: 15000, image: "bear-outline-maroon.jpg", available: true },
  { id: 3, name: "Smile Born To Skate Orange Tee", brand: "COLLINS CLOTHING", price: 15000, image: "smile-skate-orange.jpg", available: true },
  { id: 4, name: "Dab Guy Black Tee", brand: "COLLINS CLOTHING", price: 15000, image: "dab-guy-black.jpg", available: true },
  { id: 5, name: "Comic Boom White Tee", brand: "COLLINS CLOTHING", price: 15000, image: "comic-boom-white.jpg", available: true },
  { id: 6, name: "Skull Hand White Tee", brand: "COLLINS CLOTHING", price: 15000, image: "skull-hand-white.jpg", available: true },
  { id: 7, name: "Donald Duck White Tee", brand: "COLLINS CLOTHING", price: 15000, image: "donald-duck-white.jpg", available: true },
  { id: 8, name: "Steady Grinding Black Tee", brand: "COLLINS CLOTHING", price: 15000, image: "steady-grinder-black.png", available: true },
  { id: 9, name: "Champ Brown Patch Tee", brand: "COLLINS CLOTHING", price: 15000, image: "champ-brown.jpg", available: true },
  { id: 10, name: "Red Jersey 98 Baseball Shirt", brand: "COLLINS CLOTHING", price: 15000, image: "red-jersey-98.jpg", available: true },
  { id: 11, name: "Risk Takers Yellow Tee", brand: "COLLINS CLOTHING", price: 15000, image: "risk-takers-yellow.jpg", available: true },
  { id: 12, name: "Basketball 23 Beige Tee", brand: "COLLINS CLOTHING", price: 15000, image: "basketball-23-beige.jpg", available: true },
  { id: 13, name: "Steady Grinding Jeep White Tee", brand: "COLLINS CLOTHING", price: 15000, image: "steady-jeep-white.png", available: true },
  { id: 14, name: "Enjoy The Play Black Tee", brand: "COLLINS CLOTHING", price: 15000, image: "enjoy-play-black.jpg", available: true }
];

// ========== DATA LAYER ==========
function getProducts() {
  const stored = localStorage.getItem('collins_products');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return [...DEFAULT_PRODUCTS];
}

function saveProducts(products) {
  localStorage.setItem('collins_products', JSON.stringify(products));
}

function getCart() {
  const stored = localStorage.getItem('collins_cart');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return [];
}

function saveCart(cart) {
  localStorage.setItem('collins_cart', JSON.stringify(cart));
  updateCartCount();
}

function getOrders() {
  const stored = localStorage.getItem('collins_orders');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return [];
}

function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem('collins_orders', JSON.stringify(orders));
}

// ========== CART ==========
function addToCart(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product || !product.available) {
    showToast('This item is sold out');
    return;
  }

  let cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }
  saveCart(cart);
  showToast('Added to cart!');
  renderCart();
}

function removeFromCart(productId) {
  let cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function updateQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }
    saveCart(cart);
    renderCart();
  }
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

function formatPrice(n) {
  return '₦' + Number(n).toLocaleString('en-NG');
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ========== RENDER PRODUCTS ==========
function renderProducts(filter = 'all') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  let products = getProducts();
  if (filter === 'available') products = products.filter(p => p.available);
  else if (filter === 'sold') products = products.filter(p => !p.available);

  if (products.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">No products found.</p>';
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card ${p.available ? '' : 'sold-out'}">
      <div class="product-image-wrap">
        <img src="\( {p.image}" alt=" \){p.name}" loading="lazy">
        <button class="wishlist-btn" onclick="toggleWishlist(this)" title="Wishlist">♡</button>
        ${!p.available ? '<span class="sold-badge">SOLD OUT</span>' : ''}
      </div>
      <div class="product-info">
        <div class="brand-name">${p.brand}</div>
        <div class="product-title">${p.name}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
        <button class="add-to-cart" onclick="addToCart(${p.id})" ${p.available ? '' : 'disabled'}>
          ${p.available ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  `).join('');
}

function toggleWishlist(btn) {
  btn.classList.toggle('active');
  btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
}

// ========== CART UI ==========
function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  renderCart();
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p><p style="margin-top:8px;font-size:0.9rem;">Add some tees!</p></div>';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="\( {item.image}" alt=" \){item.name}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
        <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalEl = document.getElementById('cart-total-amount');
  if (totalEl) totalEl.textContent = formatPrice(total);
}

// ========== CHECKOUT ==========
const DELIVERY_FEE = 2000;

function getSelectedDelivery() {
  const selected = document.querySelector('input[name="delivery"]:checked');
  return selected ? selected.value : 'pickup';
}

function updateCheckoutTotal() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryType = getSelectedDelivery();
  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const subEl = document.getElementById('checkout-subtotal');
  const delEl = document.getElementById('checkout-delivery');
  const totEl = document.getElementById('checkout-total');

  if (subEl) subEl.textContent = formatPrice(subtotal);
  if (delEl) delEl.textContent = deliveryType === 'delivery' ? formatPrice(DELIVERY_FEE) : 'Free';
  if (totEl) totEl.textContent = formatPrice(total);

  const addressGroup = document.getElementById('address-group');
  const addressInput = document.getElementById('cust-address');
  if (deliveryType === 'pickup') {
    if (addressGroup) addressGroup.style.display = 'none';
    if (addressInput) addressInput.required = false;
  } else {
    if (addressGroup) addressGroup.style.display = 'block';
    if (addressInput) addressInput.required = true;
  }
}

function openCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  document.getElementById('checkout-modal').classList.add('open');
  updateCheckoutTotal();
  closeCart();
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
}

function placeOrder(e) {
  e.preventDefault();

  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const note = document.getElementById('cust-note').value.trim();
  const deliveryType = getSelectedDelivery();

  if (!name || !phone) {
    showToast('Please fill name and phone number');
    return;
  }
  if (deliveryType === 'delivery' && !address) {
    showToast('Please enter delivery address');
    return;
  }

  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const order = {
    id: Date.now(),
    date: new Date().toLocaleString('en-NG'),
    customer: { name, phone, address: address || 'Pickup', note },
    delivery: deliveryType,
    deliveryFee,
    items: [...cart],
    subtotal,
    total,
    status: 'pending'
  };

  saveOrder(order);
  saveCart([]);
  renderCart();
  closeCheckout();
  document.getElementById('checkout-form').reset();
  const pickupRadio = document.querySelector('input[name="delivery"][value="pickup"]');
  if (pickupRadio) pickupRadio.checked = true;

  showToast('Order placed! Opening WhatsApp...');

  const itemsText = cart.map(i => `• ${i.qty}x ${i.name} - ${formatPrice(i.price * i.qty)}`).join('%0A');
  const deliveryText = deliveryType === 'delivery' 
    ? `Delivery (+${formatPrice(DELIVERY_FEE)})%0AAddress: ${address}` 
    : `Pickup (Free)`;

  const msg = `*NEW ORDER - Collins Clothing*%0A%0A` +
    `*Order ID:* ${order.id}%0A` +
    `*Name:* ${name}%0A` +
    `*Phone:* ${phone}%0A` +
    `*Delivery:* ${deliveryText}%0A%0A` +
    `*Items:*%0A${itemsText}%0A%0A` +
    `Subtotal: ${formatPrice(subtotal)}%0A` +
    `Delivery: ${deliveryType === 'delivery' ? formatPrice(DELIVERY_FEE) : 'Free'}%0A` +
    `*Total: ${formatPrice(total)}*%0A%0A` +
    (note ? `Note: ${note}%0A%0A` : '') +
    `I will transfer to:%0A` +
    `PiggyVest - Ajigo Collins Ojenya%0A` +
    `Account: 9043728140%0A%0A` +
    `Please confirm my order. Thank you!`;

  setTimeout(() => {
    window.open(`https://wa.me/2349047101249?text=${msg}`, '_blank');
  }, 600);
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-grid')) {
    renderProducts();
    updateCartCount();
  }
});
