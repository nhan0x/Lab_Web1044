let diemTrungBinh = Number (prompt("Mời bạn nhập điểm số vào để tính trung bình: "));

if(isNaN(diemTrungBinh < 0)){
    console.log("Số bạn vừa nhập không thể tính ra được!");
}else if(diemTrungBinh >=8){
    console.log("Bạn là học sinh giỏi");
}else if (diemTrungBinh >=6.5){
    console.log("Bạn là học sinh khá");
}else if (diemTrungBinh >=5){
    console.log("Bạn là học sinh trung bình");
}else if(diemTrungBinh >= 3.5){
    console.log("Bạn là học sinh yếu");
}else{
    console.log("Bạn là học sinh kém")
}