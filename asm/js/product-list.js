// Lưới sản phẩm New Arrival trên trang chủ: hiển thị, lọc theo nhóm / loại và tìm kiếm.

class ProductList {
    // all: toàn bộ sản phẩm; current: danh sách đang hiển thị (sau khi lọc); pageSize: số thẻ hiện ban đầu;
    // expanded: đã bấm "Xem thêm" để hiện hết chưa.
    constructor(allProducts) {
        this.all = allProducts;
        this.current = allProducts;
        this.pageSize = 8;
        this.expanded = false;
    }

    // Tạo HTML cho MỘT thẻ sản phẩm: nhãn Mới / Hot / Sale theo nhóm, trái tim (đỏ nếu đã yêu thích),
    // ảnh (có ảnh thứ 2 hiện khi rê chuột), tên, giá và giá gốc gạch ngang (chỉ hàng sale).
    cardHTML(p) {
        const isWishlist = wishlist.has(p.id);
        let badgeClass = "badge-sale";
        let badgeText = "Sale";
        if (p.category === "new") {
            badgeClass = "badge-new";
            badgeText = "Mới";
        } else if (p.category === "hot") {
            badgeClass = "badge-hot";
            badgeText = "Hot";
        }

        let saleBadge = "";
        if (p.category === "sale") saleBadge = '<span class="badge badge-sale">-20%</span>';

        let wishClass = "";
        let heart = "🤍";
        if (isWishlist) {
            wishClass = "active";
            heart = "❤️";
        }

        const originalPrice = Utils.getOriginalPrice(p);
        let oldPriceHTML = "";
        if (originalPrice) oldPriceHTML = `<span class="old-price">${Utils.formatPrice(originalPrice)}</span>`;

        return `
            <div class="product-item" onclick="location.href='product.html?id=${p.id}'">
                <div class="product-top">
                    <div class="badge-group">
                        <span class="badge ${badgeClass}">${badgeText}</span>
                        ${saleBadge}
                    </div>
                    <button class="btn-wishlist ${wishClass}" onclick="wishlist.toggle(${p.id}, event)" title="Yêu thích">
                        ${heart}
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
                        ${oldPriceHTML}
                    </div>
                    <div class="product-actions-mobile">
                        <button class="btn btn-outline" onclick="event.stopPropagation(); location.href='product.html?id=${p.id}'">Chi tiết</button>
                        <button class="btn btn-primary" onclick="event.stopPropagation(); cart.add(${p.id})">Thêm giỏ</button>
                    </div>
                </div>
            </div>`;
    }

    // Vẽ lưới sản phẩm từ danh sách list và ghi nhớ nó là danh sách hiện tại.
    // Chưa bấm "Xem thêm" thì chỉ hiện pageSize thẻ đầu. Danh sách rỗng thì hiện thông báo.
    // Nút "Xem thêm" chỉ hiện khi còn sản phẩm chưa được hiển thị.
    render(list) {
        this.current = list;
        const grid = Utils.$("main-product-grid");
        if (!grid) return;
        let shown = list.slice(0, this.pageSize);
        if (this.expanded) shown = list;

        if (list.length) grid.innerHTML = shown.map(p => this.cardHTML(p)).join("");
        else grid.innerHTML = '<div class="empty-hint">Chưa có sản phẩm nào phù hợp.</div>';

        const more = Utils.$("new-arrival-more");
        if (more) {
            if (list.length > shown.length) more.style.display = "";
            else more.style.display = "none";
        }
    }

    // Bấm "Xem thêm": hiện toàn bộ danh sách hiện tại.
    showAll() {
        this.expanded = true;
        this.render(this.current);
    }

    // Bỏ lọc: về lại trạng thái đầu, gỡ trạng thái chọn của các nút lọc, ẩn dòng ghi chú và vẽ lại toàn bộ sản phẩm.
    reset() {
        this.expanded = false;
        document.querySelectorAll(".filter-tab-btn").forEach(b => b.classList.remove("active"));
        Utils.$("product-filter-note").classList.remove("show");
        this.render(this.all);
    }

    // Hiện kết quả lọc / tìm kiếm (hàm chung cho 3 cách lọc bên dưới). Nếu trang hiện tại không có lưới sản phẩm
    // (ví dụ đang ở trang giỏ hàng) thì chuyển về trang chủ kèm tham số lọc trên URL. Có lưới thì hiện hết kết quả,
    // ghi dòng đếm kết quả, hiện ghi chú và cuộn tới khu vực sản phẩm.
    show(list, counterText, query) {
        if (!Utils.$("main-product-grid")) { location.href = "index.html?" + query; return; }
        this.expanded = true;
        this.render(list);
        Utils.setText("product-counter", counterText);
        Utils.$("product-filter-note").classList.add("show");
        Utils.scrollToSection("product-section");
    }

    // Lọc theo nhóm ("all", "new", "hot", "sale"): đánh dấu nút vừa bấm là active rồi hiện sản phẩm thuộc nhóm đó.
    filterCategory(cat, btn) {
        document.querySelectorAll(".filter-tab-btn").forEach(b => b.classList.toggle("active", b === btn));
        let list = this.all;
        if (cat !== "all") list = this.all.filter(p => p.category === cat);
        this.show(list, `Hiển thị ${list.length} sản phẩm`, "cat=" + cat);
    }

    // Lọc theo loại (từ menu, ví dụ "đầm", "quần"): giữ sản phẩm có tên chứa từ khoá (không phân biệt hoa thường).
    // Không có sản phẩm nào khớp thì hiện lại tất cả.
    filterSubCategory(keyword) {
        const kw = keyword.toLowerCase();
        const found = this.all.filter(p => p.name.toLowerCase().includes(kw));
        let list = this.all;
        if (found.length) list = found;
        this.show(list, `Hiển thị ${list.length} sản phẩm (${keyword})`, "sub=" + encodeURIComponent(keyword));
    }

    // Tìm kiếm theo tên: bỏ khoảng trắng thừa, đổi chữ thường rồi giữ sản phẩm có tên chứa từ khoá. Từ khoá rỗng thì hiện tất cả.
    search(keyword) {
        const kw = keyword.trim().toLowerCase();
        let list = this.all;
        if (kw) list = this.all.filter(p => p.name.toLowerCase().includes(kw));
        this.show(list, `Tìm thấy ${list.length} sản phẩm cho "${keyword}"`, "q=" + encodeURIComponent(keyword));
    }
}

// Một đối tượng danh sách sản phẩm dùng chung cho cả site.
const productList = new ProductList(products);
