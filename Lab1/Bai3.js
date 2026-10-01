// Kết quả 105
console.log("10" + 5);
// kết quả 5
console.log("10" - 5);
// -> Kết quả: 20 (number)
console.log(Number("20"));
//-> Kết quả: "123" (string)
console.log(String(123));
//-> Kết quả: false (boolean)
console.log(Boolean(""));
// Toán tử Unary (+) ép chuỗi "123" thành số 123 -> Kết quả: 123 (number)
console.log(+"123");
// Trick: Nếu gặp toán tử (+) thì sẽ là ép tất cả sang kiểu chuỗi và nối tiếp nhau.Còn các toán tử còn lại đều trả về kiểu dữ liệu numbers.

// 2. ĐỀ XUẤT CÁCH SỬA LỖI (ÉP KIỂU ĐỂ TRÁNH LỖI LOGIC):

// Cách 1: Sử dụng hàm Number()
console.log(`Sửa lỗi bằng Number():`, Number("10") + 5);
//Cách 2: Sử dụng parseInt()
console.log(`Sửa lỗi bằng parseInt():`, parseInt("10") + 5);
// Cách 3: Sử dụng toán tử Unary (+)
console.log(`Sửa lỗi bằng toán tử Unary (+):`, +"10" + 5);