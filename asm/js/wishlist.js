// Sản phẩm yêu thích: lưu theo tài khoản, cập nhật số trên header và vẽ trang wishlist.html.

class Wishlist {
    key() { return auth.userKey("wishlist"); }

    get() {
        if (!this.key()) return [];
        try { return JSON.parse(localStorage.getItem(this.key())) || []; }
        catch (e) { return []; }
    }

    save(list) {
        localStorage.setItem(this.key(), JSON.stringify(list));
        this.updateBadge();
        productList.render(productList.current);
    }

    has(id) { return this.get().includes(id); }

    updateBadge() {
        Utils.setText("wishlist-count", this.get().length);
        if (Utils.$("wishlist-page")) this.renderPage();
    }

    toggle(id, event) {
        event.stopPropagation();
        if (!auth.requireLogin("Vui lòng đăng nhập để lưu sản phẩm yêu thích")) return;
        const list = this.get();
        const index = list.indexOf(id);
        if (index > -1) {
            list.splice(index, 1);
            Utils.showToast("Đã xóa khỏi danh sách yêu thích");
        } else {
            list.push(id);
            Utils.showToast("❤️ Đã lưu vào danh sách yêu thích");
        }
        this.save(list);
    }

    remove(id) {
        if (!auth.requireLogin()) return;
        this.save(this.get().filter(x => x !== id));
        Utils.showToast("Đã xóa khỏi danh sách yêu thích");
    }

    moveToCart(id, btn) {
        const size = btn.closest(".wl-item").querySelector(".wl-size").value;
        if (!cart.add(id, 1, size)) return;
        this.save(this.get().filter(x => x !== id));
        Utils.showToast("✓ Đã chuyển sản phẩm vào giỏ hàng");
    }

    renderPage() {
        const root = Utils.$("wishlist-page");
        if (!auth.isLoggedIn()) {
            root.innerHTML = `
                <div class="wl-wrap">
                    <h1 class="wl-title">Sản phẩm yêu thích</h1>
                    <p class="wl-sub">Vui lòng đăng nhập để xem danh sách yêu thích của bạn.</p>
                    <button class="wl-btn wl-btn-dark" onclick="accountModal.open('login')">Đăng nhập</button>
                </div>`;
            return;
        }
        const items = this.get().map(id => products.find(p => p.id === id)).filter(Boolean);
        root.innerHTML = `
          <div class="wl-wrap">
            <h1 class="wl-title">Sản phẩm yêu thích</h1>
            <p class="wl-sub">Có <strong>${items.length}</strong> mục trong danh sách yêu thích của bạn</p>
            ${items.length ? `
            <div class="wl-grid">
                ${items.map(p => `
                    <div class="wl-item">
                        <a class="wl-img" href="product.html?id=${p.id}">
                            <img src="${p.image}" alt="${p.name}" class="product-image-photo">
                            <img src="${p.image2 || p.image}" alt="${p.name}" class="product-image-photo-hover">
                        </a>
                        <a class="wl-name" href="product.html?id=${p.id}">${p.name}</a>
                        <div class="wl-price">${Utils.formatPrice(p.price)}</div>
                        <div class="wl-row">
                            <label>Kích cỡ</label>
                            <select class="wl-size">${["S", "M", "L", "XL"].map(s => `<option${s === "M" ? " selected" : ""}>${s}</option>`).join("")}</select>
                        </div>
                        <button class="wl-btn wl-btn-dark wl-add" onclick="wishlist.moveToCart(${p.id}, this)">Thêm vào giỏ</button>
                        <a href="javascript:void(0)" class="wl-remove" onclick="wishlist.remove(${p.id})">Xóa</a>
                    </div>`).join("")}
            </div>`
            : `<div class="wl-empty"><i class="fa-regular fa-flag"></i>Không có sản phẩm nào trong danh sách ưa thích của bạn.</div>`}
          </div>
            <div class="wl-bar">
                <div class="wl-bar-inner">
                    <a class="wl-btn" href="index.html">Tiếp tục mua hàng</a>
                    <div class="wl-bar-count">${items.length} &nbsp;Mục trong danh sách yêu thích của bạn</div>
                    <a class="wl-btn wl-btn-dark" href="cart.html">Xem giỏ hàng</a>
                </div>
            </div>`;
    }
}

const wishlist = new Wishlist();
