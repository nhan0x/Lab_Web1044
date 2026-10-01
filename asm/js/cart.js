/* ===== GIỎ HÀNG =====
   Việc: thêm / xóa / đổi số lượng, tính tổng tiền, lưu localStorage (khóa "cart") để tải lại trang không mất.
   Dùng: products (products.js); Utils (utils.js).
   Giao diện: id="cart-drawer", "cart-overlay", "cart-items", "cart-count", "cart-total-price" trong index.html. */

class Cart {
    constructor(allProducts) {
        this.products = allProducts;
        this.key = "cart";
    }

    get() {
        try { return JSON.parse(localStorage.getItem(this.key)) || []; }
        catch (e) { return []; }
    }

    save(items) {
        localStorage.setItem(this.key, JSON.stringify(items));
        this.render();
    }

    add(id) {
        const items = this.get();
        const item = items.find(x => x.id === id);
        if (item) item.qty += 1;
        else items.push({ id, qty: 1 });
        this.save(items);
        Utils.showToast("✓ Đã thêm sản phẩm vào giỏ hàng!");
    }

    remove(id) {
        this.save(this.get().filter(x => x.id !== id));
        Utils.showToast("Đã xóa sản phẩm khỏi giỏ hàng");
    }

    // delta = +1 hoặc -1; số lượng về 0 thì xóa khỏi giỏ
    changeQty(id, delta) {
        const items = this.get();
        const item = items.find(x => x.id === id);
        if (!item) return;
        item.qty += delta;
        this.save(item.qty <= 0 ? items.filter(x => x.id !== id) : items);
    }

    // Vẽ lại danh sách trong giỏ, tổng tiền và số lượng trên icon giỏ hàng
    render() {
        const items = this.get();
        Utils.setText("cart-count", items.reduce((sum, i) => sum + i.qty, 0));

        if (!items.length) {
            Utils.$("cart-items").innerHTML = '<div class="empty-hint" style="padding:40px 10px;">Giỏ hàng của bạn đang trống.<br>Hãy khám phá các sản phẩm mới của Luna nhé!</div>';
            Utils.setText("cart-total-price", Utils.formatPrice(0));
            return;
        }

        let total = 0;
        Utils.$("cart-items").innerHTML = items.map(item => {
            const p = this.products.find(x => x.id === item.id);
            if (!p) return "";
            total += p.price * item.qty;
            return `
                <div class="cart-item">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="cart-item-info">
                        <h4>${p.name}</h4>
                        <div class="cart-item-price">${Utils.formatPrice(p.price)}</div>
                        <div class="qty-control">
                            <button onclick="cart.changeQty(${p.id}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button onclick="cart.changeQty(${p.id}, 1)">+</button>
                            <button class="remove-item" onclick="cart.remove(${p.id})">Xóa</button>
                        </div>
                    </div>
                </div>`;
        }).join("");
        Utils.setText("cart-total-price", Utils.formatPrice(total));
    }

    open() {
        Utils.$("cart-drawer").classList.add("active");
        Utils.$("cart-overlay").classList.add("active");
    }

    close() {
        Utils.$("cart-drawer").classList.remove("active");
        Utils.$("cart-overlay").classList.remove("active");
    }

    checkout() {
        if (!this.get().length) { Utils.showToast("Giỏ hàng của bạn đang trống!"); return; }
        Utils.showToast("🎉 Đặt hàng thành công! Đơn hàng đang được chuẩn bị giao.");
        localStorage.removeItem(this.key);
        this.render();
        this.close();
    }
}

const cart = new Cart(products);
