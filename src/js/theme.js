/* ============================================================
   theme.js — Dark/Light Mode Toggle
   Lưu trạng thái vào localStorage, áp dụng class "dark" lên <html>
   ============================================================ */

const THEME_KEY = 'elite-theme'  // Key lưu trong localStorage

/**
 * initTheme — Khởi tạo theme từ localStorage hoặc system preference
 * Gán sự kiện click cho nút toggle theme
 */
export function initTheme() {
  // Class "dark" ĐÃ được script inline trong <head> đặt xong trước khi trình
  // duyệt vẽ khung hình đầu tiên (chống nháy trắng). Ở đây KHÔNG đặt lại nữa —
  // nếu đặt lại sẽ gỡ mất kết quả của script inline khi người dùng chưa từng
  // bấm nút mà hệ điều hành đang để chế độ tối.
  //
  // Thứ tự ưu tiên (giống hệt script inline):
  //   1. Lựa chọn đã lưu của người dùng (localStorage)
  //   2. Chưa từng chọn -> nghe theo hệ điều hành (prefers-color-scheme)
  const savedTheme = localStorage.getItem(THEME_KEY)
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const shouldBeDark = savedTheme ? savedTheme === 'dark' : systemDark
  document.documentElement.classList.toggle('dark', shouldBeDark)

  // Người dùng chưa chọn gì mà đổi cài đặt hệ điều hành thì trang đổi theo.
  // Đã từng bấm nút rồi thì tôn trọng lựa chọn đó, không ghi đè.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem(THEME_KEY)) return
    document.documentElement.classList.toggle('dark', e.matches)
    const btn = document.getElementById('theme-toggle')
    if (btn) updateToggleIcon(btn)
  })

  // Gán sự kiện cho nút toggle (nếu có trên trang)
  const toggleBtn = document.getElementById('theme-toggle')
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme)
    updateToggleIcon(toggleBtn) // Cập nhật icon ban đầu
  }
}

/**
 * toggleTheme — Chuyển đổi dark ↔ light mode
 * Toggle class "dark" trên <html> và lưu vào localStorage
 */
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')

  const toggleBtn = document.getElementById('theme-toggle')
  if (toggleBtn) updateToggleIcon(toggleBtn)
}

/**
 * updateToggleIcon — Cập nhật icon hiển thị theo theme hiện tại
 * @param {HTMLElement} btn - Nút toggle theme
 */
function updateToggleIcon(btn) {
  const isDark = document.documentElement.classList.contains('dark')

  // Nút này là công tắc hai trạng thái -> đúng vai trò role="switch".
  // CSS/trình đọc màn hình bắt được trạng thái qua aria-checked, không cần class riêng.
  btn.setAttribute('role', 'switch')
  btn.setAttribute('aria-checked', String(isDark))
  btn.setAttribute('aria-label', document.documentElement.lang === 'en'
    ? (isDark ? 'Switch to light mode' : 'Switch to dark mode')
    : (isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'))
  // Hiển thị icon mặt trời () khi dark, icon trăng () khi light
  btn.innerHTML = isDark
    ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>'
    : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>'
}
