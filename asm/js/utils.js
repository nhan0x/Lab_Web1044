/* ===== TIỆN ÍCH DÙNG CHUNG =====
   Việc: hàm nhỏ mà nhiều file khác cùng dùng (lấy phần tử, định dạng giá, thông báo, cuộn tới mục).
   Gọi dạng Utils.tenHam(...), không cần new.
   Nạp: phải nạp ĐẦU TIÊN (trước mọi file trừ products.js). */

class Utils {
    static $(id) { return document.getElementById(id); }

    static setText(id, text) {
        const el = Utils.$(id);
        if (el) el.textContent = text;
    }

    static formatPrice(n) { return n.toLocaleString("vi-VN") + " VND"; }

    static getOriginalPrice(p) { return p.category === "sale" ? Math.round(p.price * 1.25) : 0; }

    // Thông báo nhỏ hiện ở dưới màn hình trong 2,2 giây
    static showToast(message) {
        const toast = Utils.$("toast");
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2200);
    }

    static scrollToSection(id) {
        const el = Utils.$(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    }
}
