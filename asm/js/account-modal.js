// Khung đăng nhập / tạo tài khoản trượt từ bên phải: mở, đóng và chuyển giữa 2 màn.
// JS chỉ thêm / gỡ class "active"; hiệu ứng trượt do CSS đảm nhiệm.

class AccountModal {
    // Mở khung: chọn màn đăng nhập hay đăng ký, hiện khung + lớp nền tối, khoá cuộn trang phía sau.
    open(tab = "login") {
        this.switchTab(tab);
        Utils.$("account-modal").classList.add("active");
        Utils.$("account-overlay").classList.add("active");
        document.body.style.overflow = "hidden";
    }

    // Đóng khung: làm ngược lại open(). Nếu khung không tồn tại hoặc đang đóng thì thoát luôn.
    close() {
        const drawer = Utils.$("account-modal");
        if (!drawer || !drawer.classList.contains("active")) return;
        drawer.classList.remove("active");
        Utils.$("account-overlay").classList.remove("active");
        document.body.style.overflow = "";
    }

    // Bấm vào vùng nền tối thì đóng. Kiểm tra e.target để chỉ đóng khi đúng là bấm lên nền,
    // không đóng khi bấm bên trong khung (sự kiện click nổi bọt lên từ phần tử con).
    closeOnOverlay(e) { if (e.target.id === "account-overlay") this.close(); }

    // Chuyển giữa màn "login" và "register": bật active cho màn trùng tên, tắt màn còn lại.
    switchTab(tab) {
        ["login", "register"].forEach(name =>
            Utils.$("pane-" + name).classList.toggle("active", name === tab));
    }

    // Bấm "Quên mật khẩu?": chỉ hiện thông báo hướng dẫn gọi hotline (chưa có chức năng khôi phục thật).
    forgot() { Utils.showToast("Vui lòng liên hệ hotline 0900 000 001 để lấy lại mật khẩu"); }
}

const accountModal = new AccountModal();
