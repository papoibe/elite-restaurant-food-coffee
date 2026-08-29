import { initCounters } from './dom.js';
import { formatPrice } from './format.js';
import { getLang } from './i18n.js';

let menuData = [];

function renderCategoryList(containerId, imageId, items) {
  const container = document.getElementById(containerId);
  const imgElement = document.getElementById(imageId);
  if (!container || !items || !items.length) return;

  const lang = typeof getLang === 'function' ? getLang() : 'vi';
  // Chon 4 mon dau co ANH KHAC NHAU. Neu lay thang 4 mon dau thi nhom
  // Trang mieng va Do uong deu tra ve cung mot anh, re chuot se khong thay doi.
  const seen = new Set();
  const displayItems = [];
  for (const it of items) {
    if (seen.has(it.image)) continue;
    seen.add(it.image);
    displayItems.push(it);
    if (displayItems.length === 4) break;
  }
  // Du phong: nhom nao khong du 4 anh rieng thi bu them cho du 4 dong
  for (const it of items) {
    if (displayItems.length === 4) break;
    if (!displayItems.includes(it)) displayItems.push(it);
  }

  if (imgElement && displayItems[0]) {
    imgElement.src = displayItems[0].image;
  }

  container.innerHTML = displayItems.map(item => {
    const name = lang === 'vi' ? (item.name_vi || item.name) : item.name;
    const desc = lang === 'vi' ? (item.description || item.description_en) : (item.description_en || item.description);

    return `
      <a href="/src/pages/shop-details.html?id=${item.id}" class="block border-b border-gray-200/80 dark:border-white/10 pb-4 cursor-pointer group hover:border-[#FF9F0D] transition-colors" data-img="${item.image}">
        <div class="flex justify-between items-baseline gap-4">
          <h4 class="font-bold text-xl md:text-2xl text-[#333333] dark:text-white group-hover:text-[#FF9F0D] transition-colors">
            ${name}
          </h4>
          <span class="text-xl md:text-2xl font-bold text-[#FF9F0D] shrink-0">
            ${formatPrice(parseFloat(item.price))}
          </span>
        </div>
        <p class="text-sm text-[#4F4F4F] dark:text-white/70 mt-1.5 line-clamp-1">
          ${desc || 'Ground cumin, avocados, peeled and cubed'}
        </p>
        <span class="text-xs text-[#828282] dark:text-white/50 block mt-1">${item.calories || '1000'} CAL</span>
      </a>
    `;
  }).join('');

  container.querySelectorAll('[data-img]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (imgElement) imgElement.src = el.dataset.img;
    });
  });
}

function renderAllCategories() {
  if (!menuData.length) return;

  const appetizers = menuData.filter(i => i.category === 'Appetizers' || (i.tags && i.tags.includes('Appetizers')));
  const mainCourses = menuData.filter(i => i.category === 'Main Course' || (i.tags && i.tags.includes('Main Course')));
  const desserts = menuData.filter(i => i.category === 'Desserts' || (i.tags && i.tags.includes('Desserts')));
  const drinks = menuData.filter(i => i.category === 'Drinks' || (i.tags && i.tags.includes('Drinks')));

  renderCategoryList('starter-list', 'starter-image', appetizers.length ? appetizers : menuData.slice(0, 4));
  renderCategoryList('main-course-list', 'main-course-image', mainCourses.length ? mainCourses : menuData.slice(4, 8));
  renderCategoryList('dessert-list', 'dessert-image', desserts.length ? desserts : menuData.slice(8, 12));
  renderCategoryList('drinks-list', 'drinks-image', drinks.length ? drinks : menuData.slice(12, 16));
}

export async function initMenuPage() {
  try {
    const res = await fetch('/data/menu.json');
    if (!res.ok) throw new Error('Cannot load menu.json');
    menuData = await res.json();
    renderAllCategories();
  } catch (err) {
    console.error('Error loading menu page data:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMenuPage();
  if (typeof initCounters === 'function') initCounters();
});

window.addEventListener('languageChanged', () => {
  renderAllCategories();
});