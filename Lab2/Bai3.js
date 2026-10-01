let chucVu = prompt("Nhập chức vụ (intern/staff/senior/manager): ");
let ngayCong = Number(prompt("Nhập số ngày công: "));
let heSo = 0;

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
        console.log("Chức vụ không hợp lệ!");
}

if (heSo > 0) {
    let luong = heSo * ngayCong * (5000000 / 24);
    console.log(`Chức vụ ${chucVu}, ${ngayCong} ngày công, lương: ${luong} VNĐ`);
}