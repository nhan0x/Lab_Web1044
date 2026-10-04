// Trang tài khoản (account.html): tổng quan, đơn hàng và đổi trả, sổ địa chỉ, thông tin cá nhân, thông tin truy cập, bản tin.

// Các mục của trang tài khoản. id chính là phần sau dấu # trên địa chỉ (account.html#orders); id "" là trang tổng quan.
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
    // root: phần tử HTML sẽ được vẽ vào. menuOpen: menu bên trái (trên điện thoại) đang mở không.
    // editing: id địa chỉ đang sửa ("new" = thêm mới, null = không sửa gì).
    // Tự vẽ lại khi đổi mục (hashchange, tức đổi phần sau dấu #) và khi đăng nhập / đăng xuất (authchange).
    constructor(root) {
        this.root = root;
        this.menuOpen = false;
        this.editing = null;
        window.addEventListener("hashchange", () => { this.editing = null; this.render(); });
        window.addEventListener("authchange", () => this.render());
    }

    // Mục đang xem, lấy từ phần sau dấu # của URL. Giá trị lạ không có trong danh sách thì coi như trang tổng quan ("").
    section() {
        const id = location.hash.replace("#", "");
        if (ACCOUNT_SECTIONS.some(s => s.id === id)) return id;
        return "";
    }

    // Vẽ cả trang. Chưa đăng nhập thì mời đăng nhập. Đã đăng nhập thì chọn hàm vẽ nội dung theo mục đang xem
    // (tra trong bảng { id mục: hàm vẽ }), đổi tiêu đề tab, rồi ghép menu bên trái với nội dung chính.
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

        let toggleIcon = "+";
        let openClass = "";
        if (this.menuOpen) {
            toggleIcon = "−";
            openClass = " open";
        }
        const menuItems = ACCOUNT_SECTIONS.map(s => {
            let activeClass = "";
            if (s.id === current) activeClass = "active";
            return `<li class="${activeClass}"><a href="#${s.id}">${s.label}</a></li>`;
        }).join("");

        this.root.innerHTML = `
            <aside class="ac-side">
                <button type="button" class="ac-menu-toggle" onclick="accountPage.toggleMenu()">Menu <span>${toggleIcon}</span></button>
                <ul class="ac-menu${openClass}">
                    ${menuItems}
                </ul>
            </aside>
            <section class="ac-main">${body}</section>`;
    }

    // Mở / đóng menu (đảo true <-> false) rồi vẽ lại.
    toggleMenu() { this.menuOpen = !this.menuOpen; this.render(); }

    // Mục tổng quan: liệt kê tiêu đề + mô tả của các mục còn lại và nút Đăng xuất.
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

    // Mục "Đơn hàng": bảng các đơn của mình, đơn nào còn huỷ được thì có link "Hủy đơn". Chưa có đơn thì mời mua sắm.
    ordersView() {
        const list = orders.all();
        const status = o => orders.statusLabel(o);
        let content = "";
        if (list.length) {
            const rows = list.map(o => {
                let cancelLink = "";
                if (orders.canCancel(o)) cancelLink = `<a href="javascript:void(0)" onclick="accountPage.cancelOrder('${o.code}')">Hủy đơn</a>`;
                return `
                    <tr>
                        <td>${o.code}</td>
                        <td>${Utils.formatDateTime(o.createdAt)}</td>
                        <td>${Utils.escapeHTML(o.customer.name)}</td>
                        <td>${Utils.formatPrice(orders.total(o))}</td>
                        <td>${status(o)}</td>
                        <td class="ac-order-actions">
                            <a href="tracking.html?code=${o.code}">Xem đơn hàng</a>
                            ${cancelLink}
                        </td>
                    </tr>`;
            }).join("");
            content = `
            <table class="tk-table ac-orders">
                <thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Giao đến</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
                <tbody>${rows}
                </tbody>
            </table>
            <p class="ac-note">Đơn hàng chỉ hủy được khi chưa được đóng gói. Muốn đổi trả sản phẩm đã nhận, vui lòng gọi hotline ${SHIPPING[0].hotline} trong vòng 7 ngày.</p>`;
        } else {
            content = `<p class="ac-desc">Bạn chưa có đơn hàng nào.</p>
               <a class="cart-btn cart-btn-dark" href="index.html">Mua sắm ngay</a>`;
        }
        return `
            <h1 class="ac-title">Đơn hàng và đổi trả</h1>
            ${content}`;
    }

    // Huỷ đơn: hỏi xác nhận (confirm), người dùng đồng ý mới huỷ và báo kết quả, rồi vẽ lại.
    cancelOrder(code) {
        if (!confirm(`Bạn chắc chắn muốn hủy đơn hàng ${code}?`)) return;
        if (orders.cancel(code)) Utils.showToast(`Đã hủy đơn hàng ${code}`);
        else Utils.showToast("Đơn hàng này không thể hủy");
        this.render();
    }

    // Danh sách địa chỉ của tài khoản (chưa có thì mảng rỗng).
    addresses(u) { return u.addresses || []; }

    // Mục "Sổ địa chỉ": đang sửa / thêm thì hiện form, không thì hiện danh sách thẻ địa chỉ
    // (địa chỉ mặc định có nhãn riêng và không có link "Đặt làm mặc định").
    addressView(u) {
        const list = this.addresses(u);
        if (this.editing) return this.addressForm(list.find(a => a.id === this.editing) || null);
        let listHTML = "";
        if (list.length) {
            const cards = list.map(a => {
                let defaultClass = "";
                let defaultBadge = "";
                let setDefaultLink = `<a href="javascript:void(0)" onclick="accountPage.setDefault('${a.id}')">Đặt làm mặc định</a>`;
                if (a.isDefault) {
                    defaultClass = " default";
                    defaultBadge = '<span class="ac-badge">Mặc định</span>';
                    setDefaultLink = "";
                }
                return `
                <div class="ac-address${defaultClass}">
                    ${defaultBadge}
                    <p><strong>${Utils.escapeHTML(a.name)}</strong></p>
                    <p>${Utils.escapeHTML([a.address, a.ward, a.district, a.province].filter(Boolean).join(", "))}</p>
                    <p>Điện thoại: ${Utils.escapeHTML(a.phone)}</p>
                    <div class="ac-address-actions">
                        <a href="javascript:void(0)" onclick="accountPage.editAddress('${a.id}')">Sửa</a>
                        ${setDefaultLink}
                        <a href="javascript:void(0)" onclick="accountPage.deleteAddress('${a.id}')">Xóa</a>
                    </div>
                </div>`;
            }).join("");
            listHTML = `<div class="ac-addresses">${cards}</div>`;
        } else {
            listHTML = `<p class="ac-desc">Bạn chưa lưu địa chỉ nào.</p>`;
        }
        return `
            <h1 class="ac-title">Sổ địa chỉ</h1>
            <p class="ac-desc">Địa chỉ mặc định sẽ được điền sẵn khi bạn thanh toán.</p>
            ${listHTML}
            <button class="cart-btn cart-btn-dark" onclick="accountPage.editAddress('new')">Thêm địa chỉ mới</button>`;
    }

    // Form thêm / sửa địa chỉ. a là địa chỉ đang sửa; a = null nghĩa là thêm mới (điền sẵn tên và số điện thoại của tài khoản).
    // field() tạo một ô nhập kèm chỗ hiện lỗi.
    addressForm(a) {
        const u = auth.current();
        const v = k => Utils.escapeHTML((a && a[k]) || "");
        const field = (name, label, req, input) => {
            let reqMark = "";
            if (req) reqMark = ' <span class="req">*</span>';
            return `
            <div class="co-field">
                <label>${label}${reqMark}</label>
                ${input || `<input type="text" name="${name}" value="${v(name)}">`}
                <small class="co-error"></small>
            </div>`;
        };

        // Sửa địa chỉ có sẵn thì dùng dữ liệu của địa chỉ, thêm mới thì lấy tên + số điện thoại của tài khoản
        let title = "Thêm địa chỉ mới";
        let nameValue = Utils.escapeHTML(u.name);
        let phoneValue = Utils.escapeHTML(u.phone);
        let defaultChecked = " checked";
        if (a) {
            title = "Sửa địa chỉ";
            nameValue = v("name");
            phoneValue = v("phone");
            if (!a.isDefault) defaultChecked = "";
        }

        const provinceOptions = PROVINCES.map(p => {
            let selected = "";
            if (a && p === a.province) selected = " selected";
            return `<option${selected}>${p}</option>`;
        }).join("");

        return `
            <h1 class="ac-title">${title}</h1>
            <form class="co-form" onsubmit="accountPage.saveAddress(event)" novalidate>
                <div class="co-grid">
                    ${field("name", "Họ và tên", true, `<input type="text" name="name" value="${nameValue}">`)}
                    ${field("phone", "Điện thoại", true, `<input type="tel" name="phone" value="${phoneValue}">`)}
                    ${field("province", "Tỉnh/Thành Phố", true, `
                        <select name="province">
                            <option value="">Vui Lòng Chọn Tỉnh/Thành Phố</option>
                            ${provinceOptions}
                        </select>`)}
                    ${field("district", "Quận/Huyện", false)}
                    ${field("ward", "Phường/Xã", false)}
                    ${field("address", "Địa chỉ", true)}
                </div>
                <label class="ac-check"><input type="checkbox" name="isDefault"${defaultChecked}> Đặt làm địa chỉ mặc định</label>
                <div class="co-actions">
                    <button type="submit" class="cart-btn cart-btn-dark">Lưu địa chỉ</button>
                    <button type="button" class="cart-btn" onclick="accountPage.editAddress(null)">Hủy</button>
                </div>
            </form>`;
    }

    // Bấm Sửa / Thêm: ghi nhớ id đang sửa, vẽ lại (để hiện form) và cuộn lên đầu trang.
    editAddress(id) { this.editing = id; this.render(); window.scrollTo({ top: 0 }); }

    // Lưu form địa chỉ: kiểm tra các ô bắt buộc (sai thì dừng). Thêm mới thì push, sửa thì thay đúng địa chỉ đó.
    // Nếu địa chỉ này là mặc định thì bỏ mặc định của các địa chỉ khác (chỉ một địa chỉ mặc định);
    // địa chỉ đầu tiên luôn tự thành mặc định; nếu không còn địa chỉ nào mặc định thì lấy địa chỉ đầu.
    saveAddress(e) {
        e.preventDefault();
        const f = e.target.elements;
        const val = n => f[n].value.trim();
        let phoneError = Utils.required(val("phone"));
        if (!phoneError && !Auth.isPhone(val("phone"))) phoneError = "Số điện thoại gồm 10 số, bắt đầu bằng 0 hoặc +84";
        const ok = [
            this.check(f.name, Utils.required(val("name"))),
            this.check(f.phone, phoneError),
            this.check(f.province, Utils.required(val("province"))),
            this.check(f.address, Utils.required(val("address")))
        ];
        if (ok.includes(false)) return;
        let list = this.addresses(auth.current()).slice();
        const data = {
            name: val("name"), phone: val("phone"), province: val("province"),
            district: val("district"), ward: val("ward"), address: val("address"), isDefault: f.isDefault.checked || !list.length
        };
        if (this.editing === "new") list.push({ id: "a" + Date.now(), ...data });
        else list = list.map(a => {
            if (a.id === this.editing) return { ...a, ...data };
            return a;
        });
        let savedId = this.editing;
        if (this.editing === "new") savedId = list[list.length - 1].id;
        if (data.isDefault) list = list.map(a => ({ ...a, isDefault: a.id === savedId }));
        if (!list.some(a => a.isDefault)) list[0].isDefault = true;
        this.editing = null;
        auth.updateUser({ addresses: list });
        Utils.showToast("Đã lưu địa chỉ");
    }

    // Đặt địa chỉ này làm mặc định: duyệt từng địa chỉ, chỉ địa chỉ trùng id có isDefault = true.
    setDefault(id) {
        auth.updateUser({ addresses: this.addresses(auth.current()).map(a => ({ ...a, isDefault: a.id === id })) });
        Utils.showToast("Đã đổi địa chỉ mặc định");
    }

    // Xoá địa chỉ (hỏi xác nhận trước). Nếu lỡ xoá địa chỉ mặc định thì địa chỉ đầu tiên còn lại được lên làm mặc định.
    deleteAddress(id) {
        if (!confirm("Xóa địa chỉ này?")) return;
        const list = this.addresses(auth.current()).filter(a => a.id !== id);
        if (list.length && !list.some(a => a.isDefault)) list[0].isDefault = true;
        auth.updateUser({ addresses: list });
        Utils.showToast("Đã xóa địa chỉ");
    }

    // Mục "Thông tin cá nhân": form sửa tên và số điện thoại (email chỉ xem, đổi ở mục Thông tin truy cập).
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

    // Lưu tên / số điện thoại: tên bắt buộc; số điện thoại phải có, đúng định dạng và chưa bị TÀI KHOẢN KHÁC dùng.
    // Mỗi lỗi hiện ngay dưới đúng ô nhập; hết lỗi mới cập nhật.
    saveInfo(e) {
        e.preventDefault();
        const f = e.target.elements;
        const name = f.name.value.trim(), phone = f.phone.value.trim();
        const u = auth.current();
        const taken = auth.users().some(x => x.phone === phone && x.email !== u.email);
        let phoneError = "";
        if (!phone) phoneError = "Đây là trường bắt buộc";
        else if (!Auth.isPhone(phone)) phoneError = "Số điện thoại gồm 10 số, bắt đầu bằng 0 hoặc +84";
        else if (taken) phoneError = "Số điện thoại này đã được tài khoản khác sử dụng";
        const ok = [
            this.check(f.name, Utils.required(name)),
            this.check(f.phone, phoneError)
        ];
        if (ok.includes(false)) return;
        auth.updateUser({ name, phone });
        Utils.showToast("Đã lưu thông tin cá nhân");
    }

    // Mục "Thông tin truy cập": form đổi email và / hoặc mật khẩu, bắt buộc nhập mật khẩu hiện tại để xác nhận.
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

    // Lưu email / mật khẩu mới. Kiểm tra: email hợp lệ và chưa bị người khác dùng; mật khẩu mới (nếu nhập) tối thiểu 6 ký tự
    // và nhập lại khớp; mật khẩu hiện tại phải đúng. Không đổi gì thì báo. Mật khẩu để trống nghĩa là giữ mật khẩu cũ.
    saveAccess(e) {
        e.preventDefault();
        const f = e.target.elements;
        const u = auth.current();
        const email = f.email.value.trim().toLowerCase();
        const pass = f.password.value;
        const taken = auth.users().some(x => x.email === email && x.email !== u.email);
        let emailError = "";
        if (!email) emailError = "Đây là trường bắt buộc";
        else if (!Auth.isEmail(email)) emailError = "Email không hợp lệ";
        else if (taken) emailError = "Email này đã được đăng ký";

        let passError = "";
        if (pass && pass.length < 6) passError = "Mật khẩu tối thiểu 6 ký tự";

        let confirmError = "";
        if (pass !== f.confirm.value) confirmError = "Mật khẩu nhập lại không khớp";

        let currentError = "";
        if (!f.current.value) currentError = "Đây là trường bắt buộc";
        else if (f.current.value !== u.password) currentError = "Mật khẩu hiện tại không đúng";

        const ok = [
            this.check(f.email, emailError),
            this.check(f.password, passError),
            this.check(f.confirm, confirmError),
            this.check(f.current, currentError)
        ];
        if (ok.includes(false)) return;
        if (email === u.email && !pass) { Utils.showToast("Bạn chưa thay đổi gì"); return; }
        const changes = { email };
        if (pass) changes.password = pass;
        auth.updateUser(changes);
        Utils.showToast("Đã cập nhật thông tin truy cập");
    }

    // Mục "Bản tin": một ô tích chọn nhận bản tin, tích sẵn nếu tài khoản đã đăng ký.
    newsletterView(u) {
        let checked = "";
        if (u.newsletter) checked = " checked";
        return `
            <h1 class="ac-title">Bản tin</h1>
            <form class="ac-form" onsubmit="accountPage.saveNewsletter(event)">
                <label class="ac-check"><input type="checkbox" name="newsletter"${checked}>
                    Đăng ký nhận bản tin Luna (sản phẩm mới, ưu đãi, sự kiện) qua email <strong>${Utils.escapeHTML(u.email)}</strong></label>
                <div class="co-actions"><button type="submit" class="cart-btn cart-btn-dark">Lưu</button></div>
            </form>`;
    }

    // Lưu lựa chọn nhận bản tin (ô tích đang được tích hay không) và báo kết quả.
    saveNewsletter(e) {
        e.preventDefault();
        const on = e.target.elements.newsletter.checked;
        auth.updateUser({ newsletter: on });
        if (on) Utils.showToast("Đã đăng ký nhận bản tin");
        else Utils.showToast("Đã hủy đăng ký bản tin");
    }

    // Hiện / xoá lỗi dưới một ô nhập: có message thì thêm class "invalid" và ghi lỗi, không có thì gỡ.
    // Trả true nếu ô hợp lệ (không có lỗi), nên các hàm lưu gom kết quả vào mảng rồi kiểm tra ok.includes(false).
    check(input, message) {
        const field = input.closest(".co-field");
        field.classList.toggle("invalid", !!message);
        field.querySelector(".co-error").textContent = message;
        return !message;
    }
}

// Chỉ tạo trang tài khoản khi trang hiện tại có #account-page (account.html).
const accountPageRoot = document.getElementById("account-page");
let accountPage = null;
if (accountPageRoot) accountPage = new AccountPage(accountPageRoot);
