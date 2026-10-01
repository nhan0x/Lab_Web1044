/* ===== YÊU THÍCH (WISHLIST) =====
   Việc: lưu danh sách id sản phẩm yêu thích vào localStorage (khóa "wishlist"), cập nhật số trên header.
   Dùng: Utils (utils.js); productList (product-list.js, chỉ dùng lúc người dùng bấm nên nạp sau cũng được). */

class Wishlist {
    constructor() {
        this.key = "wishlist";
    }

    get() {
        try { return JSON.parse(localStorage.getItem(this.key)) || []; }
        catch (e) { return []; }
    }

    has(id) { return this.get().includes(id); }

    updateBadge() {
        Utils.setText("wishlist-count", this.get().length);
    }

    // Bấm nút tim trên thẻ sản phẩm: thêm hoặc bỏ yêu thích rồi vẽ lại danh sách đang xem
    toggle(id, event) {
        event.stopPropagation();
        const list = this.get();
        const index = list.indexOf(id);
        if (index > -1) {
            list.splice(index, 1);
            Utils.showToast("Đã xóa khỏi danh sách yêu thích");
        } else {
            list.push(id);
            Utils.showToast("❤️ Đã lưu vào danh sách yêu thích");
        }
        localStorage.setItem(this.key, JSON.stringify(list));
        this.updateBadge();
        productList.render(productList.current);
    }

    // Bấm icon tim trên header: báo số sản phẩm đang yêu thích
    showCount() {
        Utils.showToast(`Danh sách yêu thích: ${this.get().length} sản phẩm`);
    }
}

const wishlist = new Wishlist();
