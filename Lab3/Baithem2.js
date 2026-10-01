// Bài thêm 2: Xếp loại sinh viên dựa trên điểm trung bình
// >=8 Gioi | >=6.5 Kha | >=5 Trung binh | >=3.5 Yeu | <3.5 Kem
function xepLoaiSinhVien(diem) {
    if (diem >= 8) {
        return "Gioi";
    } else if (diem >= 6.5) {
        return "Kha";
    } else if (diem >= 5) {
        return "Trung binh";
    } else if (diem >= 3.5) {
        return "Yeu";
    } else {
        return "Kem";
    }
}

console.log(xepLoaiSinhVien(9));   // Gioi
console.log(xepLoaiSinhVien(7));   // Kha
console.log(xepLoaiSinhVien(5.5)); // Trung binh
console.log(xepLoaiSinhVien(4));   // Yeu
console.log(xepLoaiSinhVien(2));   // Kem
