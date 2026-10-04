// Đăng ký, đăng nhập, đăng xuất, sửa thông tin tài khoản và chặn thao tác khi chưa đăng nhập.
// Dữ liệu lưu trong localStorage (chỉ lưu được chuỗi nên dùng JSON.stringify khi ghi, JSON.parse khi đọc):
//   "users"       : mảng toàn bộ tài khoản [{ name, email, phone, password }, ...]
//   "currentUser" : email của người đang đăng nhập (không có = chưa đăng nhập)

class Auth {
    // Đặt tên 2 key một lần ở đây để khỏi gõ tay chuỗi "users" nhiều nơi (gõ nhầm sẽ rất khó tìm lỗi).
    constructor() {
        this.usersKey = "users";
        this.sessionKey = "currentUser";
    }

    // Đọc danh sách tài khoản. Chưa có dữ liệu thì trả mảng rỗng; dữ liệu hỏng (JSON.parse lỗi) cũng trả mảng rỗng
    // để trang không bị sập.
    users() {
        try { return JSON.parse(localStorage.getItem(this.usersKey)) || []; }
        catch (e) { return []; }
    }

    // Lấy tài khoản đang đăng nhập: đọc email đã lưu, rồi tìm tài khoản có email đó trong danh sách.
    // Trả về null nếu chưa đăng nhập hoặc tài khoản không còn tồn tại.
    current() {
        const email = localStorage.getItem(this.sessionKey);
        if (!email) return null;
        const found = this.users().find(u => u.email === email);
        if (found) return found;
        return null;
    }

    // Đã đăng nhập chưa? (true / false)
    isLoggedIn() { return this.current() !== null; }

    // Tạo key lưu dữ liệu riêng cho từng tài khoản, ví dụ userKey("cart") -> "cart:an@x.com".
    // Nhờ vậy mỗi người có giỏ hàng / yêu thích riêng. Chưa đăng nhập thì trả null.
    userKey(base) {
        const u = this.current();
        if (u) return base + ":" + u.email;
        return null;
    }

    // "Người gác cổng" cho các thao tác cần đăng nhập (thêm giỏ, yêu thích, đặt hàng...).
    // Đã đăng nhập: trả true cho đi tiếp. Chưa: hiện thông báo, mở khung đăng nhập và trả false để nơi gọi dừng lại.
    requireLogin(message = "Vui lòng đăng nhập để thực hiện thao tác này") {
        if (this.isLoggedIn()) return true;
        Utils.showToast(message);
        accountModal.open("login");
        return false;
    }

    // Kiểm tra định dạng email bằng regex: có dạng "chữ@chữ.chữ", không có khoảng trắng.
    // static vì không cần dữ liệu của đối tượng, gọi là Auth.isEmail(x).
    static isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    // Kiểm tra số điện thoại: bắt đầu bằng 0 hoặc +84, theo sau đúng 9 chữ số.
    static isPhone(v) { return /^(0|\+84)\d{9}$/.test(v); }

    // Xử lý form đăng ký (gắn ở onsubmit của form).
    // 1) Chặn trình duyệt tải lại trang  2) Đọc các ô theo thuộc tính name bằng FormData
    // 3) Kiểm tra từng điều kiện, sai chỗ nào thì báo và dừng (return)  4) Kiểm tra trùng email / số điện thoại
    // 5) Hợp lệ thì thêm vào danh sách, lưu lại, xoá form và đăng nhập luôn.
    register(e) {
        e.preventDefault();
        const d = new FormData(e.target);
        const name = d.get("name").trim();
        const email = d.get("email").trim().toLowerCase();
        const phone = d.get("phone").trim();
        const password = d.get("password");

        if (!name) return Utils.showToast("Vui lòng nhập họ và tên");
        if (!Auth.isEmail(email)) return Utils.showToast("Email không hợp lệ");
        if (!Auth.isPhone(phone)) return Utils.showToast("Số điện thoại gồm 10 số, bắt đầu bằng 0 hoặc +84");
        if (password.length < 6) return Utils.showToast("Mật khẩu tối thiểu 6 ký tự");
        if (password !== d.get("confirm")) return Utils.showToast("Mật khẩu nhập lại không khớp");

        const list = this.users();
        if (list.some(u => u.email === email)) return Utils.showToast("Email này đã được đăng ký");
        if (list.some(u => u.phone === phone)) return Utils.showToast("Số điện thoại này đã được đăng ký");

        list.push({ name, email, phone, password });
        localStorage.setItem(this.usersKey, JSON.stringify(list));
        e.target.reset();
        this.startSession(email, `Đăng ký thành công! Chào ${name}`);
    }

    // Xử lý form đăng nhập: ô "identity" có thể là email hoặc số điện thoại.
    // Tìm tài khoản khớp rồi so mật khẩu; sai thì báo chung một câu (không nói rõ sai tài khoản hay mật khẩu).
    // Đúng thì xoá form và bắt đầu phiên đăng nhập.
    login(e) {
        e.preventDefault();
        const d = new FormData(e.target);
        const id = d.get("identity").trim().toLowerCase();
        const user = this.users().find(u => u.email === id || u.phone === id);
        if (!user || user.password !== d.get("password")) return Utils.showToast("Sai tài khoản hoặc mật khẩu");
        e.target.reset();
        this.startSession(user.email, `Đăng nhập thành công! Chào ${user.name}`);
    }

    // Đăng xuất: chỉ xoá "ai đang đăng nhập", không xoá tài khoản hay giỏ hàng (lần sau đăng nhập lại vẫn còn).
    logout() {
        localStorage.removeItem(this.sessionKey);
        this.refreshUI();
        Utils.showToast("Đã đăng xuất");
    }

    // Bắt đầu phiên đăng nhập (dùng chung cho đăng ký và đăng nhập): ghi nhớ email, đóng khung, cập nhật giao diện, báo thành công.
    startSession(email, message) {
        localStorage.setItem(this.sessionKey, email);
        accountModal.close();
        this.refreshUI();
        Utils.showToast(message);
    }

    // Bấm nút "Tài Khoản" ở header: chưa đăng nhập thì mở khung đăng nhập, đã đăng nhập thì sang trang tài khoản.
    onAccountClick() {
        if (!this.current()) { accountModal.open("login"); return; }
        location.href = "account.html";
    }

    // Cập nhật thông tin tài khoản đang đăng nhập; changes chỉ cần chứa các trường muốn đổi, ví dụ { phone: "09..." }.
    // Toán tử "..." trộn các trường mới đè lên các trường cũ.
    // Nếu đổi email thì phải chuyển theo những thứ đang gắn với email cũ: giỏ hàng, yêu thích, chủ sở hữu đơn hàng,
    // và email lưu trong phiên đăng nhập (nếu không sẽ bị coi như đã đăng xuất).
    updateUser(changes) {
        const u = this.current();
        if (!u) return false;
        const list = this.users();
        const i = list.findIndex(x => x.email === u.email);
        const oldEmail = u.email;
        list[i] = { ...list[i], ...changes };
        localStorage.setItem(this.usersKey, JSON.stringify(list));
        if (changes.email && changes.email !== oldEmail) {
            // Đổi tên key "cart:emailCũ" thành "cart:emailMới" (tương tự cho wishlist)
            ["cart", "wishlist"].forEach(base => {
                const data = localStorage.getItem(base + ":" + oldEmail);
                if (data !== null) {
                    localStorage.setItem(base + ":" + changes.email, data);
                    localStorage.removeItem(base + ":" + oldEmail);
                }
            });
            // Đơn hàng nào của email cũ thì chuyển sang email mới, đơn của người khác giữ nguyên
            orders.saveAll(orders.raw().map(o => {
                if (o.owner === oldEmail) return { ...o, owner: changes.email };
                return o;
            }));
            localStorage.setItem(this.sessionKey, changes.email);
        }
        this.refreshUI();
        return true;
    }

    // Làm mới toàn bộ giao diện theo trạng thái đăng nhập hiện tại: đổi chữ nút tài khoản (hiện từ cuối của tên),
    // bật/tắt class "logged-in", vẽ lại giỏ hàng, số yêu thích, lưới sản phẩm,
    // rồi phát tín hiệu "authchange" để các trang khác tự cập nhật (auth.js không cần biết chúng là ai).
    refreshUI() {
        const u = this.current();
        if (u) Utils.setText("account-label", u.name.split(" ").pop());
        else Utils.setText("account-label", "Tài Khoản");
        const box = document.querySelector(".header-account");
        if (box) box.classList.toggle("logged-in", !!u);
        cart.render();
        wishlist.updateBadge();
        productList.render(productList.current);
        window.dispatchEvent(new Event("authchange"));
    }
}

const auth = new Auth();

// Sự kiện "storage" chỉ bắn ở CÁC TAB KHÁC khi localStorage đổi. Ví dụ đăng xuất ở tab A thì tab B tự cập nhật theo.
window.addEventListener("storage", e => {
    if (e.key === auth.sessionKey) auth.refreshUI();
});
