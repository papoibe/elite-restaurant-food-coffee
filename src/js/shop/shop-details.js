/* ============================================================
   shop-details.js — Logic trang chi tiết sản phẩm
   Đọc dữ liệu từ menu.json, kết nối cart.js + wishlist.js module chung
   ============================================================ */
import { addToCart } from '/src/js/cart.js' // Import hàm thêm giỏ hàng
import { showSuccessToast } from '/src/js/validate.js' // Toast thông báo
import { isWishlisted, toggleWishlist } from '/src/js/wishlist.js'
import { t, getLang } from '/src/js/i18n.js' // Chuyển ngôn ngữ VN/EN

/**
 * getProductIdFromUrl — Lấy id sản phẩm từ URL query string (?id=SP01)
 */
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('id') || 'SP01' // Trả về string vì menu.json dùng "SP01"
}

/**
 * initShopDetails — Khởi tạo trang chi tiết sản phẩm
 * Fetch từ menu.json thay vì dùng mockProducts
 */
async function initShopDetails() {
  const productId = getProductIdFromUrl()
  const container = document.getElementById('product-detail-container')
  if (!container) return

  try {
    const response = await fetch('/src/data/menu.json')
    const menuData = await response.json()

    // Tìm sản phẩm theo ID
    const productIndex = menuData.findIndex(p => String(p.id) === String(productId))
    const product = menuData[productIndex]

    if (!product) {
      container.className = '' // Bỏ hết class skeleton loading (grid + animate-pulse) trước khi render nội dung thật
      container.innerHTML = `
        <div class="text-center py-20">
          <p class="text-red-500 font-bold mb-4">${t('common.notFound')}</p>
          <a href="/src/pages/shop-list.html" class="text-xs bg-primary text-white px-4 py-2 rounded shadow hover:bg-amber-600 transition">${t('common.backToShop')}</a>
        </div>`
      return
    }

    // Sản phẩm trước/sau trong danh sách (vòng lặp về đầu/cuối) — cho nút Prev/Next
    const prevProduct = menuData[(productIndex - 1 + menuData.length) % menuData.length]
    const nextProduct = menuData[(productIndex + 1) % menuData.length]
    const wishlisted = isWishlisted(product.id)
    const description = getLang() === 'en' ? (product.description_en || product.description) : product.description

    // Bỏ hết class skeleton loading (grid + animate-pulse) trước khi render nội dung thật —
    // nếu không, class "animate-pulse" và grid ngoài sẽ tồn tại vĩnh viễn đè lên layout thật,
    // gây hiệu ứng nhấp nháy mờ + chồng lấn nội dung (2 lớp grid lồng nhau).
    container.className = ''

    // Render chi tiết sản phẩm theo layout Figma
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        <!-- Ảnh sản phẩm lớn -->
        <div class="lg:col-span-6">
          <img src="${product.image}" alt="${product.name}" class="w-full h-[400px] object-cover rounded-xl shadow-md">
        </div>

        <!-- Thông tin sản phẩm -->
        <div class="lg:col-span-6 space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs">${t('common.inStock')}</span>
            <!-- Prev/Next — chuyển sang món trước/sau trong danh sách -->
            <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <a href="/src/pages/shop-details.html?id=${prevProduct.id}" class="hover:text-primary flex items-center gap-1" title="${prevProduct.name}">← ${t('common.prev')}</a>
              <a href="/src/pages/shop-details.html?id=${nextProduct.id}" class="hover:text-primary flex items-center gap-1" title="${nextProduct.name}">${t('common.next')} →</a>
            </div>
          </div>

          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">${product.name}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">${description}</p>

          <!-- Rating (sao) dựa trên trường rating trong JSON -->
          <div class="flex items-center gap-1">
            ${Array.from({length: 5}, (_, i) =>
              `<span class="${i < Math.round(product.rating) ? 'text-primary' : 'text-gray-300'} text-sm">★</span>`
            ).join('')}
            <span class="text-xs text-gray-500 ml-2">(${product.rating})</span>
          </div>

          <div class="text-3xl font-bold text-primary">
            $${product.price.toFixed(2)}
          </div>

          <!-- Nút tăng/giảm số lượng + Add to Cart -->
          <div class="flex items-center flex-wrap gap-4 pt-4">
            <!-- Dạng pill có khoảng cách rõ giữa -/số lượng/+, đồng bộ với cart.js -->
            <div class="flex items-center h-11 border border-gray-300 dark:border-gray-600 rounded-full px-4 gap-4">
              <button id="btn-minus" type="button" aria-label="${t('shop.decreaseQty')}" class="text-gray-500 dark:text-gray-300 hover:text-primary font-bold text-lg leading-none cursor-pointer">−</button>
              <span id="input-qty" class="w-6 text-center text-sm font-bold text-gray-800 dark:text-white select-none">1</span>
              <button id="btn-plus" type="button" aria-label="${t('shop.increaseQty')}" class="text-gray-500 dark:text-gray-300 hover:text-primary font-bold text-lg leading-none cursor-pointer">+</button>
            </div>
            <button id="btn-add-to-cart" class="bg-primary text-white font-semibold px-8 h-11 rounded-lg hover:bg-amber-600 transition shadow-md shadow-amber-500/20 flex items-center gap-2 text-sm cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
              ${t('common.addToCart')}
            </button>
          </div>

          <!-- Wishlist + Share + Metadata -->
          <div class="pt-6 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 space-y-3">
            <button id="btn-wishlist" type="button" data-id="${product.id}" class="flex items-center gap-2 font-semibold cursor-pointer transition-colors ${wishlisted ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}">
              <svg id="wishlist-icon" class="w-4 h-4" fill="${wishlisted ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <span id="wishlist-label">${wishlisted ? t('common.wishlisted') : t('common.addToWishlist')}</span>
            </button>
            <div><span class="font-semibold text-gray-800 dark:text-gray-300">${t('common.category')}:</span> ${product.category}</div>
            <div class="flex items-center gap-3">
              <span class="font-semibold text-gray-800 dark:text-gray-300">${t('common.share')}:</span>
              <button id="btn-share" type="button" class="hover:text-primary cursor-pointer" aria-label="${t('shop.copyLink')}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              </button>
              <span id="share-feedback" class="text-primary hidden">${t('toast.copiedLink')}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Description / Reviews — nội dung thật lấy từ menu.json -->
      <div class="space-y-6">
        <div class="flex border-b border-gray-200 dark:border-gray-800 gap-8 text-sm" role="tablist">
          <button type="button" role="tab" aria-selected="true" data-tab-target="description" class="detail-tab-btn pb-3 border-b-2 border-primary font-bold text-primary">${t('common.description')}</button>
          <button type="button" role="tab" aria-selected="false" data-tab-target="reviews" class="detail-tab-btn pb-3 border-b-2 border-transparent text-gray-400 hover:text-primary">${t('common.reviews')}</button>
        </div>
        <div id="tab-panel-description" class="detail-tab-panel text-xs text-gray-500 dark:text-gray-400 leading-relaxed space-y-2" role="tabpanel">
          <p>${description}</p>
          <p>${t('shop.belongsTo')} <strong class="text-text-dark dark:text-text-white">${product.category}</strong>, ${t('shop.priced')} <strong class="text-primary">$${product.price.toFixed(2)}</strong>.</p>
        </div>
        <div id="tab-panel-reviews" class="detail-tab-panel hidden text-xs text-gray-500 dark:text-gray-400 leading-relaxed" role="tabpanel">
          <p>${t('shop.avgRating')}: <strong class="text-primary">${product.rating} / 5 ★</strong></p>
          <p class="mt-2">${t('shop.noReviewsYet')}</p>
        </div>
      </div>`

    setupQuantityControls()
    setupTabs()
    setupWishlist(product)
    setupShare(product)

    // Gắn sự kiện Add To Cart — dùng cart.js module chung
    document.getElementById('btn-add-to-cart')?.addEventListener('click', () => {
      const qty = parseInt(document.getElementById('input-qty')?.textContent) || 1
      addToCart({ ...product, quantity: qty }) // Truyền sản phẩm + số lượng
      showSuccessToast(t('toast.addedToCart', { qty, name: product.name }))
    })

    // Render thêm sản phẩm liên quan (cùng category)
    renderRelatedProducts(menuData, product)
  } catch (error) {
    console.error('Lỗi khi tải chi tiết sản phẩm:', error)
  }
}

/**
 * setupTabs — Chuyển giữa tab Description / Reviews (điều hướng được bằng bàn phím
 * mặc định của trình duyệt vì dùng đúng thẻ <button>)
 */
function setupTabs() {
  const tabButtons = document.querySelectorAll('.detail-tab-btn')
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tabTarget

      tabButtons.forEach((b) => {
        b.classList.remove('border-primary', 'text-primary', 'font-bold')
        b.classList.add('border-transparent', 'text-gray-400')
        b.setAttribute('aria-selected', 'false')
      })
      btn.classList.add('border-primary', 'text-primary', 'font-bold')
      btn.classList.remove('border-transparent', 'text-gray-400')
      btn.setAttribute('aria-selected', 'true')

      document.querySelectorAll('.detail-tab-panel').forEach((panel) => {
        panel.classList.toggle('hidden', panel.id !== `tab-panel-${target}`)
      })
    })
  })
}

/**
 * setupWishlist — Nút "Add to Wishlist" lưu vào localStorage qua wishlist.js
 */
function setupWishlist(product) {
  const btn = document.getElementById('btn-wishlist')
  if (!btn) return

  btn.addEventListener('click', () => {
    const nowWishlisted = toggleWishlist(product.id)
    const icon = document.getElementById('wishlist-icon')
    const label = document.getElementById('wishlist-label')

    btn.classList.toggle('text-primary', nowWishlisted)
    icon.setAttribute('fill', nowWishlisted ? 'currentColor' : 'none')
    label.textContent = nowWishlisted ? t('common.wishlisted') : t('common.addToWishlist')
    showSuccessToast(nowWishlisted ? t('toast.addedToWishlist', { name: product.name }) : t('toast.removedFromWishlist', { name: product.name }))
  })
}

/**
 * setupShare — Sao chép liên kết trang hiện tại bằng Clipboard API
 */
function setupShare(product) {
  const btn = document.getElementById('btn-share')
  if (!btn) return

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      const feedback = document.getElementById('share-feedback')
      feedback.classList.remove('hidden')
      setTimeout(() => feedback.classList.add('hidden'), 2000)
    } catch (error) {
      console.error('Không thể sao chép liên kết:', error)
      showSuccessToast(t('toast.copyFailed'))
    }
  })
}

/**
 * renderRelatedProducts — Hiển thị sản phẩm liên quan (cùng category)
 */
function renderRelatedProducts(allProducts, currentProduct) {
  const relatedGrid = document.getElementById('related-products-grid')
  if (!relatedGrid) return

  // Lọc 4 sản phẩm cùng category, bỏ sản phẩm hiện tại
  const related = allProducts
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4)

  relatedGrid.innerHTML = related.map(item => `
    <a href="/src/pages/shop-details.html?id=${item.id}" class="group">
      <div class="bg-gray-200 aspect-square overflow-hidden rounded">
        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <h4 class="mt-2 font-bold text-sm text-gray-800 dark:text-white group-hover:text-primary transition-colors">${item.name}</h4>
      <span class="text-primary font-semibold text-sm">$${item.price.toFixed(2)}</span>
    </a>
  `).join('')
}

/**
 * setupQuantityControls — Xử lý nút +/- số lượng
 */
function setupQuantityControls() {
  const btnMinus = document.getElementById('btn-minus')
  const btnPlus = document.getElementById('btn-plus')
  const inputQty = document.getElementById('input-qty')

  if (btnMinus && btnPlus && inputQty) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(inputQty.textContent) || 1
      if (val > 1) inputQty.textContent = val - 1
    })
    btnPlus.addEventListener('click', () => {
      let val = parseInt(inputQty.textContent) || 1
      inputQty.textContent = val + 1
    })
  }
}

document.addEventListener('DOMContentLoaded', initShopDetails)
