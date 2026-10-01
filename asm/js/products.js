// Dữ liệu sản phẩm. Ảnh stock miễn phí (Pexels) nằm trong thư mục image/.
// Thêm sản phẩm mới: sao chép một object bên dưới rồi đổi id (không trùng) và nội dung.
// category chỉ nhận: "new" (hàng mới) | "hot" (bán chạy) | "sale" (khuyến mãi)
const products = [
    { id: 1, name: "Áo thun in hình trái tim", price: 149000, image: "image/ao-thun-1.jpg", category: "new",
      description: "Áo thun cotton form unisex, in hình trái tim nổi bật, chất vải mềm mát thoáng khí, phù hợp mặc hằng ngày." },
    { id: 2, name: "Áo khoác phao chống nước", price: 650000, image: "image/ao-khoac-2.jpg", category: "new",
      description: "Áo khoác phao có mũ, chống thấm nước nhẹ, giữ ấm tốt, phù hợp mùa đông và các chuyến đi ngoài trời." },
    { id: 3, name: "Giày sneaker cổ cao trắng", price: 420000, image: "image/giay-sneaker-2.jpg", category: "new",
      description: "Giày sneaker cổ cao chất liệu canvas màu trắng, form basic dễ phối đồ, phù hợp cho cả nam và nữ." },
    { id: 4, name: "Túi xách da khóa kim loại", price: 590000, image: "image/tui-xach-2.jpg", category: "new",
      description: "Túi xách da form vuông, điểm nhấn khóa kim loại tinh tế, phù hợp đi làm hoặc dự tiệc nhẹ nhàng." },
    { id: 5, name: "Áo thun graphic nghệ thuật", price: 189000, image: "image/ao-thun-2.jpg", category: "hot",
      description: "Áo thun form rộng in họa tiết nghệ thuật độc đáo, phong cách đường phố cá tính, dễ phối cùng áo khoác." },
    { id: 6, name: "Áo khoác da biker nam", price: 890000, image: "image/ao-khoac-1.jpg", category: "hot",
      description: "Áo khoác da PU dáng biker, nhiều khóa kéo kim loại, phong cách bụi bặm cá tính, dễ phối đồ đi phố." },
    { id: 7, name: "Giày sneaker thể thao đỏ", price: 1090000, image: "image/giay-sneaker-1.jpg", category: "hot",
      description: "Giày sneaker màu đỏ nổi bật, đế êm nhẹ, phong cách thể thao năng động, dễ phối cùng trang phục hằng ngày." },
    { id: 8, name: "Đầm dạ hội ánh kim", price: 750000, image: "image/vay-1.jpg", category: "sale",
      description: "Đầm dạ hội tay dài chất liệu ánh kim sang trọng, tôn dáng, phù hợp dự tiệc hoặc các dịp đặc biệt." },
    { id: 9, name: "Đầm xòe tay bèo pastel", price: 480000, image: "image/vay-2.jpg", category: "sale",
      description: "Đầm midi tay bèo màu tím pastel nhẹ nhàng, thiết kế ôm eo tôn dáng, thích hợp dự tiệc hoặc dạo phố." },
    { id: 10, name: "Túi xách da vân cá sấu", price: 690000, image: "image/tui-xach-1.jpg", category: "sale",
      description: "Túi xách da vân cá sấu sang trọng, thiết kế thanh lịch, có quai xách và dây đeo chéo tiện lợi." }
];
