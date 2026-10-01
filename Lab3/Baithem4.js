// Bài thêm 4: Tính tiền sản phẩm, giảm giá nếu tổng >= 1.000.000
// total = price * quantity, giam 10% neu total >= 1.000.000
const discount = (price, quantity = 1) => {
    const total = price * quantity;
    return total >= 1000000 ? total * 0.1 : 0;
};

const calculateTotal = function (price, quantity = 1) {
    const total = price * quantity;
    return total - discount(price, quantity);
};

console.log("Tong tien (600.000 x 1):", calculateTotal(600000));    // 600000, khong giam
console.log("Tong tien (600.000 x 2):", calculateTotal(600000, 2)); // 1080000, giam 10%
