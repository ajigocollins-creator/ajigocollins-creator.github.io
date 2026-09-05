// Collins Clothing - CEO Dashboard

const DASH_PASSWORD = 'collins2026'; // Change this to your own secret

function checkAuth() {
  return sessionStorage.getItem('collins_ceo') === 'true';
}

function login() {
  const pass = document.getElementById('password').value;
  if (pass === DASH_PASSWORD) {
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
}

function renderDashboard() {
  const products = getProducts();
  const available = products.filter(p => p.available).length;
  const sold = products.filter(p => !p.available).length;
  const orders = getOrders();

  document.getElementById('stat-total').textContent = products.length;
  document.getElementById('stat-available').textContent = available;
  document.getElementById('stat-sold').textContent = sold;
  document.getElementById('stat-orders').textContent = orders.length;

  const tbody = document.getElementById('product-table-body');
  tbody.innerHTML = products.map(p => `
    <tr data-id="${p.id}">
      <td><img src="${p.image}" alt=""></td>
      <td>
        <input type="text" class="edit-name" value="${p.name}" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px;">
      </td>
      <td>
        <input type="number" class="edit-price" value="${p.price}" style="width:100px;padding:6px;border:1px solid #ddd;border-radius:4px;">
      </td>
      <td>
        <button class="status-toggle ${p.available ? 'available' : 'sold'}" onclick="toggleStatus(${p.id})">
          ${p.available ? 'Available' : 'Sold Out'}
        </button>
      </td>
      <td>
        <button class="save-btn" onclick="saveProduct(${p.id})">Save</button>
      </td>
    </tr>
  `).join('');
}

function renderOrders() {
  const container = document.getElementById('orders-list');
  if (!container) return;

  const orders = getOrders();
  if (orders.length === 0) {
    container.innerHTML = '<p style="color:#666;padding:20px 0;">No orders yet.</p>';
    return;
  }

  container.innerHTML = orders.map(o => `
    <div class="order-card">
      <div class="order-header">
        <span>#${o.id} • ${o.date}</span>
        <span style="color:#e11d48;">${formatPrice(o.total)}</span>
      </div>
      <div><strong>${o.customer.name}</strong> • ${o.customer.phone}</div>
      <div style="font-size:0.9rem;color:#555;">
        ${o.delivery === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
        ${o.customer.address && o.customer.address !== 'Pickup' ? ' • ' + o.customer.address : ''}
      </div>
      ${o.customer.note ? `<div style="font-size:0.85rem;color:#888;margin-top:4px;">Note: ${o.customer.note}</div>` : ''}
      <div class="order-items">
        ${o.items.map(i => `${i.qty}× ${i.name}`).join(' • ')}
      </div>
    </div>
  `).join('');
}

function toggleStatus(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (p) {
    p.available = !p.available;
    saveProducts(products);
    renderDashboard();
    showToast(p.available ? 'Marked as Available' : 'Marked as Sold Out');
  }
}

function saveProduct(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const name = row.querySelector('.edit-name').value.trim();
  const price = parseInt(row.querySelector('.edit-price').value, 10);

  if (!name || isNaN(price) || price < 0) {
    alert('Please enter valid name and price');
    return;
  }

  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (p) {
    p.name = name;
    p.price = price;
    saveProducts(products);
    showToast('Product updated!');
    renderDashboard();
  }
}

function resetToDefault() {
  if (confirm('Reset all products to original data? This cannot be undone.')) {
    localStorage.removeItem('collins_products');
    renderDashboard();
    showToast('Products reset to default');
  }
}

function clearOrders() {
  if (confirm('Clear all order history?')) {
    localStorage.removeItem('collins_orders');
    renderOrders();
    renderDashboard();
    showToast('Orders cleared');
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    showDashboard();
  }
});