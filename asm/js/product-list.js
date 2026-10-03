// Lưới sản phẩm New Arrival trên trang chủ: hiển thị, lọc theo nhóm / loại và tìm kiếm.

class ProductList {
    constructor(allProducts) {
        this.all = allProducts;
        this.current = allProducts;
        this.pageSize = 8;
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
        if (!grid) return;
        const shown = this.expanded ? list : list.slice(0, this.pageSize);
        grid.innerHTML = list.length
            ? shown.map(p => this.cardHTML(p)).join("")
            : '<div class="empty-hint">Chưa có sản phẩm nào phù hợp.</div>';
        const more = Utils.$("new-arrival-more");
        if (more) more.style.display = list.length > shown.length ? "" : "none";
    }

    showAll() {
        this.expanded = true;
        this.render(this.current);
    }

    reset() {
        this.expanded = false;
        document.querySelectorAll(".filter-tab-btn").forEach(b => b.classList.remove("active"));
        Utils.$("product-filter-note").classList.remove("show");
        this.render(this.all);
    }

    show(list, counterText, query) {
        if (!Utils.$("main-product-grid")) { location.href = "index.html?" + query; return; }
        this.expanded = true;
        this.render(list);
        Utils.setText("product-counter", counterText);
        Utils.$("product-filter-note").classList.add("show");
        Utils.scrollToSection("product-section");
    }

    filterCategory(cat, btn) {
        document.querySelectorAll(".filter-tab-btn").forEach(b => b.classList.toggle("active", b === btn));
        const list = cat === "all" ? this.all : this.all.filter(p => p.category === cat);
        this.show(list, `Hiển thị ${list.length} sản phẩm`, "cat=" + cat);
    }

    filterSubCategory(keyword) {
        const kw = keyword.toLowerCase();
        const found = this.all.filter(p => p.name.toLowerCase().includes(kw));
        const list = found.length ? found : this.all;
        this.show(list, `Hiển thị ${list.length} sản phẩm (${keyword})`, "sub=" + encodeURIComponent(keyword));
    }

    search(keyword) {
        const kw = keyword.trim().toLowerCase();
        const list = kw ? this.all.filter(p => p.name.toLowerCase().includes(kw)) : this.all;
        this.show(list, `Tìm thấy ${list.length} sản phẩm cho "${keyword}"`, "q=" + encodeURIComponent(keyword));
    }
}

const productList = new ProductList(products);
