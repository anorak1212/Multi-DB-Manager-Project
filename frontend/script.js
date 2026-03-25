const API = "/api";

// ── Utilities ───────────────────────────────────────────────────────────────

function showSection(name) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(name).style.display = "block";
  if (name === "clients")  loadClients();
  if (name === "products") loadProducts();
  if (name === "report")   loadReport();
}

function toast(msg, isError = false) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.background = isError ? "#ef4444" : "#1e293b";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Clients ─────────────────────────────────────────────────────────────────

async function loadClients() {
  const clients = await apiFetch("/clients");
  const container = document.getElementById("clients-list");
  if (!clients.length) { container.innerHTML = "<p>No clients yet.</p>"; return; }
  container.innerHTML = clients.map(c => `
    <div class="list-item">
      <div class="list-item-info">
        <strong>${escHtml(c.name)}</strong>
        <span>${escHtml(c.email)} ${c.phone ? "· " + escHtml(c.phone) : ""}</span>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit"
          data-id="${c.id}"
          data-name="${escHtml(c.name)}"
          data-email="${escHtml(c.email)}"
          data-phone="${escHtml(c.phone || '')}">Edit</button>
        <button class="btn-danger" data-id="${c.id}">Delete</button>
      </div>
    </div>`).join("");

  container.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editClient(
      btn.dataset.id,
      btn.dataset.name,
      btn.dataset.email,
      btn.dataset.phone,
    ));
  });
  container.querySelectorAll(".btn-danger").forEach(btn => {
    btn.addEventListener("click", () => deleteClient(btn.dataset.id));
  });
}

document.getElementById("client-form").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("client-id").value;
  const body = {
    name:  document.getElementById("client-name").value.trim(),
    email: document.getElementById("client-email").value.trim(),
    phone: document.getElementById("client-phone").value.trim(),
  };
  try {
    if (id) {
      await apiFetch(`/clients/${id}`, { method: "PUT", body: JSON.stringify(body) });
      toast("Client updated");
    } else {
      await apiFetch("/clients", { method: "POST", body: JSON.stringify(body) });
      toast("Client created");
    }
    resetClientForm();
    loadClients();
  } catch (err) { toast(err.message, true); }
});

function editClient(id, name, email, phone) {
  document.getElementById("client-id").value    = id;
  document.getElementById("client-name").value  = name;
  document.getElementById("client-email").value = email;
  document.getElementById("client-phone").value = phone;
  document.getElementById("client-form-title").textContent = "Edit Client";
  document.getElementById("client-cancel").style.display  = "inline-block";
}

function resetClientForm() {
  document.getElementById("client-form").reset();
  document.getElementById("client-id").value = "";
  document.getElementById("client-form-title").textContent = "Add Client";
  document.getElementById("client-cancel").style.display  = "none";
}

async function deleteClient(id) {
  if (!confirm("Delete client?")) return;
  try {
    await apiFetch(`/clients/${id}`, { method: "DELETE" });
    toast("Client deleted");
    loadClients();
  } catch (err) { toast(err.message, true); }
}

// ── Products ─────────────────────────────────────────────────────────────────

async function loadProducts() {
  const products = await apiFetch("/products");
  const container = document.getElementById("products-list");
  if (!products.length) { container.innerHTML = "<p>No products yet.</p>"; return; }
  container.innerHTML = products.map(p => `
    <div class="list-item">
      <div class="list-item-info">
        <strong>${escHtml(p.name)}</strong>
        <span>$${p.price.toFixed(2)} · Stock: ${p.stock}</span>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit"
          data-id="${p.id}"
          data-name="${escHtml(p.name)}"
          data-price="${p.price}"
          data-stock="${p.stock}">Edit</button>
        <button class="btn-danger" data-id="${p.id}">Delete</button>
      </div>
    </div>`).join("");

  container.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editProduct(
      btn.dataset.id,
      btn.dataset.name,
      btn.dataset.price,
      btn.dataset.stock,
    ));
  });
  container.querySelectorAll(".btn-danger").forEach(btn => {
    btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
  });
}

document.getElementById("product-form").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("product-id").value;
  const body = {
    name:  document.getElementById("product-name").value.trim(),
    price: parseFloat(document.getElementById("product-price").value),
    stock: parseInt(document.getElementById("product-stock").value, 10),
  };
  try {
    if (id) {
      await apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
      toast("Product updated");
    } else {
      await apiFetch("/products", { method: "POST", body: JSON.stringify(body) });
      toast("Product created");
    }
    resetProductForm();
    loadProducts();
  } catch (err) { toast(err.message, true); }
});

function editProduct(id, name, price, stock) {
  document.getElementById("product-id").value    = id;
  document.getElementById("product-name").value  = name;
  document.getElementById("product-price").value = price;
  document.getElementById("product-stock").value = stock;
  document.getElementById("product-form-title").textContent = "Edit Product";
  document.getElementById("product-cancel").style.display  = "inline-block";
}

function resetProductForm() {
  document.getElementById("product-form").reset();
  document.getElementById("product-id").value = "";
  document.getElementById("product-form-title").textContent = "Add Product";
  document.getElementById("product-cancel").style.display  = "none";
}

async function deleteProduct(id) {
  if (!confirm("Delete product?")) return;
  try {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
    toast("Product deleted");
    loadProducts();
  } catch (err) { toast(err.message, true); }
}

// ── Purchase ─────────────────────────────────────────────────────────────────

document.getElementById("purchase-form").addEventListener("submit", async e => {
  e.preventDefault();
  const body = {
    client_id:  parseInt(document.getElementById("purchase-client-id").value, 10),
    product_id: parseInt(document.getElementById("purchase-product-id").value, 10),
  };
  const resultBox = document.getElementById("purchase-result");
  try {
    const data = await apiFetch("/purchase", { method: "POST", body: JSON.stringify(body) });
    resultBox.textContent = data.message;
    resultBox.className   = "result-box";
    resultBox.style.display = "block";
  } catch (err) {
    resultBox.textContent = err.message;
    resultBox.className   = "result-box error";
    resultBox.style.display = "block";
  }
});

// ── Report ───────────────────────────────────────────────────────────────────

async function loadReport() {
  const data = await apiFetch("/report");
  const container = document.getElementById("report-content");
  if (!data.clients.length) { container.innerHTML = "<p>No registered clients.</p>"; return; }
  container.innerHTML = `
    <div class="card">
      <p><strong>Total registered clients:</strong> ${data.total}</p>
      <br/>
      <table class="report-table">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
        <tbody>
          ${data.clients.map(c => `
            <tr>
              <td>${c.id}</td>
              <td>${escHtml(c.name)}</td>
              <td>${escHtml(c.email)}</td>
              <td>${escHtml(c.phone || "—")}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

// ── XSS helpers ──────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Boot ─────────────────────────────────────────────────────────────────────
showSection("clients");
