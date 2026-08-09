import { sidebarData } from './data.js';

export function renderSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-8 text-[#333333]">
      <div class="flex">
        <input type="text" placeholder="Search Your Keyword..." class="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-primary">
        <button class="bg-primary text-white px-5 flex items-center justify-center hover:bg-amber-600 transition">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>

      <div class="border border-gray-200 p-6 text-center rounded-sm">
        <img src="${sidebarData.author.avatar}" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover">
        <h3 class="font-bold text-gray-800 text-lg">${sidebarData.author.name}</h3>
        <p class="text-xs text-gray-400 mb-2">${sidebarData.author.role}</p>
        <div class="text-primary text-xs mb-3">
          <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
          <span class="text-gray-400 ml-1">(5 Reviews)</span>
        </div>
        <p class="text-xs text-gray-500 leading-relaxed mb-4">${sidebarData.author.bio}</p>
        <div class="flex justify-center gap-4 text-gray-700 text-sm">
          <a href="#" class="hover:text-primary"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" class="hover:text-primary"><i class="fa-brands fa-twitter"></i></a>
          <a href="#" class="hover:text-primary"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" class="hover:text-primary"><i class="fa-brands fa-pinterest"></i></a>
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
                <h4 class="text-xs font-semibold text-gray-700 group-hover:text-primary transition line-clamp-2">${post.title}</h4>
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
          <a href="#" class="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition"><i class="fa-brands fa-twitter"></i></a>
          <a href="#" class="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition"><i class="fa-brands fa-youtube"></i></a>
          <a href="#" class="w-9 h-9 bg-primary flex items-center justify-center text-white transition"><i class="fa-brands fa-pinterest"></i></a>
          <a href="#" class="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" class="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition"><i class="fa-brands fa-facebook-f"></i></a>
        </div>
      </div>
    </div>
  `;
}