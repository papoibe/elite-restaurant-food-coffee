// Dữ liệu mẫu (Database)
const mockProducts = [
  { id: 1, name: "Fresh Lime Drink", price: 38.00, oldPrice: 45.00, category: "Drink", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800", desc: "Fresh refreshing lime drink made with organic limes and mint leaves." },
  { id: 2, name: "Chocolate Muffin", price: 28.00, oldPrice: null, category: "Dessert", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800", desc: "Delicious rich chocolate muffin baked fresh daily." },
  { id: 3, name: "Classic Burger", price: 21.00, oldPrice: 30.00, category: "Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800", desc: "Juicy beef patty served with fresh lettuce, tomato, and special sauce." },
  { id: 4, name: "Country Burger", price: 45.00, oldPrice: null, category: "Burger", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800", desc: "Double patty country-style burger with crispy bacon and melted cheese." },
  { id: 5, name: "Cheese Pizza", price: 43.00, oldPrice: null, category: "Pizza", image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=800", desc: "Classic Italian cheese pizza with mozzarella and freshly picked basil." },
  { id: 6, name: "Chicken Chup", price: 12.00, oldPrice: 18.00, category: "Chicken", image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=800", desc: "Crispy fried chicken chops served with tangy dipping sauces." }
];

// Trích xuất id từ đường dẫn URL (?id=...)
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get('id')) || 1;
}

// Hàm khởi tạo trang chi tiết
async function initShopDetails() {
  const productId = getProductIdFromUrl();
  const container = document.getElementById('product-detail-container');

  if (!container) return;

  // Lấy dữ liệu sản phẩm tương ứng ID
  const product = mockProducts.find(p => p.id === productId);

  if (!product) {
    container.innerHTML = `
      <div class="text-center py-20">
        <p class="text-red-500 font-bold mb-4">Product not found!</p>
        <a href="/src/pages/shop-list.html" class="text-xs bg-primary text-white px-4 py-2 rounded shadow hover:bg-amber-600 transition">Back to Shop</a>
      </div>
    `;
    return;
  }

  // Render chi tiết
  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
      <div class="lg:col-span-6">
        <img src="${product.image}" alt="${product.name}" class="w-full h-[400px] object-cover rounded-xl shadow-md mb-4">
        <div class="flex gap-4">
          <img src="${product.image}" class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 border-primary">
        </div>
      </div>

      <div class="lg:col-span-6 space-y-4">
        <span class="bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs">In stock</span>
        <h2 class="text-3xl font-bold text-gray-900">${product.name}</h2>
        <p class="text-sm text-gray-500 leading-relaxed">${product.desc}</p>
        
        <div class="text-3xl font-bold text-primary">
          $${product.price.toFixed(2)}
          ${product.oldPrice ? `<span class="text-gray-400 line-through text-sm font-normal ml-2">$${product.oldPrice.toFixed(2)}</span>` : ''}
        </div>

        <div class="flex items-center gap-4 pt-4">
          <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden h-11">
            <button id="btn-minus" class="px-4 text-gray-600 hover:bg-gray-100 font-bold">-</button>
            <input id="input-qty" type="text" value="1" readonly class="w-12 text-center text-sm font-bold text-gray-800 focus:outline-none">
            <button id="btn-plus" class="px-4 text-gray-600 hover:bg-gray-100 font-bold">+</button>
          </div>
          <button id="btn-add-to-cart" class="bg-primary text-white font-semibold px-8 h-11 rounded-lg hover:bg-amber-600 transition shadow-md shadow-amber-500/20 flex items-center gap-2 text-sm">
            <i class="fa-solid fa-bag-shopping"></i> Add to Cart
          </button>
        </div>

        <div class="pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
          <div><span class="font-semibold text-gray-800">Category:</span> ${product.category}</div>
          <div><span class="font-semibold text-gray-800">Tag:</span> Foodtuck Special</div>
        </div>
      </div>
    </div>
  `;

  setupQuantityControls();
  
  // Gán sự kiện click Add To Cart
  document.getElementById('btn-add-to-cart')?.addEventListener('click', () => {
    const qty = document.getElementById('input-qty')?.value || 1;
    alert(`Thêm thành công ${qty} sản phẩm (ID: ${product.id}) vào giỏ hàng!`);
  });
}

// Xử lý nút tăng giảm số lượng
function setupQuantityControls() {
  const btnMinus = document.getElementById('btn-minus');
  const btnPlus = document.getElementById('btn-plus');
  const inputQty = document.getElementById('input-qty');

  if (btnMinus && btnPlus && inputQty) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(inputQty.value) || 1;
      if (val > 1) inputQty.value = val - 1;
    });

    btnPlus.addEventListener('click', () => {
      let val = parseInt(inputQty.value) || 1;
      inputQty.value = val + 1;
    });
  }
}

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', initShopDetails);