// Đặt bài toán: Một giỏ hàng gồm nhiều mặt hàng (tên, giá, số lượng)
const cart = [
  { name: "Áo sơ mi", price: 250, quantity: 2 },
  { name: "Quần jean", price: 500, quantity: 1 },
  { name: "Tất", price: 20, quantity: 5 }
];

// 1. 
const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
console.log("Tổng giá trị giỏ hàng:", totalPrice);

// 2. 
const bulkItems = cart.filter(item => item.quantity > 1);
console.log("Các mặt hàng mua nhiều hơn 1 sản phẩm:", bulkItems);