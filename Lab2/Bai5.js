let n = Number(prompt("Nhập số để kiểm tra: "));
let laNguyenTo = true;

if (isNaN(n)) {
    console.log("Vui lòng nhập số hợp lệ!");
} else if (n < 2) {
    console.log(`${n} không phải số nguyên tố`);
} else {
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            laNguyenTo = false;
            break;
        }
    }

    if (laNguyenTo) {
        console.log(`${n} là số nguyên tố`);
    } else {
        console.log(`${n} không phải số nguyên tố`);
    }
}