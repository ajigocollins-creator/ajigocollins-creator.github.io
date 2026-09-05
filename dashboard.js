// ==========================================
// COLLINS CLOTHING - CEO DASHBOARD
// ==========================================

// Default password
const DEFAULT_PASSWORD = 'collins2026';

const PASSWORD_KEY = 'collins_dashboard_password';


// ==========================================
// SECURITY / LOGIN
// ==========================================

function getDashboardPassword() {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
}


function checkAuth() {
  return sessionStorage.getItem('collins_ceo') === 'true';
}


function login() {

  const pass = document.getElementById('password').value;

  if (pass === getDashboardPassword()) {

    sessionStorage.setItem('collins_ceo', 'true');

    showDashboard();

  } else {

    alert('Wrong password. Try again.');

  }
}


function logout() {

  sessionStorage.removeItem('collins_ceo');

  location.reload();

}


function showDashboard() {

  document.getElementById('login-section').style.display = 'none';

  document.getElementById('dash-section').style.display = 'block';

  renderDashboard();

  renderOrders();

  renderSalesSummary();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


// ==========================================
// PRODUCT DASHBOARD
// ==========================================

function renderDashboard() {

  const products = getProducts();

  const available = products.filter(
    p => p.available
  ).length;

  const sold = products.filter(
    p => !p.available
  ).length;

  const orders = getOrders();


  document.getElementById('stat-total').textContent =
    products.length;

  document.getElementById('stat-available').textContent =
    available;

  document.getElementById('stat-sold').textContent =
    sold;

  document.getElementById('stat-orders').textContent =
    orders.length;


  const tbody =
    document.getElementById('product-table-body');


  if (!products.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="padding:25px;text-align:center;color:#777;">
          No products found.
        </td>
      </tr>
    `;

    return;

  }


  tbody.innerHTML = products.map(p => `

    <tr data-id="${p.id}">

      <td>

        <img
          src="${escapeHTML(p.image)}"
          alt="${escapeHTML(p.name)}"
          style="
            width:70px;
            height:70px;
            object-fit:cover;
            border-radius:6px;
          "
        >

      </td>


      <td>

        <input
          type="text"
          class="edit-name"
          value="${escapeHTML(p.name)}"
          style="
            width:100%;
            min-width:180px;
            padding:7px;
            border:1px solid #ddd;
            border-radius:4px;
            box-sizing:border-box;
          "
        >

      </td>


      <td>

        <input
          type="number"
          class="edit-price"
          value="${Number(p.price) || 0}"
          min="0"
          style="
            width:110px;
            padding:7px;
            border:1px solid #ddd;
            border-radius:4px;
          "
        >

      </td>


      <td>

        <button
          class="status-toggle ${p.available ? 'available' : 'sold'}"
          onclick="toggleStatus(${p.id})"
        >
          ${p.available ? 'Available' : 'Sold Out'}
        </button>

      </td>


      <td>

        <div style="
          display:flex;
          flex-direction:column;
          gap:6px;
        ">

          <button
            class="save-btn"
            onclick="saveProduct(${p.id})"
          >
            Save
          </button>

          <button
            class="delete-btn"
            onclick="deleteProduct(${p.id})"
          >
            Delete
          </button>

        </div>

      </td>

    </tr>

  `).join('');

}


// ==========================================
// SAVE PRODUCT
// ==========================================

function saveProduct(id) {

  const row =
    document.querySelector(`tr[data-id="${id}"]`);

  if (!row) return;


  const name =
    row.querySelector('.edit-name').value.trim();

  const price =
    parseInt(
      row.querySelector('.edit-price').value,
      10
    );


  if (!name) {

    alert('Please enter a product name.');

    return;

  }


  if (isNaN(price) || price < 0) {

    alert('Please enter a valid price.');

    return;

  }


  const products = getProducts();

  const product =
    products.find(p => String(p.id) === String(id));


  if (!product) {

    alert('Product not found.');

    return;

  }


  product.name = name;

  product.price = price;


  saveProducts(products);

  renderDashboard();

  showToast('Product updated!');

}


// ==========================================
// TOGGLE AVAILABLE / SOLD OUT
// ==========================================

function toggleStatus(id) {

  const products = getProducts();

  const product =
    products.find(p => String(p.id) === String(id));


  if (!product) return;


  product.available = !product.available;


  saveProducts(products);

  renderDashboard();

  showToast(
    product.available
      ? 'Marked as Available'
      : 'Marked as Sold Out'
  );

}


// ==========================================
// DELETE PRODUCT
// ==========================================

function deleteProduct(id) {

  const products = getProducts();

  const product =
    products.find(p => String(p.id) === String(id));


  if (!product) return;


  const confirmDelete = confirm(
    `Delete "${product.name}" from the shop?`
  );


  if (!confirmDelete) return;


  const updatedProducts =
    products.filter(
      p => String(p.id) !== String(id)
    );


  saveProducts(updatedProducts);

  renderDashboard();

  showToast('Product deleted.');

}


// ==========================================
// IMAGE PREVIEW
// ==========================================

function previewNewImage(event) {

  const file =
    event.target.files[0];

  const preview =
    document.getElementById('new-image-preview');


  if (!file) {

    preview.style.display = 'none';

    return;

  }


  if (!file.type.startsWith('image/')) {

    alert('Please select an image file.');

    event.target.value = '';

    preview.style.display = 'none';

    return;

  }


  const reader =
    new FileReader();


  reader.onload = function(e) {

    preview.src = e.target.result;

    preview.style.display = 'block';

  };


  reader.readAsDataURL(file);

}


// ==========================================
// RESIZE IMAGE
// ==========================================

function resizeImage(file, maxSize = 900) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();


    reader.onload = function(event) {

      const img = new Image();


      img.onload = function() {

        let width = img.width;

        let height = img.height;


        if (width > maxSize || height > maxSize) {

          if (width > height) {

            height =
              Math.round(
                height * maxSize / width
              );

            width = maxSize;

          } else {

            width =
              Math.round(
                width * maxSize / height
              );

            height = maxSize;

          }

        }


        const canvas =
          document.createElement('canvas');


        canvas.width = width;

        canvas.height = height;


        const ctx =
          canvas.getContext('2d');


        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );


        const compressed =
          canvas.toDataURL(
            'image/jpeg',
            0.78
          );


        resolve(compressed);

      };


      img.onerror = reject;

      img.src = event.target.result;

    };


    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}


// ==========================================
// ADD NEW PRODUCT
// ==========================================

async function addProduct() {

  const nameInput =
    document.getElementById('new-product-name');

  const priceInput =
    document.getElementById('new-product-price');

  const statusInput =
    document.getElementById('new-product-status');

  const imageInput =
    document.getElementById('new-product-image');


  const name =
    nameInput.value.trim();

  const price =
    parseInt(priceInput.value, 10);

  const available =
    statusInput.value === 'true';


  if (!name) {

    alert('Please enter the product name.');

    return;

  }


  if (isNaN(price) || price < 0) {

    alert('Please enter a valid price.');

    return;

  }


  if (!imageInput.files.length) {

    alert('Please select a product image.');

    return;

  }


  const file =
    imageInput.files[0];


  try {

    showToast('Preparing product image...');


    const image =
      await resizeImage(file);


    const products =
      getProducts();


    const newProduct = {

      id: Date.now(),

      name: name,

      price: price,

      image: image,

      available: available

    };


    products.push(newProduct);


    saveProducts(products);


    nameInput.value = '';

    priceInput.value = '';

    statusInput.value = 'true';

    imageInput.value = '';


    const preview =
      document.getElementById('new-image-preview');

    preview.src = '';

    preview.style.display = 'none';


    renderDashboard();

    showToast('Product added successfully!');


  } catch (error) {

    console.error(error);

    alert(
      'Could not process the image. Please try another image.'
    );

  }

}


// ==========================================
// ORDERS
// ==========================================

function renderOrders() {

  const container =
    document.getElementById('orders-list');


  if (!container) return;


  const orders =
    getOrders();


  if (orders.length === 0) {

    container.innerHTML = `
      <p style="color:#666;padding:20px 0;">
        No orders yet.
      </p>
    `;

    return;

  }


  container.innerHTML =
    orders.map(o => {

      const customer =
        o.customer || {};

      const items =
        o.items || [];


      return `

        <div class="order-card">

          <div class="order-header">

            <span>
              #${escapeHTML(o.id || '')}
              •
              ${escapeHTML(o.date || '')}
            </span>

            <span style="color:#e11d48;">
              ${formatPrice(Number(o.total) || 0)}
            </span>

          </div>


          <div>

            <strong>
              ${escapeHTML(customer.name || 'Customer')}
            </strong>

            •
            ${escapeHTML(customer.phone || '')}

          </div>


          <div style="
            font-size:0.9rem;
            color:#555;
          ">

            ${
              o.delivery === 'delivery'
                ? '🚚 Delivery'
                : '🏪 Pickup'
            }

            ${
              customer.address &&
              customer.address !== 'Pickup'
                ? ' • ' +
                  escapeHTML(customer.address)
                : ''
            }

          </div>


          ${
            customer.note
              ? `
                <div style="
                  font-size:0.85rem;
                  color:#888;
                  margin-top:4px;
                ">
                  Note:
                  ${escapeHTML(customer.note)}
                </div>
              `
              : ''
          }


          <div class="order-items">

            ${
              items.map(i =>
                `${Number(i.qty) || 0}× ${escapeHTML(i.name || '')}`
              ).join(' • ')
            }

          </div>

        </div>

      `;

    }).join('');

}


// ==========================================
// SALES SUMMARY
// ==========================================

function renderSalesSummary() {

  const orders =
    getOrders();


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


  document.getElementById('stat-revenue').textContent =
    formatPrice(revenue);


  document.getElementById('stat-items-sold').textContent =
    itemsSold;


  document.getElementById('stat-average').textContent =
    formatPrice(average);

}


// ==========================================
// CLEAR ORDERS
// ==========================================

function clearOrders() {

  const orders =
    getOrders();


  if (!orders.length) {

    alert('There are no orders to clear.');

    return;

  }


  if (
    !confirm(
      'Clear all order history? This cannot be undone.'
    )
  ) {

    return;

  }


  localStorage.removeItem('collins_orders');


  renderOrders();

  renderDashboard();

  renderSalesSummary();

  showToast('Orders cleared.');

}


// ==========================================
// RESET PRODUCTS
// ==========================================

function resetToDefault() {

  if (
    !confirm(
      'Reset all products to the original products? This cannot be undone.'
    )
  ) {

    return;

  }


  localStorage.removeItem('collins_products');


  renderDashboard();

  showToast('Products reset to default.');

}


// ==========================================
// CHANGE PASSWORD
// ==========================================

function changePassword() {

  const current =
    document.getElementById('current-password').value;

  const newPassword =
    document.getElementById('new-password').value;

  const confirmPassword =
    document.getElementById('confirm-password').value;


  if (current !== getDashboardPassword()) {

    alert('Current password is incorrect.');

    return;

  }


  if (newPassword.length < 6) {

    alert(
      'New password must be at least 6 characters.'
    );

    return;

  }


  if (newPassword !== confirmPassword) {

    alert('New passwords do not match.');

    return;

  }


  localStorage.setItem(
    PASSWORD_KEY,
    newPassword
  );


  document.getElementById('current-password').value = '';

  document.getElementById('new-password').value = '';

  document.getElementById('confirm-password').value = '';


  showToast('Password changed successfully!');

}


// ==========================================
// TOAST MESSAGE
// ==========================================

function showToast(message) {

  let toast =
    document.getElementById('admin-toast');


  if (!toast) {

    toast =
      document.createElement('div');

    toast.id = 'admin-toast';


    toast.style.position = 'fixed';

    toast.style.bottom = '25px';

    toast.style.left = '50%';

    toast.style.transform =
      'translateX(-50%)';

    toast.style.background =
      '#111827';

    toast.style.color =
      'white';

    toast.style.padding =
      '12px 18px';

    toast.style.borderRadius =
      '8px';

    toast.style.zIndex =
      '99999';

    toast.style.fontSize =
      '14px';

    document.body.appendChild(toast);

  }


  toast.textContent = message;

  toast.style.display = 'block';


  clearTimeout(
    window.adminToastTimer
  );


  window.adminToastTimer =
    setTimeout(() => {

      toast.style.display = 'none';

    }, 2500);

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
  'DOMContentLoaded',
  () => {

    if (checkAuth()) {

      showDashboard();

    }

  }
);
