/* ============================================================
   shop-details.js — Logic trang chi tiết sản phẩm
   Đọc dữ liệu từ menu.json, kết nối cart.js module chung
   ============================================================ */
import { addToCart } from '/src/js/cart.js' // Import hàm thêm giỏ hàng
import { showSuccessToast } from '/src/js/validate.js' // Toast thông báo

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
    const product = menuData.find(p => String(p.id) === String(productId))

    if (!product) {
      container.innerHTML = `
        <div class="text-center py-20">
          <p class="text-red-500 font-bold mb-4">Product not found!</p>
          <a href="/src/pages/shop-list.html" class="text-xs bg-primary text-white px-4 py-2 rounded shadow hover:bg-amber-600 transition">Back to Shop</a>
        </div>`
      return
    }

    // Render chi tiết sản phẩm theo layout Figma
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        <!-- Ảnh sản phẩm lớn + thumbnail -->
        <div class="lg:col-span-6">
          <img src="${product.image}" alt="${product.name}" class="w-full h-[400px] object-cover rounded-xl shadow-md mb-4">
          <div class="flex gap-4">
            <img src="${product.image}" class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 border-primary">
          </div>
        </div>

        <!-- Thông tin sản phẩm -->
        <div class="lg:col-span-6 space-y-4">
          <span class="bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs">In stock</span>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">${product.name}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">${product.description}</p>
          
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
          <div class="flex items-center gap-4 pt-4">
            <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden h-11">
              <button id="btn-minus" class="px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold cursor-pointer">-</button>
              <input id="input-qty" type="text" value="1" readonly class="w-12 text-center text-sm font-bold text-gray-800 dark:text-white bg-transparent focus:outline-none">
              <button id="btn-plus" class="px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold cursor-pointer">+</button>
            </div>
            <button id="btn-add-to-cart" class="bg-primary text-white font-semibold px-8 h-11 rounded-lg hover:bg-amber-600 transition shadow-md shadow-amber-500/20 flex items-center gap-2 text-sm cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
              Add to Cart
            </button>
          </div>

          <!-- Metadata -->
          <div class="pt-6 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 space-y-2">
            <div><span class="font-semibold text-gray-800 dark:text-gray-300">Category:</span> ${product.category}</div>
            <div><span class="font-semibold text-gray-800 dark:text-gray-300">Tag:</span> Foodtuck Special</div>
          </div>
        </div>
      </div>`

    setupQuantityControls()
    
    // Gắn sự kiện Add To Cart — dùng cart.js module chung
    document.getElementById('btn-add-to-cart')?.addEventListener('click', () => {
      const qty = parseInt(document.getElementById('input-qty')?.value) || 1
      addToCart({ ...product, quantity: qty }) // Truyền sản phẩm + số lượng
      showSuccessToast(`Đã thêm ${qty}x "${product.name}" vào giỏ hàng!`)
    })

    // Render thêm sản phẩm liên quan (cùng category)
    renderRelatedProducts(menuData, product)
  } catch (error) {
    console.error('Lỗi khi tải chi tiết sản phẩm:', error)
  }
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
      let val = parseInt(inputQty.value) || 1
      if (val > 1) inputQty.value = val - 1
    })
    btnPlus.addEventListener('click', () => {
      let val = parseInt(inputQty.value) || 1
      inputQty.value = val + 1
    })
  }
}

document.addEventListener('DOMContentLoaded', initShopDetails)