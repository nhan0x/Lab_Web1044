/**
 * reveal.js - Hiệu ứng cuộn trang xuất hiện phần tử (Scroll Reveal)
 * Môn: Web1044 - Thiết kế web
 */

function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  // Sử dụng IntersectionObserver để theo dõi khi phần tử xuất hiện trong màn hình
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // Chỉ chạy 1 lần khi cuộn tới
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Dự phòng cho trình duyệt cũ không hỗ trợ Observer
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }
}
