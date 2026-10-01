// Bài 1: Kiểm tra số chẳn và lẻ
let a = Number(prompt("Nhập một số nguyên"));

if (isNaN(a)) {
  console.log("Vui lòng nhập một số hợp lệ!");
} else if (a % 2 === 0) {
  console.log(`${a} là số chẵn`);
} else {
  console.log(`${a} là số lẻ`);
}

