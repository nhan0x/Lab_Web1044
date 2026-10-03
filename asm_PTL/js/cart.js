/**
 * cart.js - Giỏ hàng: thêm, xóa, đổi số lượng, mã giảm giá, thanh toán
 * Dữ liệu giỏ hàng lưu bằng LocalStorage nên tải lại trang không bị mất.
 * Môn: Web1044 - Lập trình cơ sở với JavaScript
 */

const CART_KEY = 'cart';
const COUPON_KEY = 'cartCoupon';

const Cart = {
  items: [],
  coupon: '',

  // ----- Lưu trữ -----
  load() {
    try {
      this.items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      this.coupon = localStorage.getItem(COUPON_KEY) || '';
    } catch (err) {
      this.items = [];
      this.coupon = '';
    }
    // Bỏ các sản phẩm không còn tồn tại trong dữ liệu
    this.items = this.items.filter((item) => findProduct(item.id) && item.qty > 0);
  },

  save() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    localStorage.setItem(COUPON_KEY, this.coupon);
  },

  // ----- Nghiệp vụ -----
  add(id, qty) {
    const product = findProduct(id);
    if (!product) return;

    const existing = this.items.find((item) => item.id === id);
    if (existing) existing.qty = Math.min(existing.qty + qty, 99);
    else this.items.push({ id, qty });

    this.save();
    this.refresh();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  },

  remove(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.save();
    this.refresh();
  },

  setQty(id, qty) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    if (qty <= 0) {
      this.remove(id);
      return;
    }
    item.qty = Math.min(qty, 99);
    this.save();
    this.refresh();
  },

  clear() {
    this.items = [];
    this.coupon = '';
    this.save();
    this.refresh();
  },

  count() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  subtotal() {
    return this.items.reduce((sum, item) => sum + findProduct(item.id).price * item.qty, 0);
  },

  discountPercent() {
    return COUPONS[this.coupon] || 0;
  },

  discount() {
    return Math.round((this.subtotal() * this.discountPercent()) / 100);
  },

  total() {
    return this.subtotal() - this.discount();
  },

  applyCoupon(code) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { ok: false, message: 'Vui lòng nhập mã giảm giá.' };
    if (!COUPONS[normalized]) return { ok: false, message: 'Mã giảm giá không hợp lệ.' };
    this.coupon = normalized;
    this.save();
    this.refresh();
    return { ok: true, message: `Đã áp dụng mã ${normalized} (-${COUPONS[normalized]}%).` };
  },

  // ----- Giao diện -----
  refresh() {
    updateCartBadge();
    renderCartDrawer();
  }
};

// ---------- Toast thông báo ----------
function showToast(message) {
  let toast = document.querySelector('.shop-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'shop-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

function updateCartBadge() {
  document.querySelectorAll('.cart-count').forEach((badge) => {
    const count = Cart.count();
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  });
}

// ---------- Drawer giỏ hàng ----------
function buildCartDrawer() {
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-label', 'Giỏ hàng');
  drawer.innerHTML = `
    <div class="cart-drawer-head">
      <h3>Giỏ Hàng Của Bạn</h3>
      <button type="button" class="cart-close" aria-label="Đóng giỏ hàng">&times;</button>
    </div>
    <div class="cart-drawer-body">
      <div class="cart-items"></div>
      <div class="cart-checkout-panel"></div>
    </div>
    <div class="cart-drawer-foot"></div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  overlay.addEventListener('click', closeCart);
  drawer.querySelector('.cart-close').addEventListener('click', closeCart);

  // Sự kiện bên trong drawer (ủy quyền)
  drawer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-cart-remove]');
    if (removeBtn) {
      Cart.remove(removeBtn.getAttribute('data-cart-remove'));
      return;
    }

    const stepBtn = e.target.closest('[data-cart-step]');
    if (stepBtn) {
      const id = stepBtn.getAttribute('data-id');
      const item = Cart.items.find((i) => i.id === id);
      if (item) Cart.setQty(id, item.qty + parseInt(stepBtn.getAttribute('data-cart-step'), 10));
      return;
    }

    if (e.target.closest('[data-apply-coupon]')) {
      const input = drawer.querySelector('.cart-coupon-input');
      const result = Cart.applyCoupon(input.value);
      const msg = drawer.querySelector('.cart-coupon-msg');
      if (msg) {
        msg.textContent = result.message;
        msg.className = 'cart-coupon-msg ' + (result.ok ? 'ok' : 'error');
      }
      return;
    }

    if (e.target.closest('[data-start-checkout]')) {
      showCheckoutForm();
      return;
    }

    if (e.target.closest('[data-back-cart]')) {
      hideCheckoutForm();
    }
  });

  // Đổi số lượng bằng cách gõ trực tiếp
  drawer.addEventListener('change', (e) => {
    const qtyInput = e.target.closest('.cart-qty-input');
    if (qtyInput) {
      const value = parseInt(qtyInput.value, 10);
      Cart.setQty(qtyInput.getAttribute('data-id'), isNaN(value) ? 1 : value);
    }
  });
}

function renderCartDrawer() {
  const drawer = document.querySelector('.cart-drawer');
  if (!drawer) return;

  const itemsBox = drawer.querySelector('.cart-items');
  const foot = drawer.querySelector('.cart-drawer-foot');

  if (!Cart.items.length) {
    itemsBox.innerHTML = '<p class="cart-empty">Giỏ hàng của bạn đang trống.</p>';
    foot.innerHTML = '';
    hideCheckoutForm(true);
    return;
  }

  itemsBox.innerHTML = Cart.items.map((item) => {
    const product = findProduct(item.id);
    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">${formatPrice(product.price)}</div>
          <div class="cart-qty">
            <button type="button" data-cart-step="-1" data-id="${item.id}" aria-label="Giảm">−</button>
            <input type="number" class="cart-qty-input" data-id="${item.id}" min="1" max="99" value="${item.qty}" />
            <button type="button" data-cart-step="1" data-id="${item.id}" aria-label="Tăng">+</button>
          </div>
        </div>
        <div class="cart-item-side">
          <button type="button" class="cart-remove" data-cart-remove="${item.id}" aria-label="Xóa sản phẩm">&times;</button>
          <div class="cart-item-line">${formatPrice(product.price * item.qty)}</div>
        </div>
      </div>`;
  }).join('');

  const discountRow = Cart.discount()
    ? `<div class="cart-row"><span>Giảm giá (${Cart.discountPercent()}%)</span><span>-${formatPrice(Cart.discount())}</span></div>`
    : '';

  foot.innerHTML = `
    <div class="cart-coupon">
      <input type="text" class="cart-coupon-input" placeholder="Nhập mã giảm giá" value="${Cart.coupon}" />
      <button type="button" class="btn btn-outline btn-sm" data-apply-coupon>Áp Dụng</button>
    </div>
    <div class="cart-coupon-msg"></div>
    <div class="cart-row"><span>Tạm tính</span><span>${formatPrice(Cart.subtotal())}</span></div>
    ${discountRow}
    <div class="cart-row cart-total"><span>Tổng cộng</span><span>${formatPrice(Cart.total())}</span></div>
    <button type="button" class="btn btn-primary cart-checkout-btn" data-start-checkout>Tiến Hành Đặt Hàng</button>`;
}

// ---------- Form thanh toán ----------
function showCheckoutForm() {
  const drawer = document.querySelector('.cart-drawer');
  const panel = drawer.querySelector('.cart-checkout-panel');
  drawer.classList.add('checkout-mode');
  panel.innerHTML = `
    <form class="checkout-form" novalidate>
      <h4>Thông Tin Đặt Hàng</h4>
      <div class="field"><input type="text" name="fullname" placeholder="Họ và tên" /><small class="field-error"></small></div>
      <div class="field"><input type="text" name="phone" placeholder="Số điện thoại" /><small class="field-error"></small></div>
      <div class="field"><input type="text" name="email" placeholder="Email" /><small class="field-error"></small></div>
      <div class="field"><input type="text" name="address" placeholder="Địa chỉ nhận hàng" /><small class="field-error"></small></div>
      <div class="checkout-actions">
        <button type="button" class="btn btn-outline btn-sm" data-back-cart>Quay Lại</button>
        <button type="submit" class="btn btn-primary btn-sm">Xác Nhận Đặt Hàng</button>
      </div>
    </form>`;

  const form = panel.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!Validator.checkoutForm(form)) return;

    const orderTotal = Cart.total();
    Cart.clear();
    drawer.classList.add('checkout-mode');
    panel.innerHTML = `
      <div class="checkout-success">
        <h4>Đặt hàng thành công!</h4>
        <p>Cảm ơn quý khách. Tổng giá trị đơn hàng: <strong>${formatPrice(orderTotal)}</strong>.<br />Đỗ Phúc sẽ liên hệ xác nhận trong 15 phút.</p>
        <button type="button" class="btn btn-primary btn-sm" data-back-cart>Đóng</button>
      </div>`;
    panel.querySelector('[data-back-cart]').addEventListener('click', () => {
      hideCheckoutForm(true);
      closeCart();
    });
  });
}

function hideCheckoutForm(force) {
  const drawer = document.querySelector('.cart-drawer');
  if (!drawer) return;
  drawer.classList.remove('checkout-mode');
  // Giữ nguyên thông báo thành công nếu giỏ vừa được làm rỗng bởi đơn hàng
  if (force || !drawer.querySelector('.checkout-success')) {
    drawer.querySelector('.cart-checkout-panel').innerHTML = '';
  }
}

// ---------- Mở / đóng ----------
function openCart() {
  document.querySelector('.cart-drawer').classList.add('open');
  document.querySelector('.cart-overlay').classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeCart() {
  document.querySelector('.cart-drawer').classList.remove('open');
  document.querySelector('.cart-overlay').classList.remove('open');
  if (!document.querySelector('.product-modal')) document.body.classList.remove('no-scroll');
}

function initCart() {
  Cart.load();
  buildCartDrawer();
  Cart.refresh();

  document.querySelectorAll('.cart-toggle').forEach((btn) => {
    btn.addEventListener('click', openCart);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });
}
