/* =====================================================
   AioTec v3 - Carrito con IVA y resumen de compra
   ===================================================== */

const IVA = 0.15; // 15%

function getCart() {
  return JSON.parse(localStorage.getItem('aiotec_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('aiotec_cart', JSON.stringify(cart));
  updateCartUI();
}
function addToCart(product) {
  const cart     = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  saveCart(cart);
  showToast(`✅ ${product.nombre} agregado al carrito`);
}
function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
}
function clearCart() { saveCart([]); }

/* ── Calcular totales ── */
function calcularTotales(cart) {
  const subtotal     = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  const iva          = subtotal * IVA;
  const total        = subtotal + iva;
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    iva     : parseFloat(iva.toFixed(2)),
    total   : parseFloat(total.toFixed(2)),
  };
}

/* ── Actualizar UI del carrito ── */
function updateCartUI() {
  const cart   = getCart();
  const totals = calcularTotales(cart);
  const count  = cart.reduce((s, i) => s + i.qty, 0);

  const countEl = document.getElementById('cartCount');
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');

  if (countEl) countEl.textContent = count;

  if (itemsEl) {
    if (!cart.length) {
      itemsEl.innerHTML = `<div class="empty-cart"><span class="empty-cart-icon">🛒</span>Tu carrito está vacío</div>`;
    } else {
      itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
          <span class="cart-item-emoji">${item.emoji || '📦'}</span>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.nombre}</div>
            <div class="cart-item-price">$${(item.precio * item.qty).toFixed(2)} × ${item.qty}</div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Eliminar">🗑️</button>
        </div>
      `).join('') + `
        <div class="cart-totals-box">
          <div class="cart-total-row"><span>Subtotal</span><span>$${totals.subtotal.toFixed(2)}</span></div>
          <div class="cart-total-row iva"><span>IVA (15%)</span><span>$${totals.iva.toFixed(2)}</span></div>
        </div>`;
    }
  }

  if (totalEl) totalEl.textContent = totals.total.toFixed(2);
}

/* ── Toggle carrito lateral ── */
function toggleCart() {
  document.getElementById('cartSidebar')?.classList.toggle('open');
  document.getElementById('cartOverlay')?.classList.toggle('open');
}

/* ── CHECKOUT con validación de login ── */
function checkout() {
  const cart = getCart();
  if (!cart.length) { showToast('❌ Tu carrito está vacío'); return; }

  const user = JSON.parse(localStorage.getItem('aiotec_user') || 'null');
  if (!user) {
    showToast('⚠️ Debes iniciar sesión para comprar');
    toggleCart();
    const isInPages = window.location.pathname.includes('/pages/');
    setTimeout(() => { window.location.href = isInPages ? '/pages/login.html' : '/pages/login.html'; }, 1200);
    return;
  }

  // Mostrar modal de resumen antes de confirmar
  mostrarResumenCompra(cart, user);
}

/* ── Modal resumen de compra ── */
function mostrarResumenCompra(cart, user) {
  const totals = calcularTotales(cart);

  let modal = document.getElementById('checkoutModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'checkoutModal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-overlay" onclick="cerrarModal()"></div>
    <div class="modal-card">
      <div class="modal-header">
        <h3>🛒 Resumen de tu compra</h3>
        <button onclick="cerrarModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-items">
          ${cart.map(i => `
            <div class="modal-item">
              <span>${i.emoji || '📦'} ${i.nombre} × ${i.qty}</span>
              <span>$${(i.precio * i.qty).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="modal-totals">
          <div class="modal-total-row">
            <span>Subtotal</span>
            <span>$${totals.subtotal.toFixed(2)}</span>
          </div>
          <div class="modal-total-row iva">
            <span>IVA (15%)</span>
            <span>$${totals.iva.toFixed(2)}</span>
          </div>
          <div class="modal-total-row final">
            <span>TOTAL</span>
            <span>$${totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" onclick="cerrarModal()">Cancelar</button>
        <button class="btn-primary" onclick="procesarCompra()">Confirmar compra</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

function cerrarModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.style.display = 'none';
}

/* ── Procesar compra ── */
async function procesarCompra() {
  const cart = getCart();
  const user = JSON.parse(localStorage.getItem('aiotec_user') || 'null');
  if (!user || !cart.length) return;

  const totals = calcularTotales(cart);
  cerrarModal();

  try {
    const res = await fetch('http://localhost:3000/api/compras', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        usuario_id: user.id || user.codigo_usuario,
        productos : cart,
        total     : totals.total,
      })
    });

    if (res.ok) {
      const data = await res.json();
      clearCart();
      toggleCart();
      showToast(`🎉 ¡Compra #${data.codigo_compra} realizada! Total: $${data.total_compra}`);
    } else {
      showToast('❌ Error al procesar la compra');
    }
  } catch {
    // Demo sin backend
    clearCart();
    toggleCart();
    showToast(`🎉 Compra registrada (demo) | Total: $${totals.total.toFixed(2)}`);
  }
}

/* ── Toast ── */
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

document.addEventListener('DOMContentLoaded', updateCartUI);
