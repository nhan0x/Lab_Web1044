const products = [
  { name: "Laptop", price: 1200 },
  { name: "Mouse", price: 30 },
  { name: "Keyboard", price: 75 },
  { name: "Monitor", price: 300 }
];

// a)
products.sort((a, b) => a.price - b.price);

// b)
console.log("Mảng sản phẩm theo giá tăng dần:", products);