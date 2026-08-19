/* ============================================================
   home.js — Logic riêng cho trang chủ (index.html)
   Render động: Food Category, Món Mới Khám Phá (API), Chefs, Blog
   ============================================================ */
import { initTabs, initScrollReveal, initCounters } from './dom.js'
import { fetchRandomMeals, renderMealCard } from './api.js'
import { fetchChefs, renderChefCard } from './chefs.js'
import { blogPostsData } from './blog/data.js'
import { t } from './i18n.js' // Chuyển ngôn ngữ VN/EN

/**
 * initDiscoverMeals — Gọi TheMealDB API cho section "Món Mới Khám Phá"
 */
async function initDiscoverMeals() {
  const container = document.getElementById('discover-meals')
  if (!container) return

  const meals = await fetchRandomMeals(6)
  if (meals.length) {
    container.innerHTML = meals.map(renderMealCard).join('')
  } else {
    container.innerHTML = `<p class="text-text-muted col-span-full">${t('home.discover.loadError')}</p>`
  }
}

/**
 * renderFoodCategories — Lấy danh mục món từ menu.json, mỗi danh mục hiện
 * bằng ảnh của 1 sản phẩm đại diện; bấm vào thì lọc sẵn ở trang Shop List
 */
async function renderFoodCategories() {
  const container = document.getElementById('food-categories')
  if (!container) return

  try {
    const res = await fetch('/src/data/menu.json')
    const items = await res.json()

    // Gom theo category, lấy sản phẩm đầu tiên của mỗi nhóm làm ảnh đại diện
    const categoryMap = new Map()
    items.forEach(item => {
      if (!categoryMap.has(item.category)) categoryMap.set(item.category, item)
    })

    container.innerHTML = Array.from(categoryMap.entries()).map(([category, item]) => `
      <a href="/src/pages/shop-list.html?category=${encodeURIComponent(category)}" class="group relative aspect-square rounded-lg overflow-hidden card-hover block">
        <img src="${item.image}" alt="${category}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        <div class="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors flex items-end p-4">
          <span class="text-text-white font-semibold">${category}</span>
        </div>
      </a>
    `).join('')
  } catch (error) {
    console.error('❌ Lỗi khi tải danh mục món:', error)
  }
}

/**
 * renderChefsPreview — Hiện 4 đầu bếp đầu tiên từ chefs.json trên trang chủ
 */
async function renderChefsPreview() {
  const container = document.getElementById('chefs-preview')
  if (!container) return

  const chefs = await fetchChefs()
  container.innerHTML = chefs.slice(0, 4).map(renderChefCard).join('')
}

/**
 * renderBlogPreview — Hiện 3 bài blog mới nhất (dữ liệu thật từ blog/data.js)
 */
function renderBlogPreview() {
  const container = document.getElementById('blog-preview')
  if (!container) return

  container.innerHTML = blogPostsData.slice(0, 3).map(post => `
    <a href="/src/pages/blog-details.html?id=${post.id}" class="bg-gray-100 dark:bg-bg-dark-2 rounded-lg overflow-hidden card-hover block text-left">
      <div class="aspect-video overflow-hidden">
        <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
      </div>
      <div class="p-5">
        <h3 class="text-text-dark dark:text-text-white font-semibold mb-2 line-clamp-2">${post.title}</h3>
        <p class="text-text-muted text-sm line-clamp-2">${post.excerpt}</p>
      </div>
    </a>
  `).join('')
}

// Ghi chú: khối "Recent Post" ở footer được render dùng chung bởi main.js
// (renderFooterRecentPosts) cho mọi trang có #footer-recent-posts, nên không
// lặp lại logic đó ở đây.

document.addEventListener('DOMContentLoaded', () => {
  initTabs()
  initScrollReveal()
  initCounters()
  initDiscoverMeals()
  renderFoodCategories()
  renderChefsPreview()
  renderBlogPreview()
})
