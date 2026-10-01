

const studentScores = {
    math: 8.5,
    english: 7.0,
    physics: 9.0,
    chemistry: 6.5
};
let tongDiem = 0;
let soMon = 0;
// VÒng lặp for in dùng cho object, nó sẽ lặp qua các key của object
for(let monHoc in studentScores){
    //monHoc là key của object studentScores, studentScores[monHoc] là value của key đó
    console.log(monHoc);
    console.log(studentScores[monHoc]);
    tongDiem += studentScores[monHoc];
    soMon++
}
let diemTB = tongDiem / soMon;
console.log(`Điểm trung bình: ${diemTB}`);

