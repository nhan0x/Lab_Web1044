// Khởi động ứng dụng khi trang tải xong (vẽ lần đầu, phím tắt chung) - phải nạp cuối cùng.

class App {
    init() {
        this.bindShortcuts();
        this.renderFirstTime();
    }

    bindShortcuts() {
        document.addEventListener("keydown", e => {
            if (e.key === "Escape") {
                accountModal.close();
            }
        });
    }

    renderFirstTime() {
        if (Utils.$("pd-page")) productDetail.render();
        else {
            productList.render(products);
            this.applyUrlFilter();
        }
        auth.refreshUI();
    }

    applyUrlFilter() {
        const q = new URLSearchParams(location.search);
        if (q.get("cat")) productList.filterCategory(q.get("cat"));
        else if (q.get("sub")) productList.filterSubCategory(q.get("sub"));
        else if (q.get("q")) productList.search(q.get("q"));
    }
}

new App().init();
