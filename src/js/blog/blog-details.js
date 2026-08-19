import { blogPostsData, commentsData } from './data.js';
import { renderSidebar } from './sidebar.js';
import { getLang, t } from '../i18n.js'; // Hỗ trợ đa ngôn ngữ

function renderBlogDetail() {
  renderSidebar();

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const lang = getLang();

  const post = blogPostsData.find(item => String(item.id) === String(postId)) || blogPostsData[0];

  // Chọn nội dung theo ngôn ngữ hiện tại
  const title = lang === 'vi' ? (post.title_vi || post.title) : post.title;
  const content = lang === 'vi' ? (post.content_vi || post.content) : post.content;
  const replyText = t('common.reply');
  const commentsLabel = t('common.comments');
  const postCommentText = t('common.postComment');
  const namePlaceholder = t('common.name');
  const emailPlaceholder = t('common.email');
  const writeCommentPlaceholder = t('common.writeComment');
  const tagsLabel = t('common.tags');
  const shareLabel = t('common.share');

  const container = document.getElementById('blog-detail-container');
  if (!container) return;

  container.innerHTML = `
    <article class="mb-10 text-[#333333] dark:text-white">
      <img src="${post.image}" class="w-full h-[380px] md:h-[480px] object-cover rounded-md mb-6" alt="${title}">
      
      <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span class="flex items-center gap-1"><svg class="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ${post.date}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><svg class="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg> ${post.commentsCount}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><svg class="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${post.author}</span>
      </div>

      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">${title}</h1>
      
      <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
        ${content}
      </div>

      <div class="flex flex-wrap items-center justify-between border-y border-gray-200 dark:border-gray-800 py-4 mb-10 gap-4">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm">${tagsLabel}</span>
          ${post.tags.map(tag => `<span class="text-xs text-gray-500">${tag},</span>`).join(' ')}
        </div>
        <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span class="font-bold text-sm">${shareLabel}</span>
          <a href="#" class="hover:text-primary"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          <a href="#" class="hover:text-primary"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
          <a href="#" class="hover:text-primary"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
        </div>
      </div>

      <div class="mb-10">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6">${commentsLabel} - 0${commentsData.length}</h3>
        <div class="space-y-6">
          ${commentsData.map(c => {
            const commentText = lang === 'vi' ? (c.comment) : (c.comment_en || c.comment);
            return `
            <div class="flex gap-4 ${c.isReply ? 'ml-8 md:ml-12' : ''}">
              <img src="${c.avatar}" class="w-12 h-12 rounded-full object-cover flex-shrink-0">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h4 class="font-bold text-sm text-gray-800 dark:text-white">${c.name}</h4>
                  <span class="text-xs text-primary cursor-pointer hover:underline inline-flex items-center gap-1"><svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17l-5-5 5-5M4 12h10a5 5 0 015 5v1"/></svg> ${replyText}</span>
                </div>
                <span class="text-[11px] text-gray-400 flex items-center gap-1 mb-2"><svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ${c.date}</span>
                <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">${commentText}</p>
              </div>
            </div>
          `}).join('')}
        </div>
      </div>

      <div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">${postCommentText}</h3>
        <form onsubmit="event.preventDefault();" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="${namePlaceholder} *" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 dark:bg-bg-dark text-sm focus:outline-primary">
            <input type="email" placeholder="${emailPlaceholder} *" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 dark:bg-bg-dark text-sm focus:outline-primary">
          </div>
          <textarea rows="5" placeholder="${writeCommentPlaceholder}" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 dark:bg-bg-dark text-sm focus:outline-primary"></textarea>
          <button type="submit" class="bg-primary text-white font-semibold text-xs px-8 py-3 rounded-sm hover:bg-amber-600 transition">${postCommentText}</button>
        </form>
      </div>
    </article>
  `;
}

document.addEventListener('DOMContentLoaded', renderBlogDetail);