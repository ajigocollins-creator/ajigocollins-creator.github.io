/* =========================================================
   COLLINS CLOTHING - CUSTOMER SHOP
   Supabase + Products + Categories + Cart + Checkout
========================================================= */

let shopProducts = [];
let currentFilter = "all";
let currentCategory = "all";

let cart = JSON.parse(
  localStorage.getItem("collins_cart") || "[]"
);

const productGrid =
  document.getElementById("product-grid");


/* =========================================================
   SUPABASE
========================================================= */

let shopSupabase = null;

try {

  if (
    window.supabase &&
    typeof SUPABASE_URL !== "undefined" &&
    typeof SUPABASE_ANON_KEY !== "undefined"
  ) {

    shopSupabase =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
  }

} catch (error) {

  console.error(
    "Supabase connection error:",
    error
  );
}


/* =========================================================
   TOAST NOTIFICATION
========================================================= */

function showToast(
  message,
  type = "success"
) {

  let toast =
    document.getElementById(
      "collins-toast"
    );

  if (!toast) {

    toast =
      document.createElement("div");

    toast.id =
      "collins-toast";

    toast.style.position =
      "fixed";

    toast.style.left =
      "50%";

    toast.style.bottom =
      "25px";

    toast.style.transform =
      "translateX(-50%) translateY(20px)";

    toast.style.background =
      "#111";

    toast.style.color =
      "#fff";

    toast.style.padding =
      "14px 20px";

    toast.style.borderRadius =
      "12px";

    toast.style.fontSize =
      "15px";

    toast.style.fontWeight =
      "600";

    toast.style.zIndex =
      "999999";

    toast.style.boxShadow =
      "0 8px 30px rgba(0,0,0,0.25)";

    toast.style.opacity =
      "0";

    toast.style.transition =
      "all 0.3s ease";

    toast.style.maxWidth =
      "90%";

    toast.style.textAlign =
      "center";

    document.body.appendChild(
      toast
    );
  }


  if (type === "error") {

    toast.style.background =
      "#dc2626";

  } else if (type === "warning") {

    toast.style.background =
      "#f59e0b";

  } else {

    toast.style.background =
      "#111";
  }


  toast.textContent =
    message;


  clearTimeout(
    window.collinsToastTimer
  );


  requestAnimationFrame(
    function() {

      toast.style.opacity =
        "1";

      toast.style.transform =
        "translateX(-50%) translateY(0)";
    }
  );


  window.collinsToastTimer =
    setTimeout(
      function() {

        toast.style.opacity =
          "0";

        toast.style.transform =
          "translateX(-50%) translateY(20px)";

      },
      2500
    );
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProductsFromSupabase() {

  if (!productGrid) return;


  productGrid.innerHTML = `
    <p style="
      padding:30px;
      text-align:center;
    ">
      Loading products...
    </p>
  `;


  try {

    if (!shopSupabase) {

      throw new Error(
        "Supabase is not connected."
      );
    }


    const {
      data,
      error
    } =
      await shopSupabase
        .from("products")
        .select("*");


    if (error) {

      throw error;
    }


    console.log(
      "Products received from Supabase:",
      data
    );


    shopProducts =
      (data || []).map(
        function(product) {

          const productImage =
            product.image_url ||
            product.image ||
            "logo.png";


          return {

            id:
              product.id,

            name:
              product.name ||
              "Unnamed Product",

            price:
              Number(product.price) ||
              0,

            image:
              productImage,

            image_url:
              productImage,

            available:
              product.available !== false,

            /*
              CATEGORY
            */
            category:
              product.category ||
              "T-Shirts"

          };

        }
      );


    console.log(
      "Shop products:",
      shopProducts
    );


    renderProducts();


    updateCartCount();

  } catch (error) {

    console.error(
      "Supabase product error:",
      error
    );


    productGrid.innerHTML = `
      <div style="
        margin:20px;
        padding:20px;
        background:#fff0f0;
        color:#b00020;
        border:1px solid #ffb3b3;
        border-radius:10px;
        text-align:center;
      ">
        <strong>
          Unable to load products.
        </strong>

        <br><br>

        ${escapeHTML(
          error.message ||
          "Unknown error"
        )}

      </div>
    `;
  }
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

  if (!productGrid) return;


  let products =
    shopProducts;


  /* =======================================================
     CATEGORY FILTER
  ======================================================= */

  if (
    currentCategory !== "all"
  ) {

    products =
      products.filter(
        function(product) {

          return (
            String(
              product.category
            ).toLowerCase() ===
            String(
              currentCategory
            ).toLowerCase()
          );

        }
      );
  }


  /* =======================================================
     AVAILABILITY FILTER
  ======================================================= */

  if (
    currentFilter === "available"
  ) {

    products =
      products.filter(
        function(product) {

          return (
            product.available === true
          );

        }
      );
  }


  if (
    currentFilter === "sold"
  ) {

    products =
      products.filter(
        function(product) {

          return (
            product.available === false
          );

        }
      );
  }


  /* =======================================================
     NO PRODUCTS
  ======================================================= */

  if (!products.length) {

    productGrid.innerHTML = `
      <p style="
        padding:30px;
        text-align:center;
        width:100%;
      ">
        No products found.
      </p>
    `;

    return;
  }


  /* =======================================================
     PRODUCT CARDS
  ======================================================= */

  productGrid.innerHTML =
    products.map(
      function(product) {

        const soldOut =
          product.available === false;


        const imageSource =
          product.image_url ||
          product.image ||
          "logo.png";


        return `

          <div class="product-card">

            <div style="
              position:relative;
            ">

              <img
                src="${escapeHTML(
                  imageSource
                )}"
                alt="${escapeHTML(
                  product.name
                )}"
                style="
                  width:100%;
                  height:280px;
                  object-fit:cover;
                  display:block;
                "
                onerror="
                  this.onerror=null;
                  this.src='logo.png';
                "
              >


              ${
                soldOut
                  ? `
                    <span style="
                      position:absolute;
                      top:10px;
                      left:10px;
                      background:#111;
                      color:white;
                      padding:7px 12px;
                      border-radius:20px;
                      font-size:12px;
                      font-weight:bold;
                    ">
                      SOLD OUT
                    </span>
                  `
                  : `
                    <span style="
                      position:absolute;
                      top:10px;
                      left:10px;
                      background:#16a34a;
                      color:white;
                      padding:7px 12px;
                      border-radius:20px;
                      font-size:12px;
                      font-weight:bold;
                    ">
                      AVAILABLE
                    </span>
                  `
              }

            </div>


            <div style="
              padding:15px;
            ">

              <h3 style="
                margin:0 0 8px;
              ">
                ${escapeHTML(
                  product.name
                )}
              </h3>


              <p style="
                font-weight:bold;
                font-size:18px;
                margin:0 0 12px;
              ">
                ₦${product.price.toLocaleString()}
              </p>


              ${
                soldOut

                ? `

                  <button
                    disabled
                    style="
                      width:100%;
                      padding:12px;
                      background:#ddd;
                      color:#777;
                      border:none;
                      border-radius:8px;
                      cursor:not-allowed;
                    "
                  >
                    Sold Out
                  </button>

                `

                : `

                  <button
                    onclick="
                      addToCart(
                        ${JSON.stringify(
                          product.id
                        )}
                      )
                    "
                    style="
                      width:100%;
                      padding:12px;
                      background:#111;
                      color:white;
                      border:none;
                      border-radius:8px;
                      font-weight:bold;
                      cursor:pointer;
                    "
                  >
                    🛒 Add to Cart
                  </button>

                `
              }

            </div>

          </div>

        `;

      }
    ).join("");
}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function setCategory(
  category,
  btn
) {

  currentCategory =
    category;


  /*
    Remove active category
  */

  document
    .querySelectorAll(
      ".category-btn"
    )
    .forEach(
      function(button) {

        button.classList.remove(
          "active"
        );

      }
    );


  /*
    Make selected category active
  */

  if (btn) {

    btn.classList.add(
      "active"
    );
  }


  renderProducts();
}


/* =========================================================
   AVAILABILITY FILTER
========================================================= */

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
    .forEach(
      function(button) {

        button.classList.remove(
          "active"
        );

      }
    );


  if (btn) {

    btn.classList.add(
      "active"
    );
  }


  renderProducts();
}


/* =========================================================
   CART
========================================================= */

function saveCart() {

  localStorage.setItem(
    "collins_cart",
    JSON.stringify(cart)
  );
}


function addToCart(
  productId
) {

  const product =
    shopProducts.find(
      function(item) {

        return (
          String(item.id) ===
          String(productId)
        );

      }
    );


  if (!product) {

    showToast(
      "Product not found.",
      "error"
    );

    return;
  }


  if (!product.available) {

    showToast(
      "Sorry, this product is sold out.",
      "warning"
    );

    return;
  }


  const existing =
    cart.find(
      function(item) {

        return (
          String(item.id) ===
          String(product.id)
        );

      }
    );


  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({

      id:
        product.id,

      name:
        product.name,

      price:
        product.price,

      image:
        product.image_url ||
        product.image ||
        "logo.png",

      quantity:
        1

    });
  }


  saveCart();

  updateCartCount();

  renderCart();


  showToast(
    "Added to cart 🛒"
  );
}


function removeFromCart(
  productId
) {

  cart =
    cart.filter(
      function(item) {

        return (
          String(item.id) !==
          String(productId)
        );

      }
    );


  saveCart();

  updateCartCount();

  renderCart();
}


function increaseQuantity(
  productId
) {

  const item =
    cart.find(
      function(item) {

        return (
          String(item.id) ===
          String(productId)
        );

      }
    );


  if (item) {

    item.quantity += 1;
  }


  saveCart();

  updateCartCount();

  renderCart();
}


function decreaseQuantity(
  productId
) {

  const item =
    cart.find(
      function(item) {

        return (
          String(item.id) ===
          String(productId)
        );

      }
    );


  if (!item) return;


  if (
    item.quantity > 1
  ) {

    item.quantity -= 1;

  } else {

    removeFromCart(
      productId
    );

    return;
  }


  saveCart();

  updateCartCount();

  renderCart();
}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

  const countElement =
    document.querySelector(
      ".cart-count"
    );


  if (!countElement) return;


  const totalItems =
    cart.reduce(
      function(total, item) {

        return (
          total +
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );


  countElement.textContent =
    totalItems;


  countElement.style.display =
    totalItems > 0
      ? "inline-flex"
      : "none";
}


/* =========================================================
   OPEN / CLOSE CART
========================================================= */

function openCart() {

  const overlay =
    document.getElementById(
      "cart-overlay"
    );


  if (!overlay) return;


  overlay.classList.add(
    "open"
  );


  renderCart();
}


function closeCart() {

  const overlay =
    document.getElementById(
      "cart-overlay"
    );


  if (!overlay) return;


  overlay.classList.remove(
    "open"
  );
}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

  const container =
    document.getElementById(
      "cart-items"
    );


  const footer =
    document.getElementById(
      "cart-footer"
    );


  const totalElement =
    document.getElementById(
      "cart-total-amount"
    );


  if (!container) return;


  if (!cart.length) {

    container.innerHTML = `
      <div style="
        padding:30px 15px;
        text-align:center;
        color:#777;
      ">

        <div style="
          font-size:40px;
        ">
          🛒
        </div>

        <p>
          Your cart is empty.
        </p>

      </div>
    `;


    if (footer) {

      footer.style.display =
        "none";
    }


    return;
  }


  let total = 0;


  container.innerHTML =
    cart.map(
      function(item) {

        const itemTotal =
          Number(item.price) *
          Number(item.quantity);


        total +=
          itemTotal;


        const itemImage =
          item.image ||
          "logo.png";


        return `

          <div style="
            display:flex;
            gap:10px;
            padding:12px 0;
            border-bottom:1px solid #eee;
          ">

            <img
              src="${escapeHTML(
                itemImage
              )}"
              alt="${escapeHTML(
                item.name
              )}"
              style="
                width:65px;
                height:65px;
                object-fit:cover;
                border-radius:8px;
              "
              onerror="
                this.onerror=null;
                this.src='logo.png';
              "
            >


            <div style="
              flex:1;
            ">

              <strong>
                ${escapeHTML(
                  item.name
                )}
              </strong>


              <div style="
                margin-top:5px;
              ">
                ₦${Number(
                  item.price
                ).toLocaleString()}
              </div>


              <div style="
                display:flex;
                align-items:center;
                gap:8px;
                margin-top:8px;
              ">

                <button
                  onclick="
                    decreaseQuantity(
                      ${JSON.stringify(
                        item.id
                      )}
                    )
                  "
                  style="
                    width:30px;
                    height:30px;
                    border:1px solid #ddd;
                    background:white;
                    border-radius:6px;
                  "
                >
                  −
                </button>


                <strong>
                  ${item.quantity}
                </strong>


                <button
                  onclick="
                    increaseQuantity(
                      ${JSON.stringify(
                        item.id
                      )}
                    )
                  "
                  style="
                    width:30px;
                    height:30px;
                    border:1px solid #ddd;
                    background:white;
                    border-radius:6px;
                  "
                >
                  +
                </button>


                <button
                  onclick="
                    removeFromCart(
                      ${JSON.stringify(
                        item.id
                      )}
                    )
                  "
                  style="
                    margin-left:auto;
                    border:none;
                    background:none;
                    color:#dc2626;
                    cursor:pointer;
                  "
                >
                  🗑️
                </button>

              </div>

            </div>

          </div>

        `;

      }
    ).join("");


  if (totalElement) {

    totalElement.textContent =
      "₦" +
      total.toLocaleString();
  }


  if (footer) {

    footer.style.display =
      "block";
  }
}


/* =========================================================
   CHECKOUT
========================================================= */

function openCheckout() {

  if (!cart.length) {

    showToast(
      "Your cart is empty.",
      "warning"
    );

    return;
  }


  const modal =
    document.getElementById(
      "checkout-modal"
    );


  if (!modal) return;


  updateCheckoutTotal();

  modal.classList.add(
    "open"
  );
}


function closeCheckout() {

  const modal =
    document.getElementById(
      "checkout-modal"
    );


  if (!modal) return;


  modal.classList.remove(
    "open"
  );
}


function updateCheckoutTotal() {

  let total =
    cart.reduce(
      function(sum, item) {

        return (
          sum +
          Number(item.price) *
          Number(item.quantity)
        );

      },
      0
    );


  const delivery =
    document.querySelector(
      'input[name="delivery"]:checked'
    );


  if (
    delivery &&
    delivery.value ===
      "delivery"
  ) {

    total +=
      2000;
  }


  const totalElement =
    document.getElementById(
      "checkout-total"
    );


  if (totalElement) {

    totalElement.textContent =
      "₦" +
      total.toLocaleString();
  }
}


/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder(
  event
) {

  event.preventDefault();


  if (!cart.length) {

    showToast(
      "Your cart is empty.",
      "warning"
    );

    return;
  }


  const name =
    document
      .getElementById(
        "cust-name"
      )
      .value
      .trim();


  const phone =
    document
      .getElementById(
        "cust-phone"
      )
      .value
      .trim();


  const address =
    document
      .getElementById(
        "cust-address"
      )
      .value
      .trim();


  const note =
    document
      .getElementById(
        "cust-note"
      )
      .value
      .trim();


  const delivery =
    document.querySelector(
      'input[name="delivery"]:checked'
    );


  if (!name || !phone) {

    showToast(
      "Please enter your name and phone number.",
      "warning"
    );

    return;
  }


  if (
    delivery &&
    delivery.value ===
      "delivery" &&
    !address
  ) {

    showToast(
      "Please enter your delivery address.",
      "warning"
    );

    return;
  }


  const subtotal =
    cart.reduce(
      function(sum, item) {

        return (
          sum +
          Number(item.price) *
          Number(item.quantity)
        );

      },
      0
    );


  const deliveryFee =
    (
      delivery &&
      delivery.value ===
        "delivery"
    )
      ? 2000
      : 0;


  const total =
    subtotal +
    deliveryFee;


  const orderItems =
    cart.map(
      function(item) {

        return {

          product_id:
            item.id,

          name:
            item.name,

          price:
            item.price,

          quantity:
            item.quantity

        };

      }
    );


  /* =======================================================
     SAVE ORDER TO SUPABASE
  ======================================================= */

  if (shopSupabase) {

    try {

      const {
        error
      } =
        await shopSupabase
          .from("orders")
          .insert({

            customer_name:
              name,

            customer_phone:
              phone,

            customer_address:
              (
                delivery &&
                delivery.value ===
                  "delivery"
              )
                ? address
                : "Pickup",

            note:
              note,

            delivery:
              delivery
                ? delivery.value
                : "pickup",

            items:
              orderItems,

            subtotal:
              subtotal,

            delivery_fee:
              deliveryFee,

            total:
              total,

            status:
              "pending"

          });


      if (error) {

        console.warn(
          "Supabase order error:",
          error
        );
      }

    } catch (error) {

      console.warn(
        "Supabase order error:",
        error
      );
    }
  }


  /* =======================================================
     WHATSAPP MESSAGE
  ======================================================= */

  let message =
    "Hello Collins Clothing!%0A%0A" +
    "*NEW ORDER*%0A%0A";


  message +=
    "Name: " +
    encodeURIComponent(
      name
    ) +
    "%0A";


  message +=
    "Phone: " +
    encodeURIComponent(
      phone
    ) +
    "%0A";


  message +=
    "Option: " +
    encodeURIComponent(
      delivery
        ? delivery.value
        : "pickup"
    ) +
    "%0A";


  if (
    delivery &&
    delivery.value ===
      "delivery"
  ) {

    message +=
      "Address: " +
      encodeURIComponent(
        address
      ) +
      "%0A";
  }


  message +=
    "%0A*Items:*%0A";


  cart.forEach(
    function(item) {

      const itemTotal =
        Number(item.price) *
        Number(item.quantity);


      message +=
        encodeURIComponent(
          item.name +
          " x" +
          item.quantity +
          " = ₦" +
          itemTotal.toLocaleString()
        ) +
        "%0A";

    }
  );


  message +=
    "%0ASubtotal: ₦" +
    subtotal.toLocaleString();


  if (
    deliveryFee > 0
  ) {

    message +=
      "%0ADelivery: ₦2,000";
  }


  message +=
    "%0A*TOTAL: ₦" +
    total.toLocaleString() +
    "*";


  if (note) {

    message +=
      "%0ANote: " +
      encodeURIComponent(
        note
      );
  }


  message +=
    "%0A%0APayment: PiggyVest";


  /* =======================================================
     CLEAR CART
  ======================================================= */

  cart = [];

  saveCart();

  updateCartCount();

  closeCheckout();

  closeCart();


  const checkoutForm =
    document.getElementById(
      "checkout-form"
    );


  if (checkoutForm) {

    checkoutForm.reset();
  }


  updateCheckoutTotal();


  /* =======================================================
     OPEN WHATSAPP
  ======================================================= */

  window.open(
    "https://wa.me/2349047101249?text=" +
      message,
    "_blank"
  );


  showToast(
    "Order placed successfully! ✅"
  );
}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(
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


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadProductsFromSupabase();

    updateCartCount();

    renderCart();

  }
);


/* =========================================================
   MAKE FUNCTIONS AVAILABLE
========================================================= */

window.setFilter =
  setFilter;

window.setCategory =
  setCategory;

window.addToCart =
  addToCart;

window.removeFromCart =
  removeFromCart;

window.increaseQuantity =
  increaseQuantity;

window.decreaseQuantity =
  decreaseQuantity;

window.openCart =
  openCart;

window.closeCart =
  closeCart;

window.openCheckout =
  openCheckout;

window.closeCheckout =
  closeCheckout;

window.updateCheckoutTotal =
  updateCheckoutTotal;

window.placeOrder =
  placeOrder;

window.renderProducts =
  renderProducts;

window.loadProductsFromSupabase =
  loadProductsFromSupabase;
