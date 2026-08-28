/* ============================================================
   about-page.js — Script riêng trang About Us
   Gồm 3 khối động, số đo bám theo FigmaAnalysis/figma-spec/10-10-about-us.md:
     1. Team Member  — thẻ 312x398, thanh trắng 88px, hover hiện social_icon
     2. Testimonials — slider nhận xét, 4 chấm chuyển slide
     3. Our Food Menu — 6 tab lọc theo mealType trong menu.json, 2 cột 648px
   ============================================================ */
import { fetchChefs } from './chefs.js'
import { getLang, t } from './i18n.js'
import { formatPrice } from './format.js'

/* ------------------------------------------------------------
   1. TEAM MEMBER
   Figma "Mark Henry" INSTANCE 312x398:
     · ảnh phủ kín thẻ
     · social_icon 4 ô 36x35 bo 2px, cách nhau 12px, lệch từ đỉnh 29px — mặc định ẩn
       (fb / twitter / pinterest nền #F2F2F2, youtube nền #FF9F0D)
     · thanh trắng 312x88 ở đáy: tên Helvetica Bold 20/28 #4F4F4F
                                 chức danh Helvetica Regular 16/24 #828282
------------------------------------------------------------ */

// Dùng lại đúng bộ icon đã lưu ở footer. Riêng youtube.svg vốn có màu #FF9F0D
// nên đặt trên nền cam sẽ chìm — lật thành trắng bằng filter cho đúng Figma
// (Figma: nền ô #FF9F0D, glyph #F2F2F2).
const TEAM_SOCIALS = [
  { name: 'Facebook',  file: 'facebook.svg',  w: 9,  h: 16, bg: '#F2F2F2', invert: false },
  { name: 'Twitter',   file: 'twitter.svg',   w: 16, h: 13, bg: '#F2F2F2', invert: false },
  { name: 'YouTube',   file: 'youtube.svg',   w: 18, h: 12, bg: '#FF9F0D', invert: true },
  { name: 'Pinterest', file: 'pinterest.svg', w: 16, h: 16, bg: '#F2F2F2', invert: false },
]

function socialIconsHTML(chefName) {
  return TEAM_SOCIALS.map(s => `
        <a href="#" aria-label="${s.name} — ${chefName}"
           class="w-9 h-[35px] rounded-[2px] flex items-center justify-center hover:opacity-80 transition-opacity"
           style="background:${s.bg}">
          <img loading="lazy" src="/assets/images/${s.file}" alt="" width="${s.w}" height="${s.h}"
               style="width:${s.w}px;height:${s.h}px${s.invert ? ';filter:brightness(0) invert(1)' : ''}" />
        </a>`).join('')
}

function teamCardHTML(chef) {
  const isEn = getLang() === 'en'
  const role = isEn ? (chef.title_en || chef.title) : chef.title
  const fallback = 'https://placehold.co/312x398/E9E9E9/828282?text=Chef'

  return `
    <article class="group relative h-[398px] overflow-hidden">
      <img src="${chef.image || fallback}" alt="${chef.name}" loading="lazy"
           class="absolute inset-0 w-full h-full object-cover"
           onerror="this.src='${fallback}'" />

      <!-- social_icon: Figma để HIDDEN, chỉ hiện khi rê chuột vào thẻ -->
      <div class="absolute right-5 top-[29px] flex flex-col gap-3
                  opacity-0 translate-y-2 transition-all duration-300
                  group-hover:opacity-100 group-hover:translate-y-0
                  focus-within:opacity-100 focus-within:translate-y-0">
        ${socialIconsHTML(chef.name)}
      </div>

      <!-- Rectangle 8788: thanh trắng 312x88 ở đáy thẻ -->
      <div class="absolute inset-x-0 bottom-0 h-[88px] bg-white dark:bg-[#1A1A1A]
                  shadow-[0_0_80px_0_rgba(205,205,205,0.25)]
                  flex flex-col items-center justify-center px-3 text-center">
        <h3 class="font-heading font-bold text-[20px] leading-[28px] text-[#4F4F4F] dark:text-white truncate max-w-full">${chef.name}</h3>
        <p class="mt-1 text-[16px] leading-[24px] text-[#828282] truncate max-w-full">${role}</p>
      </div>
    </article>`
}

async function renderTeam() {
  const box = document.getElementById('team-preview')
  if (!box) return
  const chefs = await fetchChefs()
  // Figma vẽ đúng 4 thẻ trên một hàng
  box.innerHTML = chefs.slice(0, 4).map(teamCardHTML).join('')
}

/* ------------------------------------------------------------
   2. TESTIMONIALS
   Figma chỉ vẽ 1 thẻ + 4 chấm, tức là slider 4 nhận xét.
   Nội dung lấy từ chefs.json (người thật) để không phải bịa dữ liệu:
   mỗi đầu bếp thành một lời nhận xét về nhà hàng.
------------------------------------------------------------ */
const TESTIMONIALS = [
  { key: 'about.quote1', stars: 4 },
  { key: 'about.quote2', stars: 5 },
  { key: 'about.quote3', stars: 4 },
  { key: 'about.quote4', stars: 5 },
]

const AUTOPLAY_MS = 6000

let testimonialChefs = []
let slideIndex = 0
let autoplayId = null

// Sao 24x24: đầy #FF9F0D, rỗng #E0E0E0 (Figma: 4 đầy + 1 rỗng)
function starsHTML(filled) {
  return Array.from({ length: 5 }, (_, i) => `
      <svg viewBox="0 0 24 24" class="w-6 h-6" fill="${i < filled ? '#FF9F0D' : '#E0E0E0'}" aria-hidden="true">
        <path d="M12 2.4 15 9.1l7.2.6-5.5 4.8 1.7 7.1L12 17.8 5.6 21.6l1.7-7.1L1.8 9.7 9 9.1 12 2.4Z"/>
      </svg>`).join('')
}

/** Một slide = avatar nhô lên + thẻ trắng, rộng đúng 100% khung nhìn. */
function slideHTML(item, chef, i, total) {
  const isEn = getLang() === 'en'
  const role = isEn ? (chef.title_en || chef.title) : chef.title
  const avatar = chef.image || '/assets/images/chef-1.jpg'

  return `
    <div class="w-full shrink-0 px-2" role="group" aria-roledescription="slide"
         aria-label="Nhận xét ${i + 1} trên ${total}">
      <div class="relative mx-auto w-full max-w-[868px]">
        <img src="${avatar}" alt="" loading="lazy"
             class="absolute left-1/2 -translate-x-1/2 -top-[67px] w-[133px] h-[133px] rounded-full object-cover z-10 bg-[#E9E9E9]" />

        <div class="relative overflow-hidden min-h-[451px] bg-white dark:bg-[#1A1A1A] shadow-[0_0_80px_0_rgba(205,205,205,0.25)] px-6 pt-[99px] pb-8 text-center">
          <img loading="lazy" src="/assets/images/unsplash_Ioq6qEibtbU.png" alt=""
               class="pointer-events-none absolute -right-[60px] -bottom-[60px] w-[502px] h-[580px] object-contain" />

          <img src="/assets/images/Quotes.svg" alt="" class="relative w-12 h-12 mx-auto" />

          <p class="relative mt-8 mx-auto max-w-[697px] text-[18px] leading-[26px] text-[#4F4F4F] dark:text-white/70">${t(item.key)}</p>

          <div class="relative mt-8 flex justify-center gap-2">${starsHTML(item.stars)}</div>

          <h3 class="relative mt-4 font-heading font-bold text-[24px] leading-[32px] text-[#333333] dark:text-white">${chef.name}</h3>
          <p class="relative mt-2 text-[16px] leading-[24px] text-[#828282]">${role}</p>
        </div>
      </div>
    </div>`
}

function renderTestimonial() {
  const track = document.getElementById('testimonial-track')
  if (!track || !testimonialChefs.length) return

  const total = TESTIMONIALS.length
  track.innerHTML = TESTIMONIALS.map((item, i) =>
    slideHTML(item, testimonialChefs[i % testimonialChefs.length], i, total)).join('')

  go(slideIndex)
}

/**
 * go — Dịch cả dải sang trái đúng index * 100%.
 * (next + length) % length lo được cả hai đầu chỉ bằng một dòng: từ slide 0
 * bấm lùi ra -1, cộng length thành 3, chia dư ra slide cuối — không cần if.
 */
function go(next) {
  const track = document.getElementById('testimonial-track')
  if (!track) return

  const slides = [...track.children]
  if (!slides.length) return

  slideIndex = (next + slides.length) % slides.length
  track.style.transform = `translateX(-${slideIndex * 100}%)`

  // inert cho slide đang ẩn: không có nó, người dùng nhấn Tab sẽ rơi vào
  // những slide vô hình nằm ngoài màn hình — lỗi tiếp cận phổ biến nhất
  // của mọi slider.
  slides.forEach((s, i) => s.toggleAttribute('inert', i !== slideIndex))

  renderDots(slides.length)
}

/** Chấm chỉ dẫn sinh từ SỐ SLIDE THẬT, không viết cứng trong HTML. */
function renderDots(total) {
  const box = document.getElementById('testimonial-dots')
  if (!box) return
  box.innerHTML = Array.from({ length: total }, (_, i) => `
      <button type="button" data-slide="${i}"
              aria-label="Xem nhận xét ${i + 1}"
              aria-current="${i === slideIndex}"
              class="w-[15px] h-4 rounded-full cursor-pointer transition-colors"
              style="background:${i === slideIndex ? '#FF9F0D' : 'rgba(255,159,13,.3)'}"></button>`).join('')
}

function startAutoplay() {
  stopAutoplay()
  // Tôn trọng prefers-reduced-motion: không tự chạy nếu người dùng đã tắt
  // hiệu ứng chuyển động ở hệ điều hành.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  autoplayId = setInterval(() => go(slideIndex + 1), AUTOPLAY_MS)
}

function stopAutoplay() {
  if (autoplayId) { clearInterval(autoplayId); autoplayId = null }
}

function initTestimonials() {
  const root = document.getElementById('testimonial-slider')
  if (!root) return

  document.getElementById('testimonial-prev')?.addEventListener('click', () => go(slideIndex - 1))
  document.getElementById('testimonial-next')?.addEventListener('click', () => go(slideIndex + 1))

  // Event delegation cho các chấm
  document.getElementById('testimonial-dots')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-slide]')
    if (btn) go(Number(btn.dataset.slide))
  })

  // Tự chạy nhưng biết dừng khi người dùng đang xem.
  // Cặp focusin/focusout là thứ thường bị quên nhất: ai đó đang dùng bàn phím
  // mà slide vẫn tự nhảy thì không đọc kịp.
  root.addEventListener('mouseenter', stopAutoplay)
  root.addEventListener('mouseleave', startAutoplay)
  root.addEventListener('focusin', stopAutoplay)
  root.addEventListener('focusout', startAutoplay)
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay()
  })

  startAutoplay()
}

/* ------------------------------------------------------------
   3. OUR FOOD MENU
   6 tab của Figma trùng khớp trường "mealType" có sẵn trong menu.json
   (Breakfast · Lunch · Dinner · Dessert · Drink · Snack) nên lọc thẳng
   theo trường đó, không cần thêm dữ liệu mới.
   Figma vẽ 8 món / tab, xếp 2 cột 648px.
------------------------------------------------------------ */
const MEAL_TABS = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drink', 'Snack']
const ITEMS_PER_TAB = 8

let menuData = []
let activeTab = MEAL_TABS[0]

function renderTabs() {
  const box = document.getElementById('menu-tabs')
  if (!box) return
  box.innerHTML = MEAL_TABS.map(tab => {
    const on = tab === activeTab
    return `
      <button type="button" data-tab="${tab}"
              class="relative pb-3 text-[20px] leading-[28px] cursor-pointer transition-colors
                     ${on ? 'text-[#FF9F0D]' : 'text-[#4F4F4F] dark:text-white/70 hover:text-[#FF9F0D]'}">
        ${t('about.tab' + tab)}
        ${on ? '<span class="absolute left-0 -bottom-px w-full h-0.5 bg-[#FF9F0D]"></span>' : ''}
      </button>`
  }).join('')
}

function renderMenuList() {
  const box = document.getElementById('menu-list')
  if (!box) return

  const isEn = getLang() === 'en'
  const items = menuData.filter(i => i.mealType === activeTab).slice(0, ITEMS_PER_TAB)

  if (!items.length) {
    box.innerHTML = `<p class="col-span-full py-10 text-center text-[16px] leading-[24px] text-[#828282]">${t('about.menuEmpty')}</p>`
    return
  }

  box.innerHTML = items.map((item) => {
    const name = isEn ? item.name : (item.name_vi || item.name)
    const desc = isEn ? (item.description_en || item.description) : (item.description || item.description_en)

    return `
      <a href="/src/pages/shop-details.html?id=${item.id}"
         class="block h-[135px] border-b border-[#E0E0E0] dark:border-white/15 group">
        <div class="flex items-start justify-between gap-6">
          <h3 class="font-heading font-bold text-[24px] leading-[32px] text-[#333333] dark:text-white group-hover:text-[#FF9F0D] transition-colors">${name}</h3>
          <span class="shrink-0 font-heading font-bold text-[24px] leading-[32px] text-[#FF9F0D]">${formatPrice(item.price)}</span>
        </div>
        <p class="mt-[7px] text-[16px] leading-[24px] text-[#4F4F4F] dark:text-white/70 line-clamp-1">${desc || ''}</p>
        <p class="mt-2 text-[16px] leading-[24px] text-[#828282]">${item.calories} CAL</p>
      </a>`
  }).join('')
}

function initFoodMenu() {
  const tabs = document.getElementById('menu-tabs')
  if (!tabs) return
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]')
    if (!btn) return
    activeTab = btn.dataset.tab
    renderTabs()
    renderMenuList()
  })
}

/* ------------------------------------------------------------
   Khởi tạo
------------------------------------------------------------ */
export async function initAboutPage() {
  initTestimonials()
  initFoodMenu()

  // Hai nguồn dữ liệu độc lập — tải song song cho nhanh
  const [chefs, menu] = await Promise.all([
    fetchChefs(),
    fetch('/src/data/menu.json')
      .then(res => {
        // fetch KHÔNG tự ném lỗi khi máy chủ trả về 404/500 — phải tự kiểm tra.
        // Trước đây chỗ này nuốt lỗi thành mảng rỗng nên khi file hỏng thì
        // khu "Our Food Menu" trống trơn mà không ai biết vì sao.
        if (!res.ok) throw new Error(`Máy chủ trả về ${res.status}`)
        return res.json()
      })
      .catch(err => { console.error('Không tải được menu.json:', err); return [] }),
  ])

  testimonialChefs = chefs
  menuData = menu

  await renderTeam()
  renderTestimonial()
  renderTabs()
  renderMenuList()
}

// Đổi ngôn ngữ thì vẽ lại toàn bộ phần nội dung động
window.addEventListener('languageChanged', () => {
  renderTeam()
  renderTestimonial()
  renderTabs()
  renderMenuList()
})
