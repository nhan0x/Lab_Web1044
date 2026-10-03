/* ===== FLASH SALE: ĐỒNG HỒ ĐẾM NGƯỢC (Yêu cầu Y1.6 - Countdown Clock) =====
   Việc: đếm ngược tới 23:59:59 hôm nay (hết ngày thì sang chương trình của ngày mới), cập nhật mỗi giây.
   Dùng: Utils (utils.js); productList (bấm nút "Xem sản phẩm Sale").
   Giao diện: id="flash-sale", "cd-hours", "cd-minutes", "cd-seconds" trong index.html. */

class Countdown {
    constructor() {
        this.timer = null;
        this.start();
    }

    // Mốc kết thúc: 23:59:59 của ngày hôm nay
    endTime() {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end.getTime();
    }

    // Thêm số 0 phía trước cho đủ 2 chữ số: 5 -> "05"
    twoDigits(n) {
        return n < 10 ? "0" + n : "" + n;
    }

    tick() {
        let left = Math.max(0, this.endTime() - Date.now());   // số mili giây còn lại
        const hours = Math.floor(left / 3600000);
        const minutes = Math.floor((left % 3600000) / 60000);
        const seconds = Math.floor((left % 60000) / 1000);
        Utils.setText("cd-hours", this.twoDigits(hours));
        Utils.setText("cd-minutes", this.twoDigits(minutes));
        Utils.setText("cd-seconds", this.twoDigits(seconds));
    }

    start() {
        this.tick();                                       // hiện ngay, không chờ 1 giây đầu
        this.timer = setInterval(() => this.tick(), 1000);
    }
}

// Chỉ chạy ở trang có khối Flash Sale (trang chủ)
const countdown = Utils.$("flash-sale") ? new Countdown() : null;
