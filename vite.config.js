import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Cấu hình Vite cho Multi-page App (MPA)
// Mỗi trang HTML là một entry riêng biệt, cho phép 3 thành viên code song song
export default defineConfig({
  plugins: [
    tailwindcss(), // Tích hợp Tailwind CSS v4 qua Vite plugin
  ],
  build: {
    rollupOptions: {
      // Khai báo tất cả 16 HTML pages cho Vite build — Phân công 6-5-5
      input: {
        // === THỊNH (Nhóm trưởng) — 6 trang ===
        main: resolve(__dirname, 'index.html'),                          // 1. Trang chủ Restaurant
        menu: resolve(__dirname, 'src/pages/menu.html'),                 // 2. Thực đơn
        about: resolve(__dirname, 'src/pages/about.html'),               // 3. Giới thiệu
        chefs: resolve(__dirname, 'src/pages/chefs.html'),               // 4. Đội ngũ đầu bếp
        coffeeShop: resolve(__dirname, 'src/pages/coffee-shop.html'),    // 5. Coffee Shop
        contact: resolve(__dirname, 'src/pages/contact.html'),           // 6. Liên hệ

        // === KIỆT (Thành viên 2) — 5 trang ===
        shopList: resolve(__dirname, 'src/pages/shop-list.html'),        // 7. Danh sách sản phẩm
        shopDetails: resolve(__dirname, 'src/pages/shop-details.html'),  // 8. Chi tiết sản phẩm
        blog: resolve(__dirname, 'src/pages/blog.html'),                 // 9. Blog
        blogDetails: resolve(__dirname, 'src/pages/blog-details.html'),  // 10. Chi tiết blog
        faq: resolve(__dirname, 'src/pages/faq.html'),                   // 11. FAQ

        // === THUẬN (Thành viên 3) — 5 trang ===
        cart: resolve(__dirname, 'src/pages/cart.html'),                 // 12. Giỏ hàng
        checkout: resolve(__dirname, 'src/pages/checkout.html'),         // 13. Thanh toán
        signin: resolve(__dirname, 'src/pages/signin.html'),             // 14. Đăng nhập
        signup: resolve(__dirname, 'src/pages/signup.html'),             // 15. Đăng ký
        notfound: resolve(__dirname, 'src/pages/404.html'),              // 16. Trang 404
      },
    },
  },
})
