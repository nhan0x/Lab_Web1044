// Mảng bị trùng tên
const rawNames = ["An", "Bình", "An", "Chi", "Bình", "Dũng", "Chi"];

// Yêu cầu 1: Dùng Set để lọc tên trùng
const uniqueNames = new Set(rawNames);

// Yêu cầu 2: Dùng forEach in ra từng tên kèm số thứ tự
let stt = 1;
uniqueNames.forEach(function(ten) {
    console.log(`${stt}. ${ten}`);
    stt++;
});