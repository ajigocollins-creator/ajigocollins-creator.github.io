// ==================================================
// COLLINS CLOTHING - CEO DASHBOARD
// ==================================================


// ==================================================
// SETTINGS
// ==================================================

const DEFAULT_PASSWORD = "collins2026";

const PASSWORD_KEY = "collins_ceo_password";


// ==================================================
// PASSWORD
// ==================================================

function getDashboardPassword() {

  return localStorage.getItem(PASSWORD_KEY)
    || DEFAULT_PASSWORD;

}


// ==================================================
// LOGIN
// ==================================================

function checkAuth() {

  return sessionStorage.getItem("collins_ceo")
    === "true";

}


function login() {

  const passwordInput =
    document.getElementById("password");

  if (!passwordInput) return;

  const password =
    passwordInput.value.trim();


  if (!password) {

    alert("Please enter your password.");

    passwordInput.focus();

    return;

  }


  if (password === getDashboardPassword()) {

    sessionStorage.setItem(
      "collins_ceo",
      "true"
    );


    showDashboard();

  } else {

    alert("Wrong password. Try again.");

    passwordInput.value = "";

    passwordInput.focus();

  }

}


// ==================================================
// LOGOUT
// ==================================================

function logout() {

  sessionStorage.removeItem(
    "collins_ceo"
  );

  location.reload();

}


// ==================================================
// SHOW DASHBOARD
// ==================================================

function showDashboard() {

  const loginSection =
    document.getElementById("login-section");

  const dashboardSection =
    document.getElementById("dash-section");


  if (loginSection) {

    loginSection.style.display = "none";

  }


  if (dashboardSection) {

    dashboardSection.style.display = "block";

  }


  renderDashboard();

  renderOrders();

  renderSalesSummary();

}


// ==================================================
// GET PRODUCTS SAFELY
// ==================================================

function dashboardGetProducts() {

  if (typeof getProducts === "function") {

    return getProducts();

  }


  try {

    return JSON.parse(
      localStorage.getItem("collins_products")
    ) || [];

  } catch {

    return [];

  }

}


// ==================================================
// SAVE PRODUCTS SAFELY
// ==================================================

function dashboardSaveProducts(products) {

  if (typeof saveProducts === "function") {

    saveProducts(products);

    return;

  }


  localStorage.setItem(
    "collins_products",
    JSON.stringify(products)
  );

}


// ==================================================
// GET ORDERS
// ==================================================

function dashboardGetOrders() {

  if (typeof getOrders === "function") {

    return getOrders();

  }


  try {

    return JSON.parse(
      localStorage.getItem("collins_orders")
    ) || [];

  } catch {

    return [];

  }

}


// ==================================================
// PRICE FORMAT
// ==================================================

function dashboardFormatPrice(amount) {

  if (typeof formatPrice === "function") {

    return formatPrice(amount);

  }


  return "₦" + Number(amount || 0)
    .toLocaleString("en-NG");

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ==================================================
// RENDER PRODUCTS
// ==================================================

function renderDashboard() {

  const products =
    dashboardGetProducts();

  const orders =
    dashboardGetOrders();


  const available =
    products.filter(
      product => product.available
    ).length;


  const sold =
    products.filter(
      product => !product.available
    ).length;


  document.getElementById(
    "stat-total"
  ).textContent = products.length;


  document.getElementById(
    "stat-available"
  ).textContent = available;


  document.getElementById(
    "stat-sold"
  ).textContent = sold;


  document.getElementById(
    "stat-orders"
  ).textContent = orders.length;


  const table =
    document.getElementById(
      "product-table-body"
    );


  if (!table) return;


  if (!products.length) {

    table.innerHTML = `
      <tr>
        <td
          colspan="5"
          style="
            padding:30px;
            text-align:center;
            color:#777;
          "
        >
          No products available.
        <br><br>
          Add your first product above.
        </td>
      </tr>
    `;

    return;

  }


  table.innerHTML =
    products.map(product => `

      <tr data-id="${product.id}">

        <td>

          <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            style="
              width:70px;
              height:70px;
              object-fit:cover;
              border-radius:7px;
            "
          >

        </td>


        <td>

          <input
            type="text"
            class="edit-name"
            value="${escapeHTML(product.name)}"
            style="
              width:100%;
              min-width:170px;
              box-sizing:border-box;
              padding:8px;
              border:1px solid #ddd;
              border-radius:6px;
            "
          >

        </td>


        <td>

          <input
            type="number"
            class="edit-price"
            value="${Number(product.price) || 0}"
            min="0"
            style="
              width:110px;
              box-sizing:border-box;
              padding:8px;
              border:1px solid #ddd;
              border-radius:6px;
            "
          >

        </td>


        <td>

          <button
            type="button"
            class="status-toggle ${
              product.available
                ? "available"
                : "sold"
            }"
            onclick="toggleStatus(${product.id})"
          >

            ${
              product.available
                ? "Available"
                : "Sold Out"
            }

          </button>

        </td>


        <td>

          <div style="
            display:flex;
            flex-direction:column;
            gap:7px;
          ">

            <button
              type="button"
              class="save-btn"
              onclick="saveProduct(${product.id})"
            >
              Save
            </button>


            <button
              type="button"
              class="delete-btn"
              onclick="deleteProduct(${product.id})"
            >
              Delete
            </button>

          </div>

        </td>

      </tr>

    `).join("");

}


// ==================================================
// SAVE PRODUCT
// ==================================================

function saveProduct(id) {

  const row =
    document.querySelector(
      `tr[data-id="${id}"]`
    );


  if (!row) return;


  const name =
    row.querySelector(
      ".edit-name"
    ).value.trim();


  const price =
    Number(
      row.querySelector(
        ".edit-price"
      ).value
    );


  if (!name) {

    alert(
      "Please enter a product name."
    );

    return;

  }


  if (!Number.isFinite(price) || price < 0) {

    alert(
      "Please enter a valid price."
    );

    return;

  }


  const products =
    dashboardGetProducts();


  const product =
    products.find(
      p => String(p.id) === String(id)
    );


  if (!product) {

    alert(
      "Product could not be found."
    );

    return;

  }


  product.name = name;

  product.price = price;


  dashboardSaveProducts(
    products
  );


  renderDashboard();

  showToast(
    "Product updated successfully!"
  );

}


// ==================================================
// CHANGE PRODUCT STATUS
// ==================================================

function toggleStatus(id) {

  const products =
    dashboardGetProducts();


  const product =
    products.find(
      p => String(p.id) === String(id)
    );


  if (!product) return;


  product.available =
    !product.available;


  dashboardSaveProducts(
    products
  );


  renderDashboard();


  showToast(
    product.available
      ? "Product is now Available"
      : "Product marked Sold Out"
  );

}


// ==================================================
// DELETE PRODUCT
// ==================================================

function deleteProduct(id) {

  const products =
    dashboardGetProducts();


  const product =
    products.find(
      p => String(p.id) === String(id)
    );


  if (!product) return;


  const confirmed =
    confirm(
      `Delete "${product.name}" from your shop?`
    );


  if (!confirmed) return;


  const newProducts =
    products.filter(
      p => String(p.id) !== String(id)
    );


  dashboardSaveProducts(
    newProducts
  );


  renderDashboard();


  showToast(
    "Product deleted."
  );

}


// ==================================================
// IMAGE PREVIEW
// ==================================================

function previewImage(file) {

  const preview =
    document.getElementById(
      "image-preview"
    );


  if (!file) {

    preview.style.display = "none";

    preview.src = "";

    return;

  }


  if (!file.type.startsWith("image/")) {

    alert(
      "Please choose an image."
    );

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    function(event) {

      preview.src =
        event.target.result;

      preview.style.display =
        "block";

    };


  reader.readAsDataURL(file);

}


// ==================================================
// COMPRESS IMAGE
// ==================================================

function compressImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload =
        function(event) {

          const image =
            new Image();


          image.onload =
            function() {

              let width =
                image.width;

              let height =
                image.height;


              const maxSize =
                700;


              if (
                width > maxSize ||
                height > maxSize
              ) {

                if (width > height) {

                  height =
                    Math.round(
                      height *
                      maxSize /
                      width
                    );

                  width =
                    maxSize;

                } else {

                  width =
                    Math.round(
                      width *
                      maxSize /
                      height
                    );

                  height =
                    maxSize;

                }

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;

              canvas.height =
                height;


              const context =
                canvas.getContext(
                  "2d"
                );


              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );


              const result =
                canvas.toDataURL(
                  "image/jpeg",
                  0.7
                );


              resolve(result);

            };


          image.onerror =
            reject;


          image.src =
            event.target.result;

        };


      reader.onerror =
        reject;


      reader.readAsDataURL(file);

    }
  );

}


// ==================================================
// ADD PRODUCT
// ==================================================

async function addProduct() {

  const nameInput =
    document.getElementById(
      "new-product-name"
    );


  const priceInput =
    document.getElementById(
      "new-product-price"
    );


  const statusInput =
    document.getElementById(
      "new-product-status"
    );


  const imageInput =
    document.getElementById(
      "new-product-image"
    );


  const name =
    nameInput.value.trim();


  const price =
    Number(
      priceInput.value
    );


  const available =
    statusInput.value === "true";


  if (!name) {

    alert(
      "Enter the product name."
    );

    nameInput.focus();

    return;

  }


  if (!Number.isFinite(price) || price < 0) {

    alert(
      "Enter a valid price."
    );

    priceInput.focus();

    return;

  }


  if (!imageInput.files.length) {

    alert(
      "Please choose a product image."
    );

    return;

  }


  try {

    showToast(
      "Preparing image..."
    );


    const image =
      await compressImage(
        imageInput.files[0]
      );


    const products =
      dashboardGetProducts();


    const product = {

      id: Date.now(),

      name: name,

      price: price,

      image: image,

      available: available

    };


    products.push(
      product
    );


    dashboardSaveProducts(
      products
    );


    nameInput.value = "";

    priceInput.value = "";

    imageInput.value = "";

    statusInput.value = "true";


    const preview =
      document.getElementById(
        "image-preview"
      );


    preview.src = "";

    preview.style.display =
      "none";


    renderDashboard();


    showToast(
      "Product added successfully!"
    );


  } catch (error) {

    console.error(error);

    alert(
      "The image could not be processed. Please try another image."
    );

  }

}


// ==================================================
// ORDERS
// ==================================================

function renderOrders() {

  const container =
    document.getElementById(
      "orders-list"
    );


  if (!container) return;


  const orders =
    dashboardGetOrders();


  if (!orders.length) {

    container.innerHTML = `
      <p style="
        color:#777;
        padding:20px 0;
      ">
        No customer orders yet.
      </p>
    `;

    return;

  }


  container.innerHTML =
    orders.map(order => {

      const customer =
        order.customer || {};


      const items =
        Array.isArray(order.items)
          ? order.items
          : [];


      return `

        <div
          class="order-card"
          style="
            margin-bottom:15px;
            padding:15px;
            border:1px solid #eee;
            border-radius:10px;
          "
        >

          <div
            class="order-header"
            style="
              display:flex;
              justify-content:space-between;
              gap:10px;
              margin-bottom:10px;
            "
          >

            <strong>

              #${escapeHTML(order.id || "")}

            </strong>


            <strong
              style="color:#e11d48;"
            >

              ${dashboardFormatPrice(
                order.total || 0
              )}

            </strong>

          </div>


          <div>

            <strong>
              ${escapeHTML(
                customer.name ||
                "Customer"
              )}
            </strong>

          </div>


          <div style="
            color:#555;
            margin-top:5px;
          ">

            Phone:
            ${escapeHTML(
              customer.phone || ""
            )}

          </div>


          <div style="
            color:#555;
            margin-top:5px;
          ">

            ${
              order.delivery === "delivery"
                ? "🚚 Delivery"
                : "🏪 Pickup"
            }

          </div>


          ${
            customer.address
              ? `
                <div style="
                  color:#555;
                  margin-top:5px;
                ">
                  Address:
                  ${escapeHTML(
                    customer.address
                  )}
                </div>
              `
              : ""
          }


          ${
            customer.note
              ? `
                <div style="
                  color:#777;
                  margin-top:7px;
                ">
                  Note:
                  ${escapeHTML(
                    customer.note
                  )}
                </div>
              `
              : ""
          }


          <div style="
            margin-top:12px;
            padding-top:10px;
            border-top:1px solid #eee;
          ">

            <strong>
              Items:
            </strong>

            <br>

            ${
              items.map(item => `
                ${Number(item.qty) || 0}
                ×
                ${escapeHTML(
                  item.name || ""
                )}
              `).join("<br>")
            }

          </div>


          <div style="
            margin-top:8px;
            color:#888;
            font-size:13px;
          ">

            ${escapeHTML(
              order.date || ""
            )}

          </div>

        </div>

      `;

    }).join("");

}


// ==================================================
// SALES SUMMARY
// ==================================================

function renderSalesSummary() {

  const orders =
    dashboardGetOrders();


  let revenue = 0;

  let itemsSold = 0;


  orders.forEach(order => {

    revenue +=
      Number(order.total) || 0;


    if (Array.isArray(order.items)) {

      order.items.forEach(item => {

        itemsSold +=
          Number(item.qty) || 0;

      });

    }

  });


  const average =
    orders.length
      ? revenue / orders.length
      : 0;


  document.getElementById(
    "stat-revenue"
  ).textContent =
    dashboardFormatPrice(
      revenue
    );


  document.getElementById(
    "stat-items-sold"
  ).textContent =
    itemsSold;


  document.getElementById(
    "stat-average"
  ).textContent =
    dashboardFormatPrice(
      average
    );

}


// ==================================================
// CLEAR ORDERS
// ==================================================

function clearOrders() {

  const orders =
    dashboardGetOrders();


  if (!orders.length) {

    alert(
      "There are no orders yet."
    );

    return;

  }


  const confirmed =
    confirm(
      "Clear ALL customer orders? This cannot be undone."
    );


  if (!confirmed) return;


  localStorage.removeItem(
    "collins_orders"
  );


  renderOrders();

  renderDashboard();

  renderSalesSummary();


  showToast(
    "All orders cleared."
  );

}


// ==================================================
// RESET PRODUCTS
// ==================================================

function resetToDefault() {

  const confirmed =
    confirm(
      "Reset all products to your original products? This cannot be undone."
    );


  if (!confirmed) return;


  localStorage.removeItem(
    "collins_products"
  );


  renderDashboard();


  showToast(
    "Products reset."
  );

}


// ==================================================
// CHANGE PASSWORD
// ==================================================

function changePassword() {

  const current =
    document.getElementById(
      "current-password"
    ).value;


  const newPassword =
    document.getElementById(
      "new-password"
    ).value;


  const confirmPassword =
    document.getElementById(
      "confirm-password"
    ).value;


  if (
    current !==
    getDashboardPassword()
  ) {

    alert(
      "Current password is incorrect."
    );

    return;

  }


  if (newPassword.length < 6) {

    alert(
      "New password must be at least 6 characters."
    );

    return;

  }


  if (
    newPassword !==
    confirmPassword
  ) {

    alert(
      "The new passwords do not match."
    );

    return;

  }


  localStorage.setItem(
    PASSWORD_KEY,
    newPassword
  );


  document.getElementById(
    "current-password"
  ).value = "";


  document.getElementById(
    "new-password"
  ).value = "";


  document.getElementById(
    "confirm-password"
  ).value = "";


  showToast(
    "Password changed successfully!"
  );

}


// ==================================================
// TOAST
// ==================================================

function showToast(message) {

  let toast =
    document.getElementById(
      "admin-toast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );


    toast.id =
      "admin-toast";


    toast.style.position =
      "fixed";

    toast.style.bottom =
      "25px";

    toast.style.left =
      "50%";

    toast.style.transform =
      "translateX(-50%)";

    toast.style.background =
      "#111";

    toast.style.color =
      "#fff";

    toast.style.padding =
      "13px 18px";

    toast.style.borderRadius =
      "8px";

    toast.style.zIndex =
      "999999";

    toast.style.fontSize =
      "14px";

    toast.style.fontWeight =
      "600";


    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.style.display =
    "block";


  clearTimeout(
    window.adminToastTimer
  );


  window.adminToastTimer =
    setTimeout(
      function() {

        toast.style.display =
          "none";

      },
      2500
    );

}


// ==================================================
// START DASHBOARD
// ==================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {


    // LOGIN BUTTON

    const loginButton =
      document.getElementById(
        "login-button"
      );


    if (loginButton) {

      loginButton.addEventListener(
        "click",
        login
      );

    }


    // ENTER KEY

    const passwordInput =
      document.getElementById(
        "password"
      );


    if (passwordInput) {

      passwordInput.addEventListener(
        "keydown",
        function(event) {

          if (
            event.key === "Enter"
          ) {

            event.preventDefault();

            login();

          }

        }
      );

    }


    // IMAGE PREVIEW

    const imageInput =
      document.getElementById(
        "new-product-image"
      );


    if (imageInput) {

      imageInput.addEventListener(
        "change",
        function() {

          previewImage(
            this.files[0]
          );

        }
      );

    }


    // ADD PRODUCT BUTTON

    const addButton =
      document.getElementById(
        "add-product-button"
      );


    if (addButton) {

      addButton.addEventListener(
        "click",
        addProduct
      );

    }


    // CHANGE PASSWORD BUTTON

    const changePasswordButton =
      document.getElementById(
        "change-password-button"
      );


    if (changePasswordButton) {

      changePasswordButton.addEventListener(
        "click",
        changePassword
      );

    }


    // AUTO LOGIN IF ALREADY LOGGED IN

    if (checkAuth()) {

      showDashboard();

    }

  }
);
