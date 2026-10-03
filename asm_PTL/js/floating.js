/**
 * floating.js - Nút quay lại đầu trang và widget liên hệ nổi
 * Môn: Web1044 - Thiết kế web
 */

function initFloatingWidgets() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  // 1. Tự động hiện nút khi cuộn xuống quá 350px
  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  // 2. Cuộn mượt mà lên đầu trang khi click
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
