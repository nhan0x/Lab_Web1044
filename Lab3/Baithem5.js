// Bài thêm 5: Tính tổng nhiều số (rest parameters)
function sum(...numbers) {
    let total = 0;
    for (let num of numbers) {
        total += num;
    }
    return total;
}

console.log("Tong la:", sum(2, 3, 5, 6, 8)); // 24
