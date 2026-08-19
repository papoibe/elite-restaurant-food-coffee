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
  // Mặc định luôn là Light Mode cho MỌI trang khi chưa từng lưu lựa chọn nào.
  // Chỉ khi user đã từng bấm nút toggle (có lưu trong localStorage) thì mới
  // áp dụng đúng lựa chọn đó — đảm bảo toàn site đồng bộ 1 theme duy nhất.
  const savedTheme = localStorage.getItem(THEME_KEY)

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

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
  // Hiển thị icon mặt trời (☀️) khi dark, icon trăng (🌙) khi light
  btn.innerHTML = isDark
    ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>'
    : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>'
}
