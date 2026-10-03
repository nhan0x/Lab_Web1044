/* ===== ĐƠN HÀNG (DỮ LIỆU GIẢ) =====
   Việc: tạo đơn khi thanh toán, lưu localStorage (khóa "orders"), tính tiến trình của kiện hàng theo thời gian.
   Dùng: TRACKING_STEPS, SHIPPING, MOCK_ORDERS (mock-data.js). */

class OrderService {
    constructor() {
        this.key = "orders";
        this.mock = MOCK_ORDERS;
    }

    // Toàn bộ đơn của mọi tài khoản (chỉ dùng nội bộ khi ghi)
    raw() {
        try { return JSON.parse(localStorage.getItem(this.key)) || []; }
        catch (e) { return []; }
    }

    // Đơn của người đang đăng nhập (chưa đăng nhập thì trống)
    all() {
        const u = auth.current();
        return u ? this.raw().filter(o => o.owner === u.email) : [];
    }

    saveAll(list) { localStorage.setItem(this.key, JSON.stringify(list)); }

    // Tìm theo mã (không phân biệt hoa thường), tìm trong đơn của bạn rồi tới đơn mẫu
    find(code) {
        const c = String(code).trim().toUpperCase();
        return this.all().find(o => o.code === c) || this.mock.find(o => o.code === c) || null;
    }

    // Phí giao hàng đồng giá (giỏ trống thì 0)
    shippingFee(subtotal) { return subtotal > 0 ? SHIPPING.fee : 0; }

    subtotal(items) { return items.reduce((sum, i) => sum + i.price * i.qty, 0); }

    fee(order) { return order.fee !== undefined ? order.fee : this.shippingFee(this.subtotal(order.items)); }

    total(order) { return this.subtotal(order.items) + this.fee(order); }

    count(order) { return order.items.reduce((sum, i) => sum + i.qty, 0); }

    // Địa chỉ đầy đủ: số nhà/đường, phường/xã, quận/huyện, tỉnh/thành
    address(order) {
        const c = order.customer;
        return [c.address, c.ward, c.district, c.province].filter(Boolean).join(", ");
    }

    // Tra cứu như elise.vn: mã đơn + tên người nhận + (email hoặc số điện thoại) phải khớp
    // (tìm trong mọi đơn, kể cả khi chưa đăng nhập, vì đã xác minh bằng tên + liên hệ)
    lookup(code, name, by, value) {
        const c0 = String(code).trim().toUpperCase();
        const order = this.raw().find(o => o.code === c0) || this.mock.find(o => o.code === c0);
        if (!order) return null;
        const norm = s => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
        const c = order.customer;
        if (!norm(c.name).includes(norm(name))) return null;
        const phone = s => norm(s).replace(/\s/g, "").replace(/^\+84/, "0");
        if (by === "phone") return phone(c.phone) === phone(value) ? order : null;
        return norm(c.email) === norm(value) ? order : null;
    }

    newCode() {
        let code;
        do { code = "LN" + Math.floor(100000 + Math.random() * 900000); } while (this.find(code));
        return code;
    }

    // items: [{ id, name, image, price, qty, size }]
    // customer: { name, email, phone, province, district, ward, address, note }
    create(items, customer, payment) {
        const now = Date.now();
        const fee = this.shippingFee(this.subtotal(items));
        const order = { code: this.newCode(), owner: auth.current().email, createdAt: now, payment, customer, items, fee,
                        shipping: SHIPPING.carrier, events: [now] };
        const list = this.raw();
        list.unshift(order);
        this.saveAll(list);
        return order;
    }

    // Chỉ số bước hiện tại. Đơn thật luôn dừng ở "Đã đặt hàng" (bước 0); đơn mẫu giữ bước đã định sẵn để thử tra cứu.
    progress(order) {
        return this.mock.includes(order) ? order.events.length - 1 : 0;
    }


    persist(order) {
        const list = this.raw();
        const i = list.findIndex(o => o.code === order.code);
        if (i > -1) { list[i] = order; this.saveAll(list); }   // đơn mẫu chỉ đổi trong bộ nhớ
    }

    // Trạng thái hiển thị cho khách (không cập nhật theo thời gian thực)
    statusLabel(order) { return order.cancelledAt ? "Đã hủy" : TRACKING_STEPS[this.progress(order)].title; }

    // Được hủy khi đơn là của mình, chưa hủy và chưa tới bước "Đang đóng gói"
    canCancel(order) {
        const u = auth.current();
        return !!u && order.owner === u.email && !order.cancelledAt && this.progress(order) < 2;
    }

    cancel(code) {
        const list = this.raw();
        const order = list.find(o => o.code === code);
        if (!order || !this.canCancel(order)) return false;
        order.cancelledAt = Date.now();
        this.saveAll(list);
        return true;
    }

    isDelivered(order) { return this.progress(order) >= TRACKING_STEPS.length - 1; }

    eta(order) {
        const d = new Date(order.createdAt + SHIPPING.etaDays * 24 * 3600 * 1000);
        return d.toLocaleDateString("vi-VN");
    }

    trackingNumber(order) { return "LE" + order.code.replace("LN", "") + "VN"; }
}

const orders = new OrderService();
