// Bài thêm 1: Tính chu vi, diện tích, đường chéo hình chữ nhật
function thongTinHCN(a, b) {
    const chuVi = 2 * (a + b);
    const dienTich = a * b;
    const duongCheo = Math.sqrt(a * a + b * b);

    return { chuVi, dienTich, duongCheo };
}

console.log(thongTinHCN(3, 4));
// { chuVi: 14, dienTich: 12, duongCheo: 5 }
