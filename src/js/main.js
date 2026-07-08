/* ============================================================
   main.js — Entry Point chính
   Import CSS + khởi tạo các module dùng chung trên mọi trang
   ============================================================ */

import '../css/main.css'  // Import Tailwind CSS + custom styles

// === KHỞI TẠO CÁC MODULE DÙNG CHUNG ===

// Mobile hamburger menu — toggle menu responsive
import { initMobileMenu } from './dom.js'

// Dark/Light mode — lưu trạng thái vào localStorage
import { initTheme } from './theme.js'

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu()  // Bật/tắt menu mobile
  initTheme()       // Áp dụng theme đã lưu

  console.log('🍽️ Elite Restaurant — Loaded successfully!')
})
