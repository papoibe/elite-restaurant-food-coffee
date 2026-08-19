/* ============================================================
   menu-page.js — Logic riêng cho trang Menu (menu.html)
   Render 4 nhóm món (Starter/Main Course/Dessert/Drinks) từ menu.json.
   Starter Menu & Main Course: bấm vào tên món để đổi ảnh minh hoạ bên cạnh
   (đúng hành vi item đang chọn tô màu cam như thiết kế).
   ============================================================ */
import { t, getLang } from '/src/js/i18n.js' // Chuyển ngôn ngữ VN/EN

/**
 * renderMenuSectionWithImage — Nhóm món có ảnh sticky đi kèm (Starter, Main Course)
 * Bấm 1 món trong danh sách sẽ đổi ảnh sang đúng món đó.
 */
function renderMenuSectionWithImage({ listId, imageId, category, items }) {
  const list = document.getElementById(listId)
  const image = document.getElementById(imageId)
  if (!list) return

  const categoryItems = items.filter(i => i.category === category)
  if (!categoryItems.length) {
    list.innerHTML = `<p class="text-text-muted text-sm">${t('menu.emptyCategory')}</p>`
    return
  }

  list.innerHTML = categoryItems.map((item, idx) => `
    <button type="button" data-id="${item.id}" class="menu-item-btn w-full flex justify-between items-start gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 text-left cursor-pointer group">
      <div>
        <h4 class="item-title font-bold text-lg transition-colors ${idx === 0 ? 'text-primary' : 'text-text-dark dark:text-text-white group-hover:text-primary'}">${item.name}</h4>
        <p class="text-text-muted text-sm">${getLang() === 'en' ? (item.description_en || item.description) : item.description}</p>
        <p class="text-text-muted text-xs mt-1">★ ${item.rating.toFixed(1)}</p>
      </div>
      <span class="text-primary font-bold text-lg whitespace-nowrap">$${item.price.toFixed(2)}</span>
    </button>
  `).join('')

  if (image) {
    image.src = categoryItems[0].image
    image.alt = categoryItems[0].name
  }

  // Event delegation: 1 listener duy nhất trên list thay vì gắn từng nút
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-item-btn')
    if (!btn) return
    const item = categoryItems.find(i => String(i.id) === btn.dataset.id)
    if (!item) return

    if (image) {
      image.src = item.image
      image.alt = item.name
    }

    list.querySelectorAll('.item-title').forEach((title) => {
      title.classList.remove('text-primary')
      title.classList.add('text-text-dark', 'dark:text-text-white')
    })
    const activeTitle = btn.querySelector('.item-title')
    activeTitle.classList.add('text-primary')
    activeTitle.classList.remove('text-text-dark', 'dark:text-text-white')
  })
}

/**
 * renderSimpleMenuGrid — Nhóm món dạng lưới 2 cột, không có ảnh đi kèm (Dessert, Drinks)
 */
function renderSimpleMenuGrid(listId, category, items) {
  const list = document.getElementById(listId)
  if (!list) return

  const categoryItems = items.filter(i => i.category === category)
  if (!categoryItems.length) {
    list.innerHTML = `<p class="text-text-muted text-sm col-span-full">${t('menu.emptyCategory')}</p>`
    return
  }

  list.innerHTML = categoryItems.map(item => `
    <div class="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
      <div>
        <h4 class="font-bold text-text-dark dark:text-text-white">${item.name}</h4>
        <p class="text-text-muted text-sm">${getLang() === 'en' ? (item.description_en || item.description) : item.description}</p>
      </div>
      <span class="text-primary font-bold ml-4 whitespace-nowrap">$${item.price.toFixed(2)}</span>
    </div>
  `).join('')
}

async function initMenuPage() {
  try {
    const res = await fetch('/src/data/menu.json')
    const items = await res.json()

    renderMenuSectionWithImage({ listId: 'starter-list', imageId: 'starter-image', category: 'Appetizers', items })
    renderMenuSectionWithImage({ listId: 'main-course-list', imageId: 'main-course-image', category: 'Main Course', items })
    renderSimpleMenuGrid('dessert-list', 'Desserts', items)
    renderSimpleMenuGrid('drinks-list', 'Drinks', items)
  } catch (error) {
    console.error('❌ Lỗi khi tải thực đơn:', error)
  }
}

document.addEventListener('DOMContentLoaded', initMenuPage)
