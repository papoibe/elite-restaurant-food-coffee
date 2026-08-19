import { blogPostsData } from './data.js';
import { renderSidebar } from './sidebar.js';
import { getLang, t } from '../i18n.js'; // Hỗ trợ đa ngôn ngữ

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();

  const container = document.getElementById('blog-posts-container');
  if (!container) return;

  const lang = getLang(); // Lấy ngôn ngữ hiện tại (vi hoặc en)

  container.innerHTML = blogPostsData.map(post => {
    // Chọn tiêu đề, mô tả theo ngôn ngữ hiện tại
    const title = lang === 'vi' ? (post.title_vi || post.title) : post.title;
    const excerpt = lang === 'vi' ? (post.excerpt_vi || post.excerpt) : post.excerpt;
    const readMoreText = t('common.readMore');

    return `
    <article class="mb-12">
      <div class="relative overflow-hidden rounded-md mb-6">
        <a href="/src/pages/blog-details.html?id=${post.id}">
          <img src="${post.image}" class="w-full h-[350px] md:h-[450px] object-cover hover:scale-105 transition duration-500" alt="${title}">
        </a>
        <div class="absolute left-6 top-6 w-[55px] h-[55px] bg-primary rounded-sm flex flex-col items-center justify-center text-white font-bold shadow-md pointer-events-none">
          <span class="text-base leading-tight">${post.day}</span>
          <span class="text-xs leading-tight font-normal">${post.month}</span>
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span class="flex items-center gap-1"><svg class="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ${post.date}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><svg class="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg> ${post.commentsCount}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><svg class="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${post.author}</span>
      </div>

      <h2 class="text-xl md:text-2xl font-bold text-[#333333] dark:text-white hover:text-primary transition mb-3 leading-snug">
        <a href="/src/pages/blog-details.html?id=${post.id}">${title}</a>
      </h2>

      <p class="text-sm text-gray-500 leading-relaxed mb-6">${excerpt}</p>

      <a href="/src/pages/blog-details.html?id=${post.id}" class="inline-flex items-center px-6 py-2.5 border border-primary text-primary font-semibold text-xs rounded-sm hover:bg-primary hover:text-white transition gap-2">
        ${readMoreText} <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </article>
  `}).join('');
});