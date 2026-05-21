/* =========================================
   AioTec v2 - JavaScript Principal
   ========================================= */

/* ── Toggle menú hamburguesa ────────────── */
function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('open');
}

/* ── Productos de demo ──────────────────── */
const productosEjemplo = [
  { id:1, nombre:'Laptop ProX 15',    precio:1299.99, categoria:'Laptops',    emoji:'💻', descripcion:'Intel i7, 16GB RAM, SSD 512GB, pantalla 15.6" FHD' },
  { id:2, nombre:'Smartphone Z9',     precio:799.99,  categoria:'Teléfonos',  emoji:'📱', descripcion:'6.7" AMOLED, Snapdragon 8 Gen2, 256GB, cámara 108MP' },
  { id:3, nombre:'Auriculares NC1',   precio:249.99,  categoria:'Audio',      emoji:'🎧', descripcion:'Cancelación activa de ruido, 30h batería, Bluetooth 5.3' },
  { id:4, nombre:'Smartwatch GT5',    precio:349.99,  categoria:'Wearables',  emoji:'⌚', descripcion:'GPS, monitor cardíaco, 7 días de batería, resistente al agua' },
  { id:5, nombre:'Monitor 4K Pro',    precio:599.99,  categoria:'Monitores',  emoji:'🖥️', descripcion:'27" IPS, 4K UHD, 144Hz, HDR400, diseño sin marcos' },
  { id:6, nombre:'Teclado MechRGB',   precio:129.99,  categoria:'Periféricos',emoji:'⌨️', descripcion:'Mecánico, switches Cherry MX, retroiluminación RGB personalizable' },
  { id:7, nombre:'Mouse Gaming X1',   precio:79.99,   categoria:'Periféricos',emoji:'🖱️', descripcion:'12000 DPI, 6 botones programables, RGB, cable braided' },
  { id:8, nombre:'Tablet Pro 12',     precio:649.99,  categoria:'Tablets',    emoji:'📲', descripcion:'12" 2K, chip potente, 8GB RAM, stylus incluido' },
];

/* ── Cargar productos desde API o demo ──── */
async function cargarProductos(contenedor, limite = null) {
  if (!contenedor) return;
  contenedor.innerHTML = '<div class="spinner"></div>';

  try {
    const res = await fetch('http://localhost:3000/api/productos');
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderizarProductos(contenedor, limite ? data.slice(0, limite) : data);
  } catch {
    renderizarProductos(contenedor, limite ? productosEjemplo.slice(0, limite) : productosEjemplo);
  }
}

/* ── Renderizar tarjetas de productos ───── */
function renderizarProductos(contenedor, productos) {
  if (!productos.length) {
    contenedor.innerHTML = '<p style="color:var(--text-secondary);grid-column:1/-1">No se encontraron productos.</p>';
    return;
  }
  contenedor.innerHTML = productos.map((p, i) => `
    <div class="product-card" style="animation:fadeUp 0.4s ${i * 0.07}s ease both">
      <div class="product-img">
        ${i < 2 ? '<span class="product-badge">NUEVO</span>' : ''}
        ${p.emoji || '📦'}
      </div>
      <div class="product-info">
        <div class="product-cat">${p.categoria || 'General'}</div>
        <div class="product-name">${p.nombre}</div>
        <div class="product-desc">${p.descripcion || ''}</div>
        <div class="product-footer">
          <span class="product-price">$${parseFloat(p.precio).toFixed(2)}</span>
          <button class="add-cart-btn" onclick='addToCart(${JSON.stringify(p).replace(/'/g,"&#39;")})'>+ Agregar</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── Estado del usuario ─────────────────── */
function getUsuarioActual() {
  return JSON.parse(localStorage.getItem('aiotec_user') || 'null');
}

function cerrarSesion() {
  localStorage.removeItem('aiotec_user');
  const isInPages = window.location.pathname.includes('/pages/');
  window.location.href = isInPages ? '../index.html' : 'index.html';
}

/* ── Actualizar navbar con estado de auth── */
function actualizarNavAuth() {
  const user     = getUsuarioActual();
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  navLinks.querySelectorAll('.auth-nav-item').forEach(el => el.remove());

  if (user) {
    const li = document.createElement('li');
    li.className = 'auth-nav-item';
    li.innerHTML = `<a href="#" onclick="cerrarSesion()" style="color:#ef4444">Salir (${user.nombre})</a>`;
    navLinks.appendChild(li);
  }
}

document.addEventListener('DOMContentLoaded', actualizarNavAuth);
