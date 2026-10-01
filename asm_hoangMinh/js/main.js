/**
 * Xử lý Tương tác Chính Website HoangMinh
 * Môn học: Lập trình cơ sở với JavaScript (WEB1044)
 * Sinh viên: Hoàng Minh
 */

// Trạng thái lọc và hiển thị hiện tại
let currentFilterState = {
    brand: 'all',
    category: 'all',
    priceRange: 'all',
    sort: 'default',
    search: ''
};

let currentProductList = [...products];

// ============================================
// 1. TIỆN ÍCH CHUNG
// ============================================

function formatPrice(n) {
    if (!n || isNaN(n)) return 'Liên hệ';
    return Number(n).toLocaleString('vi-VN') + ' đ';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// ============================================
// 2. KHỞI TẠO KHI TẢI TRANG
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    applyAllFilters();
    updateCartBadge();
    updateWishlistBadge();
    setupHeaderScroll();
    setupEventListeners();
});

// ============================================
// 3. HIỂN THỊ DANH SÁCH SẢN PHẨM
// ============================================

function renderProducts(list) {
    const grid = document.getElementById('main-product-grid');
    const counter = document.getElementById('product-counter');
    if (!grid) return;

    if (counter) {
        counter.textContent = `Hiển thị ${list.length} sản phẩm`;
    }

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-products-msg">
                <i class="fa-solid fa-box-open"></i>
                <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc!</p>
                <button class="btn-reset-filters" onclick="resetFilters()">Đặt lại bộ lọc</button>
            </div>
        `;
        return;
    }

    const wishlist = getWishlist();

    grid.innerHTML = list.map(p => {
        const isWish = wishlist.includes(p.id);
        const hasDiscount = p.originalPrice && p.originalPrice > p.price;
        const discountPercent = hasDiscount ? Math.round((p.originalPrice - p.price) / p.originalPrice * 100) : 0;

        return `
            <div class="product-card" data-id="${p.id}">
                <div class="product-thumb">
                    <!-- Badges -->
                    <div class="badge-container">
                        ${hasDiscount ? `<span class="badge badge-sale">-${discountPercent}%</span>` : ''}
                        ${p.badge && !hasDiscount ? `<span class="badge ${p.isHot ? 'badge-hot' : 'badge-new'}">${p.badge}</span>` : ''}
                    </div>

                    <!-- Yêu thích -->
                    <button class="btn-card-wishlist ${isWish ? 'active' : ''}" onclick="toggleWishlist(${p.id}, event)" title="${isWish ? 'Bỏ thích' : 'Yêu thích'}">
                        <i class="${isWish ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>

                    <!-- Hình ảnh sản phẩm -->
                    <a href="javascript:void(0)" onclick="openQuickView(${p.id})" class="product-img-link">
                        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://haloshop.vn/wp-content/themes/woodmart/images/lazy.svg'">
                    </a>

                    <!-- Nút thao tác nhanh trên ảnh -->
                    <div class="product-hover-actions">
                        <button class="btn-quick-view" onclick="openQuickView(${p.id})">
                            <i class="fa-regular fa-eye"></i> Xem nhanh
                        </button>
                        <button class="btn-quick-cart" onclick="addToCart(${p.id}, 1, event)">
                            <i class="fa-solid fa-cart-plus"></i> Thêm giỏ
                        </button>
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-brand">${p.brand}</div>
                    <h3 class="product-title" title="${p.name}">
                        <a href="javascript:void(0)" onclick="openQuickView(${p.id})">${p.name}</a>
                    </h3>
                    
                    <div class="product-rating">
                        <div class="stars">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star-half-stroke"></i>
                        </div>
                        <span class="rating-count">(${p.reviewsCount})</span>
                    </div>

                    <div class="product-price-box">
                        <span class="current-price">${formatPrice(p.price)}</span>
                        ${hasDiscount ? `<span class="old-price">${formatPrice(p.originalPrice)}</span>` : ''}
                    </div>

                    <button class="btn-add-to-cart-solid" onclick="addToCart(${p.id}, 1, event)">
                        <i class="fa-solid fa-cart-shopping"></i> Thêm vào giỏ
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// 4. BỘ LỌC VÀ TÌM KIẾM SẢN PHẨM
// ============================================

function applyAllFilters() {
    let result = [...products];

    // 1. Lọc theo thương hiệu
    if (currentFilterState.brand !== 'all') {
        result = result.filter(p => p.brand.toLowerCase() === currentFilterState.brand.toLowerCase());
    }

    // 2. Lọc theo danh mục
    if (currentFilterState.category !== 'all') {
        result = result.filter(p => p.category === currentFilterState.category);
    }

    // 3. Lọc theo khoảng giá
    if (currentFilterState.priceRange !== 'all') {
        switch (currentFilterState.priceRange) {
            case 'under-1m':
                result = result.filter(p => p.price < 1000000);
                break;
            case '1m-5m':
                result = result.filter(p => p.price >= 1000000 && p.price <= 5000000);
                break;
            case '5m-10m':
                result = result.filter(p => p.price > 5000000 && p.price <= 10000000);
                break;
            case 'over-10m':
                result = result.filter(p => p.price > 10000000);
                break;
        }
    }

    // 4. Lọc theo từ khóa tìm kiếm
    if (currentFilterState.search.trim()) {
        const query = currentFilterState.search.toLowerCase().trim();
        result = result.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.brand.toLowerCase().includes(query) ||
            p.categoryName.toLowerCase().includes(query)
        );
    }

    // 5. Sắp xếp
    switch (currentFilterState.sort) {
        case 'price-asc':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            result.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Mặc định: ưu tiên hot/sale
            result.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
            break;
    }

    currentProductList = result;
    renderProducts(result);
}

function filterBrand(brand, element) {
    currentFilterState.brand = brand;
    document.querySelectorAll('.filter-brand-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    applyAllFilters();
}

function filterCategory(cat, element) {
    currentFilterState.category = cat;
    document.querySelectorAll('.category-tab-btn').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    applyAllFilters();
}

function filterPrice(range, element) {
    currentFilterState.priceRange = range;
    document.querySelectorAll('.filter-price-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    applyAllFilters();
}

function handleSort(sortValue) {
    currentFilterState.sort = sortValue;
    applyAllFilters();
}

function handleSearch(query) {
    currentFilterState.search = query;
    applyAllFilters();
}

function resetFilters() {
    currentFilterState = {
        brand: 'all',
        category: 'all',
        priceRange: 'all',
        sort: 'default',
        search: ''
    };
    
    // Đặt lại giao diện filter
    document.querySelectorAll('.filter-brand-item').forEach(el => el.classList.remove('active'));
    const firstBrand = document.querySelector('.filter-brand-item');
    if (firstBrand) firstBrand.classList.add('active');

    document.querySelectorAll('.filter-price-item').forEach(el => el.classList.remove('active'));
    const firstPrice = document.querySelector('.filter-price-item');
    if (firstPrice) firstPrice.classList.add('active');

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'default';

    const searchInput = document.getElementById('header-search-input');
    if (searchInput) searchInput.value = '';

    applyAllFilters();
    showToast('🔄 Đã làm mới bộ lọc sản phẩm');
}
