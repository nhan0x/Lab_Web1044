// Header thu gọn khi cuộn và menu trượt bên trái.

class Header {
    // Lưu phần tử header, vị trí cuộn lần trước, rồi bắt đầu theo dõi việc cuộn trang.
    constructor() {
        this.el = Utils.$("main-header");
        this.lastScrollY = window.scrollY;
        this.scrollTicking = false;
        this.bindScroll();
    }

    // Theo dõi cuộn trang: cuộn xuống thì thu gọn header, cuộn lên hoặc ở sát đầu trang thì mở lại.
    // - scrollTicking + requestAnimationFrame: sự kiện scroll bắn rất dày, nên chỉ xử lý tối đa 1 lần mỗi khung hình cho mượt.
    // - delta = quãng vừa cuộn so với lần trước; chỉ phản ứng khi cuộn quá 6px để tránh giật khi cuộn nhẹ.
    bindScroll() {
        window.addEventListener("scroll", () => {
            if (this.scrollTicking) return;
            this.scrollTicking = true;
            requestAnimationFrame(() => {
                const y = Math.max(window.scrollY, 0);
                const delta = y - this.lastScrollY;
                if (y <= 40 || delta < -6) {
                    this.el.classList.remove("header-compact");
                    this.lastScrollY = y;
                } else if (delta > 6) {
                    this.el.classList.add("header-compact");
                    this.lastScrollY = y;
                }
                this.scrollTicking = false;
            });
        }, { passive: true });
    }

    // Mở / đóng menu trượt bên trái và lớp nền (toggle: đang có class thì gỡ, chưa có thì thêm).
    toggleMenu() {
        Utils.$("menu-drawer").classList.toggle("active");
        Utils.$("drawer-overlay").classList.toggle("active");
    }

    // Mở / đóng một mục con trong menu theo id.
    toggleSub(id) {
        const el = Utils.$(id);
        if (el) el.classList.toggle("open");
    }
}

const header = new Header();
