// Bài 4: Chuẩn hoá câu
// - Xoá khoảng trắng dư thừa (đầu, giữa, cuối câu)
// - Xoá khoảng trắng trước dấu câu, thêm khoảng trắng sau dấu câu
// - Viết hoa chữ cái đầu câu (đầu chuỗi và sau mỗi dấu . ! ?)
function chuanHoaCau(str) {
    let ketQua = str.trim().replace(/\s+/g, " ");           // gộp nhiều khoảng trắng thành 1, xoá đầu/cuối
    ketQua = ketQua.replace(/\s+([.,!?])/g, "$1");            // xoá khoảng trắng trước dấu câu
    ketQua = ketQua.replace(/([.,!?])(\S)/g, "$1 $2");        // thêm khoảng trắng sau dấu câu nếu thiếu
    ketQua = ketQua.replace(/(^|[.!?]\s)(\p{L})/gu, (m, p1, p2) => p1 + p2.toUpperCase()); // viết hoa đầu câu

    return ketQua;
}

const input = " xin chao  cac ban.   hom nay  troi dep qua  !toi  di hoc ve ? ";
console.log(chuanHoaCau(input));
// "Xin chao cac ban. Hom nay troi dep qua! Toi di hoc ve?"
