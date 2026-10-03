/**
 * main.js - File điều phối chính (Main Entry Point)
 * Môn: Web1044 - Lập trình cơ sở với JavaScript
 * Dự án: Website Nội Thất Đỗ Phúc
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Quản lý Header & Menu Mobile (từ header.js)
  if (typeof initHeader === 'function') initHeader();
  if (typeof initMobileMenu === 'function') initMobileMenu();

  // 2. Slider banner đầu trang (từ slider.js)
  if (typeof initHeroSlider === 'function') initHeroSlider();

  // 3. Đồng hồ đếm ngược Flash Sale (từ countdown.js)
  if (typeof initCountdown === 'function') initCountdown();

  // 4. Giỏ hàng lưu LocalStorage (từ cart.js)
  if (typeof initCart === 'function') initCart();

  // 5. Hiển thị sản phẩm, bộ lọc, tìm kiếm, yêu thích (từ products.js)
  if (typeof initProducts === 'function') initProducts();

  // 6. Hiệu ứng cuộn trang xuất hiện (từ reveal.js) - chạy sau khi đã render sản phẩm
  if (typeof initScrollReveal === 'function') initScrollReveal();

  // 7. Quản lý form tư vấn (từ form.js)
  if (typeof initForms === 'function') initForms();

  // 8. Quản lý widget nổi & nút lên đầu trang (từ floating.js)
  if (typeof initFloatingWidgets === 'function') initFloatingWidgets();
});
