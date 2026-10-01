const students = [
  { name: "An", score: 8.2 },
  { name: "Bình", score: 7.5 },
  { name: "Chi", score: 9.1 },
  { name: "Duy", score: 6.8 },
  { name: "Hà", score: 8.7 },
  { name: "Khánh", score: 5.9 },
  { name: "Lan", score: 7.8 },
  { name: "Minh", score: 9.4 },
  { name: "Ngọc", score: 6.5 },
  { name: "Quân", score: 8.0 }
];

// a) 
const topStudents = students.filter(student => student.score > 8);
console.log("a) Học sinh có điểm > 8:", topStudents);

// b)
const highestStudent = students.reduce((max, student) => 
  student.score > max.score ? student : max
, students[0]);
console.log("b) Học sinh có điểm cao nhất:", highestStudent);

// c)
const totalScore = students.reduce((sum, student) => sum + student.score, 0);
const averageScore = totalScore / students.length;
console.log("c) Điểm trung bình cả lớp:", averageScore.toFixed(2));

// d) 
const studentNames = students.map(student => student.name);
console.log("d) Danh sách tên học sinh:", studentNames);

// e) 
const sortedStudents = [...students].sort((a, b) => b.score - a.score);
console.log("e) Danh sách sau khi sắp xếp giảm dần:", sortedStudents);