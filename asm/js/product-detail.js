/* ===== TRANG CHI TIẾT SẢN PHẨM (product.html?id=...) — kiểu elise.vn =====
   Việc: đọc id trên địa chỉ, vẽ thư viện ảnh, giá, SKU, kích cỡ, số lượng, thêm giỏ / yêu thích, hướng dẫn.
   Dùng: products (products.js); Utils (utils.js); cart (cart.js); wishlist (wishlist.js).
   Giao diện: id="pd-page" trong product.html. */

class ProductDetail {
    constructor(allProducts) {
        this.products = allProducts;
        this.current = null;
    }

    render() {
        const root = Utils.$("pd-page");
        const id = parseInt(new URLSearchParams(location.search).get("id"), 10);
        const p = this.products.find(x => x.id === id);
        if (!p) {
            root.innerHTML = '<div class="pd-notfound">Không tìm thấy sản phẩm. <a href="index.html">Quay lại trang chủ</a></div>';
            return;
        }
        this.current = p;
        document.title = `${p.name} | Luna`;
        const originalPrice = Utils.getOriginalPrice(p);
        const sizes = ["S", "M", "L", "XL"].map((s, i) =>
            `<span class="size-pill${i === 0 ? " active" : ""}" onclick="productDetail.selectSize(this)">${s}</span>`).join("");
        const photos = (p.gallery && p.gallery.length ? p.gallery : [p.image]).map(src =>
            `<img src="${src}" alt="${p.name}">`).join("");

        root.innerHTML = `
            <div class="pd-breadcrumb"><a href="index.html">Trang chủ</a> / <a href="index.html#product-section">Thời trang</a> / <span>${p.name}</span></div>
            <div class="pd-grid">
                <div class="pd-gallery">${photos}</div>
                <div class="pd-info">
                    <h1 class="pd-name">${p.name}</h1>
                    <div class="pd-price">
                        ${Utils.formatPrice(p.price)}
                        ${originalPrice ? `<span class="old-price">${Utils.formatPrice(originalPrice)}</span>` : ""}
                    </div>
                    <div class="pd-sku">SKU: ${p.sku || ""}</div>
                    <div class="pd-row">
                        <span class="pd-label">Kích cỡ</span>
                        <div class="size-pills">${sizes}</div>
                    </div>
                    <div class="pd-row">
                        <span class="pd-label">Số lượng</span>
                        <div class="pd-qty">
                            <button type="button" onclick="productDetail.changeQty(-1)">−</button>
                            <input type="number" id="pd-qty-input" value="1" min="1" onchange="productDetail.changeQty(0)">
                            <button type="button" onclick="productDetail.changeQty(1)">+</button>
                        </div>
                    </div>
                    <div class="pd-actions">
                        <button class="pd-btn-cart" onclick="productDetail.addToCart()">Thêm vào giỏ</button>
                        <button class="pd-btn-wish" onclick="productDetail.addToWishlist(event)">Thêm vào yêu thích</button>
                    </div>
                    <div class="pd-links">
                        ${this.accordion("Hướng dẫn mua hàng", `
                            <p><b>Bước 1:</b> Tìm kiếm và chọn sản phẩm yêu thích, chọn kích cỡ, số lượng rồi bấm "Thêm vào giỏ".</p>
                            <p><b>Bước 2:</b> Mở giỏ hàng ở góc phải, kiểm tra sản phẩm và bấm "Tiến Hành Đặt Hàng". Điền thông tin giao hàng và chọn phương thức thanh toán.</p>
                            <p><b>Bước 3:</b> Kiểm tra thông tin xác nhận đơn hàng sau khi đặt thành công.</p>`)}
                        ${this.accordion("Hướng dẫn chọn kích cỡ", `
                            <table class="pd-size-table">
                                <tr><th>Size</th><th>Eo (cm)</th><th>Mông (cm)</th></tr>
                                <tr><td>S</td><td>64 - 68</td><td>88 - 92</td></tr>
                                <tr><td>M</td><td>68 - 72</td><td>92 - 96</td></tr>
                                <tr><td>L</td><td>72 - 76</td><td>96 - 100</td></tr>
                                <tr><td>XL</td><td>76 - 80</td><td>100 - 104</td></tr>
                            </table>`)}
                        ${this.accordion("Chia sẻ", `<p><a href="javascript:void(0)" onclick="productDetail.share()">Sao chép liên kết trang</a></p>`)}
                    </div>
                </div>
            </div>`;
    }

    accordion(title, body) {
        return `<div class="pd-acc">
            <a href="javascript:void(0)" class="pd-acc-title" onclick="this.parentNode.classList.toggle('open')"><i class="pd-caret"></i>${title}</a>
            <div class="pd-acc-body">${body}</div>
        </div>`;
    }

    selectSize(el) {
        document.querySelectorAll(".size-pill").forEach(s => s.classList.toggle("active", s === el));
    }

    changeQty(delta) {
        const input = Utils.$("pd-qty-input");
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
    }

    addToCart() {
        const qty = Math.max(1, parseInt(Utils.$("pd-qty-input").value, 10) || 1);
        const size = document.querySelector(".size-pill.active");
        cart.add(this.current.id, qty, size ? size.textContent.trim() : undefined);
    }

    addToWishlist(event) {
        if (!wishlist.has(this.current.id)) wishlist.toggle(this.current.id, event);
        else { event.stopPropagation(); Utils.showToast("Sản phẩm đã có trong danh sách yêu thích"); }
    }

    share() {
        if (navigator.clipboard) navigator.clipboard.writeText(location.href);
        Utils.showToast("Đã sao chép liên kết");
    }
}

const productDetail = new ProductDetail(products);
