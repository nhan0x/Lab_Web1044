/* ===== KHỞI ĐỘNG ỨNG DỤNG =====
   Việc: nối các component lại với nhau khi trang tải xong (chạy lần đầu, phím tắt chung).
   Nạp: phải nạp CUỐI CÙNG (sau tất cả file khác). */

class App {
    init() {
        this.bindShortcuts();
        this.renderFirstTime();
    }

    // Phím Esc đóng mọi cửa sổ đang mở
    bindShortcuts() {
        document.addEventListener("keydown", e => {
            if (e.key === "Escape") { productModal.close(); accountModal.close(); }
        });
    }

    // Hiển thị lần đầu
    renderFirstTime() {
        productList.render(products);
        Utils.setText("product-counter", `Hiển thị ${products.length} sản phẩm`);
        cart.render();
        wishlist.updateBadge();
    }
}

new App().init();
