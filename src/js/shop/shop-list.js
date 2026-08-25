import { addToCart } from '/src/js/cart.js'
import { showSuccessToast } from '/src/js/validate.js'
import { isWishlisted, toggleWishlist } from '/src/js/wishlist.js'
import { t, getLang } from '/src/js/i18n.js'

let productsData = []
let filteredProducts = []
let currentPage = 1
let itemsPerPage = 15
let activeTag = null

async function initShopList() {
  try {
    const response = await fetch('/src/data/menu.json')
    const menuData = await response.json()

    productsData = menuData.map(item => ({
  id: item.id,
  name: item.name,
  price: item.price,
  oldPrice: item.oldPrice || null,
  category: item.category,
  tags: item.tags || [],
  image: item.image,
  description: getLang() === 'en' ? (item.description_en || item.description) : item.description,
  rating: item.rating || 5,
  tag: item.oldPrice ? 'Sell' : null
}))

    renderCategories(productsData)
    renderLatestProducts(productsData)
    renderProductTags(productsData   )
    setupEventListeners()
    const maxDataPrice = Math.ceil(Math.max(...productsData.map(p => p.price)))
    const priceRange = document.getElementById('price-range')
    const priceDisplay = document.getElementById('price-value')
    if (priceRange) {
      priceRange.max = maxDataPrice
      priceRange.value = maxDataPrice
      if (priceDisplay) priceDisplay.innerText = maxDataPrice
    }
    const urlCategory = new URLSearchParams(window.location.search).get('category')
    if (urlCategory) {
      const targetBox = document.querySelector(`.category-checkbox[value="${CSS.escape(urlCategory)}"]`)
      if (targetBox) targetBox.checked = true
    }

    filterProducts()
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu sản phẩm:", error)
  }
}

function renderProducts() {
  const grid = document.getElementById('product-grid')
  if (!grid) return

  if (filteredProducts.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500">Không tìm thấy món ăn nào.</div>`
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
        <!-- Khung ảnh + 3 Action Buttons -->
        <div class="relative bg-gray-200 aspect-square overflow-hidden rounded-[2px]">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onerror="this.src='https://placehold.co/400x400?text=No+Image'"
          />
          
          ${item.tag ? `
            <span class="absolute top-6 left-6 bg-primary text-white text-[14px] px-4 py-0.5 rounded-[4px] shadow-sm font-normal">
              ${item.tag}
            </span>
          ` : ''}
          <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            
            <a 
              href="/src/pages/shop-details.html?id=${item.id}" 
              class="w-9 h-9 bg-white text-primary rounded flex items-center justify-center hover:bg-primary hover:text-white transition shadow-sm"
              title="Chi tiết"
            >
              <span 
                class="w-4 h-4 bg-current transition-colors"
                style="mask: url('/public/assets/images/ProjectStatus.svg') no-repeat center / contain; -webkit-mask: url('/public/assets/images/ProjectStatus.svg') no-repeat center / contain;"
              ></span>
            </a>

            <!-- Giỏ hàng (Tote.svg) -->
            <button 
              data-id="${item.id}" 
              class="btn-add-cart w-9 h-9 bg-white text-primary rounded flex items-center justify-center hover:bg-primary hover:text-white transition shadow-sm"
              title="Thêm vào giỏ"
            >
              <span 
                class="w-4 h-4 bg-current transition-colors"
                style="mask: url('/public/assets/images/Tote.svg') no-repeat center / contain; -webkit-mask: url('/public/assets/images/Tote.svg') no-repeat center / contain;"
              ></span>
            </button>

            <!-- Yêu thích (Heart.svg) -->
            <button 
              data-id="${item.id}" 
              class="btn-wishlist w-9 h-9 rounded flex items-center justify-center transition shadow-sm ${
                wishlisted 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-primary hover:bg-primary hover:text-white'
              }"
              title="Yêu thích"
            >
              <span 
                class="w-4 h-4 bg-current transition-colors"
                style="mask: url('/public/assets/images/Heart.svg') no-repeat center / contain; -webkit-mask: url('/public/assets/images/Heart.svg') no-repeat center / contain;"
              ></span>
            </button>

          </div>
        </div>

        <!-- Tên món ăn -->
        <h3 class="mt-2 font-bold text-[18px] text-[#333333] dark:text-white group-hover:text-primary transition line-clamp-1">
          <a href="/src/pages/shop-details.html?id=${item.id}">${item.name}</a>
        </h3>
        
        <!-- Giá món -->
        <div class="mt-1 text-base flex items-center">
          <span class="text-primary font-semibold">$${item.price.toFixed(2)}</span>
          ${item.oldPrice ? `<span class="text-gray-400 line-through ml-2 text-sm font-normal">$${item.oldPrice.toFixed(2)}</span>` : ''}
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

  const categories = [...new Set(items.map(i => i.category))]

  container.innerHTML = categories.map(cat => `
    <label class="flex items-center gap-3 cursor-pointer hover:text-primary transition">
      <input type="checkbox" value="${cat}" class="category-checkbox accent-primary w-4 h-4 cursor-pointer" />
      <span>${cat}</span>
    </label>
  `).join('')

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
      starsHtml += `<span class="${i <= starCount ? 'text-primary' : 'text-gray-300'}">★</span>`
    }

    return `
      <div class="flex gap-4 items-center cursor-pointer group" onclick="window.location.href='/src/pages/shop-details.html?id=${item.id}'">
        <div class="w-16 h-16 bg-gray-200 overflow-hidden shrink-0 rounded-[2px]">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300" onerror="this.src='https://placehold.co/100x100?text=Dish'" />
        </div>
        <div>
          <h5 class="text-base font-bold text-[#333333] dark:text-white group-hover:text-primary transition line-clamp-1">${item.name}</h5>
          <div class="flex items-center gap-0.5 mt-0.5 text-xs">${starsHtml}</div>
          <span class="text-sm text-gray-500 font-normal block mt-1">$${item.price.toFixed(2)}</span>
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
    return `
      <button 
        type="button"
        data-tag="${tag}" 
        class="tag-btn pb-1 text-base cursor-pointer transition border-b ${
          isActive 
            ? 'text-primary border-primary font-medium' 
            : 'text-[#4F4F4F] dark:text-gray-300 border-[#E0E0E0] dark:border-gray-700 hover:text-primary hover:border-primary'
        }"
      >
        ${tag}
      </button>
    `
  }).join('')
  container.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selected = e.currentTarget.getAttribute('data-tag')
      activeTag = activeTag === selected ? null : selected
      renderProductTags(productsData)
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

  const baseBtn = "w-10 h-10 flex items-center justify-center bg-white border border-[#F2F2F2] text-primary text-sm font-medium hover:bg-primary hover:text-white transition shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
  const activeBtn = "w-10 h-10 flex items-center justify-center bg-primary text-white text-sm font-medium shadow-sm"

  let html = ''

  html += `
    <button 
      ${currentPage === 1 ? 'disabled class="' + baseBtn + ' opacity-40 cursor-not-allowed"' : 'data-page="' + (currentPage - 1) + '" class="btn-page ' + baseBtn + '"'}
      title="Trang trước"
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
      title="Trang sau"
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
        showSuccessToast(t('toast.addedToCart', { qty: 1, name: product.name }) || `Đã thêm ${product.name} vào giỏ`)
      }
    })
  })

  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const productId = btn.getAttribute('data-id')
      const product = productsData.find(p => String(p.id) === String(productId))
      const nowWishlisted = toggleWishlist(productId)

      btn.classList.toggle('bg-primary', nowWishlisted)
      btn.classList.toggle('text-white', nowWishlisted)
      btn.classList.toggle('bg-white', !nowWishlisted)
      btn.classList.toggle('text-primary', !nowWishlisted)

      if (product) {
        showSuccessToast(nowWishlisted ? `Đã thêm ${product.name} vào yêu thích` : `Đã xóa khỏi danh sách yêu thích`)
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
function updateSliderTrack() {
  const minInput = document.getElementById('price-min')
  const maxInput = document.getElementById('price-max')
  const track = document.getElementById('slider-track')
  const minValDisplay = document.getElementById('price-min-val')
  const maxValDisplay = document.getElementById('price-max-val')

  if (!minInput || !maxInput || !track) return

  let minVal = parseFloat(minInput.value)
  let maxVal = parseFloat(maxInput.value)

  if (minVal > maxVal - 2) {
    if (event && event.target === minInput) {
      minInput.value = maxVal - 2
      minVal = maxVal - 2
    } else {
      maxInput.value = minVal + 2
      maxVal = minVal + 2
    }
  }

  const minPercent = (minVal / minInput.max) * 100
  const maxPercent = (maxVal / maxInput.max) * 100

  track.style.left = `${minPercent}%`
  track.style.width = `${maxPercent - minPercent}%`

  if (minValDisplay) minValDisplay.innerText = minVal
  if (maxValDisplay) maxValDisplay.innerText = maxVal
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input')
  const searchBtn = document.getElementById('search-btn')
  const sortSelect = document.getElementById('sort-select')
  const showSelect = document.getElementById('show-select')
  const priceRange = document.getElementById('price-range')
  const btnFilterPrice = document.getElementById('btn-filter-price')
  const minInput = document.getElementById('price-min')
  const maxInput = document.getElementById('price-max')

  if (minInput && maxInput) {
    minInput.addEventListener('input', () => {
      updateSliderTrack()
      currentPage = 1
      filterProducts()
    })
    maxInput.addEventListener('input', () => {
      updateSliderTrack()
      currentPage = 1
      filterProducts()
    })
    updateSliderTrack()
  }

  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; filterProducts(); })
  if (searchBtn) searchBtn.addEventListener('click', () => { currentPage = 1; filterProducts(); })
  if (sortSelect) sortSelect.addEventListener('change', filterProducts)

  if (showSelect) {
    showSelect.addEventListener('change', (e) => {
      itemsPerPage = parseInt(e.target.value) || 9
      currentPage = 1
      renderProducts()
    })
  }

  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      const priceDisplay = document.getElementById('price-value')
      if (priceDisplay) priceDisplay.innerText = e.target.value
      currentPage = 1
      filterProducts()
    })
  }

  if (btnFilterPrice) {
    btnFilterPrice.addEventListener('click', () => {
      currentPage = 1
      filterProducts()
    })
  }
}
const minInput = document.getElementById('price-min')
const maxInput = document.getElementById('price-max')
const minDisplay = document.getElementById('price-min-val')
const maxDisplay = document.getElementById('price-max-val')

function updatePriceDisplays(e) {
  let minVal = parseInt(minInput.value)
  let maxVal = parseInt(maxInput.value)

  if (minVal > maxVal - 50) {
    if (e && e.target === minInput) {
      minInput.value = maxVal - 50
      minVal = maxVal - 50
    } else {
      maxInput.value = minVal + 50
      maxVal = minVal + 50
    }
  }

  if (minDisplay) minDisplay.textContent = minVal
  if (maxDisplay) maxDisplay.textContent = maxVal
}

minInput?.addEventListener('input', updatePriceDisplays)
maxInput?.addEventListener('input', updatePriceDisplays)

document.addEventListener('DOMContentLoaded', initShopList)