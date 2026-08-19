/* ============================================================
   chefs.js — Dữ liệu Đầu bếp (fetch từ chefs.json)
   Dùng chung cho: home.js (preview 4 đầu bếp) và chefs.html (đủ 12)
   Ảnh đầu bếp lấy từ trường "image" trong chefs.json (nếu có).
   Nếu 1 chef không có trường "image" (hoặc ảnh lỗi link), tự động
   rơi về avatar chữ cái đầu — đảm bảo thêm chef mới vào JSON dù
   chưa có ảnh vẫn hiển thị được ngay, không cần sửa code.
   ============================================================ */
import { t, getLang } from '/src/js/i18n.js' // Chuyển ngôn ngữ VN/EN

let cachedChefs = null

/**
 * fetchChefs — Lấy toàn bộ danh sách đầu bếp từ chefs.json (cache lại trong phiên)
 * @returns {Promise<Array>}
 */
export async function fetchChefs() {
  if (cachedChefs) return cachedChefs
  try {
    const res = await fetch('/src/data/chefs.json')
    cachedChefs = await res.json()
    return cachedChefs
  } catch (error) {
    console.error('❌ Lỗi khi tải danh sách đầu bếp:', error)
    return []
  }
}

/**
 * getInitials — Lấy chữ cái đầu của tên (tối đa 2 ký tự) cho avatar
 */
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

// Bảng màu nền avatar xoay vòng theo index — tạo cảm giác đa dạng, dễ phân biệt
const AVATAR_COLORS = ['#FF9F0D', '#2F5D5A', '#B3261E', '#2C5B95', '#7A5AF8', '#0D9488']

/**
 * renderChefMedia — Khối ảnh đại diện đầu bếp, dùng chung cho cả 2 kiểu thẻ.
 * Ưu tiên ảnh thật (chef.image); nếu không có hoặc ảnh lỗi link thì tự
 * động rơi về avatar chữ cái đầu (2 lớp cùng render sẵn, onerror chỉ
 * ẩn/hiện — không cần dựng DOM bằng tay nên tránh lỗi escaping).
 * @param {Object} chef
 * @param {number} index - dùng để xoay màu avatar
 * @param {string} initialsSizeClass - class cỡ chữ avatar (khác nhau giữa preview/full)
 */
function renderChefMedia(chef, index, initialsSizeClass) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const initialsFallback = `
    <div class="${chef.image ? 'hidden ' : ''}absolute inset-0 flex items-center justify-center" style="background-color:${color}22">
      <span class="${initialsSizeClass} font-bold" style="color:${color}" aria-hidden="true">${getInitials(chef.name)}</span>
    </div>`

  if (!chef.image) {
    // Không có ảnh — chỉ hiện avatar chữ cái, không render thẻ <img> nào cả
    return `<div class="w-full aspect-[3/4] relative overflow-hidden">${initialsFallback}</div>`
  }

  return `
    <div class="w-full aspect-[3/4] relative overflow-hidden bg-gray-200 dark:bg-bg-dark-2">
      <img src="${chef.image}" alt="${chef.name}" loading="lazy" class="w-full h-full object-cover"
           onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
      ${initialsFallback}
    </div>`
}

/**
 * renderChefCard — Tạo HTML cho 1 thẻ đầu bếp
 * @param {Object} chef
 * @param {number} index - dùng để xoay màu avatar
 */
export function renderChefCard(chef, index = 0) {
  const title = getLang() === 'en' ? (chef.title_en || chef.title) : chef.title
  return `
    <div class="bg-gray-100 dark:bg-bg-dark-2 rounded-lg overflow-hidden card-hover">
      ${renderChefMedia(chef, index, 'text-5xl')}
      <div class="p-4 text-left">
        <h4 class="text-text-dark dark:text-text-white font-semibold">${chef.name}</h4>
        <p class="text-text-muted text-sm">${title}</p>
      </div>
    </div>
  `
}

/**
 * renderChefCardFull — Thẻ đầu bếp chi tiết hơn (dùng cho trang chefs.html)
 */
export function renderChefCardFull(chef, index = 0) {
  const isEn = getLang() === 'en'
  const title = isEn ? (chef.title_en || chef.title) : chef.title
  const bio = isEn ? (chef.bio_en || chef.bio) : chef.bio
  const location = isEn ? (chef.location_en || chef.location) : chef.location
  const specialty = isEn ? (chef.specialty_en || chef.specialty) : chef.specialty
  return `
    <div class="bg-gray-100 dark:bg-bg-dark-2 rounded-lg overflow-hidden card-hover">
      ${renderChefMedia(chef, index, 'text-6xl')}
      <div class="p-5 text-left">
        <h4 class="text-text-dark dark:text-text-white font-semibold text-lg">${chef.name}</h4>
        <p class="text-primary text-sm font-medium mb-2">${title}</p>
        <p class="text-text-muted text-xs leading-relaxed mb-2">${bio}</p>
        <p class="text-text-muted text-xs">📍 ${location} · ${t('chefs.specialty')}: ${specialty}</p>
      </div>
    </div>
  `
}
