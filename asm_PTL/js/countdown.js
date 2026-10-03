/**
 * countdown.js - Đồng hồ đếm ngược Flash Sale (kết thúc lúc 24:00 mỗi ngày)
 * Môn: Web1044 - Lập trình cơ sở với JavaScript
 */

function initCountdown() {
  const box = document.querySelector('.flash-countdown');
  if (!box) return;

  box.innerHTML = `
    <span class="flash-label">${FLASH_SALE_LABEL}</span>
    <span class="flash-box"><b data-unit="h">00</b><small>Giờ</small></span>
    <span class="flash-box"><b data-unit="m">00</b><small>Phút</small></span>
    <span class="flash-box"><b data-unit="s">00</b><small>Giây</small></span>`;

  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0); // 00:00 ngày hôm sau

    const diff = Math.max(0, end - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    box.querySelector('[data-unit="h"]').textContent = pad(hours);
    box.querySelector('[data-unit="m"]').textContent = pad(minutes);
    box.querySelector('[data-unit="s"]').textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
}
