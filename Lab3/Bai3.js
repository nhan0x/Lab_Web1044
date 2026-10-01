// Bài 3: Tính lương theo chức vụ và ngày công
// Lương = hệ số chức vụ * ngày công * (lương cơ bản / ngày công quy định)
function tinhLuong(chucVu, ngayCong) {
    const luongCoBan = 5000000;
    const ngayCongQuyDinh = 24;
    let heSo;

    switch (chucVu) {
        case "intern":
            heSo = 1.0;
            break;
        case "staff":
            heSo = 1.5;
            break;
        case "senior":
            heSo = 2.0;
            break;
        case "manager":
            heSo = 3.0;
            break;
        default:
            return "Chuc vu khong hop le";
    }

    return heSo * ngayCong * (luongCoBan / ngayCongQuyDinh);
}

console.log("Luong staff, 22 ngay cong:", tinhLuong("staff", 22));
console.log("Luong manager, 24 ngay cong:", tinhLuong("manager", 24));
