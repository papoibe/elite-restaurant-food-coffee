/* ============================================================
   validate.js — Kiểm tra hợp lệ Form
   Dùng cho: Reservation (Đặt bàn), Checkout, Contact, Sign up
   ============================================================ */
import { t } from './i18n.js' // Chuyển ngôn ngữ VN/EN

/**
 * validateForm — Kiểm tra hợp lệ tất cả các trường trong form
 * @param {HTMLFormElement} form - Form cần validate
 * @returns {boolean} true nếu hợp lệ, false nếu có lỗi
 */
export function validateForm(form) {
  const fields = form.querySelectorAll('[data-validate]')
  const invalidFields = []

  fields.forEach(field => {
    const rules = field.dataset.validate.split(',')
    const errorEl = field.parentElement.querySelector('.error-message')

    clearError(field, errorEl)

    for (const rule of rules) {
      const errorMsg = checkRule(field, rule.trim())

      if (errorMsg) {
        showError(field, errorEl, errorMsg)
        invalidFields.push(field)
        break
      }
    }
  })

  if (invalidFields.length === 0) {
    clearSummary(form)
    return true
  }

  // Một dòng tóm tắt ở đầu form — trên form dài, người dùng có thể đang ở
  // cuối trang và không thấy ô lỗi nằm trên đầu.
  showSummary(form, invalidFields.length)

  // Đưa tiêu điểm về ô sai ĐẦU TIÊN. Việc này quan trọng hơn vẻ ngoài của nó:
  // không có nó, người dùng bấm "Gửi" ở cuối form dài sẽ không biết hỏng ở đâu.
  invalidFields[0].focus()
  invalidFields[0].scrollIntoView({ block: 'center', behavior: 'smooth' })

  return false
}

/** showSummary — Dòng tóm tắt số ô còn sai, đặt ngay đầu form. */
function showSummary(form, count) {
  let box = form.querySelector('[data-validate-summary]')
  if (!box) {
    box = document.createElement('p')
    box.setAttribute('data-validate-summary', '')
    box.setAttribute('role', 'alert')
    box.className = 'mb-4 px-4 py-3 border border-[#EB5757] bg-[#FFF5F5] dark:bg-transparent text-[#EB5757] text-[14px] leading-[22px]'
    form.prepend(box)
  }
  box.textContent = t('validate.summary', { count })
  box.classList.remove('hidden')
}

function clearSummary(form) {
  form.querySelector('[data-validate-summary]')?.classList.add('hidden')
}

/**
 * checkRule — Kiểm tra 1 rule validation
 */
function checkRule(field, rule) {
  const value = field.value.trim()

  if (rule === 'required' && !value) {
    return t('validate.required')
  }

  if (rule === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return t('validate.email')
    }
  }

  if (rule === 'phone' && value) {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,15}$/
    if (!phoneRegex.test(value)) {
      return t('validate.phone')
    }
  }

  if (rule.startsWith('minLength:') && value) {
    const minLen = parseInt(rule.split(':')[1])
    if (value.length < minLen) {
      return t('validate.minLength', { min: minLen })
    }
  }

  if (rule.startsWith('min:') && value) {
    const min = parseInt(rule.split(':')[1])
    if (parseInt(value) < min) {
      return t('validate.min', { min })
    }
  }

  if (rule.startsWith('max:') && value) {
    const max = parseInt(rule.split(':')[1])
    if (parseInt(value) > max) {
      return t('validate.max', { max })
    }
  }

  return null
}

/**
 * showError — Đánh dấu một ô sai. Phải chạm CẢ HAI lớp:
 *   · aria-invalid  → cho trình đọc màn hình
 *   · textContent   → cho người nhìn thấy
 * Chỉ tô đỏ viền thì với trình đọc màn hình, ô đó vẫn "bình thường".
 * CSS bắt luôn [aria-invalid="true"] nên không cần class riêng cho viền đỏ.
 */
function showError(field, errorEl, message) {
  field.setAttribute('aria-invalid', 'true')
  field.classList.add('border-red-500')
  field.classList.remove('border-gray-300')

  if (errorEl) {
    // Nối ô nhập với ô báo lỗi để trình đọc màn hình đọc kèm thông báo
    if (errorEl.id) field.setAttribute('aria-describedby', errorEl.id)
    errorEl.textContent = message
    errorEl.classList.remove('hidden')
  }
}

function clearError(field, errorEl) {
  field.removeAttribute('aria-invalid')
  field.classList.remove('border-red-500')
  field.classList.add('border-gray-300')

  if (errorEl) {
    errorEl.textContent = ''
    errorEl.classList.add('hidden')
  }
}

/**
 * showSuccessToast — Hiển thị thông báo thành công (toast notification)
 */
export function showSuccessToast(message = t('validate.success'), duration = 3000) {
  const toast = document.createElement('div')
  toast.className = 'fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] flex items-center gap-2 animate-fade-in-up'
  toast.innerHTML = `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
    </svg>
    <span>${message}</span>
  `
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, duration)
}