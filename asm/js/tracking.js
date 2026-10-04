// Trang tra cứu đơn hàng (tracking.html): form tra cứu và chi tiết đơn.

// 4 chặng hiện trên thanh tiến trình. "from" là bước nhỏ nhất (trong TRACKING_STEPS) để chặng đó được coi là đã tới.
const TRACK_STAGES = [
    { label: "Đã đặt hàng", icon: "fa-receipt",    from: 0 },
    { label: "Chuẩn bị",    icon: "fa-box-open",   from: 2 },
    { label: "Đang giao",   icon: "fa-truck-fast", from: 4 },
    { label: "Đã giao",     icon: "fa-house-circle-check", from: 6 }
];

class TrackingPage {
    // by: đang tra cứu theo "email" hay "phone". mode: đang ở màn "form" hay "order". Đọc địa chỉ URL để quyết định hiện gì:
    //  - Có đủ code + name + (email hoặc phone): tra cứu luôn, đúng thì hiện đơn.
    //  - Chỉ có code và là đơn của mình (hoặc đơn mẫu): hiện đơn luôn.
    //  - Còn lại: hiện form tra cứu.
    constructor(root) {
        this.root = root;
        this.by = "email";
        this.form = { code: "", name: "", value: "" };
        this.mode = "form";
        window.addEventListener("authchange", () => { if (this.mode === "form") this.renderForm(); });

        const q = new URLSearchParams(location.search);
        const code = q.get("code");
        if (code && q.get("name") && (q.get("email") || q.get("phone"))) {
            this.by = "email";
            if (q.get("phone")) this.by = "phone";
            this.form = { code, name: q.get("name"), value: q.get("phone") || q.get("email") };
            const order = orders.lookup(code, this.form.name, this.by, this.form.value);
            if (order) { this.renderOrder(order); return; }
        } else if (code && orders.find(code)) {
            this.renderOrder(orders.find(code));
            return;
        }
        this.renderForm();
    }

    // Tóm tắt trạng thái của đơn: bước hiện tại, chữ hiển thị, đã giao xong chưa, có bị huỷ không.
    statusOf(order) {
        const step = orders.progress(order);
        if (order.cancelledAt) return { step, label: "Đã hủy", done: false, cancelled: true };
        return { step, label: TRACKING_STEPS[step].title, done: step >= TRACKING_STEPS.length - 1 };
    }

    // Vẽ form tra cứu (mã đơn, tên người nhận, email / số điện thoại), kèm thông báo lỗi nếu có
    // và bảng "Đơn hàng của bạn" nếu đang đăng nhập và có đơn.
    renderForm(error) {
        this.mode = "form";
        const f = this.form;
        const v = x => Utils.escapeHTML(x || "");
        const mine = orders.all();

        let errorHTML = "";
        if (error) errorHTML = `<div class="tk-alert">${error}</div>`;

        let emailSelected = "";
        let phoneSelected = "";
        let valueLabel = "Email";
        let valueType = "email";
        if (this.by === "phone") {
            phoneSelected = " selected";
            valueLabel = "Số điện thoại";
            valueType = "tel";
        } else {
            emailSelected = " selected";
        }

        let minesHTML = "";
        if (mine.length) {
            minesHTML = `
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
            </table>`;
        }

        this.root.innerHTML = `
            <h1 class="tk-title">Thông tin đặt hàng</h1>
            ${errorHTML}
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
                        <option value="email"${emailSelected}>Email</option>
                        <option value="phone"${phoneSelected}>Số điện thoại</option>
                    </select>
                </div>
                <div class="co-field">
                    <label id="tk-value-label">${valueLabel} <span class="req">*</span></label>
                    <input type="${valueType}" name="value" value="${v(f.value)}">
                    <small class="co-error"></small>
                </div>
                <button type="submit" class="cart-btn cart-btn-dark">Tiếp tục</button>
                <p class="tk-hint">Thử với đơn mẫu: mã <strong>LN100002</strong>, tên <strong>Trần Quốc Bảo</strong>, số điện thoại <strong>0912345678</strong>.</p>
            </form>
            ${minesHTML}`;
    }

    // Đổi cách tra cứu giữa email và số điện thoại: đổi loại ô nhập (type "tel" hay "email"), xoá nội dung cũ, đổi nhãn.
    switchBy(by) {
        this.by = by;
        const input = this.root.querySelector('input[name="value"]');
        let inputType = "email";
        let labelText = "Email";
        if (by === "phone") {
            inputType = "tel";
            labelText = "Số điện thoại";
        }
        input.type = inputType;
        input.value = "";
        Utils.$("tk-value-label").innerHTML = labelText + ' <span class="req">*</span>';
    }

    // Bấm "Tiếp tục" ở form tra cứu: 3 ô đều bắt buộc. Rồi tra trong orders.lookup;
    // không khớp thì vẽ lại form kèm câu báo lỗi, khớp thì hiện chi tiết đơn.
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
            check(f.code, Utils.required(val("code"))),
            check(f.name, Utils.required(val("name"))),
            check(f.value, Utils.required(val("value")))
        ];
        if (ok.includes(false)) return;
        this.form = { code: val("code"), name: val("name"), value: val("value") };
        const order = orders.lookup(this.form.code, this.form.name, this.by, this.form.value);
        if (!order) {
            let byText = "email.";
            if (this.by === "phone") byText = "số điện thoại.";
            this.renderForm("Bạn đã nhập thông tin không chính xác. Vui lòng kiểm tra lại mã đơn hàng, tên và " + byText);
            return;
        }
        this.renderOrder(order);
    }

    // Bấm "Xem đơn hàng" trong bảng đơn của mình: tìm đơn theo mã rồi hiện chi tiết.
    view(code) {
        const order = orders.find(code);
        if (order) this.renderOrder(order);
    }

    // Thanh tiến trình 4 chặng: chặng đã qua là "done", chặng hiện tại là "current", chặng sau là "todo".
    // Nếu đã giao thành công (bước cuối) thì chặng hiện tại cũng tính là "done". "now" là chặng cao nhất đã tới.
    stagesHTML(step) {
        let now = 0;
        TRACK_STAGES.forEach((s, i) => { if (step >= s.from) now = i; });
        return `<ol class="stages">` + TRACK_STAGES.map((s, i) => {
            let state = "todo";
            if (i < now || (i === now && step === TRACKING_STEPS.length - 1)) state = "done";
            else if (i === now) state = "current";
            return `<li class="stage ${state}"><span class="stage-dot"><i class="fa-solid ${s.icon}"></i></span><span class="stage-label">${s.label}</span></li>`;
        }).join("") + `</ol>`;
    }

    // Vẽ chi tiết một đơn: trạng thái (hoặc thông báo đã huỷ), thanh tiến trình, bảng sản phẩm, tạm tính / phí ship / tổng,
    // địa chỉ giao, phương thức giao hàng và thanh toán, lịch sử đơn (các mốc đã qua, mới nhất ở trên cùng).
    renderOrder(order) {
        this.mode = "order";
        const st = this.statusOf(order);
        const c = order.customer;
        const subtotal = orders.subtotal(order.items);
        const history = TRACKING_STEPS.slice(0, st.step + 1).map((s, i) => `
            <li><time>${Utils.formatDateTime(order.events[i])}</time><strong>${s.title}</strong><small>${s.place}</small></li>`).reverse().join("");

        let doneClass = "";
        if (st.done) doneClass = " done";

        let progressHTML = "";
        if (st.cancelled) {
            progressHTML = `<p class="tk-now tk-cancelled">Đơn hàng đã được hủy lúc ${Utils.formatDateTime(order.cancelledAt)}.</p>`;
        } else {
            let etaText = "Dự kiến giao: " + orders.eta(order);
            if (st.done) etaText = "Đã giao thành công";
            progressHTML = `${this.stagesHTML(st.step)}
            <p class="tk-now">${TRACKING_STEPS[st.step].desc}
                <small>${etaText}</small></p>`;
        }

        let noteHTML = "";
        if (c.note) noteHTML = `<p><em>Ghi chú: ${Utils.escapeHTML(c.note)}</em></p>`;

        this.root.innerHTML = `
            <a class="tk-back" href="javascript:void(0)" onclick="trackingPage.renderForm()">‹ Tra cứu đơn khác</a>
            <div class="tk-head">
                <h1 class="tk-title">Đơn hàng # ${order.code}</h1>
                <span class="tk-status${doneClass}">${st.label}</span>
            </div>
            <p class="tk-date">Ngày đặt hàng: ${Utils.formatDateTime(order.createdAt)}</p>

            ${progressHTML}

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
                    ${noteHTML}
                </div>
                <div>
                    <h4>Phương thức giao hàng</h4>
                    <p>${(order.shipping || SHIPPING[0].carrier).toUpperCase()}</p>
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

// Chỉ tạo trang tra cứu khi trang hiện tại có #tracking-page (tracking.html).
const trackingRoot = document.getElementById("tracking-page");
let trackingPage = null;
if (trackingRoot) trackingPage = new TrackingPage(trackingRoot);
