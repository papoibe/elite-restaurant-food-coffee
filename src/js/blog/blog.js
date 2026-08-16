import { blogPostsData } from './data.js';
import { renderSidebar } from './sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();

  const container = document.getElementById('blog-posts-container');
  if (!container) return;

  container.innerHTML = blogPostsData.map(post => `
    <article class="mb-12">
      <div class="relative overflow-hidden rounded-md mb-6">
        <a href="/src/pages/blog-details.html?id=${post.id}">
          <img src="${post.image}" class="w-full h-[350px] md:h-[450px] object-cover hover:scale-105 transition duration-500" alt="${post.title}">
        </a>
        <div class="absolute left-6 top-6 w-[55px] h-[55px] bg-primary rounded-sm flex flex-col items-center justify-center text-white font-bold shadow-md pointer-events-none">
          <span class="text-base leading-tight">${post.day}</span>
          <span class="text-xs leading-tight font-normal">${post.month}</span>
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span class="flex items-center gap-1"><i class="fa-regular fa-calendar text-primary"></i> ${post.date}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><i class="fa-regular fa-comments text-primary"></i> ${post.commentsCount}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><i class="fa-regular fa-user text-primary"></i> ${post.author}</span>
      </div>

      <h2 class="text-xl md:text-2xl font-bold text-[#333333] dark:text-white hover:text-primary transition mb-3 leading-snug">
        <a href="/src/pages/blog-details.html?id=${post.id}">${post.title}</a>
      </h2>

      <p class="text-sm text-gray-500 leading-relaxed mb-6">${post.excerpt}</p>

      <a href="/src/pages/blog-details.html?id=${post.id}" class="inline-flex items-center px-6 py-2.5 border border-primary text-primary font-semibold text-xs rounded-sm hover:bg-primary hover:text-white transition gap-2">
        Read More <i class="fa-solid fa-arrow-right text-[10px]"></i>
      </a>
    </article>
  `).join('');
});