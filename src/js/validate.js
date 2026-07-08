/* ============================================================
   validate.js — Kiểm tra hợp lệ Form
   Dùng cho: Reservation (Đặt bàn), Checkout, Contact, Sign up
   ============================================================ */

/**
 * validateForm — Kiểm tra hợp lệ tất cả các trường trong form
 * @param {HTMLFormElement} form - Form cần validate
 * @returns {boolean} true nếu hợp lệ, false nếu có lỗi
 */
export function validateForm(form) {
  let isValid = true
  const fields = form.querySelectorAll('[data-validate]')  // Chỉ validate trường có data-validate

  fields.forEach(field => {
    const rules = field.dataset.validate.split(',')  // Nhiều rule cách bằng dấu phẩy
    const errorEl = field.parentElement.querySelector('.error-message')  // Phần tử hiển thị lỗi

    // Xóa lỗi cũ
    clearError(field, errorEl)

    // Kiểm tra từng rule
    for (const rule of rules) {
      const trimmedRule = rule.trim()
      const errorMsg = checkRule(field, trimmedRule)

      if (errorMsg) {
        showError(field, errorEl, errorMsg)
        isValid = false
        break  // Chỉ hiện lỗi đầu tiên
      }
    }
  })

  return isValid
}

/**
 * checkRule — Kiểm tra 1 rule validation
 * @param {HTMLInputElement} field - Trường cần check
 * @param {string} rule - Tên rule (required, email, phone, minLength:N)
 * @returns {string|null} Thông báo lỗi hoặc null nếu hợp lệ
 */
function checkRule(field, rule) {
  const value = field.value.trim()

  // Rule: bắt buộc nhập
  if (rule === 'required' && !value) {
    return 'Vui lòng nhập thông tin này'
  }

  // Rule: định dạng email
  if (rule === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // Regex kiểm tra email cơ bản
    if (!emailRegex.test(value)) {
      return 'Email không hợp lệ'
    }
  }

  // Rule: định dạng số điện thoại
  if (rule === 'phone' && value) {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,15}$/  // Cho phép số, dấu cách, dấu gạch, +, ()
    if (!phoneRegex.test(value)) {
      return 'Số điện thoại không hợp lệ'
    }
  }

  // Rule: độ dài tối thiểu (vd: minLength:6)
  if (rule.startsWith('minLength:') && value) {
    const minLen = parseInt(rule.split(':')[1])
    if (value.length < minLen) {
      return `Tối thiểu ${minLen} ký tự`
    }
  }

  // Rule: số lượng (vd: min:1, max:20)
  if (rule.startsWith('min:') && value) {
    const min = parseInt(rule.split(':')[1])
    if (parseInt(value) < min) {
      return `Giá trị tối thiểu là ${min}`
    }
  }

  if (rule.startsWith('max:') && value) {
    const max = parseInt(rule.split(':')[1])
    if (parseInt(value) > max) {
      return `Giá trị tối đa là ${max}`
    }
  }

  return null  // Không có lỗi
}

/**
 * showError — Hiển thị thông báo lỗi cho field
 */
function showError(field, errorEl, message) {
  field.classList.add('border-red-500')       // Viền đỏ
  field.classList.remove('border-gray-300')   // Xóa viền mặc định

  if (errorEl) {
    errorEl.textContent = message
    errorEl.classList.remove('hidden')
  }
}

/**
 * clearError — Xóa thông báo lỗi
 */
function clearError(field, errorEl) {
  field.classList.remove('border-red-500')
  field.classList.add('border-gray-300')

  if (errorEl) {
    errorEl.textContent = ''
    errorEl.classList.add('hidden')
  }
}

/**
 * showSuccessToast — Hiển thị thông báo thành công (toast notification)
 * @param {string} message - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (ms)
 */
export function showSuccessToast(message = 'Thành công!', duration = 3000) {
  // Tạo toast element
  const toast = document.createElement('div')
  toast.className = 'fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] flex items-center gap-2 animate-fade-in-up'
  toast.innerHTML = `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
    </svg>
    <span>${message}</span>
  `
  document.body.appendChild(toast)

  // Tự động ẩn sau duration
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, duration)
}
