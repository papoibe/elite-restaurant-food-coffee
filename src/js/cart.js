/* ============================================================
   cart.js — Logic Giỏ hàng (Shopping Cart)
   ============================================================ */
import { t } from '/src/js/i18n.js' // Chuyển ngôn ngữ VN/EN

const CART_KEY = 'elite-cart'

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }))
}

export function addToCart(product) {
  const cart = getCart()
  const existingIndex = cart.findIndex(item => String(item.id) === String(product.id))

  if (existingIndex > -1) {
    cart[existingIndex].quantity += (product.quantity || 1)
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating || 4,
      quantity: product.quantity || 1
    })
  }
  saveCart(cart)
}

export function removeFromCart(productId) {
  const cart = getCart().filter(item => String(item.id) !== String(productId))
  saveCart(cart)
}

export function updateQuantity(productId, quantity) {
  const cart = getCart()
  const item = cart.find(item => String(item.id) === String(productId))

  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    item.quantity = quantity
    saveCart(cart)
  }
}

export function getCartTotal() {
  return getCart().reduce((total, item) => total + (item.price * item.quantity), 0)
}

/**
 * updateCartBadge — Cập nhật số lượng hiển thị trên icon giỏ hàng ở header
 * Áp dụng cho mọi phần tử #cart-count có mặt trên trang (an toàn nếu không có)
 */
export function updateCartBadge() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0)
  document.querySelectorAll('#cart-count').forEach((el) => {
    el.textContent = String(count)
    el.classList.toggle('hidden', count === 0)
  })
}

let discountRate = 0

function renderStars(rating = 4) {
  let starsHtml = ''
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="${i <= rating ? 'text-[#FF9F0D]' : 'text-gray-300'} text-xs">★</span>`
  }
  return `<div class="flex gap-0.5 mt-1">${starsHtml}</div>`
}

function renderCartPage() {
  const cartTableBody = document.getElementById('cart-table-body')
  if (!cartTableBody) return

  const cart = getCart()
  cartTableBody.innerHTML = ''

  if (cart.length === 0) {
    cartTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-12 text-center text-gray-500 font-medium">${t('cart.empty')}</td>
      </tr>`
    calculateTotal(0)
    return
  }

  cart.forEach((item) => {
    const row = document.createElement('tr')
    row.className = 'border-b border-gray-200 dark:border-gray-800'
    row.innerHTML = `
      <td class="py-5 flex items-center gap-4">
        <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg" />
        <div>
          <h4 class="font-bold text-gray-900 dark:text-white">${item.name}</h4>
          ${renderStars(item.rating)}
        </div>
      </td>
      <td class="py-5 font-medium text-gray-700 dark:text-gray-300">$${Number(item.price).toFixed(2)}</td>
      <td class="py-5">
        <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-full w-fit px-3 py-1 gap-3">
          <button class="btn-minus text-gray-400 hover:text-[#FF9F0D] px-1 cursor-pointer" data-id="${item.id}">-</button>
          <span class="font-semibold text-sm w-4 text-center">${item.quantity}</span>
          <button class="btn-plus text-gray-400 hover:text-[#FF9F0D] px-1 cursor-pointer" data-id="${item.id}">+</button>
        </div>
      </td>
      <td class="py-5 font-bold text-gray-900 dark:text-white">$${(item.price * item.quantity).toFixed(2)}</td>
      <td class="py-5 text-center">
        <button class="btn-remove text-gray-400 hover:text-red-500 text-lg cursor-pointer" data-id="${item.id}">✕</button>
      </td>
    `
    cartTableBody.appendChild(row)
  })

  calculateTotal(getCartTotal())
  attachCartEvents(cart)
}

function calculateTotal(subtotal) {
  const discount = subtotal * discountRate
  const shipping = subtotal > 0 ? 0.0 : 0.0
  const total = subtotal - discount + shipping

  const subtotalEl = document.getElementById('cart-subtotal')
  const discountEl = document.getElementById('cart-discount')
  const discountRow = document.getElementById('cart-discount-row')
  const shippingEl = document.getElementById('cart-shipping')
  const totalEl = document.getElementById('cart-total')

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`
  if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`
  if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`

  // Bang Total Bill trong Figma chi co 2 dong: Cart Subtotal + Shipping Charge.
  // Hang Discount la phan mo rong cua nhom (ma SAVORIA10) nen chi hien khi
  // thuc su ap duoc ma — giu trang thai mac dinh khop 100% ban thiet ke.
  if (discountRow) {
    const hasDiscount = discount > 0
    discountRow.classList.toggle('hidden', !hasDiscount)
    discountRow.classList.toggle('flex', hasDiscount)
  }
}

function attachCartEvents(cart) {
  document.querySelectorAll('.btn-plus').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id
      const item = cart.find((i) => String(i.id) === String(id))
      if (item) updateQuantity(item.id, item.quantity + 1)
    })
  })

  document.querySelectorAll('.btn-minus').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id
      const item = cart.find((i) => String(i.id) === String(id))
      if (item) updateQuantity(item.id, item.quantity - 1)
    })
  })

  document.querySelectorAll('.btn-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id
      removeFromCart(id)
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage()
  updateCartBadge()

  const applyBtn = document.getElementById('apply-coupon-btn')
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const input = document.getElementById('coupon-input')
      const msg = document.getElementById('coupon-message')
      if (input && input.value.trim().toUpperCase() === 'SAVORIA10') {
        discountRate = 0.1
        if (msg) {
          msg.textContent = t('cart.couponSuccess')
          msg.className = 'text-sm mt-2 text-green-500 block'
        }
      } else if (msg) {
        discountRate = 0
        msg.textContent = t('cart.couponInvalid')
        msg.className = 'text-sm mt-2 text-red-500 block'
      }
      renderCartPage()
    })
  }
})

window.addEventListener('cart-updated', () => {
  renderCartPage()
  updateCartBadge()
})