/* ===== HEADER & MENU TRƯỢT =====
   Việc: header thu gọn khi cuộn xuống / giãn ra khi cuộn lên; mở-đóng menu trượt bên trái.
   Dùng: Utils (utils.js). Giao diện: id="main-header", id="menu-drawer" trong index.html. */

class Header {
    constructor() {
        this.el = Utils.$("main-header");
        this.lastScrollY = window.scrollY;
        this.scrollTicking = false;
        this.bindScroll();
    }

    // Chỉ đổi trạng thái khi cuộn quá 6px (tránh nhấp nháy), gộp theo từng frame cho mượt
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

    toggleMenu() {
        Utils.$("menu-drawer").classList.toggle("active");
        Utils.$("drawer-overlay").classList.toggle("active");
    }

    // Mở-đóng nhóm menu con (Thời trang, Thời trang công sở, Sale...)
    toggleSub(id) {
        const el = Utils.$(id);
        if (el) el.classList.toggle("open");
    }
}

const header = new Header();
