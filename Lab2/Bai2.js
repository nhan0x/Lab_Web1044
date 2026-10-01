// PHẦN 1: Tính tiền điện khi biết trước số kWh

let kwh = Number(prompt("Nhập số kWh tiêu thụ: "));
let tongTien = 0;

if (isNaN(kwh) || kwh < 0) {
  console.log("Vui lòng nhập số kWh hợp lệ (số không âm)!");
} else {
  if (kwh <= 50) {
    tongTien = kwh * 1800;
  } else if (kwh <= 100) {
    tongTien = 50 * 1800 + (kwh - 50) * 2300;
  } else {
    tongTien = 50 * 1800 + 50 * 2300 + (kwh - 100) * 3000;
  }
  
  console.log(`Số điện tiêu thụ: ${kwh} kWh`);
  console.log(`Tiền điện phải trả: ${tongTien.toLocaleString("vi-VN")} VNĐ`);
}


// PHẦN 2: Tính số điện tiêu thụ khi biết tiền là 910.000đ

let tien = 910000;
let kwhTieuThu = 0;

const moc1 = 50 * 1800;             // 90.000đ cho 50 kWh đầu
const moc2 = moc1 + 50 * 2300;      // 205.000đ cho 100 kWh đầu

if (tien <= moc1) {
  kwhTieuThu = tien / 1800;
} else if (tien <= moc2) {
  kwhTieuThu = 50 + (tien - moc1) / 2300;
} else {
  kwhTieuThu = 100 + (tien - moc2) / 3000;
}

// Làm tròn 2 chữ số thập phân cho gọn gàng
console.log("------------------------------------------");
console.log(`Với số tiền điện là ${tien} VNĐ:`);
console.log(`Nhà đó đã dùng: ${kwhTieuThu.toFixed(2)} kWh (hoặc xấp xỉ ${Math.round(kwhTieuThu)} kWh)`);
