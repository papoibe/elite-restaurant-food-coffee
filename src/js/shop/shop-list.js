const mockProducts = [
  { id: 1, name: "Fresh Lime", price: 38.00, oldPrice: 45.00, category: "Drink", image: "/assets/images/fresh_lime.jpg", tag: null },
  { id: 2, name: "Chocolate Muffin", price: 28.00, oldPrice: null, category: "Dessert", image: "/assets/images/chocolate_muffin.jpg", tag: "Sell" },
  { id: 3, name: "Burger", price: 23.00, oldPrice: 45.00, category: "Burger", image: "/assets/images/burger.jpg", tag: null },
  { id: 4, name: "Country Burger", price: 45.00, oldPrice: null, category: "Burger", image: "/assets/images/country_burger.jpg", tag: null },
  { id: 5, name: "Drink", price: 23.00, oldPrice: 45.00, category: "Drink", image: "/assets/images/drink.jpg", tag: null },
  { id: 6, name: "Pizza", price: 43.00, oldPrice: null, category: "Pizza", image: "/assets/images/pizza.jpg", tag: null },
  { id: 7, name: "Cheese Butter", price: 10.00, oldPrice: null, category: "Dessert", image: "/assets/images/cheese_butter.jpg", tag: null },
  { id: 8, name: "Sandwiches", price: 25.00, oldPrice: null, category: "Fast Food", image: "/assets/images/sandwiches.jpg", tag: null },
  { id: 9, name: "Chicken Chup", price: 12.00, oldPrice: 18.00, category: "Chicken", image: "/assets/images/chicken_chup.jpg", tag: "Sell" }
];

let productsData = [];

async function initShopList() {
  try {
    productsData = mockProducts;
    renderCategories(productsData);
    renderProducts(productsData);
    setupEventListeners();
  } catch (error) {
    console.error("Lỗi khi tải danh sách sản phẩm:", error);
  }
}

function renderProducts(items) {
  const grid = document.getElementById('product-grid');
  const countText = document.getElementById('product-count');

  if (!grid) return;

  if (countText) {
    countText.innerText = `Showing ${items.length} results`;
  }

  if (items.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">No products found matching your search.</div>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="group cursor-pointer">
      <div class="relative bg-gray-200 aspect-square overflow-hidden rounded">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onerror="this.style.opacity='0'; this.parentElement.classList.add('bg-gray-300');"
        />
        ${item.tag ? `<span class="absolute top-4 left-4 bg-primary text-white text-xs px-3 py-0.5 rounded">${item.tag}</span>` : ''}
        
        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <a href="/src/pages/shop-details.html?id=${item.id}" class="w-9 h-9 bg-white text-gray-800 rounded flex items-center justify-center hover:bg-primary hover:text-white transition">
            <i class="fa-solid fa-link text-xs"></i>
          </a>
          <button data-id="${item.id}" class="btn-add-cart w-9 h-9 bg-primary text-white rounded flex items-center justify-center hover:bg-amber-600 transition">
            <i class="fa-solid fa-bag-shopping text-xs"></i>
          </button>
          <button data-id="${item.id}" class="btn-wishlist w-9 h-9 bg-white text-gray-800 rounded flex items-center justify-center hover:bg-primary hover:text-white transition">
            <i class="fa-regular fa-heart text-xs"></i>
          </button>
        </div>
      </div>

      <h3 class="mt-2 font-bold text-base text-gray-800 dark:text-white group-hover:text-primary transition-colors">
        <a href="/src/pages/shop-details.html?id=${item.id}">${item.name}</a>
      </h3>
      
      <div class="mt-1 text-base">
        <span class="text-primary font-semibold">$${item.price.toFixed(2)}</span>
        ${item.oldPrice ? `<span class="text-gray-400 line-through text-xs ml-2">$${item.oldPrice.toFixed(2)}</span>` : ''}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.getAttribute('data-id');
      addToCart(productId);
    });
  });

  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.getAttribute('data-id');
      addToWishlist(productId);
    });
  });
}

function renderCategories(items) {
  const categoryContainer = document.getElementById('category-list');
  if (!categoryContainer) return;

  const categories = ['All', ...new Set(items.map(i => i.category))];

  categoryContainer.innerHTML = categories.map((cat, idx) => `
    <label class="flex items-center gap-2 cursor-pointer hover:text-primary transition">
      <input type="radio" name="category" value="${cat}" ${idx === 0 ? 'checked' : ''} class="category-radio accent-primary"> ${cat}
    </label>
  `).join('');

  document.querySelectorAll('.category-radio').forEach(radio => {
    radio.addEventListener('change', filterProducts);
  });
}

function filterProducts() {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const priceRange = document.getElementById('price-range');

  const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
  const selectedCat = document.querySelector('input[name="category"]:checked')?.value || 'All';
  const maxPrice = priceRange ? parseFloat(priceRange.value) : Infinity;
  const sortVal = sortSelect ? sortSelect.value : 'default';

  let filtered = productsData.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchVal);
    const matchCategory = selectedCat === 'All' || p.category === selectedCat;
    const matchPrice = p.price <= maxPrice;
    return matchSearch && matchCategory && matchPrice;
  });

  if (sortVal === 'low-high') filtered.sort((a, b) => a.price - b.price);
  if (sortVal === 'high-low') filtered.sort((a, b) => b.price - a.price);

  renderProducts(filtered);
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const sortSelect = document.getElementById('sort-select');
  const priceRange = document.getElementById('price-range');

  if (searchInput) searchInput.addEventListener('input', filterProducts);
  if (searchBtn) searchBtn.addEventListener('click', filterProducts);
  if (sortSelect) sortSelect.addEventListener('change', filterProducts);
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      const priceDisplay = document.getElementById('price-value');
      if (priceDisplay) priceDisplay.innerText = e.target.value;
      filterProducts();
    });
  }
}

function addToCart(id) {
  alert(`Đã thêm sản phẩm ID ${id} vào giỏ hàng!`);
}

function addToWishlist(id) {
  alert(`Đã thêm sản phẩm ID ${id} vào danh sách yêu thích!`);
}

document.addEventListener('DOMContentLoaded', initShopList);