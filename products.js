let shopProducts = [];
let currentFilter = "all";

let cart = JSON.parse(
  localStorage.getItem("collins_cart") || "[]"
);

const productGrid =
  document.getElementById("product-grid");

/* =====================================================
   SUPABASE
===================================================== */

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

  } else {

    console.error(
      "Supabase configuration is missing."
    );

  }

} catch (error) {

  console.error(
    "Supabase connection error:",
    error
  );

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProductsFromSupabase() {

  if (!productGrid) return;

  productGrid.innerHTML = `
    <p style="
      padding:30px;
      text-align:center;
      width:100%;
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

   const { data, error } = await shopSupabase
  .from("products")
  .select("*");

    if (error) {
      throw error;
    }

    console.log(
      "Products received:",
      data
    );

    shopProducts =
      (data || []).map(function(product) {

        return {

          id: product.id,

          name:
            product.name ||
            "Unnamed Product",

          price:
            Number(product.price) || 0,

          image:
            product.image_url ||
            product.image ||
            "logo.png",

          image_url:
            product.image_url ||
            product.image ||
            "logo.png",

          available:
            product.available !== false

        };

      });

    renderProducts(currentFilter);

    updateCartCount();

  } catch (error) {

    console.error(
      "Product loading error:",
      error
    );

    productGrid.innerHTML = `
      <div style="
        padding:25px;
        margin:20px;
        text-align:center;
        background:#fff0f0;
        color:#b00020;
        border-radius:10px;
      ">
        <strong>
          Unable to load products.
        </strong>

        <br><br>

        ${escapeHTML(error.message)}
      </div>
    `;

  }
}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts(filter = "all") {

  currentFilter = filter;

  if (!productGrid) return;

  let products = shopProducts;

  if (filter === "available") {

    products =
      shopProducts.filter(function(product) {

        return product.available === true;

      });

  }

  if (filter === "sold") {

    products =
      shopProducts.filter(function(product) {

        return product.available === false;

      });

  }

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

  productGrid.innerHTML =
    products.map(function(product) {

      const soldOut =
        product.available === false;

      const image =
        product.image_url ||
        product.image ||
        "logo.png";

      return `

        <div class="product-card">

          <div style="
            position:relative;
          ">

            <img
              src="${escapeHTML(image)}"
              alt="${escapeHTML(product.name)}"
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

            <span style="
              position:absolute;
              top:10px;
              left:10px;
              background:${soldOut ? "#111" : "#16a34a"};
              color:white;
              padding:7px 12px;
              border-radius:20px;
              font-size:12px;
              font-weight:bold;
            ">
              ${soldOut ? "SOLD OUT" : "AVAILABLE"}
            </span>

          </div>

          <div style="padding:15px;">

            <h3 style="
              margin:0 0 8px;
            ">
              ${escapeHTML(product.name)}
            </h3>

            <p style="
              font-weight:bold;
              font-size:18px;
              margin:0 0 12px;
            ">
              ₦${product.price.toLocaleString("en-NG")}
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
                  "
                >
                  Sold Out
                </button>
              `

              : `
                <button
                  onclick="addToCart(${JSON.stringify(product.id)})"
                  style="
                    width:100%;
                    padding:12px;
                    background:#111;
                    color:white;
                    border:none;
                    border-radius:8px;
                    font-weight:bold;
                  "
                >
                  🛒 Add to Cart
                </button>
              `
            }

          </div>

        </div>

      `;

    }).join("");
}


/* =====================================================
   FILTER
===================================================== */

function setFilter(filter, btn) {

  document
    .querySelectorAll(".filter-btn")
    .forEach(function(button) {

      button.classList.remove("active");

    });

  if (btn) {
    btn.classList.add("active");
  }

  renderProducts(filter);
}


/* =====================================================
   HELPERS
===================================================== */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadProductsFromSupabase();

    updateCartCount();

    renderCart();

  }
);


/* =====================================================
   MAKE FUNCTIONS AVAILABLE
===================================================== */

window.setFilter =
  setFilter;

window.loadProductsFromSupabase =
  loadProductsFromSupabase;
