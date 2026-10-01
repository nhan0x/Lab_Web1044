// Bài 2: Tính tiền điện theo bậc thang (lũy tiến)
// 0-50 kWh: 1.800đ/kWh
// 51-100 kWh: 2.300đ/kWh
// >100 kWh: 3.000đ/kWh
function tinhTienDien(kwh) {
    if (kwh <= 50) {
        return kwh * 1800;
    } else if (kwh <= 100) {
        return 50 * 1800 + (kwh - 50) * 2300;
    } else {
        return 50 * 1800 + 50 * 2300 + (kwh - 100) * 3000;
    }
}

// Tính ngược: biết số tiền, suy ra số kWh đã dùng
function tinhSoKwhTuTien(tien) {
    const tienBac1 = 50 * 1800; // 90.000đ
    const tienBac2 = 50 * 2300; // 115.000đ

    if (tien <= tienBac1) {
        return tien / 1800;
    } else if (tien <= tienBac1 + tienBac2) {
        return 50 + (tien - tienBac1) / 2300;
    } else {
        return 100 + (tien - tienBac1 - tienBac2) / 3000;
    }
}

console.log("Tien dien (150 kWh):", tinhTienDien(150));
console.log("So kWh da dung khi dong 910.000d:", tinhSoKwhTuTien(910000));
