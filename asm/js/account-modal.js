/* ===== KHUNG TÀI KHOẢN (trượt từ bên phải, kiểu elise.vn) =====
   Việc: mở-đóng khung đăng nhập / đăng ký (nút "Tài Khoản" trên header) và chuyển qua lại giữa 2 màn.
   Dùng: Utils (utils.js). Giao diện: id="account-modal", "account-overlay",
         "pane-login", "pane-register" trong index.html / product.html / staff.html.
   Kiểm tra dữ liệu của các form trong khung này sẽ viết ở form.js
   (id form: "login-form", "register-form"). */

class AccountModal {
    open(tab = "login") {
        this.switchTab(tab);
        Utils.$("account-modal").classList.add("active");
        Utils.$("account-overlay").classList.add("active");
        document.body.style.overflow = "hidden";
    }

    close() {
        const drawer = Utils.$("account-modal");
        if (!drawer || !drawer.classList.contains("active")) return;
        drawer.classList.remove("active");
        Utils.$("account-overlay").classList.remove("active");
        document.body.style.overflow = "";
    }

    closeOnOverlay(e) { if (e.target.id === "account-overlay") this.close(); }

    // tab = "login" | "register"
    switchTab(tab) {
        ["login", "register"].forEach(name =>
            Utils.$("pane-" + name).classList.toggle("active", name === tab));
    }

    forgot() { Utils.showToast("Vui lòng liên hệ hotline 0900 000 001 để lấy lại mật khẩu"); }
}

const accountModal = new AccountModal();
