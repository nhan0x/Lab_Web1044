// Dữ liệu nhân viên & ảnh Snap lấy từ elise.vn (trang chủ và trang /staffstart/staff), ảnh lưu trong image/staff/.
// staff: thứ tự mảng = "nhân viên mới nhất"; viewOrder = thứ hạng khi sắp xếp "lượt xem nhiều nhất".
// avatar rỗng = nhân viên chưa có ảnh (hiện vòng tròn xám).
const STAFF = [
    {"id":131201,"name":"Nguyễn Thị Hằng Nhi","height":170,"location":"Luna Biên Hòa 3","avatar":"image/staff/avatar-131201.jpg","viewOrder":2},
    {"id":131183,"name":"Huỳnh Thị Thu Nhung","height":165,"location":"Luna Thanh Hoá 1","avatar":"image/staff/avatar-131183.jpg","viewOrder":1},
    {"id":131219,"name":"Phạm Mỹ Linh","height":158,"location":"Luna Nguyễn Gia Thiều","avatar":"image/staff/avatar-131219.jpg","viewOrder":7},
    {"id":131224,"name":"Huỳnh Thị Trâm Anh","height":156,"location":"Luna Bến Tre","avatar":"image/staff/avatar-131224.jpg","viewOrder":4},
    {"id":131222,"name":"Nguyễn Hồng Hạnh","height":160,"location":"Luna Hà Nam","avatar":"image/staff/avatar-131222.jpg","viewOrder":3},
    {"id":131225,"name":"Nguyễn Thị Kiều Oanh","height":158,"location":"Luna Phan Đăng Lưu","avatar":"image/staff/avatar-131225.jpg","viewOrder":16},
    {"id":131221,"name":"Nguyễn Thị Thủy","height":165,"location":"Luna Uông Bí","avatar":"image/staff/avatar-131221.jpg","viewOrder":5},
    {"id":131220,"name":"Nguyễn Thị Hồng Nhung","height":157,"location":"Luna Nam Định","avatar":"image/staff/avatar-131220.jpg","viewOrder":15},
    {"id":131212,"name":"Trần Thị Như Quỳnh","height":163,"location":"Luna Điện Biên Phủ, Đà Nẵng","avatar":"image/staff/avatar-131212.jpg","viewOrder":6},
    {"id":131210,"name":"Gia Quyen","height":155,"location":"Luna Lê Văn Sỹ","avatar":"image/staff/avatar-131210.jpg","viewOrder":12},
    {"id":131197,"name":"Phạm Minh Thư","height":155,"location":"Luna Củ Chi","avatar":"image/staff/avatar-131197.jpg","viewOrder":9},
    {"id":131217,"name":"Trần Hồng Hạnh","height":160,"location":"Luna Trần Duy Hưng","avatar":"image/staff/avatar-131217.jpg","viewOrder":8},
    {"id":131203,"name":"Hồ Thị Trúc Mai","height":158,"location":"Luna Long Thành","avatar":"image/staff/avatar-131203.jpg","viewOrder":18},
    {"id":131199,"name":"Mai Lê Như Quỳnh","height":155,"location":"Luna Trường Chinh","avatar":"image/staff/avatar-131199.jpg","viewOrder":10},
    {"id":131211,"name":"Trang Nguyen","height":165,"location":"Luna Nam Kỳ Khởi Nghĩa","avatar":"image/staff/avatar-131211.jpg","viewOrder":11},
    {"id":132028,"name":"Trần Anh Thư","height":160,"location":"Luna Hậu Giang, Quận 6","avatar":"image/staff/avatar-132028.jpg","viewOrder":13},
    {"id":131209,"name":"Ngọc Dâu","height":152,"location":"Luna Bạc Liêu","avatar":"image/staff/avatar-131209.jpg","viewOrder":14},
    {"id":131190,"name":"Lê Thị Diệu Hồng","height":165,"location":"Luna Royal","avatar":"","viewOrder":17},
    {"id":131218,"name":"Bùi Thanh Hoa","height":155,"location":"Luna Việt Trì","avatar":"image/staff/avatar-131218.jpg","viewOrder":19}
];

// Snap: mỗi ảnh gắn với 1 nhân viên (staffId). Hai tab trên trang chủ: Mới nhất / Phổ biến.
const SNAPS_LATEST = [
    {"id":68556693,"staffId":131201,"image":"image/staff/snap-68556693.jpg"},
    {"id":68552894,"staffId":131201,"image":"image/staff/snap-68552894.jpg"},
    {"id":68552539,"staffId":131201,"image":"image/staff/snap-68552539.jpg"},
    {"id":68552213,"staffId":131201,"image":"image/staff/snap-68552213.jpg"},
    {"id":68407272,"staffId":131201,"image":"image/staff/snap-68407272.jpg"},
    {"id":68405710,"staffId":131201,"image":"image/staff/snap-68405710.jpg"},
    {"id":65431243,"staffId":131183,"image":"image/staff/snap-65431243.jpg"},
    {"id":65431615,"staffId":131183,"image":"image/staff/snap-65431615.jpg"},
    {"id":65431586,"staffId":131183,"image":"image/staff/snap-65431586.jpg"},
    {"id":65431551,"staffId":131183,"image":"image/staff/snap-65431551.jpg"},
    {"id":65431476,"staffId":131183,"image":"image/staff/snap-65431476.jpg"},
    {"id":65431422,"staffId":131183,"image":"image/staff/snap-65431422.jpg"},
    {"id":65431338,"staffId":131183,"image":"image/staff/snap-65431338.jpg"},
    {"id":65431277,"staffId":131183,"image":"image/staff/snap-65431277.jpg"},
    {"id":65431193,"staffId":131183,"image":"image/staff/snap-65431193.jpg"}
];
const SNAPS_POPULAR = [
    {"id":68552213,"staffId":131201,"image":"image/staff/snap-68552213.jpg"},
    {"id":65431586,"staffId":131183,"image":"image/staff/snap-65431586.jpg"},
    {"id":68556693,"staffId":131201,"image":"image/staff/snap-68556693.jpg"},
    {"id":68552539,"staffId":131201,"image":"image/staff/snap-68552539.jpg"},
    {"id":63040155,"staffId":131183,"image":"image/staff/snap-63040155.jpg"},
    {"id":68407272,"staffId":131201,"image":"image/staff/snap-68407272.jpg"},
    {"id":65431615,"staffId":131183,"image":"image/staff/snap-65431615.jpg"},
    {"id":63040231,"staffId":131183,"image":"image/staff/snap-63040231.jpg"},
    {"id":62460391,"staffId":131224,"image":"image/staff/snap-62460391.jpg"},
    {"id":62389036,"staffId":131183,"image":"image/staff/snap-62389036.jpg"},
    {"id":61885972,"staffId":131201,"image":"image/staff/snap-61885972.jpg"},
    {"id":55540885,"staffId":131183,"image":"image/staff/snap-55540885.jpg"},
    {"id":68552894,"staffId":131201,"image":"image/staff/snap-68552894.jpg"},
    {"id":65431277,"staffId":131183,"image":"image/staff/snap-65431277.jpg"},
    {"id":62917043,"staffId":131183,"image":"image/staff/snap-62917043.jpg"}
];

// Xếp hạng nhân viên (thứ tự 1 → 15) theo id nhân viên
const STAFF_RANKING = [131183,131201,131222,131224,131221,131212,131219,131217,131197,131199,131211,131210,132028,131209,131220];
