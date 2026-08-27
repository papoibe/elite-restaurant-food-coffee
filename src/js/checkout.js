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
      <div class="py-6 text-center">
        <p class="text-[16px] leading-[24px] text-[#4F4F4F]">${t('toast.emptyCart')}</p>
        <a href="/src/pages/shop-list.html" class="mt-2 inline-block text-[16px] leading-[24px] text-[#FF9F0D] underline">${t('checkout.backToShopping')}</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (taxEl) taxEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  // Figma "Chiken" INSTANCE 376x104: anh 83x88, chu cach anh 15px,
  // ten Helvetica Bold 16/24 #333333, dong phu va gia deu 14/22 #4F4F4F.
  // Cac mon cach nhau 16px va co ke ngan 1px #E0E0E0 (tru mon cuoi).
  cartListContainer.innerHTML = cart.map((item, index) => `
    <div class="flex gap-[15px] pb-4 border-b border-[#E0E0E0] dark:border-white/15 ${index < cart.length - 1 ? 'mb-4' : ''}">
      <img src="${item.image}" alt="${item.name}" loading="lazy"
           class="w-[83px] h-[88px] shrink-0 object-cover bg-[#C4C4C4]" />
      <div class="min-w-0">
        <h4 class="font-bold text-[16px] leading-[24px] text-[#333333] dark:text-white truncate">${item.name}</h4>
        <p class="mt-2 text-[14px] leading-[22px] text-[#4F4F4F] dark:text-white/70">${t('checkout.qty')} ${item.quantity || 1}</p>
        <p class="mt-1 text-[14px] leading-[22px] text-[#4F4F4F] dark:text-white/70">$${(item.price * (item.quantity || 1)).toFixed(2)}</p>
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