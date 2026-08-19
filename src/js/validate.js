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
  let isValid = true
  const fields = form.querySelectorAll('[data-validate]')

  fields.forEach(field => {
    const rules = field.dataset.validate.split(',')
    const errorEl = field.parentElement.querySelector('.error-message')

    clearError(field, errorEl)

    for (const rule of rules) {
      const trimmedRule = rule.trim()
      const errorMsg = checkRule(field, trimmedRule)

      if (errorMsg) {
        showError(field, errorEl, errorMsg)
        isValid = false
        break
      }
    }
  })

  return isValid
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

function showError(field, errorEl, message) {
  field.classList.add('border-red-500')
  field.classList.remove('border-gray-300')

  if (errorEl) {
    errorEl.textContent = message
    errorEl.classList.remove('hidden')
  }
}

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