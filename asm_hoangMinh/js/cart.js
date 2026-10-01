/**
 * Giỏ hàng và danh sách yêu thích
 * Website HoangMinh - WEB1044
 */

// ============================================
// 5. GIỎ HÀNG (SHOPPING CART & LOCALSTORAGE)
// ============================================

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('halo_cart')) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('halo_cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function addToCart(productId, qty = 1, event) {
    if (event) event.stopPropagation();

    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: qty
        });
    }

    saveCart(cart);
    showToast(`🛒 Đã thêm <b>${product.name}</b> vào giỏ hàng!`);
    openCart();
}

function updateCartQty(productId, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }

    saveCart(cart);
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== productId);
    saveCart(cart);
    showToast('🗑️ Đã xóa sản phẩm khỏi giỏ hàng');
}

function clearCart() {
    localStorage.removeItem('halo_cart');
    updateCartBadge();
    renderCart();
}

function updateCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
        b.textContent = totalCount;
        b.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    });

    const totalMoney = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const headerMoney = document.getElementById('header-cart-total');
    if (headerMoney) {
        headerMoney.textContent = formatPrice(totalMoney);
    }
}

function renderCart() {
    const cart = getCart();
    const itemsContainer = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-drawer-total');
    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-cart-view">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <button class="btn-continue-shopping" onclick="closeCart()">Tiếp tục mua sắm</button>
            </div>
        `;
        if (totalEl) totalEl.textContent = '0 đ';
        return;
    }

    let total = 0;
    itemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
            <div class="cart-drawer-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-qty-control">
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span class="qty-num">${item.qty}</span>
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="btn-remove-item" onclick="removeFromCart(${item.id})" title="Xóa">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
    }).join('');

    if (totalEl) totalEl.textContent = formatPrice(total);
}

function openCart() {
    renderCart();
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('⚠️ Giỏ hàng đang trống!');
        return;
    }
    closeCart();
    openCheckoutModal();
}

// ============================================
// 6. DANH SÁCH YÊU THÍCH (WISHLIST)
// ============================================

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem('halo_wishlist')) || [];
    } catch (e) {
        return [];
    }
}

function updateWishlistBadge() {
    const list = getWishlist();
    const badge = document.getElementById('wishlist-badge');
    if (badge) {
        badge.textContent = list.length;
        badge.style.display = list.length > 0 ? 'inline-flex' : 'none';
    }
}

function toggleWishlist(productId, event) {
    if (event) event.stopPropagation();
    let list = getWishlist();
    const idx = list.indexOf(productId);
    const prod = products.find(p => p.id === productId);

    if (idx > -1) {
        list.splice(idx, 1);
        showToast(`Đã xóa <b>${prod ? prod.name : ''}</b> khỏi danh sách yêu thích`);
    } else {
        list.push(productId);
        showToast(`❤️ Đã thêm <b>${prod ? prod.name : ''}</b> vào yêu thích`);
    }

    localStorage.setItem('halo_wishlist', JSON.stringify(list));
    updateWishlistBadge();
    renderProducts(currentProductList);
}
