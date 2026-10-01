/* ===== CỬA SỔ TÀI KHOẢN =====
   Việc: mở-đóng cửa sổ đăng nhập (nút "Tài Khoản" trên header).
   Dùng: Utils (utils.js). Giao diện: id="account-modal" trong index.html.
   Kiểm tra dữ liệu của form trong cửa sổ này sẽ viết ở form.js. */

class AccountModal {
    open() { Utils.$("account-modal").classList.add("active"); }
    close() { Utils.$("account-modal").classList.remove("active"); }
    closeOnOverlay(e) { if (e.target.id === "account-modal") this.close(); }
}

const accountModal = new AccountModal();
