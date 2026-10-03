// Đăng ký, đăng nhập, đăng xuất, sửa thông tin tài khoản và chặn thao tác khi chưa đăng nhập.

class Auth {
    constructor() {
        this.usersKey = "users";
        this.sessionKey = "currentUser";
    }

    users() {
        try { return JSON.parse(localStorage.getItem(this.usersKey)) || []; }
        catch (e) { return []; }
    }

    current() {
        const email = localStorage.getItem(this.sessionKey);
        return email ? this.users().find(u => u.email === email) || null : null;
    }

    isLoggedIn() { return this.current() !== null; }

    userKey(base) {
        const u = this.current();
        return u ? base + ":" + u.email : null;
    }

    requireLogin(message = "Vui lòng đăng nhập để thực hiện thao tác này") {
        if (this.isLoggedIn()) return true;
        Utils.showToast(message);
        accountModal.open("login");
        return false;
    }

    static isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    static isPhone(v) { return /^(0|\+84)\d{9}$/.test(v); }

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

    login(e) {
        e.preventDefault();
        const d = new FormData(e.target);
        const id = d.get("identity").trim().toLowerCase();
        const user = this.users().find(u => u.email === id || u.phone === id);
        if (!user || user.password !== d.get("password")) return Utils.showToast("Sai tài khoản hoặc mật khẩu");
        e.target.reset();
        this.startSession(user.email, `Đăng nhập thành công! Chào ${user.name}`);
    }

    logout() {
        localStorage.removeItem(this.sessionKey);
        this.refreshUI();
        Utils.showToast("Đã đăng xuất");
    }

    startSession(email, message) {
        localStorage.setItem(this.sessionKey, email);
        accountModal.close();
        this.refreshUI();
        Utils.showToast(message);
    }

    onAccountClick() {
        if (!this.current()) { accountModal.open("login"); return; }
        location.href = "account.html";
    }

    updateUser(changes) {
        const u = this.current();
        if (!u) return false;
        const list = this.users();
        const i = list.findIndex(x => x.email === u.email);
        const oldEmail = u.email;
        list[i] = { ...list[i], ...changes };
        localStorage.setItem(this.usersKey, JSON.stringify(list));
        if (changes.email && changes.email !== oldEmail) {
            ["cart", "wishlist"].forEach(base => {
                const data = localStorage.getItem(base + ":" + oldEmail);
                if (data !== null) {
                    localStorage.setItem(base + ":" + changes.email, data);
                    localStorage.removeItem(base + ":" + oldEmail);
                }
            });
            orders.saveAll(orders.raw().map(o => o.owner === oldEmail ? { ...o, owner: changes.email } : o));
            localStorage.setItem(this.sessionKey, changes.email);
        }
        this.refreshUI();
        return true;
    }

    refreshUI() {
        const u = this.current();
        Utils.setText("account-label", u ? u.name.split(" ").pop() : "Tài Khoản");
        const box = document.querySelector(".header-account");
        if (box) box.classList.toggle("logged-in", !!u);
        cart.render();
        wishlist.updateBadge();
        productList.render(productList.current);
        window.dispatchEvent(new Event("authchange"));
    }
}

const auth = new Auth();

window.addEventListener("storage", e => {
    if (e.key === auth.sessionKey) auth.refreshUI();
});
