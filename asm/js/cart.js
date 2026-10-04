// Giỏ hàng: thêm / gỡ / đổi số lượng theo size, lưu theo tài khoản và vẽ trang cart.html.

class Cart {
    // Nhận danh sách sản phẩm (từ products.js) để tra thông tin theo id. Size mặc định là "M".
    // Giỏ hàng chỉ lưu { id, size, qty }, còn tên / giá / ảnh được tra lại từ danh sách sản phẩm khi vẽ.
    constructor(allProducts) {
        this.products = allProducts;
        this.defaultSize = "M";
    }

    // Key lưu giỏ trong localStorage, riêng cho từng tài khoản ("cart:email"). Chưa đăng nhập thì là null.
    key() { return auth.userKey("cart"); }

    // Đọc giỏ hàng của người đang đăng nhập (mảng các dòng). Chưa đăng nhập hoặc dữ liệu hỏng thì trả mảng rỗng.
    // Dòng nào thiếu size thì gán size mặc định.
    get() {
        if (!this.key()) return [];
        try {
            const items = JSON.parse(localStorage.getItem(this.key())) || [];
            return items.map(i => ({ ...i, size: i.size || this.defaultSize }));
        } catch (e) { return []; }
    }

    // Ghi giỏ hàng xuống localStorage rồi vẽ lại (cập nhật số lượng trên header và trang giỏ).
    save(items) {
        if (!this.key()) return;
        localStorage.setItem(this.key(), JSON.stringify(items));
        this.render();
    }

    // Hai dòng giỏ là "cùng một món" khi cùng id sản phẩm VÀ cùng size (áo M và áo L là hai dòng khác nhau).
    same(a, id, size) { return a.id === id && a.size === size; }

    // Thêm sản phẩm vào giỏ. Phải đăng nhập (requireLogin). Đã có đúng món đó (cùng id + size) thì cộng dồn số lượng,
    // chưa có thì thêm dòng mới. Trả true nếu thêm được, false nếu bị chặn do chưa đăng nhập.
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

    // Gỡ một dòng khỏi giỏ: giữ lại mọi dòng KHÁC với dòng (id, size) này, rồi lưu.
    remove(id, size) {
        if (!auth.requireLogin()) return;
        this.save(this.get().filter(x => !this.same(x, id, size)));
        Utils.showToast("Đã gỡ sản phẩm khỏi giỏ hàng");
    }

    // Bấm nút − / + cạnh ô số lượng: delta là -1 hoặc +1. Số lượng không bao giờ nhỏ hơn 1,
    // nhập chữ hay để trống thì coi là 1. Chỉ đổi trên màn hình, chưa lưu cho tới khi bấm "Cập nhật giỏ hàng".
    stepQty(btn, delta) {
        const input = btn.parentNode.querySelector("input");
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
        this.markDirty();
    }

    // Đánh dấu "có thay đổi chưa lưu": thêm class "dirty" để CSS làm nổi nút "Cập nhật giỏ hàng".
    markDirty() { Utils.$("cart-update-btn").classList.add("dirty"); }

    // Đọc số lượng người dùng đã sửa trong từng dòng trên trang giỏ rồi lưu lại. Trả true nếu có gì thay đổi.
    // silent = true thì không hiện thông báo (dùng khi tự gọi lúc bấm Thanh toán).
    applyInputs(silent) {
        const items = this.get();
        let changed = false;
        document.querySelectorAll(".cart-row").forEach(row => {
            const item = items.find(x => this.same(x, +row.dataset.id, row.dataset.size));
            const qty = Math.max(1, parseInt(row.querySelector("input").value, 10) || 1);
            if (item && item.qty !== qty) { item.qty = qty; changed = true; }
        });
        if (changed) this.save(items);
        if (!silent) {
            if (changed) Utils.showToast("Đã cập nhật giỏ hàng");
            else Utils.showToast("Giỏ hàng không có thay đổi");
        }
        return changed;
    }

    // Ghép mỗi dòng giỏ với thông tin sản phẩm đầy đủ (tên, giá, ảnh...) để vẽ.
    // Dòng nào có sản phẩm không còn tồn tại thì bị lọc bỏ.
    lines() {
        return this.get()
            .map(i => ({ product: this.products.find(p => p.id === i.id), size: i.size, qty: i.qty }))
            .filter(l => l.product);
    }

    // Tổng số món trong giỏ (cộng số lượng của mọi dòng) - con số hiện trên biểu tượng giỏ ở header.
    count() { return this.get().reduce((sum, i) => sum + i.qty, 0); }

    // Tổng tiền hàng = cộng (giá x số lượng) của từng dòng, chưa tính phí vận chuyển.
    subtotal() { return this.lines().reduce((s, l) => s + l.product.price * l.qty, 0); }

    // Xoá sạch giỏ (gọi sau khi đặt hàng thành công).
    clear() {
        if (!this.key()) return;
        localStorage.removeItem(this.key());
        this.render();
    }

    // Chuyển sang trang giỏ hàng.
    open() { location.href = "cart.html"; }

    // Cập nhật số trên header; nếu đang ở trang giỏ hàng (có #cart-page) thì vẽ lại cả trang.
    render() {
        Utils.setText("cart-count", this.count());
        if (Utils.$("cart-page")) this.renderPage();
    }

    // Vẽ trang giỏ hàng, có 3 trường hợp (mỗi trường hợp vẽ xong là return):
    //  1) Chưa đăng nhập: mời đăng nhập.  2) Giỏ trống: mời tiếp tục mua.  3) Có hàng: danh sách dòng + thanh tổng tiền.
    // Danh sách đơn hàng đã đặt (ordersHTML) luôn hiện ở cả 3 trường hợp.
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

    // Tạo HTML khối "Đơn hàng của bạn": tối đa 5 đơn gần nhất (kèm link "Xem tất cả" nếu còn nhiều hơn).
    // Không có đơn thì hiện câu thông báo phù hợp với việc đã đăng nhập hay chưa.
    ordersHTML() {
        let list = [];
        if (auth.isLoggedIn()) list = orders.all();
        const recent = list.slice(0, 5);

        let allOrdersLink = "";
        if (list.length > recent.length) allOrdersLink = '<a href="account.html#orders">Xem tất cả đơn hàng</a>';

        let ordersBody = "";
        if (recent.length) {
            ordersBody = `
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
                </table>`;
        } else {
            let emptyText = "Đăng nhập để xem các đơn đã đặt, hoặc tra cứu bằng mã đơn hàng.";
            if (auth.isLoggedIn()) emptyText = "Bạn chưa có đơn hàng nào.";
            ordersBody = `<p class="cart-sub">${emptyText}</p>`;
        }

        return `
            <section class="cart-orders">
                <div class="cart-orders-head">
                    <h2>Đơn hàng của bạn</h2>
                    <div class="cart-orders-links">
                        ${allOrdersLink}
                        <a href="tracking.html">Tra cứu đơn hàng bằng mã đơn</a>
                    </div>
                </div>
                ${ordersBody}
            </section>`;
    }

    // Bấm "Thanh toán": phải đăng nhập, lưu lại số lượng vừa sửa (nếu đang ở trang giỏ), giỏ trống thì báo,
    // ngược lại chuyển sang trang thanh toán.
    checkout() {
        if (!auth.requireLogin("Vui lòng đăng nhập để đặt hàng")) return;
        if (Utils.$("cart-page")) this.applyInputs(true);
        if (!this.lines().length) { Utils.showToast("Giỏ hàng của bạn đang trống!"); return; }
        location.href = "checkout.html";
    }
}

// Một đối tượng giỏ hàng dùng chung cho cả site.
const cart = new Cart(products);
