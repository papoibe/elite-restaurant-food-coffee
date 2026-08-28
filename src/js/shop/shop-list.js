import { addToCart } from '/src/js/cart.js'
import { formatPrice } from '../format.js'
import { showSuccessToast } from '/src/js/validate.js'
import { isWishlisted, toggleWishlist } from '/src/js/wishlist.js'
import { t, getLang } from '/src/js/i18n.js'

let productsData = []
let filteredProducts = []
let currentPage = 1
let itemsPerPage = 15
let activeTag = null

/**
 * debounce — Hoãn gọi fn cho tới khi người dùng ngừng gõ `delay` ms.
 * Gõ "Nguyễn" là 6 lần sự kiện input, tức 6 lần lọc và vẽ lại toàn bộ lưới.
 * Với 50 món thì chưa thấy gì, nhưng danh sách lớn dần là giao diện khựng.
 */
function debounce(fn, delay = 300) {
  let id
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(() => fn(...args), delay)
  }
}

/**
 * showLoading — Khung xương trong lúc chờ fetch.
 * Vẽ đúng số ô và đúng chiều cao thẻ thật để danh sách không nhảy khi
 * dữ liệu về (giữ CLS thấp).
 */
function showLoading() {
  const grid = document.getElementById('product-grid')
  if (!grid) return
  grid.setAttribute('aria-busy', 'true')
  grid.innerHTML = Array.from({ length: 9 }, () => `
    <div class="animate-pulse">
      <div class="aspect-square bg-gray-200 dark:bg-[#1a1a1a] rounded-[2px]"></div>
      <div class="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded mt-4 w-3/4"></div>
      <div class="h-4 bg-gray-100 dark:bg-[#141414] rounded mt-2 w-1/2"></div>
    </div>`).join('')
}

/** showEmpty — Không có món nào khớp bộ lọc hiện tại. */
function showEmpty() {
  const grid = document.getElementById('product-grid')
  if (!grid) return
  grid.removeAttribute('aria-busy')
  grid.innerHTML = `
    <div class="col-span-full py-16 text-center">
      <svg class="w-12 h-12 mx-auto text-[#BDBDBD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/><path d="M20 20l-4.5-4.5"/>
      </svg>
      <p class="mt-4 text-[16px] leading-[24px] text-[#4F4F4F] dark:text-gray-400">${t('shop.noResults')}</p>
      <button type="button" id="btn-reset-filters"
              class="mt-4 h-11 px-6 border border-[#FF9F0D] text-[#FF9F0D] text-[16px] leading-[24px] hover:bg-[#FF9F0D] hover:text-white transition-colors cursor-pointer">
        ${t('shop.clearFilters')}
      </button>
    </div>`
  document.getElementById('btn-reset-filters')?.addEventListener('click', resetFilters)
}

/** showError — Không tải được dữ liệu. Có nút thử lại vì lỗi mạng hay tạm thời. */
function showError(message) {
  const grid = document.getElementById('product-grid')
  if (!grid) return
  grid.removeAttribute('aria-busy')
  grid.innerHTML = `
    <div class="col-span-full py-16 text-center" role="alert">
      <svg class="w-12 h-12 mx-auto text-[#EB5757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>
      </svg>
      <p class="mt-4 text-[16px] leading-[24px] text-[#EB5757]">${t('shop.loadError')}</p>
      <p class="mt-1 text-[14px] leading-[22px] text-[#828282]">${message}</p>
      <button type="button" id="btn-retry"
              class="mt-4 h-11 px-6 bg-[#FF9F0D] hover:bg-[#E88E00] text-white text-[16px] leading-[24px] transition-colors cursor-pointer">
        ${t('shop.retry')}
      </button>
    </div>`
  document.getElementById('btn-retry')?.addEventListener('click', initShopList)
}

/** resetFilters — Bỏ hết bộ lọc, đưa danh sách về trạng thái đầy đủ. */
function resetFilters() {
  document.querySelectorAll('.category-checkbox').forEach(cb => { cb.checked = false })
  const search = document.getElementById('search-input')
  if (search) search.value = ''
  activeTag = null
  currentPage = 1
  const maxInput = document.getElementById('price-max')
  const minInput = document.getElementById('price-min')
  if (minInput) minInput.value = minInput.min || 0
  if (maxInput) maxInput.value = maxInput.max
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('bg-[#FF9F0D]', 'text-white'))
  filterProducts()
}

async function initShopList() {
  // TRẠNG THÁI 1 — loading: vẽ khung xương TRƯỚC khi gọi fetch
  showLoading()

  try {
    const response = await fetch('/data/menu.json')
    // fetch KHÔNG tự ném lỗi khi máy chủ trả về 404/500 — phải tự kiểm tra,
    // nếu không thì response.json() mới ném và thông báo lỗi sẽ rất khó hiểu.
    if (!response.ok) throw new Error(`Máy chủ trả về ${response.status}`)

    const menuData = await response.json()
    const lang = getLang()

    productsData = menuData.map(item => ({
      id: item.id,
      name: lang === 'vi' ? (item.name_vi || item.name) : item.name,
      price: item.price,
      oldPrice: item.oldPrice || null,
      category: item.category,
      tags: item.tags || [],
      image: item.image,
      description: lang === 'en' ? (item.description_en || item.description) : (item.description || item.description_en),
      rating: item.rating || 5,
      tag: item.oldPrice ? (lang === 'vi' ? 'Giảm giá' : 'Sell') : null
    }))

    renderCategories(menuData)
    renderLatestProducts(productsData)
    renderProductTags(menuData)
    setupEventListeners()

    const maxDataPrice = Math.ceil(Math.max(...productsData.map(p => p.price)))
    const minInput = document.getElementById('price-min')
    const maxInput = document.getElementById('price-max')
    const maxValDisplay = document.getElementById('price-max-val')

    if (maxInput) {
      maxInput.max = maxDataPrice
      maxInput.value = maxDataPrice
    }
    if (minInput) {
      minInput.max = maxDataPrice
      minInput.value = 0
    }
    if (maxValDisplay) maxValDisplay.innerText = maxDataPrice

    const urlCategory = new URLSearchParams(window.location.search).get('category')
    if (urlCategory) {
      const targetBox = document.querySelector(`.category-checkbox[value="${CSS.escape(urlCategory)}"]`)
      if (targetBox) targetBox.checked = true
    }

    // TRẠNG THÁI 2 (có dữ liệu) và 3 (rỗng) do renderProducts() quyết định
    filterProducts()
  } catch (error) {
    // TRẠNG THÁI 4 — lỗi: hiện hẳn ra màn hình kèm nút thử lại,
    // thay vì chỉ console.error rồi để người dùng nhìn trang trắng.
    console.error('Lỗi khi tải dữ liệu sản phẩm:', error)
    showError(error.message)
  }
}

function renderProducts() {
  const grid = document.getElementById('product-grid')
  if (!grid) return

  grid.removeAttribute('aria-busy')

  if (filteredProducts.length === 0) {
    // TRẠNG THÁI 3 — rỗng: nói rõ không có kết quả và cho lối thoát
    showEmpty()
    renderPagination(0)
    return
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  if (currentPage > totalPages) currentPage = 1

  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  grid.innerHTML = currentItems.map(item => {
    const wishlisted = isWishlisted(item.id)
    return `
      <div class="group cursor-pointer flex flex-col">
        <div class="relative bg-gray-200 aspect-square overflow-hidden rounded-[2px]">
          <img loading="lazy" 
            src="${item.image}" 
            alt="${item.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onerror="this.src='https://placehold.co/400x400?text=No+Image'"
          />
          
          ${item.tag ? `
            <span class="absolute top-6 left-6 bg-[#FF9F0D] text-white text-[14px] px-4 py-0.5 rounded-[4px] shadow-sm font-normal">
              ${item.tag}
            </span>
          ` : ''}
          <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            
            <a 
              href="/src/pages/shop-details.html?id=${item.id}" 
              class="w-9 h-9 bg-white text-[#FF9F0D] rounded flex items-center justify-center hover:bg-[#FF9F0D] hover:text-white transition shadow-sm"
              title="${t('shop.viewDetails')}"
            >
              <span 
                class="w-4 h-4 bg-current transition-colors"
                style="mask: url('/assets/images/ProjectStatus.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/ProjectStatus.svg') no-repeat center / contain;"
              ></span>
            </a>

            <button 
              data-id="${item.id}" 
              class="btn-add-cart w-9 h-9 bg-white text-[#FF9F0D] rounded flex items-center justify-center hover:bg-[#FF9F0D] hover:text-white transition shadow-sm cursor-pointer"
              title="${t('common.addToCart')}"
            >
              <span 
                class="w-4 h-4 bg-current transition-colors"
                style="mask: url('/assets/images/Tote.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/Tote.svg') no-repeat center / contain;"
              ></span>
            </button>

            <button 
              data-id="${item.id}" 
              class="btn-wishlist w-9 h-9 rounded flex items-center justify-center transition shadow-sm cursor-pointer ${
                wishlisted 
                  ? 'bg-[#FF9F0D] text-white' 
                  : 'bg-white text-[#FF9F0D] hover:bg-[#FF9F0D] hover:text-white'
              }"
              title="${t('common.addToWishlist')}"
            >
              <span 
                class="w-4 h-4 bg-current transition-colors"
                style="mask: url('/assets/images/Heart.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/Heart.svg') no-repeat center / contain;"
              ></span>
            </button>

          </div>
        </div>

        <h3 class="mt-2 font-bold text-[18px] text-[#333333] dark:text-white group-hover:text-[#FF9F0D] transition line-clamp-1">
          <a href="/src/pages/shop-details.html?id=${item.id}">${item.name}</a>
        </h3>
        
        <div class="mt-1 text-base flex items-center">
          <span class="text-[#FF9F0D] font-semibold">${formatPrice(item.price)}</span>
          ${item.oldPrice ? `<span class="text-gray-400 line-through ml-2 text-sm font-normal">${formatPrice(item.oldPrice)}</span>` : ''}
        </div>
      </div>
    `
  }).join('')

  renderPagination(totalPages)
  attachCardEvents()
}

function renderCategories(items) {
  const container = document.getElementById('category-list')
  if (!container) return

  const rawCategories = [...new Set(items.map(i => i.category))].filter(Boolean)

  container.innerHTML = rawCategories.map(cat => {
    const key = 'cat.' + cat.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    const label = t(key) !== key ? t(key) : cat

    return `
      <label class="flex items-center gap-3 cursor-pointer hover:text-[#FF9F0D] transition">
        <input type="checkbox" value="${cat}" class="category-checkbox accent-[#FF9F0D] w-4 h-4 cursor-pointer" />
        <span>${label}</span>
      </label>
    `
  }).join('')

  document.querySelectorAll('.category-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      currentPage = 1
      filterProducts()
    })
  })
}

function renderLatestProducts(items) {
  const container = document.getElementById('latest-products-list')
  if (!container) return

  const latestItems = [...items].reverse().slice(0, 4)

  container.innerHTML = latestItems.map(item => {
    const starCount = Math.round(item.rating || 5)
    let starsHtml = ''
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="${i <= starCount ? 'text-[#FF9F0D]' : 'text-gray-300'}"></span>`
    }

    return `
      <div class="flex gap-4 items-center cursor-pointer group" onclick="window.location.href='/src/pages/shop-details.html?id=${item.id}'">
        <div class="w-16 h-16 bg-gray-200 overflow-hidden shrink-0 rounded-[2px]">
          <img loading="lazy" src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300" onerror="this.src='https://placehold.co/100x100?text=Dish'" />
        </div>
        <div>
          <h5 class="text-base font-bold text-[#333333] dark:text-white group-hover:text-[#FF9F0D] transition line-clamp-1">${item.name}</h5>
          <div class="flex items-center gap-0.5 mt-0.5 text-xs">${starsHtml}</div>
          <span class="text-sm text-gray-500 font-normal block mt-1">${formatPrice(item.price)}</span>
        </div>
      </div>
    `
  }).join('')
}

function renderProductTags(items) {
  const container = document.getElementById('product-tags-list')
  if (!container) return
  const allTags = items.flatMap(p => p.tags || [])
  const uniqueTags = [...new Set(allTags)].filter(Boolean)

  container.innerHTML = uniqueTags.map(tag => {
    const isActive = activeTag === tag
    const key = 'tag.' + tag.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    const label = t(key) !== key ? t(key) : tag

    return `
      <button 
        type="button" 
        data-tag="${tag}" 
        class="tag-btn pb-1 text-base cursor-pointer transition border-b ${
          isActive 
            ? 'text-[#FF9F0D] border-[#FF9F0D] font-medium' 
            : 'text-[#4F4F4F] dark:text-gray-300 border-[#E0E0E0] dark:border-gray-700 hover:text-[#FF9F0D] hover:border-[#FF9F0D]'
        }"
      >
        ${label}
      </button>
    `
  }).join('')

  container.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selected = e.currentTarget.getAttribute('data-tag')
      activeTag = activeTag === selected ? null : selected
      renderProductTags(items)
      currentPage = 1
      filterProducts()
    })
  })
}

function renderPagination(totalPages) {
  const container = document.getElementById('pagination')
  if (!container) return

  if (totalPages <= 1) {
    container.innerHTML = ''
    return
  }

  const baseBtn = "w-10 h-10 flex items-center justify-center bg-white border border-[#F2F2F2] text-[#FF9F0D] text-sm font-medium hover:bg-[#FF9F0D] hover:text-white transition shadow-[0px_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
  const activeBtn = "w-10 h-10 flex items-center justify-center bg-[#FF9F0D] text-white text-sm font-medium shadow-sm cursor-pointer"

  let html = ''

  html += `
    <button 
      ${currentPage === 1 ? 'disabled class="' + baseBtn + ' opacity-40 cursor-not-allowed"' : 'data-page="' + (currentPage - 1) + '" class="btn-page ' + baseBtn + '"'}
      title="${t('common.prev')}"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 17l-5-5 5-5M11 17l-5-5 5-5"/>
      </svg>
    </button>
  `

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button data-page="${i}" class="btn-page ${i === currentPage ? activeBtn : baseBtn}">${i}</button>
    `
  }

  html += `
    <button 
      ${currentPage === totalPages ? 'disabled class="' + baseBtn + ' opacity-40 cursor-not-allowed"' : 'data-page="' + (currentPage + 1) + '" class="btn-page ' + baseBtn + '"'}
      title="${t('common.next')}"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 17l5-5-5-5M13 17l5-5-5-5"/>
      </svg>
    </button>
  `

  container.innerHTML = html

  container.querySelectorAll('.btn-page').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPage = parseInt(btn.getAttribute('data-page'))
      if (targetPage && targetPage !== currentPage && targetPage >= 1 && targetPage <= totalPages) {
        currentPage = targetPage
        renderProducts()
        window.scrollTo({ top: 350, behavior: 'smooth' })
      }
    })
  })
}

function attachCardEvents() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const productId = btn.getAttribute('data-id')
      const product = productsData.find(p => String(p.id) === String(productId))
      if (product) {
        addToCart(product)
        showSuccessToast(t('toast.addedToCart', { qty: 1, name: product.name }))
      }
    })
  })

  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const productId = btn.getAttribute('data-id')
      const product = productsData.find(p => String(p.id) === String(productId))
      const nowWishlisted = toggleWishlist(productId)

      btn.classList.toggle('bg-[#FF9F0D]', nowWishlisted)
      btn.classList.toggle('text-white', nowWishlisted)
      btn.classList.toggle('bg-white', !nowWishlisted)
      btn.classList.toggle('text-[#FF9F0D]', !nowWishlisted)

      if (product) {
        showSuccessToast(nowWishlisted ? t('toast.addedToWishlist', { name: product.name }) : t('toast.removedFromWishlist', { name: product.name }))
      }
    })
  })
}

function filterProducts() {
  const searchInput = document.getElementById('search-input')
  const sortSelect = document.getElementById('sort-select')
  const minInput = document.getElementById('price-min')
  const maxInput = document.getElementById('price-max')

  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : ''
  const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value)
  const minPrice = minInput ? parseFloat(minInput.value) : 0
  const maxPrice = maxInput ? parseFloat(maxInput.value) : Infinity
  const sortVal = sortSelect ? sortSelect.value : 'default'

  filteredProducts = productsData.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchVal)
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category)
    const matchTag = !activeTag || (Array.isArray(p.tags) && p.tags.includes(activeTag))
    const matchPrice = p.price >= minPrice && p.price <= maxPrice

    return matchSearch && matchCategory && matchTag && matchPrice
  })

  if (sortVal === 'low-high') filteredProducts.sort((a, b) => a.price - b.price)
  if (sortVal === 'high-low') filteredProducts.sort((a, b) => b.price - a.price)

  renderProducts()
}

function updatePriceDisplays(e) {
  const minInput = document.getElementById('price-min')
  const maxInput = document.getElementById('price-max')
  const minDisplay = document.getElementById('price-min-val')
  const maxDisplay = document.getElementById('price-max-val')

  if (!minInput || !maxInput) return

  let minVal = parseInt(minInput.value)
  let maxVal = parseInt(maxInput.value)

  if (minVal > maxVal - 2) {
    if (e && e.target === minInput) {
      minInput.value = maxVal - 2
      minVal = maxVal - 2
    } else {
      maxInput.value = minVal + 2
      maxVal = minVal + 2
    }
  }

  if (minDisplay) minDisplay.textContent = minVal
  if (maxDisplay) maxDisplay.textContent = maxVal
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input')
  const searchBtn = document.getElementById('search-btn')
  const sortSelect = document.getElementById('sort-select')
  const showSelect = document.getElementById('show-select')
  const btnFilterPrice = document.getElementById('btn-filter-price')
  const minInput = document.getElementById('price-min')
  const maxInput = document.getElementById('price-max')

  if (minInput && maxInput) {
    minInput.addEventListener('input', (e) => {
      updatePriceDisplays(e)
      currentPage = 1
      filterProducts()
    })
    maxInput.addEventListener('input', (e) => {
      updatePriceDisplays(e)
      currentPage = 1
      filterProducts()
    })
  }

  // Bọc debounce: chỉ lọc sau khi người dùng ngừng gõ 300ms
  const onSearch = debounce(() => { currentPage = 1; filterProducts() }, 300)
  if (searchInput) searchInput.addEventListener('input', onSearch)
  if (searchBtn) searchBtn.addEventListener('click', () => { currentPage = 1; filterProducts(); })
  if (sortSelect) sortSelect.addEventListener('change', filterProducts)

  if (showSelect) {
    showSelect.addEventListener('change', (e) => {
      itemsPerPage = parseInt(e.target.value) || 15
      currentPage = 1
      renderProducts()
    })
  }

  if (btnFilterPrice) {
    btnFilterPrice.addEventListener('click', () => {
      currentPage = 1
      filterProducts()
    })
  }
}

document.addEventListener('DOMContentLoaded', initShopList)