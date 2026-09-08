// Collins Clothing - Supabase Products, Cart & Checkout

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

// ================= SUPABASE =================

const shopSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ================= PRODUCTS =================

let PRODUCTS = [];

// Load products from Supabase
async function loadProductsFromSupabase() {

  const grid = document.getElementById("product-grid");

  if (grid) {
    grid.innerHTML = `
      <p style="
        grid-column:1/-1;
        text-align:center;
        padding:40px;
        color:#666;
      ">
        Loading products...
      </p>
    `;
  }

  const { data, error } = await shopSupabase
    .from("products")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error("Supabase product error:", error);

    if (grid) {
      grid.innerHTML = `
        <p style="
          grid-column:1/-1;
          text-align:center;
          padding:40px;
          color:#dc2626;
        ">
          Unable to load products.
        </p>
      `;
    }

    return;
  }

  PRODUCTS = (data || []).map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand || "COLLINS CLOTHING",
    price: Number(product.price) || 0,
    image: product.image_url || "",
    available: product.available !== false
  }));

  renderProducts();

  updateCartCount();
}

// ================= CART STORAGE =================

function getCart() {

  const stored =
    localStorage.getItem("collins_cart");

  if (stored) {

    try {
      return JSON.parse(stored);
    }

    catch (error) {
      console.log("Could not load cart.");
    }
  }

  return [];
}

function saveCart(cart) {

  localStorage.setItem(
    "collins_cart",
    JSON.stringify(cart)
  );

  updateCartCount();
}

// ================= CART =================

function addToCart(productId) {

  const product = PRODUCTS.find(
    p => String(p.id) === String(productId)
  );

  if (!product || !product.available) {

    showToast("This item is sold out");

    return;
  }

  let cart = getCart();

  const existing = cart.find(
    item => String(item.id) === String(productId)
  );

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

  showToast("Added to cart!");

  renderCart();
}

function removeFromCart(productId) {

  let cart = getCart();

  cart = cart.filter(
    item =>
      String(item.id) !== String(productId)
  );

  saveCart(cart);

  renderCart();
}

function updateQty(productId, delta) {

  let cart = getCart();

  const item = cart.find(
    i =>
      String(i.id) === String(productId)
  );

  if (item) {

    item.qty += delta;

    if (item.qty <= 0) {

      cart = cart.filter(
        i =>
          String(i.id) !== String(productId)
      );
    }

    saveCart(cart);

    renderCart();
  }
}

function updateCartCount() {

  const cart = getCart();

  const total = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  document
    .querySelectorAll(".cart-count")
    .forEach(button => {

      button.textContent = total;

      button.style.display =
        total > 0 ? "flex" : "none";

    });
}

function formatPrice(amount) {

  return "₦" +
    Number(amount).toLocaleString("en-NG");

}

function showToast(message) {

  let toast =
    document.querySelector(".toast");

  if (!toast) {

    toast =
      document.createElement("div");

    toast.className = "toast";

    document.body.appendChild(toast);
  }

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 2500);
}

// ================= RENDER PRODUCTS =================

let currentFilter = "all";

function renderProducts(filter = currentFilter) {

  currentFilter = filter;

  const grid =
    document.getElementById("product-grid");

  if (!grid) return;

  let products = [...PRODUCTS];

  if (filter === "available") {

    products =
      products.filter(
        p => p.available
      );
  }

  if (filter === "sold") {

    products =
      products.filter(
        p => !p.available
      );
  }

  if (products.length === 0) {

    grid.innerHTML = `
      <p style="
        grid-column:1/-1;
        text-align:center;
        padding:40px;
        color:#666;
      ">
        No products found.
      </p>
    `;

    return;
  }

  grid.innerHTML =
    products.map(product => `

      <div class="product-card ${
        product.available ? "" : "sold-out"
      }">

        <div class="product-image-wrap">

          ${
            product.image
            ? `
              <img
                src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}"
                loading="lazy"
                onerror="
                  this.style.display='none';
                  this.parentElement.classList.add('image-error');
                "
              >
            `
            : `
              <div style="
                height:100%;
                min-height:220px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#eee;
                color:#666;
              ">
                No image
              </div>
            `
          }

          <button
            class="wishlist-btn"
            onclick="toggleWishlist(this)"
            title="Wishlist"
          >
            ♡
          </button>

          ${
            !product.available
            ? '<span class="sold-badge">SOLD OUT</span>'
            : ''
          }

        </div>

        <div class="product-info">

          <div class="brand-name">
            ${escapeHTML(product.brand)}
          </div>

          <div class="product-title">
            ${escapeHTML(product.name)}
          </div>

          <div class="product-price">
            ${formatPrice(product.price)}
          </div>

          <button
            class="add-to-cart"
            onclick="addToCart(${JSON.stringify(product.id)})"
            ${product.available ? "" : "disabled"}
          >
            ${
              product.available
              ? "Add to Cart"
              : "Sold Out"
            }
          </button>

        </div>

      </div>

    `).join("");
}

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

function toggleWishlist(button) {

  button.classList.toggle("active");

  button.textContent =
    button.classList.contains("active")
    ? "♥"
    : "♡";
}

// ================= CART UI =================

function openCart() {

  const overlay =
    document.getElementById("cart-overlay");

  if (overlay) {

    overlay.classList.add("open");

  }

  renderCart();
}

function closeCart() {

  const overlay =
    document.getElementById("cart-overlay");

  if (overlay) {

    overlay.classList.remove("open");

  }
}

function renderCart() {

  const container =
    document.getElementById("cart-items");

  const footer =
    document.getElementById("cart-footer");

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {

    container.innerHTML = `

      <div class="empty-cart">

        <p>Your cart is empty</p>

        <p style="
          margin-top:8px;
          font-size:0.9rem;
        ">
          Add some tees!
        </p>

      </div>

    `;

    if (footer) {

      footer.style.display = "none";

    }

    return;
  }

  if (footer) {

    footer.style.display = "block";

  }

  container.innerHTML =
    cart.map(item => `

      <div class="cart-item">

        <img
          src="${escapeHTML(item.image)}"
          alt="${escapeHTML(item.name)}"
        >

        <div class="cart-item-info">

          <div class="cart-item-title">
            ${escapeHTML(item.name)}
          </div>

          <div class="cart-item-price">
            ${formatPrice(item.price)}
          </div>

          <div class="cart-item-qty">

            <button
              class="qty-btn"
              onclick="updateQty(${JSON.stringify(item.id)}, -1)"
            >
              −
            </button>

            <span>${item.qty}</span>

            <button
              class="qty-btn"
              onclick="updateQty(${JSON.stringify(item.id)}, 1)"
            >
              +
            </button>

          </div>

          <button
            class="remove-item"
            onclick="removeFromCart(${JSON.stringify(item.id)})"
          >
            Remove
          </button>

        </div>

      </div>

    `).join("");

  const total =
    cart.reduce(
      (sum, item) =>
        sum + (item.price * item.qty),
      0
    );

  const totalElement =
    document.getElementById(
      "cart-total-amount"
    );

  if (totalElement) {

    totalElement.textContent =
      formatPrice(total);

  }
}

// ================= CHECKOUT =================

const DELIVERY_FEE = 2000;

function getSelectedDelivery() {

  const selected =
    document.querySelector(
      'input[name="delivery"]:checked'
    );

  return selected
    ? selected.value
    : "pickup";
}

function updateCheckoutTotal() {

  const cart = getCart();

  const subtotal =
    cart.reduce(
      (sum, item) =>
        sum + (item.price * item.qty),
      0
    );

  const deliveryType =
    getSelectedDelivery();

  const deliveryFee =
    deliveryType === "delivery"
    ? DELIVERY_FEE
    : 0;

  const total =
    subtotal + deliveryFee;

  const totalElement =
    document.getElementById(
      "checkout-total"
    );

  if (totalElement) {

    totalElement.textContent =
      formatPrice(total);

  }

  const addressGroup =
    document.getElementById(
      "address-group"
    );

  const addressInput =
    document.getElementById(
      "cust-address"
    );

  if (deliveryType === "pickup") {

    if (addressGroup) {

      addressGroup.style.display =
        "none";

    }

    if (addressInput) {

      addressInput.required = false;

    }

  } else {

    if (addressGroup) {

      addressGroup.style.display =
        "block";

    }

    if (addressInput) {

      addressInput.required = true;

    }
  }
}

function openCheckout() {

  const cart = getCart();

  if (cart.length === 0) {

    showToast("Your cart is empty");

    return;
  }

  const modal =
    document.getElementById(
      "checkout-modal"
    );

  if (modal) {

    modal.classList.add("open");

  }

  updateCheckoutTotal();

  closeCart();
}

function closeCheckout() {

  const modal =
    document.getElementById(
      "checkout-modal"
    );

  if (modal) {

    modal.classList.remove("open");

  }
}

// ================= PLACE ORDER =================

async function placeOrder(event) {

  event.preventDefault();

  const name =
    document.getElementById(
      "cust-name"
    ).value.trim();

  const phone =
    document.getElementById(
      "cust-phone"
    ).value.trim();

  const address =
    document.getElementById(
      "cust-address"
    ).value.trim();

  const note =
    document.getElementById(
      "cust-note"
    ).value.trim();

  const deliveryType =
    getSelectedDelivery();

  if (!name || !phone) {

    showToast(
      "Please fill name and phone number"
    );

    return;
  }

  if (
    deliveryType === "delivery" &&
    !address
  ) {

    showToast(
      "Please enter delivery address"
    );

    return;
  }

  const cart = getCart();

  const subtotal =
    cart.reduce(
      (sum, item) =>
        sum + (item.price * item.qty),
      0
    );

  const deliveryFee =
    deliveryType === "delivery"
    ? DELIVERY_FEE
    : 0;

  const total =
    subtotal + deliveryFee;

  // Save order locally for now
  const order = {

    id: Date.now(),

    date:
      new Date().toLocaleString("en-NG"),

    customer: {

      name: name,

      phone: phone,

      address:
        address || "Pickup",

      note: note

    },

    delivery: deliveryType,

    deliveryFee: deliveryFee,

    items: [...cart],

    subtotal: subtotal,

    total: total,

    status: "pending"

  };

  let orders = [];

  try {

    orders =
      JSON.parse(
        localStorage.getItem(
          "collins_orders"
        )
      ) || [];

  } catch (error) {

    orders = [];

  }

  orders.unshift(order);

  localStorage.setItem(
    "collins_orders",
    JSON.stringify(orders)
  );

  saveCart([]);

  renderCart();

  closeCheckout();

  const form =
    document.getElementById(
      "checkout-form"
    );

  if (form) {

    form.reset();

  }

  const pickupRadio =
    document.querySelector(
      'input[name="delivery"][value="pickup"]'
    );

  if (pickupRadio) {

    pickupRadio.checked = true;

  }

  showToast(
    "Order placed! Opening WhatsApp..."
  );

  const itemsText =
    cart.map(item =>
      `• ${item.qty}x ${item.name} - ${formatPrice(
        item.price * item.qty
      )}`
    ).join("\n");

  const deliveryText =
    deliveryType === "delivery"
    ? `Delivery (+${formatPrice(
        DELIVERY_FEE
      )})\nAddress: ${address}`
    : "Pickup (Free)";

  const message =
    `*NEW ORDER - Collins Clothing*\n\n` +

    `*Order ID:* ${order.id}\n` +

    `*Name:* ${name}\n` +

    `*Phone:* ${phone}\n` +

    `*Delivery:* ${deliveryText}\n\n` +

    `*Items:*\n${itemsText}\n\n` +

    `Subtotal: ${formatPrice(
      subtotal
    )}\n` +

    `Delivery: ${
      deliveryType === "delivery"
      ? formatPrice(DELIVERY_FEE)
      : "Free"
    }\n` +

    `*Total: ${formatPrice(total)}*\n\n` +

    (
      note
      ? `Note: ${note}\n\n`
      : ""
    ) +

    `I will transfer to:\n` +

    `PiggyVest - Ajigo Collins Ojenya\n` +

    `Account: 9043728140\n\n` +

    `Please confirm my order. Thank you!`;

  const whatsappURL =
    `https://wa.me/2349047101249?text=${
      encodeURIComponent(message)
    }`;

  setTimeout(() => {

    window.open(
      whatsappURL,
      "_blank"
    );

  }, 600);
}

// ================= FILTER =================

function setFilter(filter, btn) {

  document
    .querySelectorAll(".filter-btn")
    .forEach(b =>
      b.classList.remove("active")
    );

  if (btn) {

    btn.classList.add("active");

  }

  renderProducts(filter);
}

// ================= INITIALIZE =================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadProductsFromSupabase();

    updateCartCount();

    updateCheckoutTotal();

  }
);
