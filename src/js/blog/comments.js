/* ============================================================
   comments.js — Bình luận & trả lời bình luận cho trang Blog Details
   Không có backend thật nên lưu tại localStorage (key: elite-blog-comments),
   dữ liệu giữ nguyên sau khi tải lại trang / đóng trình duyệt.
   Nếu đã đăng nhập (auth.js) thì dùng tên tài khoản; nếu là khách thì gán
   một tên "UserXXXX" cố định cho phiên đó (lưu riêng, không hỏi tên tay).
   ============================================================ */
/* ============================================================
   comments.js — Quản lý bình luận đa ngôn ngữ & localStorage
   ============================================================ */
import { getCurrentUser } from '../auth.js';
import { commentsData as seedComments } from './data.js';
import { getLang } from '../i18n.js';

const STORAGE_KEY = 'elite-blog-comments';
const GUEST_KEY = 'elite-guest-name';

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAll(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getGuestName() {
  let name = localStorage.getItem(GUEST_KEY);
  if (!name) {
    name = 'User' + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem(GUEST_KEY, name);
  }
  return name;
}

export function getCommenterIdentity() {
  const user = getCurrentUser();
  return user ? { name: user.name, isGuest: false } : { name: getGuestName(), isGuest: true };
}

export function getComments(postId) {
  const seed = seedComments.filter(c => c.postId === postId);
  const stored = loadAll()[postId] || [];
  return [...seed, ...stored];
}

export function addComment(postId, { text, parentId = null }) {
  const all = loadAll();
  const list = all[postId] || [];
  const { name, isGuest } = getCommenterIdentity();
  const now = new Date();

  const comment = {
    id: 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    postId,
    parentId: parentId || null,
    name,
    isGuest,
    date: now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    date_vi: now.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }),
    comment: text.trim(),
    comment_vi: text.trim(),
  };

  list.push(comment);
  all[postId] = list;
  saveAll(all);
  return comment;
}

export function countComments(postId) {
  return getComments(postId).length;
}

export function renderCommentItem(comment) {
  const lang = getLang();
  const commentText = lang === 'vi' ? (comment.comment_vi || comment.comment) : comment.comment;
  const commentDate = lang === 'vi' ? (comment.date_vi || comment.date) : comment.date;
  const replyText = lang === 'vi' ? 'Trả lời' : 'Reply';

  return `
    <div class="flex gap-4 items-start ${comment.parentId ? 'ml-12 mt-4' : 'mt-6'}">
      <img src="${comment.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'}" alt="${comment.name}" class="w-12 h-12 rounded-full object-cover shrink-0" />
      <div class="flex-1 space-y-1">
        <div class="flex items-center justify-between">
          <h5 class="font-bold text-sm text-[#333333] dark:text-white">${comment.name}</h5>
          <button data-parent-id="${comment.id}" class="btn-reply text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
            ${replyText}
          </button>
        </div>
        <div class="flex items-center gap-1 text-[11px] text-gray-400">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span>${commentDate}</span>
        </div>
        <p class="text-xs leading-relaxed text-[#4F4F4F] dark:text-gray-300 pt-1">
          ${commentText}
        </p>
      </div>
    </div>
  `;
}
