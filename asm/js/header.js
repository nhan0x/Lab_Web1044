// Header thu gọn khi cuộn và menu trượt bên trái.

class Header {
    constructor() {
        this.el = Utils.$("main-header");
        this.lastScrollY = window.scrollY;
        this.scrollTicking = false;
        this.bindScroll();
    }

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

    toggleSub(id) {
        const el = Utils.$(id);
        if (el) el.classList.toggle("open");
    }
}

const header = new Header();
