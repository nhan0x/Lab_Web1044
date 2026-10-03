// Đồng hồ đếm ngược Flash Sale trên dải đầu trang: đếm tới 23:59:59 hôm nay, cập nhật mỗi giây (yêu cầu Y1.6).

class Countdown {
    constructor() {
        this.timer = null;
        this.start();
    }

    endTime() {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end.getTime();
    }

    twoDigits(n) {
        return n < 10 ? "0" + n : "" + n;
    }

    tick() {
        let left = Math.max(0, this.endTime() - Date.now());
        const hours = Math.floor(left / 3600000);
        const minutes = Math.floor((left % 3600000) / 60000);
        const seconds = Math.floor((left % 60000) / 1000);
        Utils.setText("cd-hours", this.twoDigits(hours));
        Utils.setText("cd-minutes", this.twoDigits(minutes));
        Utils.setText("cd-seconds", this.twoDigits(seconds));
    }

    start() {
        this.tick();
        this.timer = setInterval(() => this.tick(), 1000);
    }
}

const countdown = Utils.$("flash-bar") ? new Countdown() : null;
