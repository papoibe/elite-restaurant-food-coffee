import { addToCart } from '/src/js/cart.js'
import { formatPrice } from '../format.js'
import { showSuccessToast } from '/src/js/validate.js'
import { isWishlisted, toggleWishlist } from '/src/js/wishlist.js'
import { t, getLang, applyStaticTranslations } from '/src/js/i18n.js'

let similarOffset = 0
let similarItems = []

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('id') || 'SP01'
}

async function initShopDetails() {
  applyStaticTranslations()

  const productId = getProductIdFromUrl()
  const detailContainer = document.getElementById('product-detail-container')
  if (!detailContainer) return

  try {
    const response = await fetch('/src/data/menu.json')
    if (!response.ok) throw new Error(`May chu tra ve ${response.status}`)
    const menuData = await response.json()

    const productIndex = menuData.findIndex(p => String(p.id) === String(productId))
    const product = menuData[productIndex]

    if (!product) {
      detailContainer.innerHTML = `
        <div class="text-center py-20">
          <p class="text-red-500 font-bold mb-4">${t('common.notFound')}</p>
          <a href="/src/pages/shop-list.html" class="text-xs bg-[#FF9F0D] text-white px-5 py-2.5 rounded shadow hover:bg-amber-600 transition">${t('common.backToShop')}</a>
        </div>`
      return
    }

    const prevProduct = menuData[(productIndex - 1 + menuData.length) % menuData.length]
    const nextProduct = menuData[(productIndex + 1) % menuData.length]
    const wishlisted = isWishlisted(product.id)
    const lang = getLang()
    const productName = lang === 'vi' ? (product.name_vi || product.name) : product.name
    const description = lang === 'en' ? (product.description_en || product.description) : (product.description || product.description_en)
    const categoryKey = 'cat.' + (product.category ? product.category.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()) : '')
    const displayCategory = t(categoryKey) !== categoryKey ? t(categoryKey) : (product.category || 'Pizza')

    const rawTag = Array.isArray(product.tags) && product.tags.length ? product.tags[0] : 'Our Shop'
    const tagKey = 'tag.' + rawTag.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    const displayTag = t(tagKey) !== tagKey ? t(tagKey) : rawTag

    const sameCatProducts = menuData.filter(p => p.category === product.category && p.id !== product.id)
    const thumbnails = [
      product.image,
      sameCatProducts[0]?.image || menuData[(productIndex + 1) % menuData.length].image,
      sameCatProducts[1]?.image || menuData[(productIndex + 2) % menuData.length].image,
      sameCatProducts[2]?.image || menuData[(productIndex + 3) % menuData.length].image
    ]

    detailContainer.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div class="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
          <div class="flex sm:flex-col gap-3.5 shrink-0">
            ${thumbnails.map((imgUrl, idx) => `
              <div class="thumb-item w-20 h-20 sm:w-24 sm:h-24 rounded-[2px] overflow-hidden border ${idx === 0 ? 'border-[#FF9F0D]' : 'border-gray-200 dark:border-gray-700'} cursor-pointer hover:border-[#FF9F0D] transition">
                <img loading="lazy" src="${imgUrl}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover" />
              </div>
            `).join('')}
          </div>

          <div class="flex-1 aspect-[4/5] sm:aspect-square bg-gray-100 rounded-[2px] overflow-hidden border border-gray-200 dark:border-gray-800">
            <img loading="lazy" id="main-product-image" src="${product.image}" alt="${productName}" class="w-full h-full object-cover transition-all duration-300" />
          </div>
        </div>

        <div class="lg:col-span-6 space-y-4">
          <div class="flex items-center justify-between text-xs">
            <span class="bg-[#FF9F0D] text-white font-normal px-4 py-1 rounded-[2px]">${t('common.inStock')}</span>
            <div class="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              <a href="/src/pages/shop-details.html?id=${prevProduct.id}" class="hover:text-[#FF9F0D] transition flex items-center gap-1">&larr; ${t('common.prev')}</a>
              <a href="/src/pages/shop-details.html?id=${nextProduct.id}" class="hover:text-[#FF9F0D] transition flex items-center gap-1">${t('common.next')} &rarr;</a>
            </div>
          </div>

          <h1 class="text-3xl sm:text-4xl font-bold font-heading text-[#333333] dark:text-white pt-1">
            ${productName}
          </h1>

          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
            ${description}
          </p>

          <hr class="border-gray-200 dark:border-gray-800 my-4" />

          <div class="text-3xl font-bold text-[#333333] dark:text-white">
            ${product.price.toFixed(2)}$
          </div>

          <div class="flex items-center gap-3 text-xs text-gray-400 pt-1">
            <div class="flex items-center text-[#FF9F0D] text-sm tracking-widest"></div>
            <span>|</span>
            <span class="text-gray-500 dark:text-gray-400 font-normal">5.0 ${t('common.rating')}</span>
            <span>|</span>
            <span class="text-gray-500 dark:text-gray-400 font-normal">22 ${t('common.review')}</span>
          </div>

          <p class="text-xs text-[#333333] dark:text-gray-300 pt-2 font-normal">Dictum/cursus/Risus</p>

          <div class="flex flex-wrap items-center gap-4 pt-3">
            <div class="flex items-center border border-gray-300 dark:border-gray-700 rounded-[2px] h-11">
              <button id="btn-minus" type="button" class="w-10 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#FF9F0D] text-base transition border-r border-gray-300 dark:border-gray-700 cursor-pointer">−</button>
              <span id="input-qty" class="w-12 text-center text-sm font-semibold text-[#333333] dark:text-white select-none">1</span>
              <button id="btn-plus" type="button" class="w-10 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#FF9F0D] text-base transition border-l border-gray-300 dark:border-gray-700 cursor-pointer">+</button>
            </div>

            <button id="btn-add-to-cart" class="bg-[#FF9F0D] text-white font-normal px-8 h-11 rounded-[2px] hover:bg-amber-600 transition flex items-center gap-2 text-sm shadow-sm cursor-pointer">
              <span class="w-4 h-4 bg-white inline-block" style="mask: url('/assets/images/Tote.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/Tote.svg') no-repeat center / contain;"></span>
              <span>${t('common.addToCart')}</span>
            </button>
          </div>

          <hr class="border-gray-200 dark:border-gray-800 my-4" />

          <div class="flex items-center gap-6 text-sm text-[#4F4F4F] dark:text-gray-300">
            <button id="btn-wishlist" type="button" class="flex items-center gap-2 hover:text-[#FF9F0D] transition cursor-pointer ${wishlisted ? 'text-[#FF9F0D]' : ''}">
              <span class="w-4 h-4 bg-current inline-block transition-colors" style="mask: url('/assets/images/Heart.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/Heart.svg') no-repeat center / contain;"></span>
              <span id="wishlist-label">${wishlisted ? t('common.wishlisted') : t('common.addToWishlist')}</span>
            </button>
            <button type="button" class="flex items-center gap-2 hover:text-[#FF9F0D] transition cursor-pointer">
              <span class="w-4 h-4 bg-current inline-block transition-colors" style="mask: url('/assets/images/ProjectStatus.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/ProjectStatus.svg') no-repeat center / contain;"></span>
              <span>${t('common.compare')}</span>
            </button>
          </div>

          <div class="space-y-2 text-sm text-[#333333] dark:text-gray-300 pt-2">
            <p><span class="text-gray-600 dark:text-gray-400">${t('common.category')}:</span> ${displayCategory}</p>
            <p><span class="text-gray-600 dark:text-gray-400">${t('common.tag')}:</span> ${displayTag}</p>
            
            <div class="flex items-center gap-3 pt-2">
              <span class="text-gray-600 dark:text-gray-400">${t('common.share')} :</span>
              <div class="flex items-center gap-2.5">
                <a href="#" class="w-6 h-6 flex items-center justify-center hover:opacity-80 transition" aria-label="YouTube">
                  <img src="/assets/images/vector/youtube.svg" alt="YouTube" class="w-full h-full object-contain" />
                </a>
                <a href="#" class="w-6 h-6 flex items-center justify-center hover:opacity-80 transition" aria-label="Facebook">
                  <img src="/assets/images/vector/fb.svg" alt="Facebook" class="w-full h-full object-contain" />
                </a>
                <a href="#" class="w-6 h-6 flex items-center justify-center hover:opacity-80 transition" aria-label="Twitter">
                  <img src="/assets/images/vector/twitter.svg" alt="Twitter" class="w-full h-full object-contain" />
                </a>
                <a href="#" class="w-6 h-6 flex items-center justify-center hover:opacity-80 transition" aria-label="VK">
                  <img src="/assets/images/vector/vk.svg" alt="VK" class="w-full h-full object-contain" />
                </a>
                <a href="#" class="w-6 h-6 flex items-center justify-center hover:opacity-80 transition" aria-label="Instagram">
                  <img src="/assets/images/vector/instagram.svg" alt="Instagram" class="w-full h-full object-contain" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    renderTabs(product, description)

    similarItems = menuData.filter(p => p.id !== product.id)
    renderSimilarSection()

    setupThumbnailClick()
    setupQuantityControls()
    setupCartAndWishlist(product, productName)

  } catch (error) {
    console.error('Lỗi nạp dữ liệu:', error)
  }
}

function setupThumbnailClick() {
  const thumbs = document.querySelectorAll('.thumb-item')
  const mainImg = document.getElementById('main-product-image')

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('border-[#FF9F0D]'))
      thumb.classList.add('border-[#FF9F0D]')

      const img = thumb.querySelector('img')
      if (img && mainImg) mainImg.src = img.src
    })
  })
}

function renderTabs(product, description) {
  const container = document.getElementById('product-tabs-container')
  if (!container) return

  const lang = getLang()
  const displayDesc = lang === 'en' ? (product.description_en || product.description) : (product.description || product.description_en || description)

  container.innerHTML = `
    <div class="pt-10">
      <div class="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-0">
        <button id="tab-desc-btn" class="bg-[#FF9F0D] text-white text-sm font-normal px-7 py-2.5 rounded-t-[2px] transition focus:outline-none cursor-pointer">
          ${t('common.description')}
        </button>
        <button id="tab-rev-btn" class="text-sm font-normal px-7 py-2.5 text-[#333333] dark:text-gray-400 hover:text-[#FF9F0D] transition focus:outline-none cursor-pointer">
          ${t('common.reviews')} (24)
        </button>
      </div>

      <div id="tab-desc-content" class="pt-8 space-y-6 text-[#4F4F4F] dark:text-gray-400 text-sm leading-relaxed">
        <p>${displayDesc}</p>
        <p>${lang === 'en' ? 'Our kitchen ensures that all dishes are prepared according to strict quality standards and safety regulations. Each recipe is balanced to bring out the authentic taste while retaining nutritional values.' : 'Bếp của chúng tôi luôn đảm bảo các món ăn được chế biến theo quy chuẩn vệ sinh và chất lượng khắt khe nhất. Từng công thức đều được cân bằng hương vị hoàn hảo và giữ trọn dưỡng chất.'}</p>
        
        <div class="pt-2">
          <h4 class="font-bold text-[#333333] dark:text-white text-base mb-3">${t('shopDetails.keyBenefits')}</h4>
          <ul class="list-disc list-inside space-y-2 text-sm text-[#4F4F4F] dark:text-gray-400">
            <li>${lang === 'en' ? '100% fresh and certified organic ingredients.' : '100% nguyên liệu tươi sạch và có nguồn gốc rõ ràng.'}</li>
            <li>${lang === 'en' ? 'Crafted by award-winning professional chefs.' : 'Chế biến trực tiếp bởi các đầu bếp chuyên nghiệp.'}</li>
            <li>${lang === 'en' ? 'Fast packaging and express doorstep delivery.' : 'Đóng gói cẩn thận, giao hàng nhanh chóng tận nơi.'}</li>
            <li>${lang === 'en' ? 'Guaranteed food safety and hygiene.' : 'Đảm bảo tiêu chuẩn vệ sinh an toàn thực phẩm.'}</li>
          </ul>
        </div>
      </div>

      <div id="tab-rev-content" class="hidden pt-8 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        <p class="text-base text-[#333333] dark:text-white font-semibold mb-2">${lang === 'en' ? 'Customer Reviews' : 'Đánh giá từ khách hàng'}</p>
        <p>${lang === 'en' ? 'Average Rating:' : 'Điểm trung bình:'} <strong class="text-[#FF9F0D] font-bold">5.0 / 5 </strong> (${lang === 'en' ? 'Based on 22 real reviews' : 'Dựa trên 22 lượt đánh giá thực tế'})</p>
      </div>
    </div>
  `

  const descBtn = document.getElementById('tab-desc-btn')
  const revBtn = document.getElementById('tab-rev-btn')
  const descContent = document.getElementById('tab-desc-content')
  const revContent = document.getElementById('tab-rev-content')

  descBtn?.addEventListener('click', () => {
    descBtn.className = 'bg-[#FF9F0D] text-white text-sm font-normal px-7 py-2.5 rounded-t-[2px] transition focus:outline-none cursor-pointer'
    revBtn.className = 'text-sm font-normal px-7 py-2.5 text-[#333333] dark:text-gray-400 hover:text-[#FF9F0D] transition focus:outline-none cursor-pointer'
    descContent.classList.remove('hidden')
    revContent.classList.add('hidden')
  })

  revBtn?.addEventListener('click', () => {
    revBtn.className = 'bg-[#FF9F0D] text-white text-sm font-normal px-7 py-2.5 rounded-t-[2px] transition focus:outline-none cursor-pointer'
    descBtn.className = 'text-sm font-normal px-7 py-2.5 text-[#333333] dark:text-gray-400 hover:text-[#FF9F0D] transition focus:outline-none cursor-pointer'
    revContent.classList.remove('hidden')
    descContent.classList.add('hidden')
  })
}

function renderSimilarSection() {
  const container = document.getElementById('similar-products-container')
  if (!container) return

  const lang = getLang()
  const visibleItems = similarItems.slice(similarOffset, similarOffset + 4)

  container.innerHTML = `
    <div class="space-y-8 pt-8">
      <div class="flex justify-between items-center">
        <h3 class="text-2xl sm:text-3xl font-bold text-[#333333] dark:text-white font-heading">${t('common.similarProducts')}</h3>
        <div class="flex items-center gap-2">
          <button id="btn-similar-prev" class="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-[#FF9F0D] hover:text-white transition shadow-sm cursor-pointer" aria-label="${t('common.prev')}">&larr;</button>
          <button id="btn-similar-next" class="w-10 h-10 rounded-full bg-[#FF9F0D] text-white flex items-center justify-center hover:bg-amber-600 transition shadow-sm cursor-pointer" aria-label="${t('common.next')}">&rarr;</button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        ${visibleItems.map(item => {
          const itemName = lang === 'vi' ? (item.name_vi || item.name) : item.name
          return `
            <div class="group cursor-pointer flex flex-col" onclick="window.location.href='/src/pages/shop-details.html?id=${item.id}'">
              <div class="relative bg-gray-100 aspect-square overflow-hidden rounded-[2px]">
                <img loading="lazy" 
                  src="${item.image}" 
                  alt="${itemName}" 
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  onerror="this.src='https://placehold.co/300x300?text=Food'"
                />
                
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" class="w-8 h-8 bg-white rounded flex items-center justify-center text-[#333333] hover:bg-[#FF9F0D] hover:text-white transition" title="${t('common.compare')}">
                    <span class="w-3.5 h-3.5 bg-current inline-block" style="mask: url('/assets/images/ProjectStatus.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/ProjectStatus.svg') no-repeat center / contain;"></span>
                  </button>
                  <button type="button" class="w-8 h-8 bg-[#FF9F0D] rounded flex items-center justify-center text-white hover:bg-amber-600 transition" title="${t('common.addToCart')}">
                    <span class="w-3.5 h-3.5 bg-current inline-block" style="mask: url('/assets/images/Tote.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/Tote.svg') no-repeat center / contain;"></span>
                  </button>
                  <button type="button" class="w-8 h-8 bg-white rounded flex items-center justify-center text-[#333333] hover:bg-[#FF9F0D] hover:text-white transition" title="${t('common.addToWishlist')}">
                    <span class="w-3.5 h-3.5 bg-current inline-block" style="mask: url('/assets/images/Heart.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/Heart.svg') no-repeat center / contain;"></span>
                  </button>
                </div>
              </div>
              
              <h4 class="mt-3 font-bold text-base text-[#333333] dark:text-white group-hover:text-[#FF9F0D] transition line-clamp-1">${itemName}</h4>
              <div class="mt-1 text-sm flex items-center">
                <span class="text-[#FF9F0D] font-semibold">${formatPrice(item.price)}</span>
                ${item.oldPrice ? `<span class="text-gray-400 line-through ml-2 text-xs font-normal">${formatPrice(item.oldPrice)}</span>` : ''}
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>
  `

  document.getElementById('btn-similar-prev')?.addEventListener('click', () => {
    if (similarOffset > 0) {
      similarOffset = Math.max(0, similarOffset - 4)
      renderSimilarSection()
    }
  })

  document.getElementById('btn-similar-next')?.addEventListener('click', () => {
    if (similarOffset + 4 < similarItems.length) {
      similarOffset += 4
      renderSimilarSection()
    }
  })
}

function setupQuantityControls() {
  const btnMinus = document.getElementById('btn-minus')
  const btnPlus = document.getElementById('btn-plus')
  const inputQty = document.getElementById('input-qty')

  btnMinus?.addEventListener('click', () => {
    let val = parseInt(inputQty.textContent) || 1
    if (val > 1) inputQty.textContent = val - 1
  })

  btnPlus?.addEventListener('click', () => {
    let val = parseInt(inputQty.textContent) || 1
    inputQty.textContent = val + 1
  })
}

function setupCartAndWishlist(product, productName) {
  document.getElementById('btn-add-to-cart')?.addEventListener('click', () => {
    const qty = parseInt(document.getElementById('input-qty')?.textContent) || 1
    addToCart({ ...product, quantity: qty })
    showSuccessToast(t('toast.addedToCart', { qty, name: productName }))
  })

  const wishlistBtn = document.getElementById('btn-wishlist')
  wishlistBtn?.addEventListener('click', () => {
    const nowWishlisted = toggleWishlist(product.id)
    const label = document.getElementById('wishlist-label')

    wishlistBtn.classList.toggle('text-[#FF9F0D]', nowWishlisted)
    if (label) label.textContent = nowWishlisted ? t('common.wishlisted') : t('common.addToWishlist')
    showSuccessToast(nowWishlisted ? t('toast.addedToWishlist', { name: productName }) : t('toast.removedFromWishlist', { name: productName }))
  })
}

document.addEventListener('DOMContentLoaded', initShopDetails)