/**
 * slider.js - Slider banner đầu trang: tự chạy, nút prev/next, chấm điều hướng
 * Môn: Web1044 - Lập trình cơ sở với JavaScript
 */

function initHeroSlider() {
  const wrapper = document.querySelector('.hero-bg-wrapper');
  const hero = document.querySelector('.hero-banner-overlay');
  if (!wrapper || !hero || HERO_SLIDES.length < 2) return;

  const firstImg = wrapper.querySelector('.hero-bg-img');
  const mask = wrapper.querySelector('.hero-overlay-mask');
  if (!firstImg || !mask) return;

  wrapper.classList.add('has-slider');

  // Tạo các ảnh slide từ dữ liệu (ảnh đầu dùng lại thẻ img có sẵn)
  const slides = HERO_SLIDES.map((data, index) => {
    const img = index === 0 ? firstImg : document.createElement('img');
    if (index > 0) {
      img.className = 'hero-bg-img';
      img.loading = 'lazy';
      wrapper.insertBefore(img, mask);
    }
    img.src = data.image;
    img.alt = data.alt;
    return img;
  });

  // Nút điều khiển
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'hero-arrow hero-prev';
  prevBtn.setAttribute('aria-label', 'Ảnh trước');
  prevBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'hero-arrow hero-next';
  nextBtn.setAttribute('aria-label', 'Ảnh tiếp theo');
  nextBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  const dotsBox = document.createElement('div');
  dotsBox.className = 'hero-dots';
  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-dot';
    dot.setAttribute('aria-label', 'Chuyển đến ảnh ' + (index + 1));
    dot.addEventListener('click', () => goTo(index, true));
    dotsBox.appendChild(dot);
    return dot;
  });

  hero.appendChild(prevBtn);
  hero.appendChild(nextBtn);
  hero.appendChild(dotsBox);

  let current = 0;
  let timer = null;

  function goTo(index, userAction) {
    current = (index + slides.length) % slides.length;
    slides.forEach((img, i) => img.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    if (userAction) restart();
  }

  function startAuto() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  function restart() {
    clearInterval(timer);
    startAuto();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1, true));
  nextBtn.addEventListener('click', () => goTo(current + 1, true));

  // Tạm dừng khi rê chuột vào banner
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', restart);

  goTo(0);
  startAuto();
}
