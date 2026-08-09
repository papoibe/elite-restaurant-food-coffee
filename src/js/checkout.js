import { validateForm, showSuccessToast } from './validate.js';

export function renderCheckoutSummary() {
  const cartListContainer = document.querySelector('#checkout-cart-list');
  const subtotalEl = document.querySelector('#summary-subtotal');
  const taxEl = document.querySelector('#summary-tax');
  const totalEl = document.querySelector('#summary-total');

  if (!cartListContainer) return;

  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    cartListContainer.innerHTML = `
      <div class="py-6 text-center text-text-muted text-xs">
        <p>Giỏ hàng chưa có sản phẩm nào.</p>
        <a href="shop-list.html" class="text-primary underline mt-2 inline-block">Quay lại mua sắm</a>
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
        <p class="text-text-muted mt-0.5">${item.category || 'Mon an'} x ${item.quantity || 1}</p>
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
    
    if (validateForm(form)) {
      showSuccessToast('Đặt hàng thành công!');
      localStorage.removeItem('cart');
      
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
  renderCheckoutSummary();
  initCheckoutEvents();
});