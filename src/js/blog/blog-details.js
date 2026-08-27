import { blogPostsData } from './data.js';
import { renderSidebar } from './sidebar.js';
import { getLang, t, applyStaticTranslations } from '../i18n.js';
import { getComments, addComment, getCommenterIdentity } from './comments.js';
import { showSuccessToast } from '../validate.js';

const DEFAULT_AVATAR_SVG = `
  <div class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
    <svg class="w-8 h-8 text-gray-500 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12.75c2.9 0 5.25-2.35 5.25-5.25S14.9 2.25 12 2.25 6.75 4.6 6.75 7.5 9.1 12.75 12 12.75zm0 2.25c-3.5 0-10.5 1.76-10.5 5.25v1.5a1.5 1.5 0 001.5 1.5h18a1.5 1.5 0 001.5-1.5v-1.5c0-3.49-7-5.25-10.5-5.25z"/>
    </svg>
  </div>`;

function renderAvatar(comment) {
  if (comment.avatar) {
    return `<img src="${comment.avatar}" class="w-12 h-12 rounded-full object-cover flex-shrink-0" alt="${comment.name}" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'">`;
  }
  return DEFAULT_AVATAR_SVG;
}

function renderOneComment(c, lang, isReplyRow, replyText) {
  const commentText = lang === 'vi' ? (c.comment_vi || c.comment) : (c.comment_en || c.comment);
  const commentDate = lang === 'vi' ? (c.date_vi || c.date) : c.date;

  return `
    <div class="flex gap-4 ${isReplyRow ? 'ml-8 md:ml-12 mt-4' : ''}" data-comment-id="${c.id}">
      ${renderAvatar(c)}
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-1 flex-wrap">
          <h4 class="font-bold text-sm text-[#333333] dark:text-white">${c.name}</h4>
          ${!isReplyRow ? `
          <button type="button" class="btn-reply text-xs text-[#FF9F0D] cursor-pointer hover:underline inline-flex items-center gap-1" data-reply-to="${c.id}" data-reply-name="${c.name}">
            <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17l-5-5 5-5M4 12h10a5 5 0 015 5v1"/></svg> ${replyText}
          </button>` : ''}
        </div>
        <span class="text-[11px] text-gray-400 flex items-center gap-1 mb-2">
          <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> 
          ${commentDate}
        </span>
        <p class="text-xs text-[#4F4F4F] dark:text-gray-300 leading-relaxed">${commentText}</p>
        ${!isReplyRow ? `<div class="reply-form-slot mt-3" data-slot-for="${c.id}"></div>` : ''}
      </div>
    </div>
  `;
}

function renderReplyForm(parentId, parentName) {
  const identity = getCommenterIdentity();
  const identityNote = identity.isGuest
    ? t('blog.guestNotice', { name: identity.name })
    : t('blog.commentingAs', { name: identity.name });

  return `
    <form class="reply-form space-y-2 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-md" data-parent-id="${parentId}">
      <p class="text-[11px] text-gray-500 dark:text-gray-400">${t('blog.replyingTo', { name: parentName })} · ${identityNote}</p>
      <textarea rows="2" required class="reply-textarea w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#0D0D0D] text-xs focus:outline-[#FF9F0D] rounded" placeholder="${t('common.writeComment')}"></textarea>
      <p class="reply-error text-[11px] text-red-500 hidden"></p>
      <div class="flex gap-2">
        <button type="submit" class="bg-[#FF9F0D] text-white text-xs font-semibold px-4 py-1.5 rounded-sm hover:bg-amber-600 transition cursor-pointer">${t('common.postComment')}</button>
        <button type="button" class="btn-cancel-reply text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 cursor-pointer">${t('common.cancel')}</button>
      </div>
    </form>
  `;
}

function renderCommentsSection(postId, lang) {
  const all = getComments(postId);
  const topLevel = all.filter(c => !c.parentId);
  const repliesOf = (id) => all.filter(c => c.parentId === id);
  const replyText = t('common.reply');

  if (topLevel.length === 0) {
    return `<p class="text-sm text-gray-500 dark:text-gray-400">${t('blog.noComments')}</p>`;
  }

  return topLevel.map(c => {
    const replies = repliesOf(c.id);
    return renderOneComment(c, lang, false, replyText) +
      replies.map(r => renderOneComment(r, lang, true, replyText)).join('');
  }).join('<div class="border-t border-gray-100 dark:border-gray-800 my-6"></div>');
}

function renderMainForm(postId) {
  const identity = getCommenterIdentity();
  const identityNote = identity.isGuest
    ? t('blog.guestNotice', { name: identity.name })
    : t('blog.commentingAs', { name: identity.name });

  return `
    <h3 class="text-xl font-bold text-[#333333] dark:text-white mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">${t('common.postComment')}</h3>
    <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">${identityNote}</p>
    <form id="main-comment-form" class="space-y-4" data-post-id="${postId}">
      <textarea rows="5" required id="main-comment-text" placeholder="${t('common.writeComment')}" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 dark:bg-[#0D0D0D] text-sm focus:outline-[#FF9F0D]"></textarea>
      <p id="main-comment-error" class="text-xs text-red-500 hidden"></p>
      <button type="submit" class="bg-[#FF9F0D] text-white font-semibold text-xs px-8 py-3 rounded-sm hover:bg-amber-600 transition cursor-pointer">${t('common.postComment')}</button>
    </form>
  `;
}

export function renderBlogDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const lang = getLang();

  const post = blogPostsData.find(item => String(item.id) === String(postId)) || blogPostsData[0];
  if (!post) return;

  const realPostId = post.id;
  const title = lang === 'vi' ? (post.title_vi || post.title) : post.title;
  const content = lang === 'vi' ? (post.content_vi || post.content) : post.content;
  const date = lang === 'vi' ? (post.date_vi || post.date) : post.date;
  const commentsLabel = t('common.comments');
  const tagsLabel = t('common.tags');
  const shareLabel = t('common.share');

  const container = document.getElementById('blog-detail-container');
  if (!container) return;

  const commentCount = getComments(realPostId).length;
  const countDisplay = commentCount < 10 ? `0${commentCount}` : commentCount;

  container.innerHTML = `
    <article class="mb-10 text-[#333333] dark:text-white">
      <img src="${post.detailImage || post.image}" class="w-full h-[380px] md:h-[480px] object-cover rounded-md mb-6" alt="${title}" onerror="this.src='https://placehold.co/900x480?text=Food+Blog'">

      <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span class="flex items-center gap-1"><svg class="w-3 h-3 text-[#FF9F0D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ${date}</span>
        <span>/</span>
        <span id="comment-count-badge" class="flex items-center gap-1"><svg class="w-3 h-3 text-[#FF9F0D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg> ${commentCount}</span>
        <span>/</span>
        <span class="flex items-center gap-1"><svg class="w-3 h-3 text-[#FF9F0D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${post.author}</span>
      </div>

      <h1 class="text-2xl md:text-3xl font-bold text-[#333333] dark:text-white mb-6 leading-tight">${title}</h1>

      <div class="text-sm text-[#4F4F4F] dark:text-gray-300 leading-relaxed mb-8">
        ${content}
      </div>

      <div class="flex flex-wrap items-center justify-between border-y border-gray-200 dark:border-gray-800 py-4 mb-10 gap-4">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm">${tagsLabel}</span>
          ${(post.tags || []).map(tag => {
            const tagKey = 'tag.' + tag.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
            const displayTag = t(tagKey) !== tagKey ? t(tagKey) : tag;
            return `<span class="text-xs text-gray-500">${displayTag},</span>`;
          }).join(' ')}
        </div>
        <div class="flex items-center gap-3 text-sm text-[#4F4F4F] dark:text-gray-300">
          <span class="font-bold text-sm">${shareLabel}</span>
          <a href="#" class="hover:text-[#FF9F0D] transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          <a href="#" class="hover:text-[#FF9F0D] transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
          <a href="#" class="hover:text-[#FF9F0D] transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
        </div>
      </div>

      <div class="mb-10">
        <h3 class="text-xl font-bold text-[#333333] dark:text-white mb-6">${commentsLabel} - <span id="comments-heading-count">${countDisplay}</span></h3>
        <div id="comments-list" class="space-y-6">
          ${renderCommentsSection(realPostId, lang)}
        </div>
      </div>

      <div id="main-comment-form-wrap">
        ${renderMainForm(realPostId)}
      </div>
    </article>
  `;

  initCommentEvents(realPostId, lang);
}

function initCommentEvents(postId, lang) {
  const container = document.getElementById('blog-detail-container');
  if (!container || container.dataset.eventsBound === 'true') return;
  container.dataset.eventsBound = 'true';

  container.addEventListener('click', (e) => {
    const replyBtn = e.target.closest('.btn-reply');
    if (replyBtn) {
      const parentId = replyBtn.dataset.replyTo;
      const parentName = replyBtn.dataset.replyName;
      const slot = container.querySelector(`.reply-form-slot[data-slot-for="${parentId}"]`);
      if (!slot) return;

      if (slot.innerHTML.trim() !== '') {
        slot.innerHTML = '';
        return;
      }

      container.querySelectorAll('.reply-form-slot').forEach(s => { s.innerHTML = ''; });
      slot.innerHTML = renderReplyForm(parentId, parentName);
      slot.querySelector('.reply-textarea')?.focus();
      return;
    }

    const cancelBtn = e.target.closest('.btn-cancel-reply');
    if (cancelBtn) {
      const slot = cancelBtn.closest('.reply-form-slot');
      if (slot) slot.innerHTML = '';
    }
  });

  container.addEventListener('submit', (e) => {
    const replyForm = e.target.closest('.reply-form');
    if (replyForm) {
      e.preventDefault();
      const textarea = replyForm.querySelector('.reply-textarea');
      const errorEl = replyForm.querySelector('.reply-error');
      const text = textarea.value.trim();
      if (!text) {
        errorEl.textContent = t('blog.commentEmpty');
        errorEl.classList.remove('hidden');
        textarea.classList.add('border-red-500');
        return;
      }
      addComment(postId, { text, parentId: replyForm.dataset.parentId });
      showSuccessToast(t('blog.replyPosted'));
      renderBlogDetail();
      return;
    }

    const mainForm = e.target.closest('#main-comment-form');
    if (mainForm) {
      e.preventDefault();
      const textarea = document.getElementById('main-comment-text');
      const errorEl = document.getElementById('main-comment-error');
      const text = textarea.value.trim();
      if (!text) {
        errorEl.textContent = t('blog.commentEmpty');
        errorEl.classList.remove('hidden');
        textarea.classList.add('border-red-500');
        return;
      }
      addComment(postId, { text });
      showSuccessToast(t('blog.commentPosted'));
      renderBlogDetail();
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  applyStaticTranslations();
  renderBlogDetail();
  try {
    await renderSidebar();
  } catch (e) {
    console.error(e);
  }
});

window.addEventListener('languageChanged', async () => {
  applyStaticTranslations();
  renderBlogDetail();
  try {
    await renderSidebar();
  } catch (e) {
    console.error(e);
  }
});