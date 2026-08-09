import { blogPostsData, commentsData } from './data.js';
import { renderSidebar } from './sidebar.js';

function renderBlogDetail() {
  renderSidebar();

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  const post = blogPostsData.find(item => String(item.id) === String(postId)) || blogPostsData[0];

  const container = document.getElementById('blog-detail-container');
  if (!container) return;

  container.innerHTML = `
    <article class="mb-10 text-[#333333] dark:text-white">
      <img src="${post.image}" class="w-full h-[380px] md:h-[480px] object-cover rounded-md mb-6" alt="${post.title}">
      
      <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span class="flex items-center gap-1"><i class="fa-regular fa-calendar text-primary"></i> ${post.date}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><i class="fa-regular fa-comments text-primary"></i> ${post.commentsCount}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><i class="fa-regular fa-user text-primary"></i> ${post.author}</span>
      </div>

      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">${post.title}</h1>
      
      <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
        ${post.content}
      </div>

      <div class="flex flex-wrap items-center justify-between border-y border-gray-200 dark:border-gray-800 py-4 mb-10 gap-4">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm">Tags:</span>
          ${post.tags.map(tag => `<span class="text-xs text-gray-500">${tag},</span>`).join(' ')}
        </div>
        <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span class="font-bold text-sm">Share:</span>
          <a href="#" class="hover:text-primary"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" class="hover:text-primary"><i class="fa-brands fa-twitter"></i></a>
          <a href="#" class="hover:text-primary"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" class="hover:text-primary"><i class="fa-brands fa-pinterest"></i></a>
        </div>
      </div>

      <div class="mb-10">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6">Comments - 03</h3>
        <div class="space-y-6">
          ${commentsData.map(c => `
            <div class="flex gap-4 ${c.isReply ? 'ml-8 md:ml-12' : ''}">
              <img src="${c.avatar}" class="w-12 h-12 rounded-full object-cover flex-shrink-0">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h4 class="font-bold text-sm text-gray-800 dark:text-white">${c.name}</h4>
                  <span class="text-xs text-primary cursor-pointer hover:underline"><i class="fa-solid fa-reply"></i> Reply</span>
                </div>
                <span class="text-[11px] text-gray-400 block mb-2"><i class="fa-regular fa-calendar"></i> ${c.date}</span>
                <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">${c.comment}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">Post a comment</h3>
        <form onsubmit="event.preventDefault();" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Name *" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 dark:bg-bg-dark text-sm focus:outline-primary">
            <input type="email" placeholder="Email *" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 dark:bg-bg-dark text-sm focus:outline-primary">
          </div>
          <textarea rows="5" placeholder="Write a comment" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 dark:bg-bg-dark text-sm focus:outline-primary"></textarea>
          <button type="submit" class="bg-primary text-white font-semibold text-xs px-8 py-3 rounded-sm hover:bg-amber-600 transition">Post comment</button>
        </form>
      </div>
    </article>
  `;
}

document.addEventListener('DOMContentLoaded', renderBlogDetail);