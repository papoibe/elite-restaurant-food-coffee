/* ============================================================
   wishlist.js — Danh sách Yêu thích (localStorage)
   Dùng chung cho shop-list.js (icon tim trên thẻ sản phẩm) và
   shop-details.js (nút "Add to Wishlist")
   ============================================================ */

const WISHLIST_KEY = 'elite-wishlist'

/**
 * getWishlist — Lấy danh sách id sản phẩm đã yêu thích
 * @returns {string[]}
 */
export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []
  } catch {
    return []
  }
}

function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
}

/**
 * isWishlisted — Kiểm tra 1 sản phẩm đã có trong wishlist chưa
 */
export function isWishlisted(productId) {
  return getWishlist().includes(String(productId))
}

/**
 * toggleWishlist — Thêm/bỏ 1 sản phẩm khỏi wishlist
 * @returns {boolean} true nếu sau khi toggle là ĐÃ yêu thích
 */
export function toggleWishlist(productId) {
  const id = String(productId)
  const list = getWishlist()
  const index = list.indexOf(id)

  if (index > -1) {
    list.splice(index, 1)
    saveWishlist(list)
    return false
  }

  list.push(id)
  saveWishlist(list)
  return true
}
