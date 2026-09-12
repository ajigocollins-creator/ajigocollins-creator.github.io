// ============================================
// COLLINS CLOTHING - SHOP PRODUCTS
// ============================================

let shopProducts = [];

let currentFilter = "all";

let currentCategory = "all";

let cart =
  JSON.parse(
    localStorage.getItem("collins_cart") || "[]"
  );


// ============================================
// SUPABASE
// ============================================

const shopSupabase =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// ============================================
// LOAD PRODUCTS
// ============================================

async function loadProductsFromSupabase() {

  try {

    const { data, error } =
      await shopSupabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false
        });


    if (error) {
      throw error;
    }


    shopProducts =
      (data || []).map(product => {

        const productImage =
          product.image_url ||
          product.image ||
          "logo.png";


        return {

          id: product.id,

          name:
            product.name ||
            "Unnamed Product",

          price:
            Number(product.price) || 0,

          image:
            productImage,

          image_url:
            productImage,

          category:
            normalizeCategory(
              product.category
            ),

          available:
            product.available !== false

        };

      });


    createCategoryButtons();

    renderProducts();


  } catch (error) {

    console.error(
      "Product loading error:",
      error
    );


    const grid =
      document.getElementById(
        "product-grid"
      );


    if (grid) {

      grid.innerHTML = `
        <div style="
          grid-column:1/-1;
          text-align:center;
          padding:40px;
        ">
          <h3>Unable to load products</h3>
          <p>${escapeHtml(
            error.message
          )}</p>
        </div>
      `;

    }

  }

}


// ============================================
// CATEGORY NORMALIZER
// ============================================

function normalizeCategory(category) {

  if (!category) {
    return "T-Shirts";
  }


  const value =
    String(category)
      .trim()
      .toLowerCase();


  if (
    value === "t-shirt" ||
    value === "tshirts" ||
    value === "t-shirts"
  ) {

    return "T-Shirts";

  }


  if (
    value === "baggie jean" ||
    value === "baggie jeans"
  ) {

    return "Baggie Jeans";

  }


  if (
    value === "hoodie" ||
    value === "hoodies"
  ) {

    return "Hoodies";

  }


  return category;

}


// ============================================
// CREATE CATEGORY BUTTONS
// ============================================

function createCategoryButtons() {

  const productsSection =
    document.getElementById(
      "products"
    );


  if (!productsSection) {
    return;
  }


  let categoryBox =
    document.querySelector(
      ".category-filters"
    );


  // If you already have category buttons
  // in index.html, don't create another set.

  if (categoryBox) {
    return;
  }


  categoryBox =
    document.createElement("div");


  categoryBox.className =
    "category-filters";


  categoryBox.style.cssText = `
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    width:100%;
    margin-top:15px;
  `;


  const categories = [
    ["all", "All"],
    ["T-Shirts", "T-Shirts"],
    ["Baggie Jeans", "Baggie Jeans"],
    ["Hoodies", "Hoodies"]
  ];


  categories.forEach(
    ([value, label]) => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "category-btn";


      if (value === "all") {
        button.classList.add(
          "active"
        );
      }


      button.textContent =
        label;


      button.onclick =
        function() {

          setCategory(
            value,
            this
          );

        };


      categoryBox.appendChild(
        button
      );

    }
  );


  const header =
    productsSection.querySelector(
      ".section-header"
    );


  if (header) {

    header.appendChild(
      categoryBox
    );

  } else {

    productsSection.prepend(
      categoryBox
    );

  }

}


// ============================================
// CATEGORY FILTER
// ============================================

function setCategory(
  category,
  button
) {

  currentCategory =
    category;


  document
    .querySelectorAll(
      ".category-btn"
    )
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );

    });


  if (button) {

    button.classList.add(
      "active"
    );

  }


  renderProducts();

}


// ============================================
// AVAILABILITY FILTER
// ============================================

function setFilter(
  filter,
  btn
) {

  currentFilter =
    filter;


  document
    .querySelectorAll(
      ".filter-btn"
    )
    .forEach(button => {

      button.classList.remove(
        "active"
      );

    });


  if (btn) {

    btn.classList.add(
      "active"
    );

  }


  renderProducts();

}


// ============================================
// RENDER PRODUCTS
// ============================================

function renderProducts(
  filter = currentFilter
) {

  currentFilter =
    filter;


  const grid =
    document.getElementById(
      "product-grid"
    );


  if (!grid) {
    return;
  }


  let products =
    [...shopProducts];


  // CATEGORY

  if (
    currentCategory !== "all"
  ) {

    products =
      products.filter(
        product =>
          normalizeCategory(
            product.category
          ) === currentCategory
      );

  }


  // AVAILABILITY

  if (
    currentFilter ===
    "available"
  ) {

    products =
      products.filter(
        product =>
          product.available
      );

  }


  if (
    currentFilter ===
    "sold"
  ) {

    products =
      products.filter(
        product =>
          !product.available
      );

  }


  if (!products.length) {

    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:45px 15px;
        color:#777;
      ">
        <h3>No products found</h3>
        <p>
          There are no products in this category yet.
        </p>
      </div>
    `;

    return;
  }


  grid.innerHTML =
    products.map(
      product =>
        createProductCard(
          product
        )
    ).join("");

}


// ============================================
// PRODUCT CARD
// ============================================

function createProductCard(
  product
) {

  const soldOut =
    !product.available;


  return `

    <div
      class="product-card"
      data-category="${escapeAttribute(
        product.category
      )}"
    >

      <div class="product-image-wrap">

        <img
          src="${escapeAttribute(
            product.image_url ||
            product.image ||
            "logo.png"
          )}"
          alt="${escapeAttribute(
            product.name
          )}"
          class="product-image"
          onerror="this.src='logo.png'"
        >

        ${
          soldOut
            ? `
              <div
                class="sold-out-badge"
              >
                SOLD OUT
              </div>
            `
            : ""
        }

      </div>


      <div class="product-info">

        <div
          style="
            font-size:13px;
            font-weight:bold;
            opacity:.65;
            margin-bottom:6px;
          "
        >
          ${escapeHtml(
            normalizeCategory(
              product.category
            )
          )}
        </div>


        <h3>
          ${escapeHtml(
            product.name
          )}
        </h3>


        <p class="product-price">
          ₦${Number(
            product.price
          ).toLocaleString()}
        </p>


        ${
          soldOut
            ? `
              <button
                class="add-to-cart-btn"
                disabled
                style="
                  opacity:.5;
                  cursor:not-allowed;
                "
              >
                Sold Out
              </button>
            `
            : `
              <button
                class="add-to-cart-btn"
                onclick="addToCart('${escapeAttribute(
                  product.id
                )}')"
              >
                🛒 Add to Cart
              </button>
            `
        }

      </div>

    </div>

  `;

}


// ============================================
// ADD TO CART
// ============================================

function addToCart(
  productId
) {

  const product =
    shopProducts.find(
      p =>
        String(p.id) ===
        String(productId)
    );


  if (!product) {
    return;
  }


  if (!product.available) {

    showToast(
      "This product is sold out."
    );

    return;
  }


  const existing =
    cart.find(
      item =>
        String(item.id) ===
        String(product.id)
    );


  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: product.price,

      image:
        product.image_url ||
        product.image,

      quantity: 1

    });

  }


  saveCart();

  updateCartCount();

  renderCart();

  showToast(
    "Added to cart 🛒"
  );

}


// ============================================
// SAVE CART
// ============================================

function saveCart() {

  localStorage.setItem(
    "collins_cart",
    JSON.stringify(cart)
  );

}


// ============================================
// CART COUNT
// ============================================

function updateCartCount() {

  const count =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );


  const cartCount =
    document.getElementById(
      "cart-count"
    );


  if (cartCount) {

    cartCount.textContent =
      count;

  }

}


// ============================================
// RENDER CART
// ============================================

function renderCart() {

  const cartItems =
    document.getElementById(
      "cart-items"
    );


  if (!cartItems) {
    return;
  }


  if (!cart.length) {

    cartItems.innerHTML = `
      <p style="
        text-align:center;
        padding:30px;
        color:#777;
      ">
        Your cart is empty 🛒
      </p>
    `;

    updateCartTotal();

    return;
  }


  cartItems.innerHTML =
    cart.map(
      item => `

        <div
          class="cart-item"
          style="
            display:flex;
            gap:12px;
            align-items:center;
            margin-bottom:15px;
          "
        >

          <img
            src="${escapeAttribute(
              item.image ||
              "logo.png"
            )}"
            style="
              width:70px;
              height:80px;
              object-fit:cover;
              border-radius:10px;
            "
          >

          <div style="flex:1">

            <strong>
              ${escapeHtml(
                item.name
              )}
            </strong>

            <div>
              ₦${Number(
                item.price
              ).toLocaleString()}
            </div>

            <div
              style="
                display:flex;
                align-items:center;
                gap:8px;
                margin-top:7px;
              "
            >

              <button
                onclick="changeQuantity(
                  '${escapeAttribute(
                    item.id
                  )}',
                  -1
                )"
              >
                −
              </button>

              <span>
                ${item.quantity}
              </span>

              <button
                onclick="changeQuantity(
                  '${escapeAttribute(
                    item.id
                  )}',
                  1
                )"
              >
                +
              </button>

              <button
                onclick="removeFromCart(
                  '${escapeAttribute(
                    item.id
                  )}'
                )"
                style="
                  margin-left:8px;
                  color:red;
                "
              >
                Remove
              </button>

            </div>

          </div>

        </div>

      `
    ).join("");


  updateCartTotal();

}


// ============================================
// CHANGE QUANTITY
// ============================================

function changeQuantity(
  id,
  amount
) {

  const item =
    cart.find(
      product =>
        String(product.id) ===
        String(id)
    );


  if (!item) {
    return;
  }


  item.quantity += amount;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        product =>
          String(product.id) !==
          String(id)
      );

  }


  saveCart();

  updateCartCount();

  renderCart();

}


// ============================================
// REMOVE FROM CART
// ============================================

function removeFromCart(id) {

  cart =
    cart.filter(
      item =>
        String(item.id) !==
        String(id)
    );


  saveCart();

  updateCartCount();

  renderCart();

}


// ============================================
// CART TOTAL
// ============================================

function updateCartTotal() {

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
        Number(item.quantity),
      0
    );


  const totalElement =
    document.getElementById(
      "cart-total"
    );


  if (totalElement) {

    totalElement.textContent =
      "₦" +
      total.toLocaleString();

  }

}


// ============================================
// TOAST
// ============================================

function showToast(
  message
) {

  let toast =
    document.getElementById(
      "collins-toast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "collins-toast";


    toast.style.cssText = `
      position:fixed;
      bottom:25px;
      left:50%;
      transform:translateX(-50%);
      background:#111;
      color:white;
      padding:14px 22px;
      border-radius:12px;
      z-index:99999;
      font-weight:bold;
    `;


    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.style.display =
    "block";


  setTimeout(
    () => {
      toast.style.display =
        "none";
    },
    2200
  );

}


// ============================================
// SECURITY
// ============================================

function escapeHtml(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  );

}


// ============================================
// START SHOP
// ============================================

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    updateCartCount();

    renderCart();

    await loadProductsFromSupabase();

  }
);


// ============================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ============================================

window.setFilter =
  setFilter;

window.setCategory =
  setCategory;

window.addToCart =
  addToCart;

window.changeQuantity =
  changeQuantity;

window.removeFromCart =
  removeFromCart;

window.renderCart =
  renderCart;
