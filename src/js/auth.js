/* ============================================================
   auth.js — Xử lý Đăng ký & Đăng nhập
   Lưu trữ tài khoản bằng localStorage (JSON)
   Theo yêu cầu thầy: dữ liệu user lưu dạng JSON
   ============================================================ */

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
    return { success: false, message: 'Vui lòng điền đầy đủ thông tin!' }
  }

  if (password.length < 6) {
    return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
  }

  // Kiểm tra email regex cơ bản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Email không hợp lệ!' }
  }

  const users = getUsers()

  // Kiểm tra email đã tồn tại chưa
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'Email này đã được đăng ký!' }
  }

  // Thêm user mới vào mảng và lưu
  users.push({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password, // Trong thực tế cần hash, đây là demo
    createdAt: new Date().toISOString()
  })

  saveUsers(users)
  return { success: true, message: 'Đăng ký thành công! Hãy đăng nhập.' }
}

/**
 * login — Đăng nhập
 * @param {string} email
 * @param {string} password
 * @returns {Object} {success: boolean, message: string, user?: Object}
 */
export function login(email, password) {
  if (!email || !password) {
    return { success: false, message: 'Vui lòng điền email và mật khẩu!' }
  }

  const users = getUsers()
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )

  if (!user) {
    return { success: false, message: 'Email hoặc mật khẩu không đúng!' }
  }

  // Lưu thông tin user đang đăng nhập
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    name: user.name,
    email: user.email
  }))

  return { success: true, message: `Chào mừng ${user.name}!`, user }
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
