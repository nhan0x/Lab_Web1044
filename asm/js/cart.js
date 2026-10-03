// Giỏ hàng: thêm / gỡ / đổi số lượng theo size, lưu theo tài khoản và vẽ trang cart.html.

class Cart {
    constructor(allProducts) {
        this.products = allProducts;
        this.defaultSize = "M";
    }

    key() { return auth.userKey("cart"); }

    get() {
        if (!this.key()) return [];
        try {
            const items = JSON.parse(localStorage.getItem(this.key())) || [];
            return items.map(i => ({ ...i, size: i.size || this.defaultSize }));
        } catch (e) { return []; }
    }

    save(items) {
        if (!this.key()) return;
        localStorage.setItem(this.key(), JSON.stringify(items));
        this.render();
    }

    same(a, id, size) { return a.id === id && a.size === size; }

    add(id, qty = 1, size = this.defaultSize) {
        if (!auth.requireLogin("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")) return false;
        const items = this.get();
        const item = items.find(x => this.same(x, id, size));
        if (item) item.qty += qty;
        else items.push({ id, size, qty });
        this.save(items);
        Utils.showToast("✓ Đã thêm sản phẩm vào giỏ hàng!");
        return true;
    }

    remove(id, size) {
        if (!auth.requireLogin()) return;
        this.save(this.get().filter(x => !this.same(x, id, size)));
        Utils.showToast("Đã gỡ sản phẩm khỏi giỏ hàng");
    }

    stepQty(btn, delta) {
        const input = btn.parentNode.querySelector("input");
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
        this.markDirty();
    }

    markDirty() { Utils.$("cart-update-btn").classList.add("dirty"); }

    applyInputs(silent) {
        const items = this.get();
        let changed = false;
        document.querySelectorAll(".cart-row").forEach(row => {
            const item = items.find(x => this.same(x, +row.dataset.id, row.dataset.size));
            const qty = Math.max(1, parseInt(row.querySelector("input").value, 10) || 1);
            if (item && item.qty !== qty) { item.qty = qty; changed = true; }
        });
        if (changed) this.save(items);
        if (!silent) Utils.showToast(changed ? "Đã cập nhật giỏ hàng" : "Giỏ hàng không có thay đổi");
        return changed;
    }

    lines() {
        return this.get()
            .map(i => ({ product: this.products.find(p => p.id === i.id), size: i.size, qty: i.qty }))
            .filter(l => l.product);
    }

    count() { return this.get().reduce((sum, i) => sum + i.qty, 0); }

    subtotal() { return this.lines().reduce((s, l) => s + l.product.price * l.qty, 0); }

    clear() {
        if (!this.key()) return;
        localStorage.removeItem(this.key());
        this.render();
    }

    open() { location.href = "cart.html"; }

    render() {
        Utils.setText("cart-count", this.count());
        if (Utils.$("cart-page")) this.renderPage();
    }

    renderPage() {
        const root = Utils.$("cart-page");
        if (!auth.isLoggedIn()) {
            root.innerHTML = `
                <h1 class="cart-title">Thông tin giỏ hàng</h1>
                <p class="cart-sub">Bạn cần đăng nhập để xem giỏ hàng.</p>
                <button class="cart-btn cart-btn-dark" onclick="accountModal.open('login')">Đăng nhập</button>
                ${this.ordersHTML()}`;
            return;
        }
        const lines = this.lines();
        if (!lines.length) {
            root.innerHTML = `
                <h1 class="cart-title">Thông tin giỏ hàng</h1>
                <p class="cart-sub">Bạn chưa có sản phẩm nào trong giỏ.</p>
                <a class="cart-btn cart-btn-dark" href="index.html">Tiếp tục mua hàng</a>
                ${this.ordersHTML()}`;
            return;
        }
        root.innerHTML = `
            <h1 class="cart-title">Thông tin giỏ hàng</h1>
            <p class="cart-sub">Bạn có ${this.count()} mặt hàng trong giỏ.</p>
            <div class="cart-list">
                ${lines.map(l => `
                    <div class="cart-row" data-id="${l.product.id}" data-size="${l.size}">
                        <a class="cart-row-img" href="product.html?id=${l.product.id}"><img src="${l.product.image}" alt="${l.product.name}"></a>
                        <div class="cart-row-info">
                            <a class="cart-row-name" href="product.html?id=${l.product.id}">${l.product.name}</a>
                            <div class="cart-row-price">${Utils.formatPrice(l.product.price)}</div>
                            <div class="cart-row-size">${l.size}</div>
                            <div class="cart-qty">
                                <button type="button" onclick="cart.stepQty(this, -1)">−</button>
                                <input type="number" min="1" value="${l.qty}" oninput="cart.markDirty()">
                                <button type="button" onclick="cart.stepQty(this, 1)">+</button>
                            </div>
                            <a href="javascript:void(0)" class="cart-row-remove" onclick="cart.remove(${l.product.id}, '${l.size}')">Gỡ</a>
                        </div>
                        <div class="cart-row-total">${Utils.formatPrice(l.product.price * l.qty)}</div>
                    </div>`).join("")}
            </div>
            ${this.ordersHTML()}
            <div class="cart-bar">
                <div class="cart-bar-inner">
                    <a class="cart-btn" href="index.html">Tiếp tục mua hàng</a>
                    <div class="cart-bar-total">
                        <strong>Tổng đơn đặt hàng ${Utils.formatPrice(this.subtotal())}</strong>
                        <small>* Đã bao gồm thuế VAT</small>
                    </div>
                    <div class="cart-bar-actions">
                        <button class="cart-btn" id="cart-update-btn" onclick="cart.applyInputs()">Cập nhật giỏ hàng</button>
                        <button class="cart-btn cart-btn-dark" onclick="cart.checkout()">Thanh toán</button>
                    </div>
                </div>
            </div>`;
    }

    ordersHTML() {
        const list = auth.isLoggedIn() ? orders.all() : [];
        const recent = list.slice(0, 5);
        return `
            <section class="cart-orders">
                <div class="cart-orders-head">
                    <h2>Đơn hàng của bạn</h2>
                    <div class="cart-orders-links">
                        ${list.length > recent.length ? '<a href="account.html#orders">Xem tất cả đơn hàng</a>' : ""}
                        <a href="tracking.html">Tra cứu đơn hàng bằng mã đơn</a>
                    </div>
                </div>
                ${recent.length ? `
                <table class="tk-table">
                    <thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>${recent.map(o => `
                        <tr>
                            <td>${o.code}</td>
                            <td>${Utils.formatDateTime(o.createdAt)}</td>
                            <td>${orders.count(o)}</td>
                            <td>${Utils.formatPrice(orders.total(o))}</td>
                            <td>${orders.statusLabel(o)}</td>
                            <td><a href="tracking.html?code=${o.code}">Theo dõi đơn hàng</a></td>
                        </tr>`).join("")}
                    </tbody>
                </table>`
                : `<p class="cart-sub">${auth.isLoggedIn() ? "Bạn chưa có đơn hàng nào." : "Đăng nhập để xem các đơn đã đặt, hoặc tra cứu bằng mã đơn hàng."}</p>`}
            </section>`;
    }

    checkout() {
        if (!auth.requireLogin("Vui lòng đăng nhập để đặt hàng")) return;
        if (Utils.$("cart-page")) this.applyInputs(true);
        if (!this.lines().length) { Utils.showToast("Giỏ hàng của bạn đang trống!"); return; }
        location.href = "checkout.html";
    }
}

const cart = new Cart(products);
