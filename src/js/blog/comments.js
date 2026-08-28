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
