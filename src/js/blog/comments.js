/* ============================================================
   comments.js — Bình luận & trả lời bình luận cho trang Blog Details
   Không có backend thật nên lưu tại localStorage (key: elite-blog-comments),
   dữ liệu giữ nguyên sau khi tải lại trang / đóng trình duyệt.
   Nếu đã đăng nhập (auth.js) thì dùng tên tài khoản; nếu là khách thì gán
   một tên "UserXXXX" cố định cho phiên đó (lưu riêng, không hỏi tên tay).
   ============================================================ */
import { getCurrentUser } from '../auth.js'
import { commentsData as seedComments } from './data.js'

const STORAGE_KEY = 'elite-blog-comments' // { [postId]: Comment[] }
const GUEST_KEY = 'elite-guest-name'

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function saveAll(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

/**
 * getGuestName — Sinh (hoặc lấy lại) tên hiển thị cho khách chưa đăng nhập,
 * dạng "UserXXXX", giữ cố định cho cùng một trình duyệt.
 */
export function getGuestName() {
  let name = localStorage.getItem(GUEST_KEY)
  if (!name) {
    name = 'User' + Math.floor(1000 + Math.random() * 9000)
    localStorage.setItem(GUEST_KEY, name)
  }
  return name
}

/**
 * getCommenterIdentity — Tên + trạng thái (đã đăng nhập hay khách) sẽ dùng
 * khi đăng bình luận mới.
 */
export function getCommenterIdentity() {
  const user = getCurrentUser()
  return user ? { name: user.name, isGuest: false } : { name: getGuestName(), isGuest: true }
}

/**
 * getComments — Trả về TẤT CẢ bình luận (mẫu có sẵn + do người dùng đăng)
 * của 1 bài viết, đã gộp và sắp theo thời gian đăng (mẫu trước, mới nhất sau).
 */
export function getComments(postId) {
  const seed = seedComments.filter(c => c.postId === postId)
  const stored = loadAll()[postId] || []
  return [...seed, ...stored]
}

/**
 * addComment — Thêm bình luận mới (hoặc trả lời nếu có parentId) cho 1 bài viết.
 * @returns {Object} bình luận vừa tạo
 */
export function addComment(postId, { text, parentId = null }) {
  const all = loadAll()
  const list = all[postId] || []
  const { name, isGuest } = getCommenterIdentity()

  const comment = {
    id: 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    postId,
    parentId: parentId || null,
    name,
    isGuest,
    date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }),
    comment: text.trim(),
  }

  list.push(comment)
  all[postId] = list
  saveAll(all)
  return comment
}

/**
 * countComments — Đếm tổng số bình luận (gồm cả trả lời) của 1 bài viết.
 */
export function countComments(postId) {
  return getComments(postId).length
}
