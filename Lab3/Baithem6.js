// Bài thêm 6: Tìm số lớn nhất trong nhiều số (rest parameters)
function max(...numbers) {
    let m = numbers[0];
    for (let c of numbers) {
        if (m < c) {
            m = c;
        }
    }
    return m;
}

console.log("Max la:", max(10, 3, 20, 6, 4, 8)); // 20
