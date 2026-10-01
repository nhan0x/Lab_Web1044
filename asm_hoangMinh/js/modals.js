/**
 * Quick view, tài khoản, thanh toán, menu mobile
 * Website HoangMinh - WEB1044
 */

// ============================================
// 7. XEM NHANH CHI TIẾT SẢN PHẨM (QUICK VIEW MODAL)
// ============================================

function openQuickView(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.getElementById('quickview-modal');
    const modalBody = document.getElementById('quickview-body');
    if (!modal || !modalBody) return;

    const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;
    const discountPercent = hasDiscount ? Math.round((prod.originalPrice - prod.price) / prod.originalPrice * 100) : 0;

    modalBody.innerHTML = `
        <div class="quickview-grid">
            <div class="quickview-gallery">
                <div class="quickview-main-img-box">
                    <img src="${prod.image}" alt="${prod.name}" id="quickview-active-img">
                    ${hasDiscount ? `<span class="badge badge-sale">-${discountPercent}%</span>` : ''}
                </div>
            </div>

            <div class="quickview-details">
                <span class="quickview-brand">${prod.brand}</span>
                <h2 class="quickview-title">${prod.name}</h2>
                <div class="quickview-meta">
                    <span class="sku">Mã SKU: <b>${prod.sku}</b></span>
                    <span class="stock-status"><i class="fa-solid fa-circle-check"></i> Còn hàng</span>
                </div>

                <div class="quickview-rating">
                    <div class="stars">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star-half-stroke"></i>
                    </div>
                    <span>(${prod.reviewsCount} đánh giá từ khách hàng)</span>
                </div>

                <div class="quickview-price-wrap">
                    <span class="quickview-price">${formatPrice(prod.price)}</span>
                    ${hasDiscount ? `<span class="quickview-old-price">${formatPrice(prod.originalPrice)}</span>` : ''}
                </div>

                <div class="quickview-desc">
                    <p>${prod.description}</p>
                </div>

                <div class="quickview-features">
                    <ul>
                        <li><i class="fa-solid fa-shield-halved"></i> Bảo hành chính hãng HoangMinh</li>
                        <li><i class="fa-solid fa-truck-fast"></i> Giao hàng miễn phí nội thành TP.HCM</li>
                        <li><i class="fa-solid fa-headset"></i> Kỹ thuật viên hỗ trợ kích hoạt trực tiếp</li>
                    </ul>
                </div>

                <div class="quickview-actions">
                    <div class="quantity-input-box">
                        <button type="button" onclick="changeQuickViewQty(-1)">-</button>
                        <input type="number" id="quickview-qty" value="1" min="1" max="99">
                        <button type="button" onclick="changeQuickViewQty(1)">+</button>
                    </div>

                    <button class="btn-quickview-add-cart" onclick="addFromQuickView(${prod.id})">
                        <i class="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
                    </button>
                    <button class="btn-quickview-buy-now" onclick="buyNowFromQuickView(${prod.id})">
                        Mua ngay
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function changeQuickViewQty(delta) {
    const input = document.getElementById('quickview-qty');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    input.value = val;
}

function addFromQuickView(productId) {
    const input = document.getElementById('quickview-qty');
    const qty = input ? parseInt(input.value) || 1 : 1;
    addToCart(productId, qty);
    closeQuickView();
}

function buyNowFromQuickView(productId) {
    const input = document.getElementById('quickview-qty');
    const qty = input ? parseInt(input.value) || 1 : 1;
    addToCart(productId, qty);
    closeQuickView();
    proceedToCheckout();
}

function closeQuickView() {
    const modal = document.getElementById('quickview-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// ============================================
// 8. MODAL TÀI KHOẢN & THANH TOÁN
// ============================================

function openAccountModal(tab = 'login') {
    const modal = document.getElementById('account-modal');
    if (modal) {
        modal.classList.add('open');
        switchAccountTab(tab);
        document.body.style.overflow = 'hidden';
    }
}

function closeAccountModal() {
    const modal = document.getElementById('account-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function switchAccountTab(tab) {
    const loginForm = document.getElementById('login-form-wrap');
    const registerForm = document.getElementById('register-form-wrap');
    const tabLoginBtn = document.getElementById('tab-btn-login');
    const tabRegBtn = document.getElementById('tab-btn-register');

    if (tab === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (tabLoginBtn) tabLoginBtn.classList.add('active');
        if (tabRegBtn) tabRegBtn.classList.remove('active');
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (tabLoginBtn) tabLoginBtn.classList.remove('active');
        if (tabRegBtn) tabRegBtn.classList.add('active');
    }
}

function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const cart = getCart();
    const orderItems = document.getElementById('checkout-order-items');
    const totalEl = document.getElementById('checkout-order-total');

    if (orderItems) {
        let total = 0;
        orderItems.innerHTML = cart.map(item => {
            const sub = item.price * item.qty;
            total += sub;
            return `
                <div class="checkout-item-row">
                    <span>${item.name} <b>x ${item.qty}</b></span>
                    <span>${formatPrice(sub)}</span>
                </div>
            `;
        }).join('');
        if (totalEl) totalEl.textContent = formatPrice(total);
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// ============================================
// 9. MENU MOBILE & HEADER SCROLL
// ============================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    if (menu && overlay) {
        menu.classList.toggle('open');
        overlay.classList.toggle('open');
    }
}

function setupHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    }, { passive: true });
}

function setupEventListeners() {
    // Đóng modal khi click ra ngoài overlay
    window.addEventListener('click', (e) => {
        const qvModal = document.getElementById('quickview-modal');
        if (e.target === qvModal) closeQuickView();

        const accModal = document.getElementById('account-modal');
        if (e.target === accModal) closeAccountModal();

        const chkModal = document.getElementById('checkout-modal');
        if (e.target === chkModal) closeCheckoutModal();
    });

    // Đóng khi bấm phím ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuickView();
            closeAccountModal();
            closeCheckoutModal();
            closeCart();
            toggleMobileMenu();
        }
    });
}
