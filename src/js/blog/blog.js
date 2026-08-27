import { blogPostsData } from './data.js';
import { renderSidebar } from './sidebar.js';
import { getLang, t, applyStaticTranslations } from '../i18n.js';
import { countComments } from './comments.js';

let currentPage = 1;
const postsPerPage = 4;

export function renderBlogList() {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;

  const lang = getLang();
  const totalPosts = blogPostsData.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = blogPostsData.slice(startIndex, endIndex);

  if (currentPosts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-gray-500 dark:text-gray-400">
        <p>${lang === 'vi' ? 'Không có bài viết nào.' : 'No blog posts found.'}</p>
      </div>
    `;
  } else {
    container.innerHTML = currentPosts.map(post => {
      const title = lang === 'vi' ? (post.title_vi || post.title) : post.title;
      const excerpt = lang === 'vi' ? (post.excerpt_vi || post.excerpt) : post.excerpt;
      const date = lang === 'vi' ? (post.date_vi || post.date) : post.date;
      const month = lang === 'vi' ? (post.month_vi || post.month) : post.month;
      const commentsNum = typeof countComments === 'function' ? countComments(post.id) : (post.commentsCount || 3);
      const readMoreText = t('common.readMore');

      return `
        <article class="bg-white dark:bg-[#0D0D0D] rounded-[2px] overflow-hidden mb-12">
          <div class="relative overflow-hidden group">
            <a href="/src/pages/blog-details.html?id=${post.id}" class="block overflow-hidden">
              <img 
                src="${post.image}" 
                class="w-full h-[360px] md:h-[480px] object-cover group-hover:scale-105 transition duration-500" 
                alt="${title}" 
                onerror="this.src='https://placehold.co/800x480?text=Food+Blog'"
              />
            </a>
            <div class="absolute left-6 top-6 w-[56px] h-[56px] bg-[#FF9F0D] rounded-[2px] flex flex-col items-center justify-center text-white shadow-md pointer-events-none">
              <span class="text-lg font-bold leading-none">${post.day}</span>
              <span class="text-xs font-normal leading-tight mt-1">${month}</span>
            </div>
          </div>

          <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-5 mb-3 font-normal">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#FF9F0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              ${date}
            </span>
            <span class="text-gray-300">/</span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#FF9F0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              ${commentsNum}
            </span>
            <span class="text-gray-300">/</span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#FF9F0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              ${post.author}
            </span>
          </div>

          <h2 class="text-2xl md:text-[26px] font-bold text-[#333333] dark:text-white hover:text-[#FF9F0D] transition mb-3 leading-snug">
            <a href="/src/pages/blog-details.html?id=${post.id}">${title}</a>
          </h2>

          <p class="text-sm text-[#4F4F4F] dark:text-gray-400 leading-relaxed mb-6 font-normal">
            ${excerpt}
          </p>

          <a 
            href="/src/pages/blog-details.html?id=${post.id}" 
            class="inline-flex items-center px-6 py-2.5 border border-[#FF9F0D] text-[#FF9F0D] font-normal text-sm rounded-[2px] hover:bg-[#FF9F0D] hover:text-white transition gap-2 group"
          >
            <span>${readMoreText}</span>
            <svg class="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </article>
      `;
    }).join('');
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const paginationContainer = document.getElementById('blog-pagination');
  if (!paginationContainer) return;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  paginationContainer.innerHTML = `
    <div class="flex justify-center items-center gap-3 mt-12">
      <button 
        id="btn-prev-page" 
        ${isFirstPage ? 'disabled' : ''}
        class="w-11 h-11 flex items-center justify-center rounded-[2px] border border-[#F2F2F2] dark:border-gray-700 bg-white dark:bg-[#0D0D0D] text-[#FF9F0D] font-bold text-sm shadow-sm transition ${
          isFirstPage 
            ? 'opacity-40 cursor-not-allowed border-gray-200' 
            : 'hover:border-[#FF9F0D] cursor-pointer'
        }"
        aria-label="${t('common.prev')}"
      >
        &#171;
      </button>

      ${pageNumbers.map(p => `
        <button 
          data-page="${p}" 
          class="btn-page-number w-11 h-11 flex items-center justify-center rounded-[2px] text-sm font-semibold transition shadow-sm ${
            p === currentPage 
              ? 'bg-[#FF9F0D] text-white border border-[#FF9F0D] cursor-default' 
              : 'border border-[#F2F2F2] dark:border-gray-700 bg-white dark:bg-[#0D0D0D] text-[#FF9F0D] hover:border-[#FF9F0D] cursor-pointer'
          }"
        >
          ${p}
        </button>
      `).join('')}

      <button 
        id="btn-next-page" 
        ${isLastPage ? 'disabled' : ''}
        class="w-11 h-11 flex items-center justify-center rounded-[2px] border border-[#F2F2F2] dark:border-gray-700 bg-white dark:bg-[#0D0D0D] text-[#FF9F0D] font-bold text-sm shadow-sm transition ${
          isLastPage 
            ? 'opacity-40 cursor-not-allowed border-gray-200' 
            : 'hover:border-[#FF9F0D] cursor-pointer'
        }"
        aria-label="${t('common.next')}"
      >
        &#187;
      </button>
    </div>
  `;

  document.getElementById('btn-prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderBlogList();
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  });

  document.getElementById('btn-next-page')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderBlogList();
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  });

  document.querySelectorAll('.btn-page-number').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetPage = parseInt(e.currentTarget.dataset.page, 10);
      if (targetPage !== currentPage) {
        currentPage = targetPage;
        renderBlogList();
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  applyStaticTranslations();
  renderBlogList();
  try {
    await renderSidebar();
  } catch (e) {
    console.error(e);
  }
});

window.addEventListener('languageChanged', async () => {
  applyStaticTranslations();
  renderBlogList();
  try {
    await renderSidebar();
  } catch (e) {
    console.error(e);
  }
});