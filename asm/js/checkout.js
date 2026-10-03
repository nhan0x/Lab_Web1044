/* ===== TRANG THANH TOÁN 4 BƯỚC (checkout.html) — kiểu elise.vn =====
   01. Chi tiết → 02. Vận chuyển → 03. Thanh toán → 04. Hoàn thành; bên phải luôn có khung "Giỏ hàng".
   Chỉ nhận thanh toán khi nhận hàng (COD). Phải đăng nhập mới đặt được (giỏ hàng gắn với tài khoản).
   Dùng: Utils; auth; cart; orders; SHIPPING, PAYMENT_METHODS, PROVINCES (mock-data.js).
   Giao diện: id="checkout-page" trong checkout.html. */

const CHECKOUT_STEPS = ["Chi tiết", "Vận chuyển", "Thanh toán", "Hoàn thành"];

class CheckoutPage {
    constructor(root) {
        this.root = root;
        this.step = 1;
        this.contact = null;   // { email } — bước 1
        this.ship = null;      // địa chỉ — bước 2
        this.order = null;     // đơn vừa đặt — bước 4
        window.addEventListener("authchange", () => { if (this.step < 4) this.render(); });
        this.render();
    }

    go(step) {
        this.step = step;
        this.render();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

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
        // Chưa đăng nhập thì luôn ở bước 1
        if (!auth.isLoggedIn() && this.step < 4) this.step = 1;

        const main = [null, this.stepDetail, this.stepShipping, this.stepPayment, this.stepDone][this.step].call(this);
        this.root.innerHTML = `
            ${this.navHTML()}
            <p class="co-hotline">Vui lòng gọi theo số <strong>${SHIPPING.hotline}</strong> (miễn phí) để đặt đơn hàng nhanh chóng</p>
            <div class="co-layout">
                <div class="co-main">${main}</div>
                <aside class="co-side">${this.summaryHTML()}</aside>
            </div>`;
    }

    // Thanh bước: bước đã qua bấm được để quay lại (trừ khi đã hoàn thành)
    navHTML() {
        return `<ol class="co-steps">` + CHECKOUT_STEPS.map((label, i) => {
            const n = i + 1;
            const cls = n === this.step ? "active" : n < this.step ? "done" : "";
            const canGo = n < this.step && this.step < 4;
            const num = String(n).padStart(2, "0");
            return `<li class="${cls}">${canGo
                ? `<a href="javascript:void(0)" onclick="checkoutPage.go(${n})">${num}.${label}</a>`
                : `<span>${num}.${label}</span>`}</li>`;
        }).join("") + `</ol>`;
    }

    // ---------- Khung "Giỏ hàng" bên phải ----------
    summaryHTML() {
        const items = this.step === 4 && this.order
            ? this.order.items.map(i => ({ id: i.id, name: i.name, image: i.image, price: i.price, qty: i.qty, size: i.size }))
            : cart.lines().map(l => ({ id: l.product.id, name: l.product.name, image: l.product.image, price: l.product.price, qty: l.qty, size: l.size }));
        const count = items.reduce((s, i) => s + i.qty, 0);
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        const fee = orders.shippingFee(subtotal);
        return `
            <div class="co-box">
                <h3 class="co-box-title">${this.step === 4 ? "Đơn hàng" : "Giỏ hàng"}</h3>
                ${this.step < 4 ? `
                <form class="co-coupon" onsubmit="checkoutPage.applyCoupon(event)">
                    <input type="text" name="coupon" placeholder="Nhập mã giảm giá">
                    <button type="submit">Áp dụng</button>
                </form>` : ""}
                <p class="co-count">${this.step === 4 ? "Đơn hàng của bạn có" : "Bạn có"} ${count} sản phẩm${this.step === 4 ? "" : " trong giỏ hàng"}</p>
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
                    ${this.step >= 2 ? `<div class="co-row co-carrier"><span>${SHIPPING.carrier.toUpperCase()}</span></div>` : ""}
                    <div class="co-row co-total"><span>Tổng đơn đặt hàng</span><span>${Utils.formatPrice(subtotal + fee)}</span></div>
                    <p class="co-vat">* Đã bao gồm thuế VAT</p>
                </div>
            </div>`;
    }

    applyCoupon(e) {
        e.preventDefault();
        const code = e.target.elements.coupon.value.trim();
        Utils.showToast(code ? "Mã giảm giá không hợp lệ hoặc đã hết hạn" : "Vui lòng nhập mã giảm giá");
    }

    // ---------- 01. Chi tiết ----------
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

    submitDetail(e) {
        e.preventDefault();
        const input = e.target.elements.email;
        const email = input.value.trim();
        if (!this.check(input, email ? (Auth.isEmail(email) ? "" : "Email không hợp lệ") : "Đây là trường bắt buộc")) return;
        this.contact = { email };
        this.go(2);
    }

    // ---------- 02. Vận chuyển ----------
    stepShipping() {
        const u = auth.current();
        // Điền sẵn từ địa chỉ mặc định trong Sổ địa chỉ (trang tài khoản), không có thì lấy tên + SĐT tài khoản
        const saved = (u.addresses || []).find(a => a.isDefault) || {};
        const parts = (saved.name || u.name).trim().split(/\s+/);
        const s = this.ship || {
            firstName: parts.pop(), lastName: parts.join(" "),
            province: saved.province || "", district: saved.district || "", ward: saved.ward || "",
            address: saved.address || "", note: "",
            phone: (saved.phone || u.phone).replace(/^(\+84|0)/, "")
        };
        const v = k => Utils.escapeHTML(s[k] || "");
        const field = (name, label, req, input) => `
            <div class="co-field">
                <label>${label}${req ? ' <span class="req">*</span>' : ""}</label>
                ${input || `<input type="text" name="${name}" value="${v(name)}">`}
                <small class="co-error"></small>
            </div>`;
        return `
            <form class="co-form" onsubmit="checkoutPage.submitShipping(event)" novalidate>
                <h2 class="co-title">Địa chỉ giao hàng</h2>
                <div class="co-grid">
                    ${field("firstName", "Tên", true)}
                    ${field("lastName", "Họ", true)}
                    ${field("province", "Tỉnh/Thành Phố", true, `
                        <select name="province">
                            <option value="">Vui Lòng Chọn Tỉnh/Thành Phố</option>
                            ${PROVINCES.map(p => `<option${p === s.province ? " selected" : ""}>${p}</option>`).join("")}
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
                <label class="co-radio">
                    <input type="radio" name="shipping" checked>
                    <span>${SHIPPING.carrier.toUpperCase()}</span>
                    <em>${Utils.formatPrice(SHIPPING.fee)}</em>
                </label>
                <div class="co-actions"><button type="submit" class="cart-btn cart-btn-dark">Tiếp tục</button></div>
            </form>`;
    }

    submitShipping(e) {
        e.preventDefault();
        const f = e.target.elements;
        const val = n => f[n].value.trim();
        const phone = val("phone").replace(/\s/g, "").replace(/^(\+84|0)/, "");
        const checks = [
            this.check(f.firstName, val("firstName") ? "" : "Đây là trường bắt buộc"),
            this.check(f.lastName, val("lastName") ? "" : "Đây là trường bắt buộc"),
            this.check(f.province, val("province") ? "" : "Đây là trường bắt buộc"),
            this.check(f.address, val("address") ? "" : "Đây là trường bắt buộc"),
            this.check(f.phone, !phone ? "Đây là trường bắt buộc" : /^\d{9}$/.test(phone) ? "" : "Số điện thoại không hợp lệ")
        ];
        if (checks.includes(false)) return;
        this.ship = {
            firstName: val("firstName"), lastName: val("lastName"), province: val("province"),
            district: val("district"), ward: val("ward"), address: val("address"), note: val("note"), phone
        };
        this.go(3);
    }

    // Hiện / xóa lỗi dưới ô nhập; trả về true nếu hợp lệ
    check(input, message) {
        const field = input.closest(".co-field");
        field.classList.toggle("invalid", !!message);
        field.querySelector(".co-error").textContent = message;
        return !message;
    }

    // ---------- 03. Thanh toán ----------
    stepPayment() {
        const s = this.ship;
        const fullAddress = [s.address, s.ward, s.district, s.province].filter(Boolean).join(", ");
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
                    ${s.note ? `<p><em>Ghi chú: ${Utils.escapeHTML(s.note)}</em></p>` : ""}
                </div>
                <div class="co-review-block">
                    <h4>Phương thức giao hàng <a href="javascript:void(0)" onclick="checkoutPage.go(2)">Sửa</a></h4>
                    <p>${SHIPPING.carrier.toUpperCase()} — ${Utils.formatPrice(SHIPPING.fee)}</p>
                    <p>Dự kiến giao trong ${SHIPPING.etaDays} ngày</p>
                </div>
                <div class="co-review-block">
                    <h4>Email nhận thông tin <a href="javascript:void(0)" onclick="checkoutPage.go(1)">Sửa</a></h4>
                    <p>${Utils.escapeHTML(this.contact.email)}</p>
                </div>
            </div>
            <div class="co-actions"><button id="co-place-btn" class="cart-btn cart-btn-dark" onclick="checkoutPage.placeOrder()">Đặt hàng</button></div>`;
    }

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
        // Giả lập hệ thống xử lý đơn ~1 giây
        const btn = Utils.$("co-place-btn");
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đặt hàng...';
        setTimeout(() => {
            this.order = orders.create(items, customer, "cod");
            cart.clear();
            this.go(4);
        }, 1000);
    }

    // ---------- 04. Hoàn thành ----------
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

const checkoutRoot = document.getElementById("checkout-page");
const checkoutPage = checkoutRoot ? new CheckoutPage(checkoutRoot) : null;
