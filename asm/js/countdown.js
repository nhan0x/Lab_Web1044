// Đồng hồ đếm ngược Flash Sale trên dải đầu trang: đếm tới 23:59:59 hôm nay, cập nhật mỗi giây (yêu cầu Y1.6).

class Countdown {
    // Chạy ngay khi tạo: bắt đầu đếm.
    constructor() {
        this.timer = null;
        this.start();
    }

    // Thời điểm kết thúc = 23:59:59.999 của hôm nay (trả về dạng số mili giây).
    endTime() {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end.getTime();
    }

    // Luôn hiện 2 chữ số: 5 -> "05", 12 -> "12".
    twoDigits(n) {
        if (n < 10) return "0" + n;
        return "" + n;
    }

    // Chạy mỗi giây: tính thời gian còn lại rồi tách thành giờ / phút / giây để ghi lên màn hình.
    // 1 giờ = 3.600.000 ms, 1 phút = 60.000 ms, 1 giây = 1.000 ms. Dấu % lấy phần dư để ra phút và giây còn lẻ.
    tick() {
        let left = Math.max(0, this.endTime() - Date.now());
        const hours = Math.floor(left / 3600000);
        const minutes = Math.floor((left % 3600000) / 60000);
        const seconds = Math.floor((left % 60000) / 1000);
        Utils.setText("cd-hours", this.twoDigits(hours));
        Utils.setText("cd-minutes", this.twoDigits(minutes));
        Utils.setText("cd-seconds", this.twoDigits(seconds));
    }

    // Cập nhật ngay một lần (để khỏi chờ 1 giây mới thấy số), rồi hẹn chạy tick() lặp lại mỗi 1000 ms.
    start() {
        this.tick();
        this.timer = setInterval(() => this.tick(), 1000);
    }
}

// Chỉ tạo đồng hồ khi trang có dải #flash-bar (các trang khác không có thì bỏ qua).
let countdown = null;
if (Utils.$("flash-bar")) countdown = new Countdown();
