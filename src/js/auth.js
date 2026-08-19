/* ============================================================
   auth.js — Xử lý Đăng ký & Đăng nhập
   Lưu trữ tài khoản bằng localStorage (JSON)
   Theo yêu cầu thầy: dữ liệu user lưu dạng JSON
   ============================================================ */

import { t } from './i18n.js'

const USERS_KEY = 'elite-users' // Key lưu danh sách tài khoản trong localStorage
const CURRENT_USER_KEY = 'elite-current-user' // Key lưu user đang đăng nhập

/**
 * getUsers — Lấy danh sách tài khoản đã đăng ký từ localStorage
 * @returns {Array} Mảng các object user {name, email, password}
 */
export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

/**
 * saveUsers — Lưu danh sách tài khoản vào localStorage
 * @param {Array} users - Mảng users cần lưu
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

/**
 * register — Đăng ký tài khoản mới
 * @param {string} name - Tên người dùng
 * @param {string} email - Email (unique, dùng làm username)
 * @param {string} password - Mật khẩu (tối thiểu 6 ký tự)
 * @returns {Object} {success: boolean, message: string}
 */
export function register(name, email, password) {
  // Validate input
  if (!name || !email || !password) {
    return { success: false, message: t('auth.fillAll') }
  }

  if (password.length < 6) {
    return { success: false, message: t('auth.passwordMin') }
  }

  // Kiểm tra email regex cơ bản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, message: t('auth.invalidEmail') }
  }

  const users = getUsers()

  // Kiểm tra email đã tồn tại chưa
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: t('auth.emailTaken') }
  }

  // Thêm user mới vào mảng và lưu
  users.push({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password, // Trong thực tế cần hash, đây là demo
    createdAt: new Date().toISOString()
  })

  saveUsers(users)
  return { success: true, message: t('auth.registerSuccess') }
}

/**
 * login — Đăng nhập
 * @param {string} email
 * @param {string} password
 * @returns {Object} {success: boolean, message: string, user?: Object}
 */
export function login(email, password) {
  if (!email || !password) {
    return { success: false, message: t('auth.fillEmailPassword') }
  }

  const users = getUsers()
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )

  if (!user) {
    return { success: false, message: t('auth.wrongCredentials') }
  }

  // Lưu thông tin user đang đăng nhập
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    name: user.name,
    email: user.email
  }))

  return { success: true, message: t('auth.welcome', { name: user.name }), user }
}

/**
 * getCurrentUser — Lấy thông tin user đang đăng nhập
 * @returns {Object|null}
 */
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
  } catch {
    return null
  }
}

/**
 * logout — Đăng xuất
 */
export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

/**
 * isLoggedIn — Kiểm tra đã đăng nhập chưa
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getCurrentUser() !== null
}

/**
 * renderAuthStatus — Đồng bộ icon Tài khoản trên header với trạng thái đăng nhập
 * - Chưa đăng nhập: icon user giữ nguyên, trỏ tới trang Sign In.
 * - Đã đăng nhập: ẩn icon user, thay bằng "Hi, <tên> · Đăng xuất".
 * Gắn liền trước icon #user-account-link (mọi header hiện đều có).
 */
export function renderAuthStatus() {
  const user = getCurrentUser()
  const accountLinks = document.querySelectorAll('#user-account-link')

  if (!user) {
    accountLinks.forEach((link) => { link.href = '/src/pages/signin.html' })
    return
  }

  accountLinks.forEach((link) => {
    const container = link.parentElement
    if (!container || container.querySelector('.auth-status')) return // tránh render trùng

    link.classList.add('hidden') // Ẩn icon mặc định, thay bằng khối tên + đăng xuất

    const wrapper = document.createElement('div')
    wrapper.className = 'auth-status hidden sm:flex items-center gap-2 text-xs mr-1'
    wrapper.innerHTML = `
      <span class="text-white/80">${t('auth.hi')}, ${user.name.split(' ')[0]}</span>
      <button type="button" class="btn-logout text-primary hover:underline font-semibold cursor-pointer">${t('auth.logout')}</button>
    `
    container.insertBefore(wrapper, link)

    wrapper.querySelector('.btn-logout').addEventListener('click', () => {
      logout()
      window.location.href = '/'
    })
  })
}
