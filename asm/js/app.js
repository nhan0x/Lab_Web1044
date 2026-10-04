// Khởi động ứng dụng khi trang tải xong (vẽ lần đầu, phím tắt chung) - phải nạp cuối cùng.
// Nạp cuối vì nó dùng auth, productList, productDetail... nên các file đó phải có sẵn trước.

class App {
    // Điểm vào: gắn phím tắt rồi vẽ giao diện lần đầu.
    init() {
        this.bindShortcuts();
        this.renderFirstTime();
    }

    // Phím tắt chung toàn site: nhấn Esc thì đóng khung đăng nhập.
    bindShortcuts() {
        document.addEventListener("keydown", e => {
            if (e.key === "Escape") {
                accountModal.close();
            }
        });
    }

    // Vẽ lần đầu tuỳ theo đang ở trang nào:
    //  - Trang chi tiết (có phần tử #pd-page): vẽ chi tiết sản phẩm.
    //  - Trang chủ: vẽ lưới sản phẩm, rồi áp dụng bộ lọc từ địa chỉ URL (nếu có).
    // Cuối cùng cập nhật header theo trạng thái đăng nhập (tên, số giỏ hàng, số yêu thích...).
    renderFirstTime() {
        if (Utils.$("pd-page")) productDetail.render();
        else {
            productList.render(products);
            this.applyUrlFilter();
        }
        auth.refreshUI();
    }

    // Đọc tham số trên URL để lọc sản phẩm: ?cat=... (nhóm), ?sub=... (loại), ?q=... (tìm kiếm).
    // Các trang khác chuyển về trang chủ kèm tham số này, trang chủ đọc ở đây để lọc.
    applyUrlFilter() {
        const q = new URLSearchParams(location.search);
        if (q.get("cat")) productList.filterCategory(q.get("cat"));
        else if (q.get("sub")) productList.filterSubCategory(q.get("sub"));
        else if (q.get("q")) productList.search(q.get("q"));
    }
}

new App().init();
