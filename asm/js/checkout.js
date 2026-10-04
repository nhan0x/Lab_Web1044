// Trang thanh toán 4 bước (checkout.html): chi tiết, vận chuyển, thanh toán khi nhận hàng, hoàn thành.

// Tên 4 bước hiện ở thanh tiến trình phía trên.
const CHECKOUT_STEPS = ["Chi tiết", "Vận chuyển", "Thanh toán", "Hoàn thành"];

class CheckoutPage {
    // step: bước hiện tại (1-4). contact: email nhận thông tin (bước 1). ship: thông tin giao hàng (bước 2).
    // order: đơn vừa đặt xong (bước 4). shippingIndex: vị trí phương thức giao hàng đang chọn trong mảng SHIPPING (0 = đầu tiên).
    // Khi đăng nhập / đăng xuất (authchange) thì vẽ lại, trừ khi đã đặt xong ở bước 4.
    constructor(root) {
        this.root = root;
        this.step = 1;
        this.contact = null;
        this.ship = null;
        this.order = null;
        this.shippingIndex = 0;
        window.addEventListener("authchange", () => { if (this.step < 4) this.render(); });
        this.render();
    }

    // Phương thức giao hàng đang được chọn (một phần tử của mảng SHIPPING: carrier, fee, etaDays, hotline).
    method() { return SHIPPING[this.shippingIndex]; }

    // Chuyển sang bước khác: đổi số bước, vẽ lại và cuộn mượt lên đầu trang.
    go(step) {
        this.step = step;
        this.render();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Vẽ cả trang: giỏ trống (khi chưa đặt xong) thì báo giỏ trống; chưa đăng nhập thì ép về bước 1.
    // Còn lại: gọi hàm vẽ của bước hiện tại (tra trong mảng theo số bước) và ghép với thanh tiến trình + khung tóm tắt đơn hàng bên phải.
    render() {
        const lines = cart.lines();
        if (this.step < 4 && auth.isLoggedIn() && !lines.length) {
            this.root.innerHTML = `
                <div class="co-empty">
                    <h2>Giỏ hàng của bạn đang trống</h2>
                    <a class="cart-btn cart-btn-dark" href="index.html">Tiếp tục mua hàng</a>
                </div>`;
            return;
        }
        if (!auth.isLoggedIn() && this.step < 4) this.step = 1;

        const main = [null, this.stepDetail, this.stepShipping, this.stepPayment, this.stepDone][this.step].call(this);
        this.root.innerHTML = `
            ${this.navHTML()}
            <p class="co-hotline">Vui lòng gọi theo số <strong>${SHIPPING[0].hotline}</strong> (miễn phí) để đặt đơn hàng nhanh chóng</p>
            <div class="co-layout">
                <div class="co-main">${main}</div>
                <aside class="co-side">${this.summaryHTML()}</aside>
            </div>`;
    }

    // Thanh tiến trình 4 bước: bước hiện tại tô đậm (active), bước đã qua đánh dấu (done) và bấm để quay lại được
    // (trừ khi đã đặt xong ở bước 4), bước chưa tới chỉ là chữ.
    navHTML() {
        return `<ol class="co-steps">` + CHECKOUT_STEPS.map((label, i) => {
            const n = i + 1;
            let cls = "";
            if (n === this.step) cls = "active";
            else if (n < this.step) cls = "done";

            const canGo = n < this.step && this.step < 4;
            const num = String(n).padStart(2, "0");

            let stepHTML = `<span>${num}.${label}</span>`;
            if (canGo) stepHTML = `<a href="javascript:void(0)" onclick="checkoutPage.go(${n})">${num}.${label}</a>`;
            return `<li class="${cls}">${stepHTML}</li>`;
        }).join("") + `</ol>`;
    }

    // Khung tóm tắt bên phải: danh sách món, số lượng, tiền hàng, phí vận chuyển và tổng thanh toán.
    // Bước 4 lấy món từ đơn vừa đặt (vì giỏ đã xoá), các bước trước lấy từ giỏ hàng.
    summaryHTML() {
        let items;
        if (this.step === 4 && this.order) {
            items = this.order.items.map(i => ({ id: i.id, name: i.name, image: i.image, price: i.price, qty: i.qty, size: i.size }));
        } else {
            items = cart.lines().map(l => ({ id: l.product.id, name: l.product.name, image: l.product.image, price: l.product.price, qty: l.qty, size: l.size }));
        }
        const count = items.reduce((s, i) => s + i.qty, 0);
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

        // Phí và tên đơn vị giao: các bước trước lấy theo phương thức đang chọn; bước 4 lấy theo đơn đã lưu
        // (đơn lưu sẵn phí và tên đơn vị giao tại thời điểm đặt).
        let fee = orders.shippingFee(subtotal, this.method());
        let carrierName = this.method().carrier;
        if (this.step === 4 && this.order) {
            fee = orders.fee(this.order);
            carrierName = this.order.shipping;
        }

        // Bước 4 (đã đặt xong) hiện "Đơn hàng", các bước còn lại hiện "Giỏ hàng" kèm ô mã giảm giá
        let boxTitle = "Giỏ hàng";
        let countPrefix = "Bạn có";
        let countSuffix = " trong giỏ hàng";
        let couponHTML = `
                <form class="co-coupon" onsubmit="checkoutPage.applyCoupon(event)">
                    <input type="text" name="coupon" placeholder="Nhập mã giảm giá">
                    <button type="submit">Áp dụng</button>
                </form>`;
        if (this.step === 4) {
            boxTitle = "Đơn hàng";
            countPrefix = "Đơn hàng của bạn có";
            countSuffix = "";
            couponHTML = "";
        }

        let carrierRow = "";
        if (this.step >= 2) carrierRow = `<div class="co-row co-carrier"><span>${carrierName.toUpperCase()}</span></div>`;

        return `
            <div class="co-box">
                <h3 class="co-box-title">${boxTitle}</h3>
                ${couponHTML}
                <p class="co-count">${countPrefix} ${count} sản phẩm${countSuffix}</p>
                <div class="co-items">
                    ${items.map(i => `
                        <div class="co-item">
                            <img src="${i.image}" alt="${i.name}">
                            <div class="co-item-info">
                                <div class="co-item-name">${i.name}</div>
                                <div class="co-item-price">${Utils.formatPrice(i.price)}</div>
                                <details class="co-item-more">
                                    <summary>Xem chi tiết</summary>
                                    <p>Kích cỡ: ${i.size || "—"}</p>
                                    <p>Số lượng: ${i.qty}</p>
                                </details>
                            </div>
                        </div>`).join("")}
                </div>
                <div class="co-sum">
                    <div class="co-row"><span>${count} sản phẩm</span><span>${Utils.formatPrice(subtotal)}</span></div>
                    <div class="co-row"><span>Vận chuyển</span><span>${Utils.formatPrice(fee)}</span></div>
                    ${carrierRow}
                    <div class="co-row co-total"><span>Tổng đơn đặt hàng</span><span>${Utils.formatPrice(subtotal + fee)}</span></div>
                    <p class="co-vat">* Đã bao gồm thuế VAT</p>
                </div>
            </div>`;
    }

    // Ô mã giảm giá: chỉ để minh hoạ, mọi mã nhập vào đều báo không hợp lệ (chưa nhập thì nhắc nhập).
    applyCoupon(e) {
        e.preventDefault();
        const code = e.target.elements.coupon.value.trim();
        if (code) Utils.showToast("Mã giảm giá không hợp lệ hoặc đã hết hạn");
        else Utils.showToast("Vui lòng nhập mã giảm giá");
    }

    // Bước 1 - Chi tiết: chưa đăng nhập thì mời đăng nhập / tạo tài khoản; đã đăng nhập thì hiện form email
    // (điền sẵn email đã nhập trước đó, nếu chưa có thì email tài khoản).
    stepDetail() {
        const u = auth.current();
        if (!u) {
            return `
                <h2 class="co-title">Đăng nhập để đặt hàng</h2>
                <p class="co-desc">Giỏ hàng được lưu theo tài khoản, vui lòng đăng nhập để tiếp tục.</p>
                <div class="co-actions">
                    <button class="cart-btn cart-btn-dark" onclick="accountModal.open('login')">Đăng nhập</button>
                    <button class="cart-btn" onclick="accountModal.open('register')">Tạo tài khoản</button>
                </div>`;
        }
        const email = (this.contact && this.contact.email) || u.email;
        return `
            <h2 class="co-title">Thông tin khách hàng</h2>
            <p class="co-desc">Chúng tôi sẽ gửi thông tin đặt hàng đến email của bạn</p>
            <form class="co-form" onsubmit="checkoutPage.submitDetail(event)" novalidate>
                <div class="co-field">
                    <label>Địa chỉ Email <span class="req">*</span></label>
                    <input type="email" name="email" value="${Utils.escapeHTML(email)}">
                    <small class="co-error"></small>
                </div>
                <p class="co-account">Bạn đang đặt hàng với tài khoản <strong>${Utils.escapeHTML(u.name)}</strong>.
                    Không phải bạn? <a href="javascript:void(0)" onclick="auth.logout()">Đăng xuất</a></p>
                <div class="co-actions"><button type="submit" class="cart-btn cart-btn-dark">Tiếp tục</button></div>
            </form>`;
    }

    // Bấm "Tiếp tục" ở bước 1: kiểm tra email (bắt buộc, đúng định dạng), hợp lệ thì ghi nhớ và sang bước 2.
    submitDetail(e) {
        e.preventDefault();
        const input = e.target.elements.email;
        const email = input.value.trim();
        let emailError = "";
        if (!email) emailError = "Đây là trường bắt buộc";
        else if (!Auth.isEmail(email)) emailError = "Email không hợp lệ";
        if (!this.check(input, emailError)) return;
        this.contact = { email };
        this.go(2);
    }

    // Bước 2 - Vận chuyển: form địa chỉ giao hàng. Nếu đã nhập rồi (this.ship) thì giữ lại;
    // chưa thì điền sẵn từ địa chỉ mặc định trong sổ địa chỉ (hoặc từ tên / số điện thoại tài khoản). Tên được tách:
    // từ cuối là "Tên", phần còn lại là "Họ". Số điện thoại bỏ đầu 0 hoặc +84 vì ô nhập đã có sẵn "+84".
    stepShipping() {
        const u = auth.current();
        const saved = (u.addresses || []).find(a => a.isDefault) || {};
        const parts = (saved.name || u.name).trim().split(/\s+/);
        const s = this.ship || {
            firstName: parts.pop(), lastName: parts.join(" "),
            province: saved.province || "", district: saved.district || "", ward: saved.ward || "",
            address: saved.address || "", note: "",
            phone: (saved.phone || u.phone).replace(/^(\+84|0)/, "")
        };
        const v = k => Utils.escapeHTML(s[k] || "");
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
        const provinceOptions = PROVINCES.map(p => {
            let selected = "";
            if (p === s.province) selected = " selected";
            return `<option${selected}>${p}</option>`;
        }).join("");

        // Mỗi phương thức giao hàng trong mảng SHIPPING là một nút radio. i là vị trí trong mảng; nút của phương thức
        // đang chọn có "checked". Chọn nút khác thì gọi pickShipping(i) để cập nhật phí ở khung bên phải.
        const shippingOptions = SHIPPING.map((m, i) => {
            let checked = "";
            if (i === this.shippingIndex) checked = " checked";
            return `
                <label class="co-radio">
                    <input type="radio" name="shipping" value="${i}"${checked} onchange="checkoutPage.pickShipping(${i})">
                    <span>${m.carrier.toUpperCase()}</span>
                    <em>${Utils.formatPrice(m.fee)}</em>
                </label>`;
        }).join("");

        return `
            <form class="co-form" onsubmit="checkoutPage.submitShipping(event)" novalidate>
                <h2 class="co-title">Địa chỉ giao hàng</h2>
                <div class="co-grid">
                    ${field("firstName", "Tên", true)}
                    ${field("lastName", "Họ", true)}
                    ${field("province", "Tỉnh/Thành Phố", true, `
                        <select name="province">
                            <option value="">Vui Lòng Chọn Tỉnh/Thành Phố</option>
                            ${provinceOptions}
                        </select>`)}
                    ${field("district", "Quận/Huyện", false)}
                    ${field("ward", "Phường/Xã", false)}
                    ${field("address", "Địa chỉ", true)}
                    ${field("note", "Ghi chú", false, `<input type="text" name="note" placeholder="Ghi chú đơn hàng" value="${v("note")}">`)}
                    ${field("phone", "Điện thoại", true, `
                        <div class="co-phone"><span>+84</span><input type="tel" name="phone" value="${v("phone")}" placeholder="987986689"></div>`)}
                </div>
                <p class="co-hint">Số điện thoại có dạng +84 987986689</p>

                <h2 class="co-title co-title-2">Chọn phương thức giao hàng của bạn</h2>
                <p class="co-desc">Phí vận chuyển dựa trên trọng lượng kiện hàng và địa điểm giao hàng</p>
                ${shippingOptions}
                <div class="co-actions"><button type="submit" class="cart-btn cart-btn-dark">Tiếp tục</button></div>
            </form>`;
    }

    // Người dùng chọn một phương thức giao hàng: ghi nhớ vị trí đã chọn rồi vẽ lại CHỈ khung tóm tắt bên phải
    // (không vẽ lại cả trang để khỏi mất những gì đang gõ trong form).
    pickShipping(index) {
        this.shippingIndex = index;
        this.root.querySelector(".co-side").innerHTML = this.summaryHTML();
    }

    // Bấm "Tiếp tục" ở bước 2: kiểm tra các ô bắt buộc và số điện thoại (đúng 9 chữ số sau khi bỏ đầu 0 / +84).
    // Hợp lệ thì lưu thông tin giao hàng và sang bước 3.
    submitShipping(e) {
        e.preventDefault();
        const f = e.target.elements;
        const val = n => f[n].value.trim();
        const phone = val("phone").replace(/\s/g, "").replace(/^(\+84|0)/, "");
        let phoneError = "";
        if (!phone) phoneError = "Đây là trường bắt buộc";
        else if (!/^\d{9}$/.test(phone)) phoneError = "Số điện thoại không hợp lệ";
        const checks = [
            this.check(f.firstName, Utils.required(val("firstName"))),
            this.check(f.lastName, Utils.required(val("lastName"))),
            this.check(f.province, Utils.required(val("province"))),
            this.check(f.address, Utils.required(val("address"))),
            this.check(f.phone, phoneError)
        ];
        if (checks.includes(false)) return;
        this.ship = {
            firstName: val("firstName"), lastName: val("lastName"), province: val("province"),
            district: val("district"), ward: val("ward"), address: val("address"), note: val("note"), phone
        };
        this.go(3);
    }

    // Hiện / xoá lỗi dưới một ô nhập (có message thì đánh dấu "invalid" và ghi lỗi). Trả true nếu ô hợp lệ.
    check(input, message) {
        const field = input.closest(".co-field");
        field.classList.toggle("invalid", !!message);
        field.querySelector(".co-error").textContent = message;
        return !message;
    }

    // Bước 3 - Thanh toán: chỉ có thanh toán khi nhận hàng (COD), kèm khung xem lại thông tin giao đến,
    // phương thức giao hàng, email và nút "Đặt hàng".
    stepPayment() {
        const s = this.ship;
        const fullAddress = [s.address, s.ward, s.district, s.province].filter(Boolean).join(", ");
        let noteHTML = "";
        if (s.note) noteHTML = `<p><em>Ghi chú: ${Utils.escapeHTML(s.note)}</em></p>`;
        return `
            <h2 class="co-title">Phương thức thanh toán</h2>
            <label class="co-radio">
                <input type="radio" name="payment" value="cod" checked>
                <span>${PAYMENT_METHODS.cod}</span>
            </label>
            <p class="co-desc co-cod-note">Bạn thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận được hàng.</p>

            <div class="co-review">
                <div class="co-review-block">
                    <h4>Giao đến <a href="javascript:void(0)" onclick="checkoutPage.go(2)">Sửa</a></h4>
                    <p><strong>${Utils.escapeHTML(s.lastName + " " + s.firstName)}</strong> · +84 ${Utils.escapeHTML(s.phone)}</p>
                    <p>${Utils.escapeHTML(fullAddress)}</p>
                    ${noteHTML}
                </div>
                <div class="co-review-block">
                    <h4>Phương thức giao hàng <a href="javascript:void(0)" onclick="checkoutPage.go(2)">Sửa</a></h4>
                    <p>${this.method().carrier.toUpperCase()} — ${Utils.formatPrice(this.method().fee)}</p>
                    <p>Dự kiến giao trong ${this.method().etaDays} ngày</p>
                </div>
                <div class="co-review-block">
                    <h4>Email nhận thông tin <a href="javascript:void(0)" onclick="checkoutPage.go(1)">Sửa</a></h4>
                    <p>${Utils.escapeHTML(this.contact.email)}</p>
                </div>
            </div>
            <div class="co-actions"><button id="co-place-btn" class="cart-btn cart-btn-dark" onclick="checkoutPage.placeOrder()">Đặt hàng</button></div>`;
    }

    // Bấm "Đặt hàng": phải đăng nhập, giỏ không được trống. Chụp lại các món trong giỏ (copy giá và tên tại thời điểm đặt)
    // và thông tin khách. Khoá nút + hiện chữ "Đang đặt hàng..." để khỏi bấm 2 lần, sau 1 giây (giả lập xử lý)
    // thì tạo đơn, xoá giỏ và sang bước 4.
    placeOrder() {
        if (!auth.requireLogin("Vui lòng đăng nhập để đặt hàng")) return;
        const items = cart.lines().map(l => ({
            id: l.product.id, name: l.product.name, image: l.product.image, price: l.product.price, qty: l.qty, size: l.size
        }));
        if (!items.length) { Utils.showToast("Giỏ hàng của bạn đang trống!"); return; }
        const s = this.ship;
        const customer = {
            name: `${s.lastName} ${s.firstName}`.trim(), email: this.contact.email, phone: "0" + s.phone,
            province: s.province, district: s.district, ward: s.ward, address: s.address, note: s.note
        };
        const btn = Utils.$("co-place-btn");
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đặt hàng...';
        setTimeout(() => {
            this.order = orders.create(items, customer, "cod", this.method());
            cart.clear();
            this.go(4);
        }, 1000);
    }

    // Bước 4 - Hoàn thành: hiện mã đơn và thông tin đơn vừa đặt, kèm link tra cứu. Chưa có đơn (vào thẳng bước này) thì về trang giỏ.
    stepDone() {
        const o = this.order;
        if (!o) { location.href = "cart.html"; return ""; }
        const c = o.customer;
        const query = `tracking.html?code=${o.code}&name=${encodeURIComponent(c.name)}&email=${encodeURIComponent(c.email)}`;
        return `
            <div class="co-done">
                <div class="co-done-icon"><i class="fa-solid fa-check"></i></div>
                <h2 class="co-title">Cảm ơn bạn đã đặt hàng!</h2>
                <p class="co-desc">Mã đơn hàng của bạn là <strong class="co-code">${o.code}</strong></p>
                <p class="co-desc">Thông tin đơn hàng đã được gửi tới <strong>${Utils.escapeHTML(c.email)}</strong>.
                   Luna sẽ gọi số <strong>${Utils.escapeHTML(c.phone)}</strong> để xác nhận trước khi giao.</p>
                <ul class="co-done-info">
                    <li><span>Người nhận</span><span>${Utils.escapeHTML(c.name)}</span></li>
                    <li><span>Địa chỉ</span><span>${Utils.escapeHTML(orders.address(o))}</span></li>
                    <li><span>Thanh toán</span><span>${PAYMENT_METHODS[o.payment]}</span></li>
                    <li><span>Tổng tiền</span><span>${Utils.formatPrice(orders.total(o))}</span></li>
                    <li><span>Dự kiến giao</span><span>${orders.eta(o)}</span></li>
                </ul>
                <div class="co-actions">
                    <a class="cart-btn cart-btn-dark" href="${query}">Tra cứu đơn hàng</a>
                    <a class="cart-btn" href="index.html">Tiếp tục mua hàng</a>
                </div>
            </div>`;
    }
}

// Chỉ tạo trang thanh toán khi trang hiện tại có #checkout-page (checkout.html).
const checkoutRoot = document.getElementById("checkout-page");
let checkoutPage = null;
if (checkoutRoot) checkoutPage = new CheckoutPage(checkoutRoot);
