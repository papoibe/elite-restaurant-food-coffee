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

// Badge số lượng giỏ hàng trên header — cập nhật ở mọi trang có #cart-count
import { updateCartBadge } from './cart.js'

// Hiện tên user + nút Đăng xuất trên header khi đã đăng nhập
import { renderAuthStatus } from './auth.js'

// Dữ liệu blog thật — dùng để render khối "Recent Post" ở footer (nếu trang có)
import { blogPostsData } from './blog/data.js'

// Chuyển đổi ngôn ngữ VN/EN — áp dụng text tĩnh [data-i18n] + gắn nút toggle
import { applyStaticTranslations, initLangToggle } from './i18n.js'

/**
 * renderFooterRecentPosts — Render 2 bài viết mới nhất vào mọi footer có
 * khối #footer-recent-posts. Dùng dữ liệu thật từ blog/data.js thay vì
 * ảnh tĩnh với đường dẫn tương đối (từng bị vỡ trên các trang trong src/pages/).
 */
function renderFooterRecentPosts() {
  document.querySelectorAll('#footer-recent-posts').forEach((container) => {
    container.innerHTML = blogPostsData.slice(0, 2).map(post => `
      <a href="/src/pages/blog-details.html?id=${post.id}" class="flex gap-3 group">
        <img src="${post.image}" alt="${post.title}" class="w-12 h-12 object-cover rounded flex-shrink-0" loading="lazy" />
        <div>
          <span class="text-white text-xs hover:text-primary transition block line-clamp-2 group-hover:text-primary">${post.title}</span>
          <span class="text-xs text-gray-500">${post.date}</span>
        </div>
      </a>
    `).join('')
  })
}

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  applyStaticTranslations()   // Dịch toàn bộ text tĩnh [data-i18n] theo ngôn ngữ đã lưu — chạy TRƯỚC các hàm render khác
  initLangToggle()            // Gắn nút chuyển VN/EN trên header
  initMobileMenu()            // Bật/tắt menu mobile
  initTheme()                 // Áp dụng theme đã lưu
  updateCartBadge()           // Đồng bộ badge giỏ hàng với localStorage hiện tại
  renderAuthStatus()          // Hiện trạng thái đăng nhập (nếu có)
  renderFooterRecentPosts()   // Footer "Recent Post" — dữ liệu thật, ảnh không vỡ

  console.log('🍽️ Elite Restaurant — Loaded successfully!')
})
