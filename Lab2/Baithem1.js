let month = Number (prompt("Nhập vào tháng (1-12: "));

switch(month){
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
        console.log(`Tháng có ${month}31 ngày`);
        break;
    case 4:
    case 6:
    case 9:
    case 11:
        console.log(`Tháng có ${month}30 ngày`);
        break;
    case 2: 
        console.log(`Tháng có ${month} 28 or 29 days`);
        break;
    default: 
        console.log("Tháng khong hợp lệ! Vui lòng nhập lại từ 1 đến 12");
}
