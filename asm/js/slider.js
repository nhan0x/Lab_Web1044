// Slider banner: tự chuyển ảnh, nút trước/sau, chấm tròn, vuốt trên điện thoại.

class Slider {
    // Lấy các ảnh (.slide) và chỗ đặt chấm tròn, dựng chấm, gắn sự kiện, hiện ảnh đầu tiên rồi bật tự chạy.
    constructor(root) {
        this.root = root;
        this.slides = root.querySelectorAll(".slide");
        this.dotsWrap = root.querySelector(".slider-dots");
        this.interval = 4000;
        this.current = 0;
        this.timer = null;
        this.touchStartX = null;

        this.createDots();
        this.bindEvents();
        this.goTo(0);
        this.start();
    }

    // Tạo mỗi ảnh một chấm tròn (button). Bấm chấm i thì nhảy tới ảnh i và đặt lại bộ đếm giờ tự chuyển.
    createDots() {
        this.slides.forEach((_, i) => {
            const dot = document.createElement("button");
            dot.className = "slider-dot";
            dot.setAttribute("aria-label", "Ảnh " + (i + 1));
            dot.addEventListener("click", () => { this.goTo(i); this.start(); });
            this.dotsWrap.appendChild(dot);
        });
        this.dots = this.dotsWrap.querySelectorAll(".slider-dot");
    }

    // Chuyển tới ảnh thứ index. Phép "(index + số ảnh) % số ảnh" làm cho chạy vòng tròn:
    // sau ảnh cuối quay về ảnh đầu, lùi từ ảnh đầu thì nhảy về ảnh cuối.
    // Sau đó chỉ ảnh và chấm hiện tại có class "active".
    goTo(index) {
        this.current = (index + this.slides.length) % this.slides.length;
        this.slides.forEach((s, n) => s.classList.toggle("active", n === this.current));
        this.dots.forEach((d, n) => d.classList.toggle("active", n === this.current));
    }

    // Bật tự chuyển: huỷ bộ đếm cũ trước (tránh chạy chồng nhiều bộ đếm), rồi cứ 4 giây sang ảnh kế tiếp.
    start() {
        this.stop();
        this.timer = setInterval(() => this.goTo(this.current + 1), this.interval);
    }

    // Dừng tự chuyển.
    stop() { clearInterval(this.timer); }

    // Gắn sự kiện: nút trước/sau, rê chuột vào thì dừng và rê ra thì chạy tiếp,
    // chuyển sang tab khác của trình duyệt thì dừng, quay lại thì chạy tiếp.
    bindEvents() {
        this.root.querySelector(".prev").addEventListener("click", () => { this.goTo(this.current - 1); this.start(); });
        this.root.querySelector(".next").addEventListener("click", () => { this.goTo(this.current + 1); this.start(); });

        this.root.addEventListener("mouseenter", () => this.stop());
        this.root.addEventListener("mouseleave", () => this.start());
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) this.stop();
            else this.start();
        });

    }
}

// Chỉ tạo slider khi trang có #hero-slider (trang chủ).
const heroEl = document.getElementById("hero-slider");
let slider = null;
if (heroEl) slider = new Slider(heroEl);
