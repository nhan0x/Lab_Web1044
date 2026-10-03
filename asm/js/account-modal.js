// Khung đăng nhập / tạo tài khoản trượt từ bên phải: mở, đóng và chuyển giữa 2 màn.

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

    switchTab(tab) {
        ["login", "register"].forEach(name =>
            Utils.$("pane-" + name).classList.toggle("active", name === tab));
    }

    forgot() { Utils.showToast("Vui lòng liên hệ hotline 0900 000 001 để lấy lại mật khẩu"); }
}

const accountModal = new AccountModal();
