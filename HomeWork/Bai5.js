let age5 = 20;
console.log("Age ban đầu:", age5);

age5 = 21;
console.log("Age sau khi thay đổi:", age5);

const PI = 3.14;
console.log("PI:", PI);

// Thử thay đổi PI -> sẽ bị lỗi vì PI là const
try {
    PI = 3.14159;
} catch (e) {
    console.log("Lỗi:", e.message);
}
// Giá trị của const sẽ không bao giờ thay đổi được sau khi đã gán.