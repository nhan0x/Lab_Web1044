/* =====================================================================
   FORM & KIỂM TRA DỮ LIỆU  (Yêu cầu Y1.4)  -  BẠN TỰ VIẾT CODE Ở FILE NÀY
   =====================================================================
   Đề yêu cầu: có ít nhất 1 form (đăng ký, liên hệ, thanh toán...) và:
     1. Kiểm tra dữ liệu rỗng
     2. Kiểm tra định dạng (email, số điện thoại...)
     (được dùng Validator.js hoặc JS thuần)

   Gợi ý các bước làm:
     - Trong index.html, đặt id cho form và các ô nhập. Hiện có sẵn 2 chỗ để dùng:
         + Modal "Tài khoản" (tìm <!-- Modal tài khoản -->): form đăng nhập/đăng ký
         + Ô email "Đăng ký bản tin" ở footer
       Hoặc tự thêm form mới (ví dụ form liên hệ, form thanh toán trong giỏ hàng).
     - Với mỗi ô nhập, thêm một thẻ hiện lỗi, ví dụ: <small class="error-msg"></small>
     - Bắt sự kiện submit rồi kiểm tra:
         const form = document.getElementById("id-form-cua-ban");
         form.addEventListener("submit", function (e) {
             e.preventDefault();          // chặn tải lại trang
             // 1) kiểm tra rỗng:  value.trim() === ""
             // 2) kiểm tra email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
             // 3) kiểm tra SĐT:   /^(0|\+84)\d{9}$/.test(value)
             // 4) hợp lệ thì gọi showToast("Thành công!") (hàm có sẵn trong main.js)
         });
     - Nên tách mỗi việc thành một hàm nhỏ: isEmpty(), isEmail(), isPhone(), showError()...
   ===================================================================== */

// TODO: viết code kiểm tra form ở bên dưới

