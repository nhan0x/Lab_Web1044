/**
 * Xử lý Kiểm tra Dữ liệu Form (Form Validation)
 * Môn học: Lập trình cơ sở với JavaScript (WEB1044)
 * Sinh viên: Hoàng Minh
 */

// Các biểu thức chính quy (Regex) kiểm tra chuẩn
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_PHONE = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;

/**
 * Hiển thị lỗi dưới input
 */
function setFieldError(inputId, errorMsg) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('input-error');
    
    let errorSpan = input.parentElement.querySelector('.field-error-msg');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'field-error-msg';
        input.parentElement.appendChild(errorSpan);
    }
    errorSpan.textContent = errorMsg;
}

/**
 * Xóa lỗi input
 */
function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.remove('input-error');
    
    const errorSpan = input.parentElement.querySelector('.field-error-msg');
    if (errorSpan) {
        errorSpan.remove();
    }
}

/**
 * Xử lý Form Đăng nhập
 */
function handleLoginForm(event) {
    event.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    let isValid = true;

    // Kiểm tra email/username
    if (!emailInput.value.trim()) {
        setFieldError('login-email', 'Vui lòng nhập email hoặc số điện thoại');
        isValid = false;
    } else {
        clearFieldError('login-email');
    }

    // Kiểm tra mật khẩu
    if (!passInput.value.trim()) {
        setFieldError('login-password', 'Vui lòng nhập mật khẩu');
        isValid = false;
    } else if (passInput.value.length < 6) {
        setFieldError('login-password', 'Mật khẩu phải có ít nhất 6 ký tự');
        isValid = false;
    } else {
        clearFieldError('login-password');
    }

    if (isValid) {
        showToast('✅ Đăng nhập tài khoản thành công!');
        closeAccountModal();
        emailInput.value = '';
        passInput.value = '';
        // Cập nhật tên người dùng trên header
        const userBtn = document.querySelector('.header-action-user span');
        if (userBtn) userBtn.textContent = 'Hoàng Minh';
    }
}

/**
 * Xử lý Form Đăng ký
 */
function handleRegisterForm(event) {
    event.preventDefault();
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    const passInput = document.getElementById('reg-password');
    let isValid = true;

    if (!nameInput.value.trim()) {
        setFieldError('reg-name', 'Vui lòng nhập họ và tên của bạn');
        isValid = false;
    } else {
        clearFieldError('reg-name');
    }

    if (!emailInput.value.trim()) {
        setFieldError('reg-email', 'Vui lòng nhập địa chỉ email');
        isValid = false;
    } else if (!REGEX_EMAIL.test(emailInput.value.trim())) {
        setFieldError('reg-email', 'Email không đúng định dạng (vd: user@gmail.com)');
        isValid = false;
    } else {
        clearFieldError('reg-email');
    }

    if (!phoneInput.value.trim()) {
        setFieldError('reg-phone', 'Vui lòng nhập số điện thoại');
        isValid = false;
    } else if (!REGEX_PHONE.test(phoneInput.value.trim())) {
        setFieldError('reg-phone', 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)');
        isValid = false;
    } else {
        clearFieldError('reg-phone');
    }

    if (!passInput.value.trim()) {
        setFieldError('reg-password', 'Vui lòng nhập mật khẩu');
        isValid = false;
    } else if (passInput.value.length < 6) {
        setFieldError('reg-password', 'Mật khẩu phải từ 6 ký tự trở lên');
        isValid = false;
    } else {
        clearFieldError('reg-password');
    }

    if (isValid) {
        showToast('🎉 Đăng ký thành viên HoangMinh thành công!');
        closeAccountModal();
        nameInput.value = '';
        emailInput.value = '';
        phoneInput.value = '';
        passInput.value = '';
    }
}

/**
 * Xử lý Đăng ký nhận bản tin (Newsletter)
 */
function handleNewsletter(event) {
    event.preventDefault();
    const input = document.getElementById('newsletter-input');
    if (!input) return;

    const email = input.value.trim();
    if (!email) {
        showToast('⚠️ Vui lòng nhập địa chỉ email của bạn!');
        return;
    }
    if (!REGEX_EMAIL.test(email)) {
        showToast('⚠️ Địa chỉ email không đúng định dạng!');
        return;
    }

    showToast('✉️ Cảm ơn bạn đã đăng ký nhận thông tin khuyến mãi từ HoangMinh!');
    input.value = '';
}

/**
 * Xử lý Form Thanh toán Đơn hàng (Checkout)
 */
function handleCheckoutForm(event) {
    event.preventDefault();
    const name = document.getElementById('checkout-name');
    const phone = document.getElementById('checkout-phone');
    const address = document.getElementById('checkout-address');
    let isValid = true;

    if (!name.value.trim()) {
        setFieldError('checkout-name', 'Vui lòng nhập họ tên người nhận');
        isValid = false;
    } else {
        clearFieldError('checkout-name');
    }

    if (!phone.value.trim()) {
        setFieldError('checkout-phone', 'Vui lòng nhập số điện thoại nhận hàng');
        isValid = false;
    } else if (!REGEX_PHONE.test(phone.value.trim())) {
        setFieldError('checkout-phone', 'Số điện thoại không hợp lệ (10 chữ số)');
        isValid = false;
    } else {
        clearFieldError('checkout-phone');
    }

    if (!address.value.trim()) {
        setFieldError('checkout-address', 'Vui lòng nhập địa chỉ giao hàng chi tiết');
        isValid = false;
    } else {
        clearFieldError('checkout-address');
    }

    if (isValid) {
        // Hoàn tất đơn hàng
        showToast('🛍️ Đặt hàng thành công! HoangMinh sẽ liên hệ sớm nhất để xác nhận.');
        closeCheckoutModal();
        clearCart();
    }
}
