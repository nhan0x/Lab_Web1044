// Hàm tiện ích dùng chung: lấy phần tử, định dạng giá / ngày, thông báo toast, cuộn tới mục.

class Utils {
    static $(id) { return document.getElementById(id); }

    static setText(id, text) {
        const el = Utils.$(id);
        if (el) el.textContent = text;
    }

    static formatPrice(n) { return n.toLocaleString("vi-VN") + " VND"; }

    static getOriginalPrice(p) { return p.category === "sale" ? Math.round(p.price * 1.25) : 0; }

    static showToast(message) {
        const toast = Utils.$("toast");
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2200);
    }

    static escapeHTML(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    static formatDateTime(ts) {
        return new Date(ts).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
    }

    static scrollToSection(id) {
        const el = Utils.$(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    }
}
