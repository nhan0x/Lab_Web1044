// Dữ liệu giả: các bước vận chuyển, phí giao hàng, phương thức thanh toán, tỉnh/thành và đơn hàng mẫu.

// 7 bước của một đơn hàng, theo thứ tự từ lúc đặt tới lúc giao thành công (title: tên bước, desc: mô tả, place: nơi xử lý).
const TRACKING_STEPS = [
    { icon: "fa-receipt",       title: "Đã đặt hàng",            desc: "Luna đã tiếp nhận đơn hàng của bạn.",                    place: "Hệ thống Luna" },
    { icon: "fa-circle-check",  title: "Đã xác nhận",            desc: "Đơn hàng được xác nhận và thanh toán thành công.",       place: "Hệ thống Luna" },
    { icon: "fa-box-open",      title: "Đang đóng gói",          desc: "Kho đang kiểm tra và đóng gói sản phẩm.",                place: "Kho Luna - Vũng Tàu" },
    { icon: "fa-people-carry-box", title: "Bàn giao vận chuyển", desc: "Kiện hàng đã được giao cho đơn vị vận chuyển.",          place: "Bưu cục Vũng Tàu" },
    { icon: "fa-truck-fast",    title: "Đang vận chuyển",        desc: "Kiện hàng đang trên đường đến trung tâm phân loại.",     place: "Trung tâm trung chuyển TP.HCM" },
    { icon: "fa-motorcycle",    title: "Đang giao hàng",         desc: "Nhân viên giao hàng đang trên đường đến bạn.",           place: "Bưu cục giao hàng gần bạn" },
    { icon: "fa-house-circle-check", title: "Giao thành công",   desc: "Kiện hàng đã được giao. Cảm ơn bạn đã mua sắm tại Luna!", place: "Địa chỉ nhận hàng" }
];

// Các phương thức giao hàng khách có thể chọn ở bước 2: đơn vị giao, phí (VND), số ngày giao dự kiến, hotline.
// Phần tử đầu tiên (SHIPPING[0]) là phương thức mặc định và là nguồn hotline chung của site.
const SHIPPING = [
   { carrier: "Giao Hàng Tiết Kiệm", fee: 30000, etaDays: 3, hotline: "0900 000 000"},
   { carrier: "Giao Hàng Hỏa Tốc", fee: 60000, etaDays: 1, hotline: "0989 616 228"},
   { carrier: "Đến nhà vận chuyển lấy đơn", fee: 20000, etaDays: 3, hotline: "0917 844 843"}
];
   


// Các phương thức thanh toán: khoá (cod) -> chữ hiển thị.
const PAYMENT_METHODS = {
    cod: "Thanh toán khi nhận hàng (COD)"
};

// Danh sách tỉnh / thành phố cho ô chọn trong form địa chỉ.
const PROVINCES = ["Thành phố Hà Nội","Thành phố Hồ Chí Minh","Tỉnh An Giang","Tỉnh Bà Rịa - Vũng Tàu","Tỉnh Bắc Giang","Tỉnh Bắc Kạn","Tỉnh Bạc Liêu","Tỉnh Bắc Ninh","Tỉnh Bến Tre","Tỉnh Bình Định","Tỉnh Bình Dương","Tỉnh Bình Phước","Tỉnh Bình Thuận","Tỉnh Cà Mau","Thành phố Cần Thơ","Tỉnh Cao Bằng","Thành phố Đà Nẵng","Tỉnh Đắk Lắk","Tỉnh Đắk Nông","Tỉnh Điện Biên","Tỉnh Đồng Nai","Tỉnh Đồng Tháp","Tỉnh Gia Lai","Tỉnh Hà Giang","Tỉnh Hà Nam","Tỉnh Hà Tĩnh","Tỉnh Hải Dương","Thành phố Hải Phòng","Tỉnh Hậu Giang","Tỉnh Hoà Bình","Tỉnh Hưng Yên","Tỉnh Khánh Hòa","Tỉnh Kiên Giang","Tỉnh Kon Tum","Tỉnh Lai Châu","Tỉnh Lâm Đồng","Tỉnh Lạng Sơn","Tỉnh Lào Cai","Tỉnh Long An","Tỉnh Nam Định","Tỉnh Nghệ An","Tỉnh Ninh Bình","Tỉnh Ninh Thuận","Tỉnh Phú Thọ","Tỉnh Phú Yên","Tỉnh Quảng Bình","Tỉnh Quảng Nam","Tỉnh Quảng Ngãi","Tỉnh Quảng Ninh","Tỉnh Quảng Trị","Tỉnh Sóc Trăng","Tỉnh Sơn La","Tỉnh Tây Ninh","Tỉnh Thái Bình","Tỉnh Thái Nguyên","Tỉnh Thanh Hóa","Tỉnh Thừa Thiên Huế","Tỉnh Tiền Giang","Tỉnh Trà Vinh","Tỉnh Tuyên Quang","Tỉnh Vĩnh Long","Tỉnh Vĩnh Phúc","Tỉnh Yên Bái"];

// Các đơn hàng mẫu để thử tra cứu (ví dụ mã LN100002). Hàm này chạy ngay một lần ( (function () {...})() ) và trả về mảng đơn.
// H = 1 giờ tính bằng mili giây. Các mốc thời gian được tính lùi từ lúc hiện tại nên đơn luôn trông "mới đặt".
const MOCK_ORDERS = (function () {
    const H = 3600 * 1000;
    const now = Date.now();
    // Tạo mảng mốc thời gian các bước: mốc đầu = start + khoảng cách đầu, mỗi mốc sau = mốc trước + khoảng cách kế tiếp (cộng dồn).
    const events = (start, gaps) => gaps.reduce((arr, g) => {
        let last = start;
        if (arr.length) last = arr[arr.length - 1];
        arr.push(last + g);
        return arr;
    }, []);
    return [
        {
            code: "LN100001", createdAt: now - 72 * H, payment: "cod",
            customer: { name: "Nguyễn Minh Anh", phone: "0901234567", email: "minhanh@example.com", address: "12 Lê Lợi", ward: "Phường 1", district: "TP. Vũng Tàu", province: "Tỉnh Bà Rịa - Vũng Tàu", note: "" },
            items: [{ id: 2, name: "QUẦN SUÔNG RỘNG NÂU BÈO CẠP", image: "image/products/2-card0.jpg", price: 1498000, qty: 1, size: "M" }],
            events: events(now - 72 * H, [0, 1 * H, 8 * H, 3 * H, 14 * H, 20 * H, 6 * H]).slice(0, 7)
        },
        {
            code: "LN100002", createdAt: now - 30 * H, payment: "cod",
            customer: { name: "Trần Quốc Bảo", phone: "0912345678", email: "quocbao@example.com", address: "45 Nguyễn Huệ", ward: "Phường Bến Nghé", district: "Quận 1", province: "Thành phố Hồ Chí Minh", note: "Giao giờ hành chính" },
            items: [
                { id: 1, name: "ĐẦM THUN ĐEN NHÚN EO", image: "image/products/1-card0.jpg", price: 1998000, qty: 2, size: "S" },
                { id: 3, name: "QUẦN SUÔNG DENIM NÂU", image: "image/products/3-card0.jpg", price: 1298000, qty: 1, size: "L" }
            ],
            events: events(now - 30 * H, [0, 1 * H, 6 * H, 2 * H, 12 * H])
        }
    ];
})();
