// Đơn hàng: tạo, lưu, tra cứu, tính tiền, trạng thái và hủy đơn (dữ liệu giả trong localStorage).

class OrderService {
    // key: tên khoá lưu đơn hàng trong localStorage; mock: các đơn mẫu có sẵn (từ mock-data.js) để thử tra cứu.
    constructor() {
        this.key = "orders";
        this.mock = MOCK_ORDERS;
    }

    // Đọc TOÀN BỘ đơn đã lưu (của mọi tài khoản). Chưa có hoặc dữ liệu hỏng thì trả [].
    raw() {
        try { return JSON.parse(localStorage.getItem(this.key)) || []; }
        catch (e) { return []; }
    }

    // Đơn hàng của người đang đăng nhập (lọc theo trường owner = email). Chưa đăng nhập thì trả [].
    all() {
        const u = auth.current();
        if (u) return this.raw().filter(o => o.owner === u.email);
        return [];
    }

    // Ghi đè toàn bộ danh sách đơn hàng xuống localStorage.
    saveAll(list) { localStorage.setItem(this.key, JSON.stringify(list)); }

    // Tìm đơn theo mã (chuẩn hoá: bỏ khoảng trắng, viết hoa). Ưu tiên đơn của tài khoản đang đăng nhập, rồi tới đơn mẫu. Không thấy thì null.
    find(code) {
        const c = String(code).trim().toUpperCase();
        return this.all().find(o => o.code === c) || this.mock.find(o => o.code === c) || null;
    }

    // Phí vận chuyển theo phương thức giao hàng đã chọn (mặc định là phương thức đầu tiên): có hàng (tiền hàng > 0) thì tính phí, giỏ trống thì không tính.
    shippingFee(subtotal, method = SHIPPING[0]) {
        if (subtotal > 0) return method.fee;
        return 0;
    }

    // Tiền hàng = tổng (giá x số lượng) của các món.
    subtotal(items) { return items.reduce((sum, i) => sum + i.price * i.qty, 0); }

    // Phí vận chuyển của một đơn: đơn nào đã lưu sẵn phí thì dùng phí đó, không thì tính lại.
    fee(order) {
        if (order.fee !== undefined) return order.fee;
        return this.shippingFee(this.subtotal(order.items));
    }

    // Tổng thanh toán = tiền hàng + phí vận chuyển.
    total(order) { return this.subtotal(order.items) + this.fee(order); }

    // Tổng số món trong đơn.
    count(order) { return order.items.reduce((sum, i) => sum + i.qty, 0); }

    // Ghép địa chỉ đầy đủ "số nhà, phường, quận, tỉnh"; filter(Boolean) bỏ các phần để trống.
    address(order) {
        const c = order.customer;
        return [c.address, c.ward, c.district, c.province].filter(Boolean).join(", ");
    }

    // Tra cứu đơn cho trang tra cứu (không cần đăng nhập): phải khớp mã đơn, tên người nhận (chứa nội dung nhập)
    // và email hoặc số điện thoại (tuỳ by = "email" / "phone"). Sai ở bất kỳ điều kiện nào thì trả null.
    // norm: chuẩn hoá chữ thường, gộp khoảng trắng; phone: bỏ khoảng trắng, đổi +84 thành 0 để so sánh công bằng.
    lookup(code, name, by, value) {
        const c0 = String(code).trim().toUpperCase();
        const order = this.raw().find(o => o.code === c0) || this.mock.find(o => o.code === c0);
        if (!order) return null;
        const norm = s => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
        const c = order.customer;
        if (!norm(c.name).includes(norm(name))) return null;
        const phone = s => norm(s).replace(/\s/g, "").replace(/^\+84/, "0");
        if (by === "phone") {
            if (phone(c.phone) === phone(value)) return order;
            return null;
        }
        if (norm(c.email) === norm(value)) return order;
        return null;
    }

    // Sinh mã đơn mới dạng "LN" + 6 chữ số ngẫu nhiên; lặp lại nếu trùng với mã đã có.
    newCode() {
        let code;
        do { code = "LN" + Math.floor(100000 + Math.random() * 900000); } while (this.find(code));
        return code;
    }

    // Tạo đơn mới cho người đang đăng nhập: gắn mã, chủ đơn, thời điểm đặt; lưu cả phí, tên đơn vị giao và số ngày giao
    // của phương thức đã chọn (để sau này đổi bảng giá cũng không làm thay đổi đơn cũ). Thêm lên đầu danh sách rồi lưu.
    create(items, customer, payment, method = SHIPPING[0]) {
        const now = Date.now();
        const fee = this.shippingFee(this.subtotal(items), method);
        const order = { code: this.newCode(), owner: auth.current().email, createdAt: now, payment, customer, items, fee,
                        shipping: method.carrier, etaDays: method.etaDays, events: [now] };
        const list = this.raw();
        list.unshift(order);
        this.saveAll(list);
        return order;
    }

    // Đơn đang ở bước vận chuyển thứ mấy (chỉ số trong TRACKING_STEPS). Đơn mẫu lấy theo số mốc đã có;
    // đơn thật luôn ở bước 0 (đã đặt hàng) vì không có hệ thống giao hàng thật.
    progress(order) {
        if (this.mock.includes(order)) return order.events.length - 1;
        return 0;
    }

    // Lưu lại một đơn đã sửa: tìm đơn cùng mã trong danh sách rồi thay bằng bản mới.
    persist(order) {
        const list = this.raw();
        const i = list.findIndex(o => o.code === order.code);
        if (i > -1) { list[i] = order; this.saveAll(list); }
    }

    // Chữ trạng thái hiển thị: "Đã hủy" nếu đơn bị huỷ, không thì lấy tên bước hiện tại.
    statusLabel(order) {
        if (order.cancelledAt) return "Đã hủy";
        return TRACKING_STEPS[this.progress(order)].title;
    }

    // Có được huỷ không? Phải là đơn CỦA MÌNH, chưa bị huỷ và còn ở các bước đầu (trước khi bàn giao đóng gói, bước < 2).
    canCancel(order) {
        const u = auth.current();
        return !!u && order.owner === u.email && !order.cancelledAt && this.progress(order) < 2;
    }

    // Huỷ đơn theo mã: không thấy đơn hoặc không được phép huỷ thì trả false; được thì ghi thời điểm huỷ, lưu, trả true.
    cancel(code) {
        const list = this.raw();
        const order = list.find(o => o.code === code);
        if (!order || !this.canCancel(order)) return false;
        order.cancelledAt = Date.now();
        this.saveAll(list);
        return true;
    }

    // Đã giao xong chưa? (đã tới bước cuối cùng)
    isDelivered(order) { return this.progress(order) >= TRACKING_STEPS.length - 1; }

    // Ngày dự kiến giao = ngày đặt + số ngày giao hàng dự kiến (etaDays x 24 giờ x 3600 giây x 1000 ms).
    // Dùng etaDays đã lưu trong đơn; đơn cũ / đơn mẫu không có thì dùng của phương thức đầu tiên.
    eta(order) {
        let etaDays = SHIPPING[0].etaDays;
        if (order.etaDays) etaDays = order.etaDays;
        const d = new Date(order.createdAt + etaDays * 24 * 3600 * 1000);
        return d.toLocaleDateString("vi-VN");
    }

    // Mã vận đơn giả, tạo từ mã đơn: "LN123456" thành "LE123456VN".
    trackingNumber(order) { return "LE" + order.code.replace("LN", "") + "VN"; }
}

// Một đối tượng quản lý đơn hàng dùng chung cho cả site.
const orders = new OrderService();
