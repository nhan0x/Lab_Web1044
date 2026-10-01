/**
 * Xử lý Slider Banner HoangMinh
 * Môn học: Lập trình cơ sở với JavaScript (WEB1044)
 * Sinh viên: Hoàng Minh
 */

(function () {
    let currentSlide = 0;
    let slideInterval = null;
    const intervalTime = 4000;

    function initSlider() {
        const slider = document.getElementById('hero-slider');
        if (!slider) return;

        const slides = slider.querySelectorAll('.slide');
        const dotsContainer = slider.querySelector('.slider-dots');
        const prevBtn = slider.querySelector('.slider-btn.prev');
        const nextBtn = slider.querySelector('.slider-btn.next');

        if (!slides.length) return;

        // Tạo các dots tương ứng số lượng slide
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Chuyển tới slide ${idx + 1}`);
                dot.addEventListener('click', () => goToSlide(idx));
                dotsContainer.appendChild(dot);
            });
        }

        function showSlide(index) {
            slides.forEach((s, i) => {
                s.classList.toggle('active', i === index);
            });
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.slider-dot');
                dots.forEach((d, i) => {
                    d.classList.toggle('active', i === index);
                });
            }
            currentSlide = index;
        }

        function nextSlide() {
            let next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }

        function prevSlide() {
            let prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
        }

        function goToSlide(index) {
            showSlide(index);
            resetAutoPlay();
        }

        function startAutoPlay() {
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, intervalTime);
        }

        function stopAutoPlay() {
            if (slideInterval) clearInterval(slideInterval);
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                nextSlide();
                resetAutoPlay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prevSlide();
                resetAutoPlay();
            });
        }

        // Tạm dừng khi rê chuột vào
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);

        // Hỗ trợ vuốt chạm trên thiết bị di động
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 40;
            if (touchEndX < touchStartX - threshold) {
                nextSlide();
                resetAutoPlay();
            } else if (touchEndX > touchStartX + threshold) {
                prevSlide();
                resetAutoPlay();
            }
        }

        // Bắt đầu chạy tự động
        startAutoPlay();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        initSlider();
    }
})();
