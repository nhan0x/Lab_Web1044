/**
 * form.js - Kiểm tra dữ liệu form (rỗng, định dạng email, số điện thoại...)
 * dùng cho form đăng ký tư vấn ở footer và form đặt hàng trong giỏ hàng.
 * Môn: Web1044 - Lập trình cơ sở với JavaScript
 */

const Validator = {
  phoneRegex: /^(0|\+84)[0-9]{8,10}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,

  isEmpty(value) {
    return value.trim() === '';
  },

  isPhone(value) {
    return this.phoneRegex.test(value.replace(/\s+/g, ''));
  },

  isEmail(value) {
    return this.emailRegex.test(value.trim());
  },

  // Hiển thị / xóa thông báo lỗi dưới ô nhập
  setError(input, message) {
    const box = input.closest('.field');
    const error = box ? box.querySelector('.field-error') : null;
    if (error) error.textContent = message;
    input.classList.toggle('invalid', !!message);
  },

  // Kiểm tra form đặt hàng, trả về true nếu hợp lệ
  checkoutForm(form) {
    const f = form.elements;
    let valid = true;

    const rules = [
      [f.fullname, (v) => (this.isEmpty(v) ? 'Vui lòng nhập họ và tên.' : v.trim().length < 3 ? 'Họ và tên tối thiểu 3 ký tự.' : '')],
      [f.phone, (v) => (this.isEmpty(v) ? 'Vui lòng nhập số điện thoại.' : !this.isPhone(v) ? 'Số điện thoại không hợp lệ (VD: 0963 933 333).' : '')],
      [f.email, (v) => (this.isEmpty(v) ? 'Vui lòng nhập email.' : !this.isEmail(v) ? 'Email không đúng định dạng.' : '')],
      [f.address, (v) => (this.isEmpty(v) ? 'Vui lòng nhập địa chỉ nhận hàng.' : v.trim().length < 8 ? 'Địa chỉ quá ngắn, vui lòng ghi rõ hơn.' : '')]
    ];

    let firstInvalid = null;
    rules.forEach(([input, rule]) => {
      const message = rule(input.value);
      this.setError(input, message);
      if (message) {
        valid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }
};

function initForms() {
  const footerForm = document.querySelector('.footer-cta-form');
  if (!footerForm) return;

  footerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputPhone = footerForm.querySelector('input');
    const phoneValue = inputPhone ? inputPhone.value : '';

    if (Validator.isEmpty(phoneValue) || !Validator.isPhone(phoneValue)) {
      alert('Vui lòng nhập số điện thoại hợp lệ (Ví dụ: 0963 933 333)!');
      if (inputPhone) inputPhone.focus();
      return;
    }

    // Ẩn thanh input và hiển thị thông báo thành công
    const inputGroup = footerForm.querySelector('.footer-cta-input-group');
    if (inputGroup) inputGroup.style.display = 'none';

    let successMsg = footerForm.querySelector('.footer-cta-success');
    if (!successMsg) {
      successMsg = document.createElement('div');
      successMsg.className = 'footer-cta-success';
      successMsg.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A57B46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Cảm ơn quý khách! Kiến trúc sư trưởng Đỗ Phúc sẽ liên hệ tư vấn trong 15 phút.</span>
      `;
      footerForm.appendChild(successMsg);
    }
    successMsg.style.display = 'flex';

    // Tự động khôi phục lại form sau 5 giây
    setTimeout(() => {
      if (inputPhone) inputPhone.value = '';
      if (inputGroup) inputGroup.style.display = 'flex';
      successMsg.style.display = 'none';
    }, 5000);
  });
}
