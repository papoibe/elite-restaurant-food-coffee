/* ============================================================
   cart.js — Logic Giỏ hàng (Shopping Cart)
   CRUD giỏ hàng bằng localStorage
   ============================================================ */

const CART_KEY = 'elite-cart'  // Key lưu trong localStorage

/**
 * getCart — Lấy giỏ hàng từ localStorage
 * @returns {Array} Danh sách sản phẩm trong giỏ
 */
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

/**
 * saveCart — Lưu giỏ hàng vào localStorage
 * @param {Array} cart - Danh sách sản phẩm
 */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  // Dispatch custom event để các component khác lắng nghe cập nhật
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }))
}

/**
 * addToCart — Thêm sản phẩm vào giỏ
 * Nếu sản phẩm đã có, tăng số lượng
 * @param {Object} product - { id, name, price, image, quantity }
 */
export function addToCart(product) {
  const cart = getCart()
  const existingIndex = cart.findIndex(item => item.id === product.id)

  if (existingIndex > -1) {
    // Sản phẩm đã có → tăng số lượng
    cart[existingIndex].quantity += (product.quantity || 1)
  } else {
    // Sản phẩm mới → thêm vào giỏ
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.quantity || 1
    })
  }

  saveCart(cart)
}

/**
 * removeFromCart — Xóa sản phẩm khỏi giỏ theo ID
 * @param {string|number} productId
 */
export function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId)
  saveCart(cart)
}

/**
 * updateQuantity — Cập nhật số lượng sản phẩm
 * @param {string|number} productId
 * @param {number} quantity - Số lượng mới (nếu ≤ 0 thì xóa)
 */
export function updateQuantity(productId, quantity) {
  const cart = getCart()
  const item = cart.find(item => item.id === productId)

  if (item) {
    if (quantity <= 0) {
      // Số lượng ≤ 0 → xóa khỏi giỏ
      removeFromCart(productId)
      return
    }
    item.quantity = quantity
    saveCart(cart)
  }
}

/**
 * getCartTotal — Tính tổng tiền giỏ hàng
 * @returns {number} Tổng tiền
 */
export function getCartTotal() {
  return getCart().reduce((total, item) => total + (item.price * item.quantity), 0)
}

/**
 * getCartCount — Đếm tổng số sản phẩm trong giỏ
 * @returns {number} Tổng số lượng
 */
export function getCartCount() {
  return getCart().reduce((count, item) => count + item.quantity, 0)
}

/**
 * clearCart — Xóa toàn bộ giỏ hàng
 */
export function clearCart() {
  saveCart([])
}

/**
 * updateCartBadge — Cập nhật số hiển thị trên icon giỏ hàng (header)
 * Tìm phần tử #cart-count và cập nhật text
 */
export function updateCartBadge() {
  const badge = document.getElementById('cart-count')
  if (badge) {
    const count = getCartCount()
    badge.textContent = count
    badge.style.display = count > 0 ? 'flex' : 'none'
  }
}
