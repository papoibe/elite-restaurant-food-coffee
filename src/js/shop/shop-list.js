/* ============================================================
   shop-list.js — Logic trang danh sách sản phẩm (Shop List)
   Đọc dữ liệu từ menu.json (do Kiệt tạo), kết nối cart.js
   ============================================================ */
import { addToCart } from '/src/js/cart.js' // Import hàm thêm giỏ hàng từ module chung
import { showSuccessToast } from '/src/js/validate.js' // Toast thông báo
import { isWishlisted, toggleWishlist } from '/src/js/wishlist.js' // Yêu thích (localStorage)
import { t, getLang } from '/src/js/i18n.js' // Chuyển ngôn ngữ VN/EN

let productsData = [] // Mảng chứa toàn bộ sản phẩm sau khi fetch

/**
 * initShopList — Khởi tạo trang Shop List
 * Fetch dữ liệu từ menu.json thay vì dùng mockProducts
 */
async function initShopList() {
  try {
    const response = await fetch('/src/data/menu.json') // Gọi file JSON chứa sản phẩm
    const menuData = await response.json()

    // Chuyển đổi format từ menu.json sang format shop-list cần
    productsData = menuData.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      oldPrice: null, // menu.json không có giá cũ, để null
      category: item.category,
      image: item.image, // Ảnh từ Cloudinary
      description: getLang() === 'en' ? (item.description_en || item.description) : item.description,
      rating: item.rating,
      tag: item.rating >= 5.0 ? 'Hot' : null // Đánh tag Hot cho sản phẩm 5 sao
    }))

    renderCategories(productsData) // Render danh mục lọc bên sidebar
    setupEventListeners() // Gắn sự kiện search, filter, sort

    // Nếu URL có ?category=... (bấm từ khối "Food Category" ở trang chủ) thì lọc sẵn theo đúng danh mục đó
    const urlCategory = new URLSearchParams(window.location.search).get('category')
    if (urlCategory) {
      const matchedRadio = document.querySelector(`.category-radio[value="${CSS.escape(urlCategory)}"]`)
      if (matchedRadio) {
        matchedRadio.checked = true
        filterProducts()
        return
      }
    }

    renderProducts(productsData) // Render lưới sản phẩm (không có filter từ URL)
  } catch (error) {
    console.error("Lỗi khi tải danh sách sản phẩm:", error)
  }
}

/**
 * renderProducts — Render lưới sản phẩm ra giao diện
 * @param {Array} items - Mảng sản phẩm đã filter/sort
 */
function renderProducts(items) {
  const grid = document.getElementById('product-grid')
  const countText = document.getElementById('product-count')

  if (!grid) return

  if (countText) {
    countText.innerText = t('shop.showingResults', { count: items.length })
  }

  if (items.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">${t('shop.noResults')}</div>`
    return
  }

  // Render từng card sản phẩm theo layout Figma
  grid.innerHTML = items.map(item => `
    <div class="group cursor-pointer">
      <div class="relative bg-gray-200 aspect-square overflow-hidden rounded">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onerror="this.style.opacity='0'; this.parentElement.classList.add('bg-gray-300');"
        />
        ${item.tag ? `<span class="absolute top-4 left-4 bg-primary text-white text-xs px-3 py-0.5 rounded">${item.tag}</span>` : ''}

        <!-- Yêu thích — lưu localStorage qua wishlist.js, luôn hiện (không chỉ khi hover) -->
        <button data-id="${item.id}" class="btn-wishlist absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition ${isWishlisted(item.id) ? 'text-primary' : 'text-gray-600'}" title="${t('common.addToWishlist')}" aria-label="${t('common.addToWishlist')}">
          <svg class="w-4 h-4 wishlist-icon" fill="${isWishlisted(item.id) ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>

        <!-- Overlay khi hover: link chi tiết + thêm giỏ hàng -->
        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <a href="/src/pages/shop-details.html?id=${item.id}" class="w-9 h-9 bg-white text-gray-800 rounded flex items-center justify-center hover:bg-primary hover:text-white transition" title="${t('shop.viewDetails')}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          </a>
          <button data-id="${item.id}" class="btn-add-cart w-9 h-9 bg-primary text-white rounded flex items-center justify-center hover:bg-amber-600 transition" title="${t('common.addToCart')}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
          </button>
        </div>
      </div>

      <h3 class="mt-2 font-bold text-base text-gray-800 dark:text-white group-hover:text-primary transition-colors">
        <a href="/src/pages/shop-details.html?id=${item.id}">${item.name}</a>
      </h3>
      
      <div class="mt-1 text-base">
        <span class="text-primary font-semibold">$${item.price.toFixed(2)}</span>
        ${item.oldPrice ? `<span class="text-gray-400 line-through text-xs ml-2">$${item.oldPrice.toFixed(2)}</span>` : ''}
      </div>
    </div>
  `).join('')

  // Gắn sự kiện addToCart cho các nút — dùng cart.js module chung
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const productId = e.currentTarget.getAttribute('data-id')
      const product = productsData.find(p => String(p.id) === String(productId))
      if (product) {
        addToCart(product) // Gọi hàm addToCart từ cart.js
        showSuccessToast(t('toast.addedToCart', { qty: 1, name: product.name }))
      }
    })
  })

  // Gắn sự kiện Yêu thích — dùng wishlist.js module chung
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const productId = btn.getAttribute('data-id')
      const product = productsData.find(p => String(p.id) === String(productId))
      const nowWishlisted = toggleWishlist(productId)

      btn.classList.toggle('text-primary', nowWishlisted)
      btn.classList.toggle('text-gray-600', !nowWishlisted)
      btn.querySelector('.wishlist-icon').setAttribute('fill', nowWishlisted ? 'currentColor' : 'none')

      if (product) {
        showSuccessToast(nowWishlisted ? t('toast.addedToWishlist', { name: product.name }) : t('toast.removedFromWishlist', { name: product.name }))
      }
    })
  })
}

/**
 * renderCategories — Render danh mục lọc sản phẩm
 */
function renderCategories(items) {
  const categoryContainer = document.getElementById('category-list')
  if (!categoryContainer) return

  // Lấy danh sách category duy nhất từ dữ liệu
  const categories = ['All', ...new Set(items.map(i => i.category))]

  categoryContainer.innerHTML = categories.map((cat, idx) => `
    <label class="flex items-center gap-2 cursor-pointer hover:text-primary transition">
      <input type="radio" name="category" value="${cat}" ${idx === 0 ? 'checked' : ''} class="category-radio accent-primary"> ${cat}
    </label>
  `).join('')

  document.querySelectorAll('.category-radio').forEach(radio => {
    radio.addEventListener('change', filterProducts)
  })
}

/**
 * filterProducts — Lọc sản phẩm theo search, category, giá, sort
 */
function filterProducts() {
  const searchInput = document.getElementById('search-input')
  const sortSelect = document.getElementById('sort-select')
  const priceRange = document.getElementById('price-range')

  const searchVal = searchInput ? searchInput.value.toLowerCase() : ''
  const selectedCat = document.querySelector('input[name="category"]:checked')?.value || 'All'
  const maxPrice = priceRange ? parseFloat(priceRange.value) : Infinity
  const sortVal = sortSelect ? sortSelect.value : 'default'

  let filtered = productsData.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchVal)
    const matchCategory = selectedCat === 'All' || p.category === selectedCat
    const matchPrice = p.price <= maxPrice
    return matchSearch && matchCategory && matchPrice
  })

  // Sắp xếp theo giá
  if (sortVal === 'low-high') filtered.sort((a, b) => a.price - b.price)
  if (sortVal === 'high-low') filtered.sort((a, b) => b.price - a.price)

  renderProducts(filtered)
}

/**
 * setupEventListeners — Gắn sự kiện cho các bộ lọc
 */
function setupEventListeners() {
  const searchInput = document.getElementById('search-input')
  const searchBtn = document.getElementById('search-btn')
  const sortSelect = document.getElementById('sort-select')
  const priceRange = document.getElementById('price-range')

  if (searchInput) searchInput.addEventListener('input', filterProducts)
  if (searchBtn) searchBtn.addEventListener('click', filterProducts)
  if (sortSelect) sortSelect.addEventListener('change', filterProducts)
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      const priceDisplay = document.getElementById('price-value')
      if (priceDisplay) priceDisplay.innerText = e.target.value
      filterProducts()
    })
  }
}

document.addEventListener('DOMContentLoaded', initShopList)