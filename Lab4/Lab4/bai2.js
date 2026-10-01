const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Mảng mẫu

// a)
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log("a) Mảng số chẵn:", evenNumbers);

// b)
const doubledEvenNumbers = evenNumbers.map(num => num * 2);
console.log("b) Mảng số chẵn gấp đôi:", doubledEvenNumbers);