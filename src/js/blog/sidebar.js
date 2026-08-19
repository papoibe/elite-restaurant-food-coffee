import { sidebarData } from './data.js';
import { getLang } from '../i18n.js';

export function renderSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const lang = getLang();
  const bio = lang === 'vi' ? sidebarData.author.bio : (sidebarData.author.bio_en || sidebarData.author.bio);

  container.innerHTML = `
    <div class="space-y-8 text-[#333333]">
      <div class="flex">
        <input type="text" placeholder="${lang === 'vi' ? 'Tìm kiếm từ khoá...' : 'Search Your Keyword...'}" class="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-primary">
        <button class="bg-primary text-white px-5 flex items-center justify-center hover:bg-amber-600 transition">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
      </div>

      <div class="border border-gray-200 p-6 text-center rounded-sm">
        <img src="${sidebarData.author.avatar}" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover">
        <h3 class="font-bold text-gray-800 text-lg">${sidebarData.author.name}</h3>
        <p class="text-xs text-gray-400 mb-2">${sidebarData.author.role}</p>
        <div class="text-primary text-xs mb-3 inline-flex items-center gap-0.5">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z"/></svg><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z"/></svg><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z"/></svg><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z"/></svg><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z"/></svg>
          <span class="text-gray-400 ml-1">(5 Reviews)</span>
        </div>
        <p class="text-xs text-gray-500 leading-relaxed mb-4">${bio}</p>
        <div class="flex justify-center gap-4 text-gray-700 text-sm">
          <a href="#" class="hover:text-primary"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          <a href="#" class="hover:text-primary"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
          <a href="#" class="hover:text-primary"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
          <a href="#" class="hover:text-primary"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 17c.7-2 1.2-4 1.8-6.3M12.2 7.2c2.4 0 4 1.4 4 3.5 0 2.6-1.5 4.6-3.7 4.6-1 0-1.8-.5-2-1.2"/></svg></a>
        </div>
      </div>

      <div class="border border-gray-200 p-6 rounded-sm">
        <h3 class="font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2">Recent Post</h3>
        <div class="space-y-4">
          ${sidebarData.recentPosts.map(post => `
            <a href="/src/pages/blog-details.html?id=${post.id}" class="flex items-center gap-4 group">
              <img src="${post.image}" class="w-16 h-16 object-cover rounded-sm flex-shrink-0">
              <div>
                <span class="text-[11px] text-gray-400 block">${post.date}</span>
                <h4 class="text-xs font-semibold text-gray-700 group-hover:text-primary transition line-clamp-2">${lang === 'vi' ? (post.title_vi || post.title) : post.title}</h4>
              </div>
            </a>
          `).join('')}
        </div>
      </div>

      <div class="border border-gray-200 p-6 rounded-sm">
        <h3 class="font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2">Filter By Menu</h3>
        <div class="space-y-3">
          ${sidebarData.filterMenu.map(item => `
            <div class="flex items-center justify-between group cursor-pointer">
              <div class="flex items-center gap-3">
                <img src="${item.image}" class="w-12 h-12 rounded-sm object-cover">
                <span class="text-sm font-semibold text-gray-700 group-hover:text-primary transition">${item.name}</span>
              </div>
              <span class="text-xs text-gray-400">${item.count}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="border border-gray-200 p-6 rounded-sm">
        <h3 class="font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2">Popular Tags</h3>
        <div class="flex flex-wrap gap-2">
          ${sidebarData.popularTags.map(tag => `
            <a href="#" class="px-3 py-1.5 border border-gray-200 text-xs text-gray-600 hover:border-primary hover:text-primary transition">${tag}</a>
          `).join('')}
        </div>
      </div>

      <div class="border border-gray-200 p-6 rounded-sm">
        <h3 class="font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2">Photo Gallery</h3>
        <div class="grid grid-cols-3 gap-2">
          ${sidebarData.photoGallery.map(img => `
            <img src="${img}" class="w-full h-20 object-cover hover:opacity-80 transition cursor-pointer rounded-sm">
          `).join('')}
        </div>
      </div>

      <div class="border border-gray-200 p-6 rounded-sm">
        <h3 class="font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2">Follow Us</h3>
        <div class="flex gap-2">
          <a href="#" class="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
          <a href="#" class="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></a>
          <a href="#" class="w-9 h-9 bg-primary flex items-center justify-center text-white transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 17c.7-2 1.2-4 1.8-6.3M12.2 7.2c2.4 0 4 1.4 4 3.5 0 2.6-1.5 4.6-3.7 4.6-1 0-1.8-.5-2-1.2"/></svg></a>
          <a href="#" class="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
          <a href="#" class="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
        </div>
      </div>
    </div>
  `;
}