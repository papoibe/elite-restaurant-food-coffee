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

// Ảnh đại diện mặc định khi bình luận không có avatar hoặc link ảnh hỏng.
const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';

/**
 * buildComment — Dựng MỘT bình luận thành node DOM thật.
 *
 * Không nối chuỗi vào innerHTML: `name` và `comment` là do người dùng gõ vào
 * ô bình luận. Nếu ai đó gõ <img src=x onerror=alert(1)> và mình nối vào
 * innerHTML thì đoạn đó chạy thật — đây chính là lỗ hổng XSS.
 * textContent coi mọi thứ là chữ, không bao giờ là mã.
 *
 * @returns {HTMLElement} node đã điền dữ liệu, sẵn sàng gắn vào DOM
 */
function buildComment(c, lang, isReplyRow, replyText) {
  const tpl = document.getElementById('comment-template');
  const node = tpl.content.firstElementChild.cloneNode(true);

  const commentText = lang === 'vi' ? (c.comment_vi || c.comment) : (c.comment_en || c.comment);
  const commentDate = lang === 'vi' ? (c.date_vi || c.date) : c.date;
  const cell = (name) => node.querySelector(`[data-cell="${name}"]`);

  node.dataset.commentId = c.id;
  if (isReplyRow) node.classList.add('ml-8', 'md:ml-12', 'mt-4');

  // Ảnh đại diện: chỉ nhận URL, còn alt là dữ liệu người dùng nên đặt bằng
  // thuộc tính (trình duyệt tự escape), không nối vào chuỗi HTML.
  const avatar = cell('avatar');
  avatar.src = c.avatar || DEFAULT_AVATAR_URL;
  avatar.alt = c.name;
  avatar.addEventListener('error', () => { avatar.src = DEFAULT_AVATAR_URL; });

  cell('name').textContent = c.name;
  cell('date').textContent = commentDate;
  cell('text').textContent = commentText;

  const replyBtn = cell('reply');
  if (isReplyRow) {
    replyBtn.remove();
    cell('slot').remove();
  } else {
    replyBtn.dataset.replyTo = c.id;
    replyBtn.dataset.replyName = c.name;
    node.querySelector('[data-cell="reply-label"]').textContent = replyText;
    cell('slot').dataset.slotFor = c.id;
  }

  return node;
}

/**
 * mountComments — Vẽ toàn bộ danh sách bình luận vào #comments-list.
 * Gom hết node rồi thay một lần bằng replaceChildren: chỉ chạm DOM đúng
 * một lần thay vì append từng dòng.
 */
function mountComments(postId, lang) {
  const box = document.getElementById('comments-list');
  if (!box) return;

  const all = getComments(postId);
  const topLevel = all.filter(c => !c.parentId);
  const replyText = t('common.reply');

  if (topLevel.length === 0) {
    const p = document.createElement('p');
    p.className = 'text-sm text-gray-500 dark:text-gray-400';
    p.textContent = t('blog.noComments');
    box.replaceChildren(p);
    return;
  }

  const nodes = [];
  topLevel.forEach((c, i) => {
    if (i > 0) {
      const hr = document.createElement('div');
      hr.className = 'border-t border-gray-100 dark:border-gray-800 my-6';
      nodes.push(hr);
    }
    nodes.push(buildComment(c, lang, false, replyText));
    all.filter(r => r.parentId === c.id)
       .forEach(r => nodes.push(buildComment(r, lang, true, replyText)));
  });

  box.replaceChildren(...nodes);
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
      <img loading="lazy" src="${post.detailImage || post.image}" class="w-full h-[380px] md:h-[480px] object-cover rounded-md mb-6" alt="${title}" onerror="this.src='https://placehold.co/900x480?text=Food+Blog'">

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
        <div id="comments-list" class="space-y-6"></div>
      </div>

      <div id="main-comment-form-wrap">
        ${renderMainForm(realPostId)}
      </div>
    </article>
  `;

  mountComments(realPostId, lang);   // dựng bằng <template> + textContent
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