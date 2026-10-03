/* ===== DANH SÁCH SẢN PHẨM: HIỂN THỊ, LỌC, TÌM KIẾM =====
   Việc: vẽ lưới sản phẩm, lọc theo nhóm (tab) / theo loại (menu), tìm kiếm theo tên.
   Dùng: products (products.js); Utils (utils.js); wishlist (wishlist.js).
         Thẻ mở trang product.html?id=...; các nút gọi cart.add, wishlist.toggle. */

class ProductList {
    constructor(allProducts) {
        this.all = allProducts;
        this.current = allProducts; // danh sách đang hiển thị (để vẽ lại đúng bộ lọc khi bấm tim)
        this.pageSize = 8;          // NEW ARRIVAL: hiện 8 sản phẩm đầu, bấm "Xem thêm" để hiện hết
        this.expanded = false;
    }

    cardHTML(p) {
        const isWishlist = wishlist.has(p.id);
        const badgeClass = p.category === "new" ? "badge-new" : p.category === "hot" ? "badge-hot" : "badge-sale";
        const badgeText = p.category === "new" ? "Mới" : p.category === "hot" ? "Hot" : "Sale";
        const originalPrice = Utils.getOriginalPrice(p);

        return `
            <div class="product-item" onclick="location.href='product.html?id=${p.id}'">
                <div class="product-top">
                    <div class="badge-group">
                        <span class="badge ${badgeClass}">${badgeText}</span>
                        ${p.category === "sale" ? '<span class="badge badge-sale">-20%</span>' : ""}
                    </div>
                    <button class="btn-wishlist ${isWishlist ? "active" : ""}" onclick="wishlist.toggle(${p.id}, event)" title="Yêu thích">
                        ${isWishlist ? "❤️" : "🤍"}
                    </button>
                    <div class="product-image-wrapper">
                        <img src="${p.image}" alt="${p.name}" class="product-image-photo" loading="lazy">
                        <img src="${p.image2 || p.image}" alt="${p.name}" class="product-image-photo-hover" loading="lazy">
                    </div>
                </div>
                <div class="product-details">
                    <h5 class="product-item-name">
                        <a href="product.html?id=${p.id}" onclick="event.stopPropagation()">${p.name}</a>
                    </h5>
                    <div class="price-box">
                        <span class="price">${Utils.formatPrice(p.price)}</span>
                        ${originalPrice ? `<span class="old-price">${Utils.formatPrice(originalPrice)}</span>` : ""}
                    </div>
                    <div class="product-actions-mobile">
                        <button class="btn btn-outline" onclick="event.stopPropagation(); location.href='product.html?id=${p.id}'">Chi tiết</button>
                        <button class="btn btn-primary" onclick="event.stopPropagation(); cart.add(${p.id})">Thêm giỏ</button>
                    </div>
                </div>
            </div>`;
    }

    render(list) {
        this.current = list;
        const grid = Utils.$("main-product-grid");
        if (!grid) return; // đang ở trang chi tiết (không có lưới)
        const shown = this.expanded ? list : list.slice(0, this.pageSize);
        grid.innerHTML = list.length
            ? shown.map(p => this.cardHTML(p)).join("")
            : '<div class="empty-hint">Chưa có sản phẩm nào phù hợp.</div>';
        const more = Utils.$("new-arrival-more");
        if (more) more.style.display = list.length > shown.length ? "" : "none";
    }

    // Nút "Xem thêm" dưới NEW ARRIVAL
    showAll() {
        this.expanded = true;
        this.render(this.current);
    }

    // Link "Xem tất cả" trên dòng thông báo lọc: bỏ lọc, quay về 8 sản phẩm đầu
    reset() {
        this.expanded = false;
        document.querySelectorAll(".filter-tab-btn").forEach(b => b.classList.remove("active"));
        Utils.$("product-filter-note").classList.remove("show");
        this.render(this.all);
    }

    // Hiển thị danh sách + cập nhật bộ đếm + cuộn tới khu vực sản phẩm
    show(list, counterText, query) {
        // Ở trang chi tiết: quay về trang chủ rồi lọc (app.js đọc tham số trên địa chỉ)
        if (!Utils.$("main-product-grid")) { location.href = "index.html?" + query; return; }
        this.expanded = true; // kết quả lọc / tìm kiếm thì hiện hết
        this.render(list);
        Utils.setText("product-counter", counterText);
        Utils.$("product-filter-note").classList.add("show");
        Utils.scrollToSection("product-section");
    }

    // Lọc theo nhóm: "all" | "new" | "hot" | "sale" (các tab phía trên lưới)
    filterCategory(cat, btn) {
        document.querySelectorAll(".filter-tab-btn").forEach(b => b.classList.toggle("active", b === btn));
        const list = cat === "all" ? this.all : this.all.filter(p => p.category === cat);
        this.show(list, `Hiển thị ${list.length} sản phẩm`, "cat=" + cat);
    }

    // Lọc theo loại (Áo, Đầm, Giày, Túi...) từ menu; không có kết quả thì hiện tất cả
    filterSubCategory(keyword) {
        const kw = keyword.toLowerCase();
        const found = this.all.filter(p => p.name.toLowerCase().includes(kw));
        const list = found.length ? found : this.all;
        this.show(list, `Hiển thị ${list.length} sản phẩm (${keyword})`, "sub=" + encodeURIComponent(keyword));
    }

    // Tìm theo tên khi gõ vào ô tìm kiếm ở header
    search(keyword) {
        const kw = keyword.trim().toLowerCase();
        const list = kw ? this.all.filter(p => p.name.toLowerCase().includes(kw)) : this.all;
        this.show(list, `Tìm thấy ${list.length} sản phẩm cho "${keyword}"`, "q=" + encodeURIComponent(keyword));
    }
}

const productList = new ProductList(products);
