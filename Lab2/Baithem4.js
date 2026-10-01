const sanPham = new Map();
sanPham.set("Táo", 20000);
sanPham.set("Cam", 35000);
sanPham.set("Chuối",15000);


// Xuất danh sách 
for(let[ten,gia] of sanPham){
    console.log(`${ten} -${gia} VND`);
}

// Tìm sản phẩm giá cao nhất 
let tenCaoNhat = "";
let giaCaoNhat = 0;

for (let [ten,gia] of sanPham) {
    if (gia > giaCaoNhat) {
        giaCaoNhat  = gia;
        tenCaoNhat = ten;
    }
}
console.log(`Sản phẩm đắt nhất:  ${tenCaoNhat} - ${giaCaoNhat} VND`);