const API = "/api";

// ── Utilities ───────────────────────────────────────────────────────────────

function showSection(name) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(name).style.display = "block";
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const nl = document.getElementById('nav-' + name);
  if (nl) nl.classList.add('active');
  if (name === "clients")  loadClients();
  if (name === "products") loadProducts();
  if (name === "purchase") loadPurchaseSelects();
  if (name === "report")   loadReport();
}

function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast show toast--" + type;
  setTimeout(() => el.classList.remove("show"), 3200);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en la solicitud");
  return data;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { year:"numeric", month:"short", day:"numeric" });
}

function fmtMoney(n) {
  return "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Modals ──────────────────────────────────────────────────────────────────

function openModal(id) {
  document.getElementById(id).style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
  document.body.style.overflow = "";
}

function closeModalIfOverlay(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

function showConfirm(title, msg, onOk) {
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-msg").textContent = msg;
  const btn = document.getElementById("confirm-ok-btn");
  btn.onclick = () => { closeModal("modal-confirm"); onOk(); };
  openModal("modal-confirm");
}

// ── Clients ─────────────────────────────────────────────────────────────────

let _clients = [];

async function loadClients() {
  try {
    _clients = await apiFetch("/clients");
    const container = document.getElementById("clients-list");
    document.getElementById("clients-count").textContent = _clients.length;
    const badge = document.getElementById("badge-clients");
    badge.textContent = _clients.length;

    // Stats
    const statsEl = document.getElementById("clients-stats");
    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${_clients.length}</div>
        <div class="stat-label">Total clientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${_clients.filter(c => c.city).length}</div>
        <div class="stat-label">Con ciudad registrada</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${[...new Set(_clients.map(c => c.country).filter(Boolean))].length}</div>
        <div class="stat-label">Países distintos</div>
      </div>`;

    if (!_clients.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>No hay clientes registrados.</p><button class="btn btn-primary" onclick="openClientModal()">Agregar primer cliente</button></div>`;
      return;
    }

    container.innerHTML = _clients.map(c => `
      <div class="list-item">
        <div class="client-avatar">${escHtml(c.name.charAt(0).toUpperCase())}</div>
        <div class="list-item-info">
          <strong>${escHtml(c.name)}</strong>
          <span>${escHtml(c.email)}${c.phone ? " · " + escHtml(c.phone) : ""}</span>
          ${c.city || c.country ? `<span class="item-tag">📍 ${[c.city, c.country].filter(Boolean).map(escHtml).join(", ")}</span>` : ""}
        </div>
        <div class="list-item-meta">
          <span class="meta-date">${fmtDate(c.created_at)}</span>
        </div>
        <div class="list-item-actions">
          <button class="btn-row btn-row--history" onclick="viewClientHistory(${c.id}, '${escHtml(c.name)}')">🛒 Compras</button>
          <button class="btn-row btn-row--edit" onclick="openClientModal(${c.id})">✏️ Editar</button>
          <button class="btn-row btn-row--del" onclick="deleteClient(${c.id}, '${escHtml(c.name)}')">🗑️ Eliminar</button>
        </div>
      </div>`).join("");
  } catch (err) { toast(err.message, "error"); }
}

function openClientModal(id) {
  const isEdit = !!id;
  document.getElementById("modal-client-title").textContent = isEdit ? "Editar Cliente" : "Nuevo Cliente";
  document.getElementById("client-submit-btn").textContent = isEdit ? "💾 Guardar cambios" : "💾 Guardar cliente";
  document.getElementById("client-form").reset();
  document.getElementById("client-id").value = "";

  if (isEdit) {
    const c = _clients.find(x => x.id === id);
    if (!c) return;
    document.getElementById("client-id").value      = c.id;
    document.getElementById("client-name").value    = c.name;
    document.getElementById("client-email").value   = c.email;
    document.getElementById("client-phone").value   = c.phone || "";
    document.getElementById("client-address").value = c.address || "";
    document.getElementById("client-city").value    = c.city || "";
    document.getElementById("client-country").value = c.country || "México";
  }
  openModal("modal-client");
}

document.getElementById("client-form").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("client-id").value;
  const body = {
    name:    document.getElementById("client-name").value.trim(),
    email:   document.getElementById("client-email").value.trim(),
    phone:   document.getElementById("client-phone").value.trim(),
    address: document.getElementById("client-address").value.trim(),
    city:    document.getElementById("client-city").value.trim(),
    country: document.getElementById("client-country").value.trim(),
  };

  const doSave = async () => {
    try {
      if (id) {
        await apiFetch(`/clients/${id}`, { method: "PUT", body: JSON.stringify(body) });
        toast("✅ Cliente actualizado correctamente");
      } else {
        await apiFetch("/clients", { method: "POST", body: JSON.stringify(body) });
        toast("✅ Cliente creado correctamente");
      }
      closeModal("modal-client");
      loadClients();
    } catch (err) { toast(err.message, "error"); }
  };

  if (id) {
    closeModal("modal-client");
    showConfirm(
      "¿Guardar cambios?",
      `¿Estás seguro de que deseas actualizar los datos de "${body.name}"? Esta acción modificará el registro en la base de datos.`,
      doSave
    );
  } else {
    await doSave();
  }
});

async function deleteClient(id, name) {
  showConfirm(
    "¿Eliminar cliente?",
    `¿Estás seguro de que deseas eliminar a "${name}"? Esta acción no se puede deshacer y también eliminará su historial de compras.`,
    async () => {
      try {
        await apiFetch(`/clients/${id}`, { method: "DELETE" });
        toast("🗑️ Cliente eliminado");
        loadClients();
      } catch (err) { toast(err.message, "error"); }
    }
  );
}

async function viewClientHistory(clientId, clientName) {
  document.getElementById("modal-history-title").textContent = `Compras de ${clientName}`;
  document.getElementById("modal-history-body").innerHTML = `<p style="text-align:center;color:var(--muted)">Cargando...</p>`;
  openModal("modal-history");
  try {
    const data = await apiFetch(`/clients/${clientId}/purchases`);
    const body = document.getElementById("modal-history-body");
    if (!data.purchases.length) {
      body.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><p>Este cliente no tiene compras registradas.</p></div>`;
      return;
    }
    body.innerHTML = `
      <div class="history-summary">
        <div class="stat-card"><div class="stat-value">${data.purchases.length}</div><div class="stat-label">Compras</div></div>
        <div class="stat-card"><div class="stat-value">${fmtMoney(data.total_spent)}</div><div class="stat-label">Total gastado</div></div>
      </div>
      <table class="report-table" style="margin-top:1rem">
        <thead><tr><th>#</th><th>Producto</th><th>Cant.</th><th>Precio unit.</th><th>Total</th><th>Fecha</th></tr></thead>
        <tbody>
          ${data.purchases.map(p => `
            <tr>
              <td>${p.id}</td>
              <td><strong>${escHtml(p.product_name)}</strong></td>
              <td>${p.quantity}</td>
              <td>${fmtMoney(p.unit_price)}</td>
              <td><strong>${fmtMoney(p.total_price)}</strong></td>
              <td>${fmtDate(p.purchased_at)}</td>
            </tr>`).join("")}
        </tbody>
      </table>`;
  } catch (err) {
    document.getElementById("modal-history-body").innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

// ── Products ─────────────────────────────────────────────────────────────────

let _products = [];

async function loadProducts() {
  try {
    _products = await apiFetch("/products");
    const container = document.getElementById("products-list");
    document.getElementById("products-count").textContent = _products.length;
    const badge = document.getElementById("badge-products");
    badge.textContent = _products.length;

    // Stats
    const statsEl = document.getElementById("products-stats");
    const lowStock = _products.filter(p => p.stock <= 10).length;
    const categories = [...new Set(_products.map(p => p.category).filter(Boolean))].length;
    const avgPrice = _products.length ? (_products.reduce((s, p) => s + p.price, 0) / _products.length) : 0;
    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${_products.length}</div>
        <div class="stat-label">Total productos</div>
      </div>
      <div class="stat-card ${lowStock > 0 ? 'stat-card--warn' : ''}">
        <div class="stat-value">${lowStock}</div>
        <div class="stat-label">Stock bajo (≤10)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${categories}</div>
        <div class="stat-label">Categorías</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fmtMoney(avgPrice)}</div>
        <div class="stat-label">Precio promedio</div>
      </div>`;

    if (!_products.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>No hay productos registrados.</p><button class="btn btn-primary" onclick="openProductModal()">Agregar primer producto</button></div>`;
      return;
    }

    container.innerHTML = _products.map(p => `
      <div class="list-item">
        <div class="product-icon">${getCategoryEmoji(p.category)}</div>
        <div class="list-item-info">
          <strong>${escHtml(p.name)}</strong>
          <span>${p.description ? escHtml(p.description) : "Sin descripción"}</span>
          ${p.category ? `<span class="item-tag">${escHtml(p.category)}</span>` : ""}
        </div>
        <div class="list-item-meta">
          <span class="price-tag">${fmtMoney(p.price)}</span>
          <span class="stock-tag ${p.stock <= 10 ? 'stock-low' : p.stock <= 30 ? 'stock-mid' : 'stock-ok'}">
            Stock: ${p.stock}
          </span>
          ${p.sku ? `<span class="meta-date">SKU: ${escHtml(p.sku)}</span>` : ""}
        </div>
        <div class="list-item-actions">
          <button class="btn-row btn-row--edit" onclick="openProductModal(${p.id})">✏️ Editar</button>
          <button class="btn-row btn-row--del" onclick="deleteProduct(${p.id}, '${escHtml(p.name)}')">🗑️ Eliminar</button>
        </div>
      </div>`).join("");
  } catch (err) { toast(err.message, "error"); }
}

function getCategoryEmoji(cat) {
  if (!cat) return "📦";
  const c = cat.toLowerCase();
  if (c.includes("comput") || c.includes("laptop")) return "💻";
  if (c.includes("perifér") || c.includes("mouse") || c.includes("teclado")) return "🖱️";
  if (c.includes("monitor")) return "🖥️";
  if (c.includes("acceso")) return "🔌";
  if (c.includes("audio") || c.includes("auricular")) return "🎧";
  return "📦";
}

function openProductModal(id) {
  const isEdit = !!id;
  document.getElementById("modal-product-title").textContent = isEdit ? "Editar Producto" : "Nuevo Producto";
  document.getElementById("product-submit-btn").textContent = isEdit ? "💾 Guardar cambios" : "💾 Guardar producto";
  document.getElementById("product-form").reset();
  document.getElementById("product-id").value = "";

  if (isEdit) {
    const p = _products.find(x => x.id === id);
    if (!p) return;
    document.getElementById("product-id").value          = p.id;
    document.getElementById("product-name").value        = p.name;
    document.getElementById("product-description").value = p.description || "";
    document.getElementById("product-category").value    = p.category || "";
    document.getElementById("product-price").value       = p.price;
    document.getElementById("product-stock").value       = p.stock;
    document.getElementById("product-sku").value         = p.sku || "";
  }
  openModal("modal-product");
}

document.getElementById("product-form").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("product-id").value;
  const body = {
    name:        document.getElementById("product-name").value.trim(),
    description: document.getElementById("product-description").value.trim(),
    category:    document.getElementById("product-category").value.trim(),
    price:       parseFloat(document.getElementById("product-price").value),
    stock:       parseInt(document.getElementById("product-stock").value, 10),
    sku:         document.getElementById("product-sku").value.trim(),
  };

  const doSave = async () => {
    try {
      if (id) {
        await apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
        toast("✅ Producto actualizado correctamente");
      } else {
        await apiFetch("/products", { method: "POST", body: JSON.stringify(body) });
        toast("✅ Producto creado correctamente");
      }
      closeModal("modal-product");
      loadProducts();
    } catch (err) { toast(err.message, "error"); }
  };

  if (id) {
    closeModal("modal-product");
    showConfirm(
      "¿Guardar cambios?",
      `¿Estás seguro de que deseas actualizar el producto "${body.name}"?`,
      doSave
    );
  } else {
    await doSave();
  }
});

async function deleteProduct(id, name) {
  showConfirm(
    "¿Eliminar producto?",
    `¿Estás seguro de que deseas eliminar "${name}"? Esta acción no se puede deshacer.`,
    async () => {
      try {
        await apiFetch(`/products/${id}`, { method: "DELETE" });
        toast("🗑️ Producto eliminado");
        loadProducts();
      } catch (err) { toast(err.message, "error"); }
    }
  );
}

// ── Purchase ─────────────────────────────────────────────────────────────────

async function loadPurchaseSelects() {
  try {
    const [clients, products] = await Promise.all([apiFetch("/clients"), apiFetch("/products")]);
    _clients = clients;
    _products = products;

    const cSel = document.getElementById("purchase-client-id");
    cSel.innerHTML = `<option value="">— Seleccionar cliente —</option>` +
      clients.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join("");

    const pSel = document.getElementById("purchase-product-id");
    pSel.innerHTML = `<option value="">— Seleccionar producto —</option>` +
      products.map(p => `<option value="${p.id}">${escHtml(p.name)} · ${fmtMoney(p.price)} · Stock: ${p.stock}</option>`).join("");

    loadPurchaseHistory();
  } catch (err) { toast(err.message, "error"); }
}

function updatePurchasePreview() {
  const cId = parseInt(document.getElementById("purchase-client-id").value);
  const pId = parseInt(document.getElementById("purchase-product-id").value);
  const qty = parseInt(document.getElementById("purchase-quantity").value) || 1;
  const preview = document.getElementById("purchase-preview");

  if (cId && pId) {
    const client = _clients.find(c => c.id === cId);
    const product = _products.find(p => p.id === pId);
    if (client && product) {
      preview.style.display = "block";
      preview.innerHTML = `
        <div class="preview-row"><span>Cliente:</span><strong>${escHtml(client.name)}</strong></div>
        <div class="preview-row"><span>Producto:</span><strong>${escHtml(product.name)}</strong></div>
        <div class="preview-row"><span>Cantidad:</span><strong>${qty}</strong></div>
        <div class="preview-row"><span>Precio unit.:</span><strong>${fmtMoney(product.price)}</strong></div>
        <div class="preview-row preview-total"><span>Total:</span><strong>${fmtMoney(product.price * qty)}</strong></div>`;
      return;
    }
  }
  preview.style.display = "none";
}

document.getElementById("purchase-client-id").addEventListener("change", updatePurchasePreview);
document.getElementById("purchase-product-id").addEventListener("change", updatePurchasePreview);
document.getElementById("purchase-quantity").addEventListener("input", updatePurchasePreview);

document.getElementById("purchase-form").addEventListener("submit", async e => {
  e.preventDefault();
  const body = {
    client_id:  parseInt(document.getElementById("purchase-client-id").value),
    product_id: parseInt(document.getElementById("purchase-product-id").value),
    quantity:   parseInt(document.getElementById("purchase-quantity").value) || 1,
  };
  const resultBox = document.getElementById("purchase-result");
  try {
    const data = await apiFetch("/purchase", { method: "POST", body: JSON.stringify(body) });
    resultBox.innerHTML = `<strong>✅ ${escHtml(data.message)}</strong><br><small>Total: ${fmtMoney(data.purchase.total_price)}</small>`;
    resultBox.className = "result-box";
    resultBox.style.display = "block";
    document.getElementById("purchase-form").reset();
    document.getElementById("purchase-preview").style.display = "none";
    loadPurchaseSelects();
    toast("✅ Compra registrada exitosamente");
  } catch (err) {
    resultBox.textContent = err.message;
    resultBox.className = "result-box error";
    resultBox.style.display = "block";
    toast(err.message, "error");
  }
});

async function loadPurchaseHistory() {
  try {
    const data = await apiFetch("/report");
    // Get recent purchases from all clients
    const allPurchases = [];
    for (const client of data.clients.slice(0, 5)) {
      try {
        const cd = await apiFetch(`/clients/${client.id}/purchases`);
        cd.purchases.forEach(p => allPurchases.push({ ...p, client_name: client.name }));
      } catch (_) {}
    }
    allPurchases.sort((a, b) => new Date(b.purchased_at) - new Date(a.purchased_at));

    const el = document.getElementById("purchase-history");
    if (!allPurchases.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No hay compras registradas aún.</p></div>`;
      return;
    }
    el.innerHTML = allPurchases.slice(0, 8).map(p => `
      <div class="list-item list-item--compact">
        <div class="list-item-info">
          <strong>${escHtml(p.product_name)}</strong>
          <span>${escHtml(p.client_name)} · ${p.quantity}x · ${fmtDate(p.purchased_at)}</span>
        </div>
        <div class="price-tag">${fmtMoney(p.total_price)}</div>
      </div>`).join("");
  } catch (_) {}
}

// ── Report ───────────────────────────────────────────────────────────────────

async function loadReport() {
  try {
    const data = await apiFetch("/report");
    const container = document.getElementById("report-content");

    container.innerHTML = `
      <div class="stats-row" style="margin-bottom:1.5rem">
        <div class="stat-card stat-card--primary">
          <div class="stat-value">${data.total_clients}</div>
          <div class="stat-label">Total clientes</div>
        </div>
        <div class="stat-card stat-card--success">
          <div class="stat-value">${data.total_purchases}</div>
          <div class="stat-label">Total compras</div>
        </div>
        <div class="stat-card stat-card--info">
          <div class="stat-value">${fmtMoney(data.total_revenue)}</div>
          <div class="stat-label">Ingresos totales</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Clientes registrados</span>
          <span style="font-size:.8rem;color:var(--muted)">${data.total_clients} registros · PostgreSQL</span>
        </div>
        <table class="report-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Ciudad</th><th>País</th><th>Registrado</th></tr></thead>
          <tbody>
            ${data.clients.map(c => `
              <tr>
                <td><span class="id-badge">#${c.id}</span></td>
                <td><strong>${escHtml(c.name)}</strong></td>
                <td>${escHtml(c.email)}</td>
                <td>${escHtml(c.phone || "—")}</td>
                <td>${escHtml(c.city || "—")}</td>
                <td>${escHtml(c.country || "—")}</td>
                <td>${fmtDate(c.created_at)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  } catch (err) { toast(err.message, "error"); }
}

// ── Boot ─────────────────────────────────────────────────────────────────────
showSection("clients");
