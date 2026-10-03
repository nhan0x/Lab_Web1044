/**
 * data.js - Toàn bộ dữ liệu của website (object / array of objects)
 * Môn: Web1044 - Lập trình cơ sở với JavaScript
 * Các file khác chỉ đọc dữ liệu từ đây rồi render ra giao diện.
 */

// 3 nhóm sản phẩm theo yêu cầu: mới, hot, khuyến mãi
const PRODUCT_GROUPS = {
  new: 'Sản Phẩm Mới',
  hot: 'Sản Phẩm Hot',
  sale: 'Khuyến Mãi'
};

// Danh sách sản phẩm (featured = true thì hiển thị ở trang chủ)
const PRODUCTS = [
  {
    id: 'p01',
    name: 'Sofa Da Thật Kèm Bàn Trà Đá Marble',
    group: 'new',
    price: 68500000,
    oldPrice: null,
    image: 'image/project-lavila-1.jpg',
    featured: true,
    desc: 'Bộ sofa da bò Ý màu đen đi cùng bàn trà mặt đá marble vân mây, phù hợp phòng khách biệt thự phong cách Quiet Luxury.',
    specs: { 'Chất liệu': 'Da bò Ý, khung gỗ sồi', 'Kích thước': '3200 x 1000 x 780 mm', 'Bảo hành': '5 năm' }
  },
  {
    id: 'p02',
    name: 'Sofa Văn Góc Phong Cách Warm Minimalism',
    group: 'new',
    price: 54900000,
    oldPrice: null,
    image: 'image/project-lacasa.jpg',
    featured: true,
    desc: 'Sofa văn góc tông trắng kem, đệm mút D40 êm ái, kèm bàn trà đá nung mặt tròn dành cho căn hộ cao cấp.',
    specs: { 'Chất liệu': 'Vải bố cao cấp, khung gỗ tự nhiên', 'Kích thước': '2800 x 1600 x 750 mm', 'Bảo hành': '5 năm' }
  },
  {
    id: 'p03',
    name: 'Bộ Ghế Thư Giãn Ngoài Trời Resort',
    group: 'new',
    price: 39800000,
    oldPrice: null,
    image: 'image/project-resort.jpg',
    featured: false,
    desc: 'Bộ sofa và bàn trà ngoài trời khung nhôm sơn tĩnh điện, đệm chống nước, dùng cho sân vườn và hồ bơi biệt thự.',
    specs: { 'Chất liệu': 'Nhôm sơn tĩnh điện, vải chống thấm', 'Kích thước': '2400 x 900 x 700 mm', 'Bảo hành': '3 năm' }
  },
  {
    id: 'p04',
    name: 'Sofa Da Nâu Kèm Ghế Armchair Khung Thép',
    group: 'hot',
    price: 72000000,
    oldPrice: null,
    image: 'image/about-main.jpg',
    featured: true,
    desc: 'Sofa da nâu cognac đi cùng cặp armchair khung thép đen, điểm nhấn ấm áp cho phòng khách penthouse.',
    specs: { 'Chất liệu': 'Da bò thật, khung thép sơn đen', 'Kích thước': '2600 x 950 x 800 mm', 'Bảo hành': '5 năm' }
  },
  {
    id: 'p05',
    name: 'Sofa Module Xám Kèm Bàn Gỗ Óc Chó Nguyên Khối',
    group: 'hot',
    price: 95000000,
    oldPrice: null,
    image: 'image/hero-bg.jpg',
    featured: true,
    desc: 'Sofa module xám ghi ghép linh hoạt cùng bàn trà gỗ óc chó nguyên khối nhập Bắc Mỹ chuẩn FAS, đi kèm 2 đôn da.',
    specs: { 'Chất liệu': 'Gỗ óc chó FAS, vải bọc dệt dày', 'Kích thước': '3000 x 1100 x 750 mm', 'Bảo hành': '5 năm' }
  },
  {
    id: 'p06',
    name: 'Bộ Bàn Ăn Ngoài Trời Thảo Điền',
    group: 'hot',
    price: 46500000,
    oldPrice: null,
    image: 'image/project-thaodien.jpg',
    featured: false,
    desc: 'Bàn ăn 6 ghế ngoài trời mặt gỗ teak xử lý chống mối mọt, thiết kế cho sân vườn và hiên biệt thự.',
    specs: { 'Chất liệu': 'Gỗ teak, chân thép mạ', 'Kích thước': '1800 x 900 x 750 mm', 'Bảo hành': '3 năm' }
  },
  {
    id: 'p07',
    name: 'Sofa Be Bo Tròn Kèm Vách Tivi Ốp Đá',
    group: 'sale',
    price: 58000000,
    oldPrice: 69000000,
    image: 'image/project-lavila-2.jpg',
    featured: true,
    desc: 'Sofa da be bo tròn êm ái cùng vách tivi ốp đá vân gỗ và kệ tivi mặt đá đen, trọn bộ phòng khách dinh thự.',
    specs: { 'Chất liệu': 'Da công nghiệp cao cấp, đá nung kết', 'Kích thước': 'Vách tivi 2800 x 2600 mm', 'Bảo hành': '5 năm' }
  },
  {
    id: 'p08',
    name: 'Kệ Tivi & Bench Ốp Gỗ Óc Chó Phòng Khách Mở',
    group: 'sale',
    price: 84000000,
    oldPrice: 99000000,
    image: 'image/project-penthouse.jpg',
    featured: true,
    desc: 'Combo kệ treo tường, bench dài ốp gỗ óc chó và sofa xám cho không gian phòng khách liên thông bếp.',
    specs: { 'Chất liệu': 'Gỗ óc chó, MDF chống ẩm An Cường', 'Kích thước': '3600 x 450 x 2400 mm', 'Bảo hành': '5 năm' }
  },
  {
    id: 'p09',
    name: 'Bộ Ghế Nằm Hồ Bơi Kèm Ô Che Sân Vườn',
    group: 'sale',
    price: 27900000,
    oldPrice: 33000000,
    image: 'image/about-sub.jpg',
    featured: false,
    desc: 'Cặp ghế nằm gỗ teak cùng ô che nắng ngoài trời đường kính 3m, dành cho khu hồ bơi và sân vườn.',
    specs: { 'Chất liệu': 'Gỗ teak, vải canvas chống UV', 'Kích thước': '1900 x 650 x 350 mm', 'Bảo hành': '2 năm' }
  }
];

// Ảnh cho slider ở banner đầu trang
const HERO_SLIDES = [
  { image: 'image/hero-bg.jpg', alt: 'Thiết kế nội thất biệt thự phong cách Quiet Luxury sang trọng' },
  { image: 'image/project-penthouse.jpg', alt: 'Phòng khách liên thông ốp gỗ óc chó cho penthouse' },
  { image: 'image/project-lacasa.jpg', alt: 'Không gian căn hộ cao cấp tông trắng kem ấm áp' }
];

// Mã giảm giá (giá trị là % giảm)
const COUPONS = {
  'DOPHUC10': 10,
  'NOITHAT5': 5
};

// Cấu hình Flash Sale: kết thúc vào 24:00 mỗi ngày
const FLASH_SALE_LABEL = 'Flash Sale kết thúc sau';

// Tiện ích dùng chung
function formatPrice(value) {
  return value.toLocaleString('vi-VN') + '₫';
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
