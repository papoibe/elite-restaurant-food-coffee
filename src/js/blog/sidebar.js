import { sidebarData, blogPostsData } from './data.js';
import { getLang, t } from '../i18n.js';

export async function renderSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const lang = getLang();
  const { author, photoGallery } = sidebarData;

  let dynamicFilterMenu = [];
  let dynamicTags = [];

  try {
    const res = await fetch('/data/menu.json');
    // fetch KHÔNG tự ném lỗi với mã 404/500, phải tự kiểm tra rồi throw để
    // khối catch bên dưới xử lý chung một chỗ.
    if (!res.ok) throw new Error(`Máy chủ trả về ${res.status}`);
    {
      const menuList = await res.json();
      const categoryMap = {};
      const tagsSet = new Set();

      menuList.forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (!categoryMap[cat]) {
          categoryMap[cat] = {
            name: cat,
            count: 0,
            image: item.image || '/assets/images/burger.jpg'
          };
        }
        categoryMap[cat].count += 1;

        if (Array.isArray(item.tags)) {
          item.tags.forEach(t => tagsSet.add(t));
        }
      });

      dynamicFilterMenu = Object.values(categoryMap).slice(0, 5);
      dynamicTags = Array.from(tagsSet).slice(0, 10);
    }
  } catch {
    dynamicFilterMenu = sidebarData.filterMenu || [];
    dynamicTags = sidebarData.popularTags || [];
  }

  const recentPostsList = (blogPostsData && blogPostsData.length > 0)
    ? blogPostsData.slice(0, 4)
    : (sidebarData.recentPosts || []);

  const tRecent = lang === 'vi' ? 'Bài Viết Gần Đây' : 'Recent Post';
  const tFilter = lang === 'vi' ? 'Lọc Theo Thực Đơn' : 'Filter By Menu';
  const tTags = t('tag.popularTags');
  const tGallery = lang === 'vi' ? 'Bộ Sưu Tập Ảnh' : 'Photo Gallery';
  const tFollow = lang === 'vi' ? 'Theo Dõi Chúng Tôi' : 'Follow Us';
  const tSearchPlaceholder = lang === 'vi' ? 'Tìm kiếm từ khóa...' : 'Search Your Keyword...';

  container.innerHTML = `
    <div class="relative flex items-center">
      <input 
        type="text" 
        placeholder="${tSearchPlaceholder}" 
        class="w-full bg-transparent border border-[#E0E0E0] dark:border-gray-700 text-sm px-5 py-3.5 rounded-[2px] focus:outline-none focus:border-[#FF9F0D] text-[#333333] dark:text-white placeholder-gray-400"
      />
      <button class="absolute right-0 top-0 bottom-0 bg-[#FF9F0D] text-white w-14 flex items-center justify-center rounded-r-[2px] hover:bg-amber-600 transition cursor-pointer" aria-label="${t('common.searchProduct')}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </button>
    </div>

    <div class="border border-[#E0E0E0] dark:border-gray-800 rounded-[2px] pt-[32px] pb-[32px] pl-[55px] pr-[32px] text-center bg-white dark:bg-[#1a1a1a]">
      <div class="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border border-gray-200 dark:border-gray-700">
        <img loading="lazy" src="${author.avatar}" alt="${author.name}" class="w-full h-full object-cover" />
      </div>
      <h4 class="font-bold text-lg text-[#333333] dark:text-white">${author.name}</h4>
      <p class="text-xs text-gray-400 mt-1">${lang === 'vi' ? (author.role_vi || author.role) : author.role}</p>
      
      <div class="flex justify-center items-center gap-1 text-[#FF9F0D] text-xs my-2.5">
        <span class="text-gray-400 text-[11px] ml-1">(1 ${t('common.review')})</span>
      </div>

      <p class="text-xs text-[#828282] dark:text-gray-400 leading-relaxed max-w-[260px] mx-auto mb-4">
        ${lang === 'vi' ? (author.bio_vi || author.bio) : author.bio}
      </p>

      <div class="flex justify-center items-center gap-3 text-[#333333] dark:text-white">
        <a href="#" class="hover:text-[#FF9F0D] transition" aria-label="Facebook"><img src="/assets/images/facebook.svg" class="w-3.5 h-3.5" alt="FB" /></a>
        <a href="#" class="hover:text-[#FF9F0D] transition" aria-label="Twitter"><img src="/assets/images/twitter.svg" class="w-3.5 h-3.5" alt="Twitter" /></a>
        <a href="#" class="hover:text-[#FF9F0D] transition" aria-label="Instagram"><img src="/assets/images/instagram.svg" class="w-3.5 h-3.5" alt="Instagram" /></a>
        <a href="#" class="hover:text-[#FF9F0D] transition" aria-label="Pinterest"><img src="/assets/images/pinterest.svg" class="w-3.5 h-3.5" alt="Pinterest" /></a>
      </div>
    </div>

    <div class="border border-[#E0E0E0] dark:border-gray-800 rounded-[2px] pt-[32px] pb-[32px] pl-[55px] pr-[32px] bg-white dark:bg-[#1a1a1a]">
      <h4 class="font-bold text-lg text-[#333333] dark:text-white mb-6">${tRecent}</h4>
      <div class="space-y-4">
        ${recentPostsList.map(p => `
          <div class="flex items-center gap-4">
            <a href="/src/pages/blog-details.html?id=${p.id}" class="w-16 h-16 rounded-[2px] overflow-hidden shrink-0">
              <img loading="lazy" src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition" onerror="this.src='https://placehold.co/64x64?text=Post'" />
            </a>
            <div>
              <span class="text-[11px] text-gray-400 block mb-1">${lang === 'vi' ? (p.date_vi || p.date) : p.date}</span>
              <a href="/src/pages/blog-details.html?id=${p.id}" class="text-xs text-[#333333] dark:text-white hover:text-[#FF9F0D] transition line-clamp-2 leading-snug">
                ${lang === 'vi' ? (p.title_vi || p.title) : p.title}
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="border border-[#E0E0E0] dark:border-gray-800 rounded-[2px] pt-[32px] pb-[32px] pl-[55px] pr-[32px] bg-white dark:bg-[#1a1a1a]">
      <h4 class="font-bold text-lg text-[#333333] dark:text-white mb-6">${tFilter}</h4>
      <div class="space-y-3.5">
        ${dynamicFilterMenu.map(m => {
          const key = 'cat.' + m.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
          const catName = t(key) !== key ? t(key) : m.name;
          return `
            <a href="/src/pages/shop-list.html?category=${encodeURIComponent(m.name)}" class="flex items-center justify-between group cursor-pointer">
              <div class="flex items-center gap-3">
                <img loading="lazy" src="${m.image}" alt="${m.name}" class="w-12 h-12 object-cover rounded-[2px]" onerror="this.src='https://placehold.co/48x48?text=Food'" />
                <span class="text-sm font-semibold text-[#333333] dark:text-white group-hover:text-[#FF9F0D] transition">${catName}</span>
              </div>
              <span class="text-xs text-[#333333] dark:text-gray-400 font-medium">${m.count}</span>
            </a>
          `;
        }).join('')}
      </div>
    </div>

    <div class="border border-[#E0E0E0] dark:border-gray-800 rounded-[2px] pt-[32px] pb-[32px] pl-[55px] pr-[32px] bg-white dark:bg-[#1a1a1a]">
      <h4 class="font-bold text-lg text-[#333333] dark:text-white mb-6">${tTags}</h4>
      <div class="flex flex-wrap gap-4">
        ${dynamicTags.map(tag => {
          const key = 'tag.' + tag.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
          const tagLabel = t(key) !== key ? t(key) : tag;
          return `
            <a href="/src/pages/shop-list.html?tag=${encodeURIComponent(tag)}" class="text-xs text-[#4F4F4F] dark:text-gray-300 border border-[#E0E0E0] dark:border-gray-700 px-4 py-2.5 rounded-[2px] hover:border-[#FF9F0D] hover:text-[#FF9F0D] transition inline-block">
              ${tagLabel}
            </a>
          `;
        }).join('')}
      </div>
    </div>

    <div class="border border-[#E0E0E0] dark:border-gray-800 rounded-[2px] pt-[32px] pb-[32px] pl-[55px] pr-[32px] bg-white dark:bg-[#1a1a1a]">
      <h4 class="font-bold text-lg text-[#333333] dark:text-white mb-6">${tGallery}</h4>
      <div class="grid grid-cols-3 gap-2.5">
        ${photoGallery.map(img => `
          <div class="gallery-item relative aspect-square rounded-[2px] overflow-hidden group cursor-pointer" data-img-url="${img}">
            <img loading="lazy" src="${img}" alt="Gallery photo" class="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="border border-[#E0E0E0] dark:border-gray-800 rounded-[2px] pt-[32px] pb-[32px] pl-[55px] pr-[32px] bg-white dark:bg-[#1a1a1a]">
      <h4 class="font-bold text-lg text-[#333333] dark:text-white mb-6">${tFollow}</h4>
      <div class="flex items-center gap-3">
        <a href="#" class="w-9 h-9 bg-[#FAF7F2] dark:bg-gray-800 text-[#333333] dark:text-white hover:bg-[#FF9F0D] hover:text-white rounded-[2px] flex items-center justify-center transition group" aria-label="Twitter">
          <span class="w-4 h-4 bg-current inline-block" style="mask: url('/assets/images/twitter.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/twitter.svg') no-repeat center / contain;"></span>
        </a>
        <a href="#" class="w-9 h-9 bg-[#FAF7F2] dark:bg-gray-800 text-[#333333] dark:text-white hover:bg-[#FF9F0D] hover:text-white rounded-[2px] flex items-center justify-center transition group" aria-label="YouTube">
          <span class="w-4 h-4 bg-current inline-block" style="mask: url('/assets/images/youtube.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/youtube.svg') no-repeat center / contain;"></span>
        </a>
        <a href="#" class="w-9 h-9 bg-[#FAF7F2] dark:bg-gray-800 text-[#333333] dark:text-white hover:bg-[#FF9F0D] hover:text-white rounded-[2px] flex items-center justify-center transition group" aria-label="Pinterest">
          <span class="w-4 h-4 bg-current inline-block" style="mask: url('/assets/images/pinterest.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/pinterest.svg') no-repeat center / contain;"></span>
        </a>
        <a href="#" class="w-9 h-9 bg-[#FAF7F2] dark:bg-gray-800 text-[#333333] dark:text-white hover:bg-[#FF9F0D] hover:text-white rounded-[2px] flex items-center justify-center transition group" aria-label="Instagram">
          <span class="w-4 h-4 bg-current inline-block" style="mask: url('/assets/images/instagram.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/instagram.svg') no-repeat center / contain;"></span>
        </a>
        <a href="#" class="w-9 h-9 bg-[#FAF7F2] dark:bg-gray-800 text-[#333333] dark:text-white hover:bg-[#FF9F0D] hover:text-white rounded-[2px] flex items-center justify-center transition group" aria-label="Facebook">
          <span class="w-4 h-4 bg-current inline-block" style="mask: url('/assets/images/facebook.svg') no-repeat center / contain; -webkit-mask: url('/assets/images/facebook.svg') no-repeat center / contain;"></span>
        </a>
      </div>
    </div>
  `;

  setupGalleryLightbox();
}

function setupGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  let modal = document.getElementById('gallery-lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gallery-lightbox-modal';
    modal.className = 'fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 hidden opacity-0 transition-opacity duration-300';
    modal.innerHTML = `
      <div class="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
        <button id="close-lightbox" class="absolute -top-10 right-0 text-white hover:text-[#FF9F0D] text-3xl font-bold cursor-pointer transition">&times;</button>
        <img id="lightbox-img" src="" alt="Enlarged gallery photo" class="max-w-full max-h-[85vh] rounded-[2px] shadow-2xl object-contain" />
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'close-lightbox') {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  function openModal(imgUrl) {
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) lightboxImg.src = imgUrl;

    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
    }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }

  items.forEach(item => {
    item.addEventListener('click', () => {
      const imgUrl = item.dataset.imgUrl;
      if (imgUrl) openModal(imgUrl);
    });
  });
}