// Bài 5: Hàm calculator như máy tính cầm tay
function calculator(a, operator, b) {
    switch (operator) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            if (b === 0) return "Khong the chia cho 0";
            return a / b;
        default:
            return "Toan tu khong hop le";
    }
}

console.log(calculator(15.5, "*", 2)); // 31
console.log(calculator(10, "/", 0));   // Khong the chia cho 0
console.log(calculator(5, "+", 3));    // 8
