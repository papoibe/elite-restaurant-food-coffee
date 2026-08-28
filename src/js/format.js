/* ============================================================
   format.js — Định dạng số và tiền tệ theo ngôn ngữ đang chọn
   ------------------------------------------------------------
   Trước đây 16 chỗ trong dự án tự nối chuỗi kiểu `$${price.toFixed(2)}`.
   Cách đó có 3 vấn đề:
     · Dấu phân cách nghìn phải tự viết hàm chèn — rất dễ sai ở số âm/số lẻ
     · Ký hiệu tiền tệ cứng "$" dù trang đang ở tiếng Việt
     · Vị trí ký hiệu khác nhau theo ngôn ngữ ($38.00 vs 950.000 ₫)
   Intl.NumberFormat lo hết cả ba, là API sẵn có của trình duyệt.
   ============================================================ */
import { getLang } from './i18n.js'

// Giá trong menu.json lưu theo USD. Tiếng Việt quy đổi sang VND để hiển thị
// cho đúng bối cảnh nhà hàng tại Việt Nam. Đặt tên hằng số rõ ràng thay vì
// rải số 25000 khắp nơi — sau này đổi tỉ giá chỉ sửa một chỗ.
const USD_TO_VND = 25000

// Tạo formatter một lần rồi dùng lại: khởi tạo Intl.NumberFormat khá nặng,
// gọi mới trong vòng lặp render danh sách sẽ chậm thấy rõ.
const formatters = {
  vi: new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }),
  en: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }),
}

/**
 * formatPrice — Đổi số tiền (USD trong dữ liệu) thành chuỗi hiển thị.
 * @param {number|string} usd - giá gốc theo USD, ví dụ 38 hoặc "38.0"
 * @returns {string} "950.000 ₫" (vi) hoặc "$38.00" (en)
 */
export function formatPrice(usd) {
  const value = Number(usd) || 0
  const lang = getLang() === 'en' ? 'en' : 'vi'
  return lang === 'vi'
    ? formatters.vi.format(value * USD_TO_VND)
    : formatters.en.format(value)
}

/**
 * formatNumber — Định dạng số thường (số lượng, calo…) theo ngôn ngữ.
 * @param {number|string} n
 * @returns {string} "1.234" (vi) hoặc "1,234" (en)
 */
export function formatNumber(n) {
  const lang = getLang() === 'en' ? 'en-US' : 'vi-VN'
  return new Intl.NumberFormat(lang).format(Number(n) || 0)
}
