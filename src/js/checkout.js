import { validateForm, showSuccessToast } from './validate.js';
import { t } from './i18n.js'; // Chuyển ngôn ngữ VN/EN
import { isLoggedIn } from './auth.js';

/**
 * requireLoginForCheckout — Chặn thanh toán nếu chưa đăng nhập.
 * Đề 01 không bắt cart/thêm giỏ phải đăng nhập (khách vãng lai vẫn thêm
 * giỏ được như thương mại điện tử thật) — nhưng theo yêu cầu, riêng bước
 * XÁC NHẬN THANH TOÁN (checkout) thì bắt buộc phải đăng nhập.
 * @returns {boolean} true nếu đã đăng nhập (được phép thanh toán tiếp)
 */
function requireLoginForCheckout() {
  const loginPanel = document.getElementById('checkout-login-required');
  const content = document.getElementById('checkout-content');
  if (!loginPanel || !content) return true // trang không có khối này thì bỏ qua, tránh vỡ nếu HTML khác

  if (isLoggedIn()) {
    loginPanel.classList.add('hidden')
    content.classList.remove('hidden')
    return true
  }

  // Chưa đăng nhập — ẩn form thanh toán, hiện khối yêu cầu đăng nhập,
  // gắn ?redirect=... để sau khi đăng nhập/đăng ký xong quay lại đúng trang checkout
  loginPanel.classList.remove('hidden')
  content.classList.add('hidden')
  const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
  const signinLink = document.getElementById('checkout-signin-link')
  const signupLink = document.getElementById('checkout-signup-link')
  if (signinLink) signinLink.href = `/src/pages/signin.html?redirect=${returnUrl}`
  if (signupLink) signupLink.href = `/src/pages/signup.html?redirect=${returnUrl}`
  return false
}

export function renderCheckoutSummary() {
  const cartListContainer = document.querySelector('#checkout-cart-list');
  const subtotalEl = document.querySelector('#summary-subtotal');
  const taxEl = document.querySelector('#summary-tax');
  const totalEl = document.querySelector('#summary-total');

  if (!cartListContainer) return;

  const cart = JSON.parse(localStorage.getItem('elite-cart')) || [];

  if (cart.length === 0) {
    cartListContainer.innerHTML = `
      <div class="py-6 text-center text-text-muted text-xs">
        <p>${t('toast.emptyCart')}</p>
        <a href="shop-list.html" class="text-primary underline mt-2 inline-block">${t('checkout.backToShopping')}</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (taxEl) taxEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  cartListContainer.innerHTML = cart.map(item => `
    <div class="flex items-center gap-3 pt-3">
      <img src="${item.image}" class="w-14 h-14 object-cover rounded shrink-0" alt="${item.name}" />
      <div class="flex-1 text-xs">
        <h4 class="font-bold text-gray-800 dark:text-gray-200">${item.name}</h4>
        <p class="text-text-muted mt-0.5">${item.category || t('checkout.dish')} x ${item.quantity || 1}</p>
        <p class="text-primary font-medium mt-0.5">$${(item.price * (item.quantity || 1)).toFixed(2)}</p>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

export function initCheckoutEvents() {
  const form = document.querySelector('#checkout-form');
  const btnPlaceOrder = document.querySelector('#btn-place-order');

  function handleCheckout(e) {
    if (e) e.preventDefault();

    // Chặn lần nữa ngay tại thời điểm bấm đặt hàng (phòng trường hợp session hết hạn
    // giữa lúc đang điền form) — không chỉ dựa vào việc ẩn/hiện UI lúc tải trang.
    if (!isLoggedIn()) {
      requireLoginForCheckout()
      return
    }

    if (validateForm(form)) {
      showSuccessToast(t('toast.orderSuccess'));
      localStorage.removeItem('elite-cart');
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart: [] } }));
      
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1500);
    }
  }

  form?.addEventListener('submit', handleCheckout);

  btnPlaceOrder?.addEventListener('click', () => {
    if (form && typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else if (form) {
      handleCheckout();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  requireLoginForCheckout(); // Kiểm tra đăng nhập TRƯỚC — ẩn/hiện đúng khối ngay khi tải trang
  renderCheckoutSummary();
  initCheckoutEvents();
});