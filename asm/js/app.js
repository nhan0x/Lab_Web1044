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
            if (e.key === "Escape") {
                accountModal.close();
            }
        });
    }

    // Hiển thị lần đầu
    renderFirstTime() {
        if (Utils.$("pd-page")) productDetail.render();
        else {
            productList.render(products);
            this.applyUrlFilter();
        }
        auth.refreshUI();
    }

    // Từ trang chi tiết quay về: index.html?cat=hot | ?sub=Áo | ?q=từ khóa
    applyUrlFilter() {
        const q = new URLSearchParams(location.search);
        if (q.get("cat")) productList.filterCategory(q.get("cat"));
        else if (q.get("sub")) productList.filterSubCategory(q.get("sub"));
        else if (q.get("q")) productList.search(q.get("q"));
    }
}

new App().init();
