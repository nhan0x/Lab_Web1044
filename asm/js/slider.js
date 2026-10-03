// Slider banner: tự chuyển ảnh, nút trước/sau, chấm tròn, vuốt trên điện thoại.

class Slider {
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

    goTo(index) {
        this.current = (index + this.slides.length) % this.slides.length;
        this.slides.forEach((s, n) => s.classList.toggle("active", n === this.current));
        this.dots.forEach((d, n) => d.classList.toggle("active", n === this.current));
    }

    start() {
        this.stop();
        this.timer = setInterval(() => this.goTo(this.current + 1), this.interval);
    }

    stop() { clearInterval(this.timer); }

    bindEvents() {
        this.root.querySelector(".prev").addEventListener("click", () => { this.goTo(this.current - 1); this.start(); });
        this.root.querySelector(".next").addEventListener("click", () => { this.goTo(this.current + 1); this.start(); });

        this.root.addEventListener("mouseenter", () => this.stop());
        this.root.addEventListener("mouseleave", () => this.start());
        document.addEventListener("visibilitychange", () => { document.hidden ? this.stop() : this.start(); });

    }
}

const heroEl = document.getElementById("hero-slider");
const slider = heroEl ? new Slider(heroEl) : null;
