/**
 * products.js - Hiển thị sản phẩm, lọc theo nhóm, tìm kiếm, sắp xếp,
 * yêu thích (wishlist) và cửa sổ xem chi tiết sản phẩm
 * Môn: Web1044 - Lập trình cơ sở với JavaScript
 */

const WISHLIST_KEY = 'wishlist';
const productState = { cat: 'all', query: '', sort: 'default', firstRender: true };

// ---------- Wishlist (lưu LocalStorage) ----------
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function toggleWishlist(id) {
  const list = getWishlist();
  const index = list.indexOf(id);
  if (index === -1) list.push(id);
  else list.splice(index, 1);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  return index === -1;
}

// ---------- Render ----------
const ARROW_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
const HEART_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

function renderProductCard(product, index, wishlist) {
  const delay = ((index % 3) + 1) * 100;
  const liked = wishlist.includes(product.id);
  const oldPrice = product.oldPrice
    ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>`
    : '';
  const reveal = `data-reveal="up" data-delay="${delay}"`;

  return `
    <div class="project-item" data-category="${product.group}" data-id="${product.id}" ${reveal}>
      <div class="project-thumb">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="project-tag-badge">${PRODUCT_GROUPS[product.group]}</span>
        <button type="button" class="wish-btn${liked ? ' active' : ''}" data-wish="${product.id}" aria-label="Yêu thích">${HEART_ICON}</button>
      </div>
      <div class="project-body">
        <div>
          <h3 class="project-item-title">${product.name}</h3>
          <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.25rem; display: flex; gap: 1rem; align-items: center;">
            <span class="price-now">${formatPrice(product.price)}</span>
            ${oldPrice}
          </div>
        </div>
        <div class="product-actions">
          <button type="button" class="project-link-btn" data-view="${product.id}">
            Xem Chi Tiết
            ${ARROW_ICON}
          </button>
          <button type="button" class="btn btn-outline btn-sm" data-add="${product.id}">Thêm Giỏ</button>
        </div>
      </div>
    </div>`;
}

function getVisibleProducts(grid) {
  const onlyFeatured = grid.hasAttribute('data-featured');
  const wishlist = getWishlist();
  const keyword = productState.query.trim().toLowerCase();

  let list = PRODUCTS.filter((p) => {
    if (onlyFeatured && !p.featured) return false;
    if (productState.cat === 'wish') return wishlist.includes(p.id);
    if (productState.cat !== 'all' && p.group !== productState.cat) return false;
    return true;
  });

  if (keyword) {
    list = list.filter((p) => p.name.toLowerCase().includes(keyword));
  }

  if (productState.sort === 'asc') list.sort((a, b) => a.price - b.price);
  if (productState.sort === 'desc') list.sort((a, b) => b.price - a.price);

  return list;
}

function renderProducts() {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  const wishlist = getWishlist();
  const list = getVisibleProducts(grid);

  if (!list.length) {
    grid.innerHTML = '<p class="product-empty">Không tìm thấy sản phẩm phù hợp.</p>';
    return;
  }

  grid.innerHTML = list.map((p, i) => renderProductCard(p, i, wishlist)).join('');

  // Các lần render sau khi lọc: hiện ngay, không chờ cuộn
  if (!productState.firstRender) {
    grid.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  }
  productState.firstRender = false;
}

// ---------- Modal xem chi tiết ----------
function openProductModal(id) {
  const product = findProduct(id);
  if (!product) return;

  closeProductModal();

  const specs = Object.entries(product.specs)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
    .join('');
  const oldPrice = product.oldPrice
    ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>`
    : '';

  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.innerHTML = `
    <div class="product-modal-dialog" role="dialog" aria-modal="true">
      <button type="button" class="product-modal-close" aria-label="Đóng">&times;</button>
      <div class="product-modal-image"><img src="${product.image}" alt="${product.name}" /></div>
      <div class="product-modal-info">
        <span class="section-tag">${PRODUCT_GROUPS[product.group]}</span>
        <h3>${product.name}</h3>
        <div class="product-modal-price"><span class="price-now">${formatPrice(product.price)}</span>${oldPrice}</div>
        <p>${product.desc}</p>
        <ul class="product-modal-specs">${specs}</ul>
        <div class="product-modal-buy">
          <input type="number" class="product-modal-qty" min="1" max="99" value="1" aria-label="Số lượng" />
          <button type="button" class="btn btn-primary" data-modal-add="${product.id}">Thêm Vào Giỏ</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  document.body.classList.add('no-scroll');

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.product-modal-close')) {
      closeProductModal();
      return;
    }
    const addBtn = e.target.closest('[data-modal-add]');
    if (addBtn) {
      const qty = parseInt(modal.querySelector('.product-modal-qty').value, 10) || 1;
      Cart.add(product.id, Math.min(Math.max(qty, 1), 99));
      closeProductModal();
    }
  });
}

function closeProductModal() {
  const modal = document.querySelector('.product-modal');
  if (modal) modal.remove();
  if (!document.querySelector('.cart-drawer.open')) document.body.classList.remove('no-scroll');
}

// ---------- Khởi tạo ----------
function initProducts() {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  // Lấy danh mục từ URL, ví dụ products.html?cat=hot
  const urlCat = new URLSearchParams(window.location.search).get('cat');
  const validCats = ['all', 'wish', ...Object.keys(PRODUCT_GROUPS)];
  if (urlCat && validCats.includes(urlCat)) productState.cat = urlCat;

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.classList.toggle('active', (btn.getAttribute('data-filter') || 'all') === productState.cat);
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      productState.cat = btn.getAttribute('data-filter') || 'all';
      renderProducts();
    });
  });

  const searchInput = document.querySelector('.product-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      productState.query = searchInput.value;
      renderProducts();
    });
  }

  const sortSelect = document.querySelector('.product-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      productState.sort = sortSelect.value;
      renderProducts();
    });
  }

  // Ủy quyền sự kiện cho các nút trong thẻ sản phẩm
  grid.addEventListener('click', (e) => {
    const wishBtn = e.target.closest('[data-wish]');
    if (wishBtn) {
      const liked = toggleWishlist(wishBtn.getAttribute('data-wish'));
      wishBtn.classList.toggle('active', liked);
      if (productState.cat === 'wish') renderProducts();
      return;
    }

    const viewBtn = e.target.closest('[data-view]');
    if (viewBtn) {
      openProductModal(viewBtn.getAttribute('data-view'));
      return;
    }

    const addBtn = e.target.closest('[data-add]');
    if (addBtn) Cart.add(addBtn.getAttribute('data-add'), 1);
  });

  // Hiệu ứng onmouseover: làm nổi bật thẻ đang rê chuột, mờ nhẹ các thẻ còn lại
  grid.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.project-item');
    grid.classList.toggle('is-hovering', !!card);
    grid.querySelectorAll('.project-item').forEach((item) => {
      item.classList.toggle('is-focused', item === card);
    });
  });
  grid.addEventListener('mouseleave', () => {
    grid.classList.remove('is-hovering');
    grid.querySelectorAll('.project-item').forEach((item) => item.classList.remove('is-focused'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
  });

  renderProducts();
}
