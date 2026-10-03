// Trang tài khoản (account.html): tổng quan, đơn hàng và đổi trả, sổ địa chỉ, thông tin cá nhân, thông tin truy cập, bản tin.

const ACCOUNT_SECTIONS = [
    { id: "",           label: "Tài khoản" },
    { id: "orders",     label: "Đơn hàng và đổi trả",
      desc: "Vui lòng kiểm tra trạng thái và thông tin liên quan đến đơn đặt hàng trực tuyến của bạn. Bạn có thể hủy đơn hàng hoặc yêu cầu hoàn lại tiền." },
    { id: "address",    label: "Sổ địa chỉ",
      desc: "Sổ địa chỉ có thể lưu trữ nhiều thông tin địa chỉ (nhà, văn phòng của bạn, nơi ở của gia đình bạn, v.v.). Lưu địa chỉ tại đây giúp bạn dễ dàng chọn nơi nhận hàng khi thanh toán thay vì nhập thông tin địa chỉ giao hàng." },
    { id: "info",       label: "Thông tin cá nhân",
      desc: "Bạn có thể truy cập và sửa đổi thông tin cá nhân (tên, địa chỉ thanh toán, số điện thoại, v.v.). Điều này thuận lợi cho quá trình mua hàng trực tuyến trong tương lai." },
    { id: "access",     label: "Thông tin truy cập",
      desc: "Bạn có thể thay đổi thông tin truy cập của bạn (e-mail và mật khẩu). Để bảo mật thông tin cá nhân, bạn nên sử dụng một mật khẩu an toàn và thay đổi khi cần thiết." },
    { id: "newsletter", label: "Bản tin",
      desc: "Thiết lập các bản tin bạn muốn nhận trong tài khoản email của bạn." }
];

class AccountPage {
    constructor(root) {
        this.root = root;
        this.menuOpen = false;
        this.editing = null;
        window.addEventListener("hashchange", () => { this.editing = null; this.render(); });
        window.addEventListener("authchange", () => this.render());
    }

    section() {
        const id = location.hash.replace("#", "");
        return ACCOUNT_SECTIONS.some(s => s.id === id) ? id : "";
    }

    render() {
        const u = auth.current();
        if (!u) {
            this.root.innerHTML = `
                <div class="ac-guest">
                    <h1 class="ac-title">Tài khoản</h1>
                    <p class="ac-desc">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
                    <div class="co-actions">
                        <button class="cart-btn cart-btn-dark" onclick="accountModal.open('login')">Đăng nhập</button>
                        <button class="cart-btn" onclick="accountModal.open('register')">Tạo tài khoản</button>
                    </div>
                </div>`;
            return;
        }
        const current = this.section();
        const body = {
            "": this.dashboard, orders: this.ordersView, address: this.addressView,
            info: this.infoView, access: this.accessView, newsletter: this.newsletterView
        }[current].call(this, u);
        document.title = (ACCOUNT_SECTIONS.find(s => s.id === current).label) + " | Luna";
        this.root.innerHTML = `
            <aside class="ac-side">
                <button type="button" class="ac-menu-toggle" onclick="accountPage.toggleMenu()">Menu <span>${this.menuOpen ? "−" : "+"}</span></button>
                <ul class="ac-menu${this.menuOpen ? " open" : ""}">
                    ${ACCOUNT_SECTIONS.map(s => `
                        <li class="${s.id === current ? "active" : ""}"><a href="#${s.id}">${s.label}</a></li>`).join("")}
                </ul>
            </aside>
            <section class="ac-main">${body}</section>`;
    }

    toggleMenu() { this.menuOpen = !this.menuOpen; this.render(); }

    dashboard() {
        return `
            <h1 class="ac-title">Tài khoản</h1>
            ${ACCOUNT_SECTIONS.slice(1).map(s => `
                <div class="ac-block">
                    <h2 class="ac-block-title"><a href="#${s.id}">${s.label}</a></h2>
                    <p class="ac-desc">${s.desc}</p>
                </div>`).join("")}
            <button class="cart-btn cart-btn-dark ac-logout" onclick="auth.logout()">Đăng xuất</button>`;
    }

    ordersView() {
        const list = orders.all();
        const status = o => orders.statusLabel(o);
        return `
            <h1 class="ac-title">Đơn hàng và đổi trả</h1>
            ${list.length ? `
            <table class="tk-table ac-orders">
                <thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Giao đến</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
                <tbody>${list.map(o => `
                    <tr>
                        <td>${o.code}</td>
                        <td>${Utils.formatDateTime(o.createdAt)}</td>
                        <td>${Utils.escapeHTML(o.customer.name)}</td>
                        <td>${Utils.formatPrice(orders.total(o))}</td>
                        <td>${status(o)}</td>
                        <td class="ac-order-actions">
                            <a href="tracking.html?code=${o.code}">Xem đơn hàng</a>
                            ${orders.canCancel(o) ? `<a href="javascript:void(0)" onclick="accountPage.cancelOrder('${o.code}')">Hủy đơn</a>` : ""}
                        </td>
                    </tr>`).join("")}
                </tbody>
            </table>
            <p class="ac-note">Đơn hàng chỉ hủy được khi chưa được đóng gói. Muốn đổi trả sản phẩm đã nhận, vui lòng gọi hotline ${SHIPPING.hotline} trong vòng 7 ngày.</p>`
            : `<p class="ac-desc">Bạn chưa có đơn hàng nào.</p>
               <a class="cart-btn cart-btn-dark" href="index.html">Mua sắm ngay</a>`}`;
    }

    cancelOrder(code) {
        if (!confirm(`Bạn chắc chắn muốn hủy đơn hàng ${code}?`)) return;
        Utils.showToast(orders.cancel(code) ? `Đã hủy đơn hàng ${code}` : "Đơn hàng này không thể hủy");
        this.render();
    }

    addresses(u) { return u.addresses || []; }

    addressView(u) {
        const list = this.addresses(u);
        if (this.editing) return this.addressForm(list.find(a => a.id === this.editing) || null);
        return `
            <h1 class="ac-title">Sổ địa chỉ</h1>
            <p class="ac-desc">Địa chỉ mặc định sẽ được điền sẵn khi bạn thanh toán.</p>
            ${list.length ? `<div class="ac-addresses">${list.map(a => `
                <div class="ac-address${a.isDefault ? " default" : ""}">
                    ${a.isDefault ? '<span class="ac-badge">Mặc định</span>' : ""}
                    <p><strong>${Utils.escapeHTML(a.name)}</strong></p>
                    <p>${Utils.escapeHTML([a.address, a.ward, a.district, a.province].filter(Boolean).join(", "))}</p>
                    <p>Điện thoại: ${Utils.escapeHTML(a.phone)}</p>
                    <div class="ac-address-actions">
                        <a href="javascript:void(0)" onclick="accountPage.editAddress('${a.id}')">Sửa</a>
                        ${a.isDefault ? "" : `<a href="javascript:void(0)" onclick="accountPage.setDefault('${a.id}')">Đặt làm mặc định</a>`}
                        <a href="javascript:void(0)" onclick="accountPage.deleteAddress('${a.id}')">Xóa</a>
                    </div>
                </div>`).join("")}</div>` : `<p class="ac-desc">Bạn chưa lưu địa chỉ nào.</p>`}
            <button class="cart-btn cart-btn-dark" onclick="accountPage.editAddress('new')">Thêm địa chỉ mới</button>`;
    }

    addressForm(a) {
        const u = auth.current();
        const v = k => Utils.escapeHTML((a && a[k]) || "");
        const field = (name, label, req, input) => `
            <div class="co-field">
                <label>${label}${req ? ' <span class="req">*</span>' : ""}</label>
                ${input || `<input type="text" name="${name}" value="${v(name)}">`}
                <small class="co-error"></small>
            </div>`;
        return `
            <h1 class="ac-title">${a ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h1>
            <form class="co-form" onsubmit="accountPage.saveAddress(event)" novalidate>
                <div class="co-grid">
                    ${field("name", "Họ và tên", true, `<input type="text" name="name" value="${a ? v("name") : Utils.escapeHTML(u.name)}">`)}
                    ${field("phone", "Điện thoại", true, `<input type="tel" name="phone" value="${a ? v("phone") : Utils.escapeHTML(u.phone)}">`)}
                    ${field("province", "Tỉnh/Thành Phố", true, `
                        <select name="province">
                            <option value="">Vui Lòng Chọn Tỉnh/Thành Phố</option>
                            ${PROVINCES.map(p => `<option${a && p === a.province ? " selected" : ""}>${p}</option>`).join("")}
                        </select>`)}
                    ${field("district", "Quận/Huyện", false)}
                    ${field("ward", "Phường/Xã", false)}
                    ${field("address", "Địa chỉ", true)}
                </div>
                <label class="ac-check"><input type="checkbox" name="isDefault"${!a || a.isDefault ? " checked" : ""}> Đặt làm địa chỉ mặc định</label>
                <div class="co-actions">
                    <button type="submit" class="cart-btn cart-btn-dark">Lưu địa chỉ</button>
                    <button type="button" class="cart-btn" onclick="accountPage.editAddress(null)">Hủy</button>
                </div>
            </form>`;
    }

    editAddress(id) { this.editing = id; this.render(); window.scrollTo({ top: 0 }); }

    saveAddress(e) {
        e.preventDefault();
        const f = e.target.elements;
        const val = n => f[n].value.trim();
        const ok = [
            this.check(f.name, val("name") ? "" : "Đây là trường bắt buộc"),
            this.check(f.phone, !val("phone") ? "Đây là trường bắt buộc" : Auth.isPhone(val("phone")) ? "" : "Số điện thoại gồm 10 số, bắt đầu bằng 0 hoặc +84"),
            this.check(f.province, val("province") ? "" : "Đây là trường bắt buộc"),
            this.check(f.address, val("address") ? "" : "Đây là trường bắt buộc")
        ];
        if (ok.includes(false)) return;
        let list = this.addresses(auth.current()).slice();
        const data = {
            name: val("name"), phone: val("phone"), province: val("province"),
            district: val("district"), ward: val("ward"), address: val("address"), isDefault: f.isDefault.checked || !list.length
        };
        if (this.editing === "new") list.push({ id: "a" + Date.now(), ...data });
        else list = list.map(a => a.id === this.editing ? { ...a, ...data } : a);
        const savedId = this.editing === "new" ? list[list.length - 1].id : this.editing;
        if (data.isDefault) list = list.map(a => ({ ...a, isDefault: a.id === savedId }));
        if (!list.some(a => a.isDefault)) list[0].isDefault = true;
        this.editing = null;
        auth.updateUser({ addresses: list });
        Utils.showToast("Đã lưu địa chỉ");
    }

    setDefault(id) {
        auth.updateUser({ addresses: this.addresses(auth.current()).map(a => ({ ...a, isDefault: a.id === id })) });
        Utils.showToast("Đã đổi địa chỉ mặc định");
    }

    deleteAddress(id) {
        if (!confirm("Xóa địa chỉ này?")) return;
        const list = this.addresses(auth.current()).filter(a => a.id !== id);
        if (list.length && !list.some(a => a.isDefault)) list[0].isDefault = true;
        auth.updateUser({ addresses: list });
        Utils.showToast("Đã xóa địa chỉ");
    }

    infoView(u) {
        return `
            <h1 class="ac-title">Thông tin cá nhân</h1>
            <form class="co-form ac-form" onsubmit="accountPage.saveInfo(event)" novalidate>
                <div class="co-field">
                    <label>Họ và tên <span class="req">*</span></label>
                    <input type="text" name="name" value="${Utils.escapeHTML(u.name)}">
                    <small class="co-error"></small>
                </div>
                <div class="co-field">
                    <label>Số điện thoại <span class="req">*</span></label>
                    <input type="tel" name="phone" value="${Utils.escapeHTML(u.phone)}">
                    <small class="co-error"></small>
                </div>
                <div class="co-field">
                    <label>Email</label>
                    <input type="email" value="${Utils.escapeHTML(u.email)}" disabled>
                    <small class="ac-field-hint">Đổi email tại mục <a href="#access">Thông tin truy cập</a>.</small>
                </div>
                <div class="co-actions"><button type="submit" class="cart-btn cart-btn-dark">Lưu thông tin</button></div>
            </form>`;
    }

    saveInfo(e) {
        e.preventDefault();
        const f = e.target.elements;
        const name = f.name.value.trim(), phone = f.phone.value.trim();
        const u = auth.current();
        const taken = auth.users().some(x => x.phone === phone && x.email !== u.email);
        const ok = [
            this.check(f.name, name ? "" : "Đây là trường bắt buộc"),
            this.check(f.phone, !phone ? "Đây là trường bắt buộc"
                : !Auth.isPhone(phone) ? "Số điện thoại gồm 10 số, bắt đầu bằng 0 hoặc +84"
                : taken ? "Số điện thoại này đã được tài khoản khác sử dụng" : "")
        ];
        if (ok.includes(false)) return;
        auth.updateUser({ name, phone });
        Utils.showToast("Đã lưu thông tin cá nhân");
    }

    accessView(u) {
        return `
            <h1 class="ac-title">Thông tin truy cập</h1>
            <form class="co-form ac-form" onsubmit="accountPage.saveAccess(event)" novalidate>
                <div class="co-field">
                    <label>Email <span class="req">*</span></label>
                    <input type="email" name="email" value="${Utils.escapeHTML(u.email)}">
                    <small class="co-error"></small>
                </div>
                <div class="co-field">
                    <label>Mật khẩu mới <small>(để trống nếu không đổi)</small></label>
                    <input type="password" name="password" autocomplete="new-password">
                    <small class="co-error"></small>
                </div>
                <div class="co-field">
                    <label>Nhập lại mật khẩu mới</label>
                    <input type="password" name="confirm" autocomplete="new-password">
                    <small class="co-error"></small>
                </div>
                <div class="co-field">
                    <label>Mật khẩu hiện tại <span class="req">*</span></label>
                    <input type="password" name="current" autocomplete="current-password">
                    <small class="co-error"></small>
                </div>
                <div class="co-actions"><button type="submit" class="cart-btn cart-btn-dark">Lưu thay đổi</button></div>
            </form>`;
    }

    saveAccess(e) {
        e.preventDefault();
        const f = e.target.elements;
        const u = auth.current();
        const email = f.email.value.trim().toLowerCase();
        const pass = f.password.value;
        const taken = auth.users().some(x => x.email === email && x.email !== u.email);
        const ok = [
            this.check(f.email, !email ? "Đây là trường bắt buộc" : !Auth.isEmail(email) ? "Email không hợp lệ"
                : taken ? "Email này đã được đăng ký" : ""),
            this.check(f.password, pass && pass.length < 6 ? "Mật khẩu tối thiểu 6 ký tự" : ""),
            this.check(f.confirm, pass !== f.confirm.value ? "Mật khẩu nhập lại không khớp" : ""),
            this.check(f.current, !f.current.value ? "Đây là trường bắt buộc"
                : f.current.value !== u.password ? "Mật khẩu hiện tại không đúng" : "")
        ];
        if (ok.includes(false)) return;
        if (email === u.email && !pass) { Utils.showToast("Bạn chưa thay đổi gì"); return; }
        const changes = { email };
        if (pass) changes.password = pass;
        auth.updateUser(changes);
        Utils.showToast("Đã cập nhật thông tin truy cập");
    }

    newsletterView(u) {
        return `
            <h1 class="ac-title">Bản tin</h1>
            <form class="ac-form" onsubmit="accountPage.saveNewsletter(event)">
                <label class="ac-check"><input type="checkbox" name="newsletter"${u.newsletter ? " checked" : ""}>
                    Đăng ký nhận bản tin Luna (sản phẩm mới, ưu đãi, sự kiện) qua email <strong>${Utils.escapeHTML(u.email)}</strong></label>
                <div class="co-actions"><button type="submit" class="cart-btn cart-btn-dark">Lưu</button></div>
            </form>`;
    }

    saveNewsletter(e) {
        e.preventDefault();
        const on = e.target.elements.newsletter.checked;
        auth.updateUser({ newsletter: on });
        Utils.showToast(on ? "Đã đăng ký nhận bản tin" : "Đã hủy đăng ký bản tin");
    }

    check(input, message) {
        const field = input.closest(".co-field");
        field.classList.toggle("invalid", !!message);
        field.querySelector(".co-error").textContent = message;
        return !message;
    }
}

const accountPageRoot = document.getElementById("account-page");
const accountPage = accountPageRoot ? new AccountPage(accountPageRoot) : null;
