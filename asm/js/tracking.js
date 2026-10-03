/* ===== TRA CỨU ĐƠN HÀNG (tracking.html) — kiểu elise.vn/sales/guest/form =====
   Việc: form "Thông tin đặt hàng" (mã đơn + tên người nhận + email hoặc SĐT) → trang chi tiết đơn.
         Đã đăng nhập thì có thêm bảng "Đơn hàng của bạn" để xem nhanh.
   Trạng thái hiển thị theo dữ liệu đã lưu, KHÔNG tự cập nhật theo thời gian thực.
   Dùng: Utils; auth; orders; TRACKING_STEPS, SHIPPING, PAYMENT_METHODS (mock-data.js).
   Địa chỉ: tracking.html | tracking.html?code=LN100002&name=...&email=... (từ trang đặt hàng thành công)
   Giao diện: id="tracking-page" trong tracking.html. */

// 4 giai đoạn hiển thị cho khách; "from" là bước đầu tiên (trong TRACKING_STEPS) thuộc giai đoạn đó
const TRACK_STAGES = [
    { label: "Đã đặt hàng", icon: "fa-receipt",    from: 0 },
    { label: "Chuẩn bị",    icon: "fa-box-open",   from: 2 },
    { label: "Đang giao",   icon: "fa-truck-fast", from: 4 },
    { label: "Đã giao",     icon: "fa-house-circle-check", from: 6 }
];

class TrackingPage {
    constructor(root) {
        this.root = root;
        this.by = "email";
        this.form = { code: "", name: "", value: "" };
        this.mode = "form";       // "form" | "order"
        // Đăng nhập / đăng xuất: vẽ lại form (để hiện / ẩn bảng "Đơn hàng của bạn"), không đụng tới đơn đang xem
        window.addEventListener("authchange", () => { if (this.mode === "form") this.renderForm(); });

        const q = new URLSearchParams(location.search);
        const code = q.get("code");
        if (code && q.get("name") && (q.get("email") || q.get("phone"))) {
            this.by = q.get("phone") ? "phone" : "email";
            this.form = { code, name: q.get("name"), value: q.get("phone") || q.get("email") };
            const order = orders.lookup(code, this.form.name, this.by, this.form.value);
            if (order) { this.renderOrder(order); return; }
        } else if (code && orders.find(code)) {
            // Đơn của chính tài khoản đang đăng nhập (hoặc đơn mẫu): xem thẳng
            this.renderOrder(orders.find(code));
            return;
        }
        this.renderForm();
    }

    statusOf(order) {
        const step = orders.progress(order);
        if (order.cancelledAt) return { step, label: "Đã hủy", done: false, cancelled: true };
        return { step, label: TRACKING_STEPS[step].title, done: step >= TRACKING_STEPS.length - 1 };
    }

    // ---------- Form tra cứu ----------
    renderForm(error) {
        this.mode = "form";
        const f = this.form;
        const v = x => Utils.escapeHTML(x || "");
        const mine = orders.all();
        this.root.innerHTML = `
            <h1 class="tk-title">Thông tin đặt hàng</h1>
            ${error ? `<div class="tk-alert">${error}</div>` : ""}
            <form class="tk-form" onsubmit="trackingPage.search(event)" novalidate>
                <div class="co-field">
                    <label>ID đặt hàng <span class="req">*</span></label>
                    <input type="text" name="code" value="${v(f.code)}" placeholder="Ví dụ: LN100002" autocomplete="off">
                    <small class="co-error"></small>
                </div>
                <div class="co-field">
                    <label>Tên người nhận <span class="req">*</span></label>
                    <input type="text" name="name" value="${v(f.name)}">
                    <small class="co-error"></small>
                </div>
                <div class="co-field">
                    <label>Tìm đơn hàng theo <span class="req">*</span></label>
                    <select name="by" onchange="trackingPage.switchBy(this.value)">
                        <option value="email"${this.by === "email" ? " selected" : ""}>Email</option>
                        <option value="phone"${this.by === "phone" ? " selected" : ""}>Số điện thoại</option>
                    </select>
                </div>
                <div class="co-field">
                    <label id="tk-value-label">${this.by === "phone" ? "Số điện thoại" : "Email"} <span class="req">*</span></label>
                    <input type="${this.by === "phone" ? "tel" : "email"}" name="value" value="${v(f.value)}">
                    <small class="co-error"></small>
                </div>
                <button type="submit" class="cart-btn cart-btn-dark">Tiếp tục</button>
                <p class="tk-hint">Thử với đơn mẫu: mã <strong>LN100002</strong>, tên <strong>Trần Quốc Bảo</strong>, số điện thoại <strong>0912345678</strong>.</p>
            </form>
            ${mine.length ? `
            <h2 class="tk-subtitle">Đơn hàng của bạn</h2>
            <table class="tk-table">
                <thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
                <tbody>${mine.map(o => `
                    <tr>
                        <td>${o.code}</td>
                        <td>${Utils.formatDateTime(o.createdAt)}</td>
                        <td>${Utils.formatPrice(orders.total(o))}</td>
                        <td>${this.statusOf(o).label}</td>
                        <td><a href="javascript:void(0)" onclick="trackingPage.view('${o.code}')">Xem đơn hàng</a></td>
                    </tr>`).join("")}
                </tbody>
            </table>` : ""}`;
    }

    switchBy(by) {
        this.by = by;
        const input = this.root.querySelector('input[name="value"]');
        input.type = by === "phone" ? "tel" : "email";
        input.value = "";
        Utils.$("tk-value-label").innerHTML = (by === "phone" ? "Số điện thoại" : "Email") + ' <span class="req">*</span>';
    }

    search(e) {
        e.preventDefault();
        const f = e.target.elements;
        const val = n => f[n].value.trim();
        const check = (input, msg) => {
            const field = input.closest(".co-field");
            field.classList.toggle("invalid", !!msg);
            field.querySelector(".co-error").textContent = msg;
            return !msg;
        };
        const ok = [
            check(f.code, val("code") ? "" : "Đây là trường bắt buộc"),
            check(f.name, val("name") ? "" : "Đây là trường bắt buộc"),
            check(f.value, val("value") ? "" : "Đây là trường bắt buộc")
        ];
        if (ok.includes(false)) return;
        this.form = { code: val("code"), name: val("name"), value: val("value") };
        const order = orders.lookup(this.form.code, this.form.name, this.by, this.form.value);
        if (!order) {
            this.renderForm("Bạn đã nhập thông tin không chính xác. Vui lòng kiểm tra lại mã đơn hàng, tên và " +
                            (this.by === "phone" ? "số điện thoại." : "email."));
            return;
        }
        this.renderOrder(order);
    }

    view(code) {
        const order = orders.find(code);
        if (order) this.renderOrder(order);
    }

    // ---------- Chi tiết đơn ----------
    stagesHTML(step) {
        let now = 0;
        TRACK_STAGES.forEach((s, i) => { if (step >= s.from) now = i; });
        return `<ol class="stages">` + TRACK_STAGES.map((s, i) => {
            const state = i < now || (i === now && step === TRACKING_STEPS.length - 1) ? "done" : i === now ? "current" : "todo";
            return `<li class="stage ${state}"><span class="stage-dot"><i class="fa-solid ${s.icon}"></i></span><span class="stage-label">${s.label}</span></li>`;
        }).join("") + `</ol>`;
    }

    renderOrder(order) {
        this.mode = "order";
        const st = this.statusOf(order);
        const c = order.customer;
        const subtotal = orders.subtotal(order.items);
        const history = TRACKING_STEPS.slice(0, st.step + 1).map((s, i) => `
            <li><time>${Utils.formatDateTime(order.events[i])}</time><strong>${s.title}</strong><small>${s.place}</small></li>`).reverse().join("");

        this.root.innerHTML = `
            <a class="tk-back" href="javascript:void(0)" onclick="trackingPage.renderForm()">‹ Tra cứu đơn khác</a>
            <div class="tk-head">
                <h1 class="tk-title">Đơn hàng # ${order.code}</h1>
                <span class="tk-status${st.done ? " done" : ""}">${st.label}</span>
            </div>
            <p class="tk-date">Ngày đặt hàng: ${Utils.formatDateTime(order.createdAt)}</p>

            ${st.cancelled
                ? `<p class="tk-now tk-cancelled">Đơn hàng đã được hủy lúc ${Utils.formatDateTime(order.cancelledAt)}.</p>`
                : `${this.stagesHTML(st.step)}
            <p class="tk-now">${TRACKING_STEPS[st.step].desc}
                <small>${st.done ? "Đã giao thành công" : "Dự kiến giao: " + orders.eta(order)}</small></p>`}

            <h2 class="tk-subtitle">Sản phẩm đặt hàng</h2>
            <table class="tk-table tk-items">
                <thead><tr><th>Tên sản phẩm</th><th>Kích cỡ</th><th>Giá</th><th>Số lượng</th><th>Tổng</th></tr></thead>
                <tbody>${order.items.map(i => `
                    <tr>
                        <td><div class="tk-prod"><img src="${i.image}" alt="${i.name}"><span>${Utils.escapeHTML(i.name)}</span></div></td>
                        <td>${i.size || "—"}</td>
                        <td>${Utils.formatPrice(i.price)}</td>
                        <td>${i.qty}</td>
                        <td>${Utils.formatPrice(i.price * i.qty)}</td>
                    </tr>`).join("")}
                </tbody>
            </table>
            <div class="tk-totals">
                <div><span>Tạm tính</span><span>${Utils.formatPrice(subtotal)}</span></div>
                <div><span>Phí vận chuyển</span><span>${Utils.formatPrice(orders.fee(order))}</span></div>
                <div class="tk-grand"><span>Tổng đơn hàng</span><span>${Utils.formatPrice(orders.total(order))}</span></div>
            </div>

            <h2 class="tk-subtitle">Thông tin đơn hàng</h2>
            <div class="tk-info">
                <div>
                    <h4>Địa chỉ giao hàng</h4>
                    <p>${Utils.escapeHTML(c.name)}</p>
                    <p>${Utils.escapeHTML(orders.address(order))}</p>
                    <p>Điện thoại: ${Utils.escapeHTML(c.phone)}</p>
                    ${c.note ? `<p><em>Ghi chú: ${Utils.escapeHTML(c.note)}</em></p>` : ""}
                </div>
                <div>
                    <h4>Phương thức giao hàng</h4>
                    <p>${(order.shipping || SHIPPING.carrier).toUpperCase()}</p>
                    <p>Mã vận đơn: ${orders.trackingNumber(order)}</p>
                </div>
                <div>
                    <h4>Phương thức thanh toán</h4>
                    <p>${PAYMENT_METHODS[order.payment] || PAYMENT_METHODS.cod}</p>
                </div>
            </div>

            <details class="tk-history">
                <summary>Lịch sử đơn hàng</summary>
                <ul>${history}</ul>
            </details>`;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

const trackingRoot = document.getElementById("tracking-page");
const trackingPage = trackingRoot ? new TrackingPage(trackingRoot) : null;
