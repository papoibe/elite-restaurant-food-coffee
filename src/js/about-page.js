/* ============================================================
   about-page.js — Script riêng trang About Us
   Gồm 3 khối động, số đo bám theo FigmaAnalysis/figma-spec/10-10-about-us.md:
     1. Team Member  — thẻ 312x398, thanh trắng 88px, hover hiện social_icon
     2. Testimonials — slider nhận xét, 4 chấm chuyển slide
     3. Our Food Menu — 6 tab lọc theo mealType trong menu.json, 2 cột 648px
   ============================================================ */
import { fetchChefs } from './chefs.js'
import { getLang, t } from './i18n.js'

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
          <img src="/assets/images/${s.file}" alt="" width="${s.w}" height="${s.h}"
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

let testimonialChefs = []
let activeSlide = 0

// Sao 24x24: đầy #FF9F0D, rỗng #E0E0E0 (Figma: 4 đầy + 1 rỗng)
function starsHTML(filled) {
  return Array.from({ length: 5 }, (_, i) => `
      <svg viewBox="0 0 24 24" class="w-6 h-6" fill="${i < filled ? '#FF9F0D' : '#E0E0E0'}" aria-hidden="true">
        <path d="M12 2.4 15 9.1l7.2.6-5.5 4.8 1.7 7.1L12 17.8 5.6 21.6l1.7-7.1L1.8 9.7 9 9.1 12 2.4Z"/>
      </svg>`).join('')
}

function renderTestimonial() {
  const quoteEl = document.getElementById('testimonial-quote')
  if (!quoteEl || !testimonialChefs.length) return

  const item = TESTIMONIALS[activeSlide]
  const chef = testimonialChefs[activeSlide % testimonialChefs.length]
  const isEn = getLang() === 'en'

  quoteEl.textContent = t(item.key)
  document.getElementById('testimonial-stars').innerHTML = starsHTML(item.stars)
  document.getElementById('testimonial-name').textContent = chef.name
  document.getElementById('testimonial-role').textContent = isEn ? (chef.title_en || chef.title) : chef.title

  const avatar = document.getElementById('testimonial-avatar')
  if (chef.image) avatar.src = chef.image

  // 4 chấm: chấm đang chọn #FF9F0D, còn lại #FF9F0D 30%
  document.getElementById('testimonial-dots').innerHTML = TESTIMONIALS.map((_, i) => `
      <button type="button" data-slide="${i}" aria-label="Nhận xét ${i + 1}"
              class="w-[15px] h-4 rounded-full cursor-pointer transition-colors"
              style="background:${i === activeSlide ? '#FF9F0D' : 'rgba(255,159,13,.3)'}"></button>`).join('')
}

function initTestimonials() {
  const dots = document.getElementById('testimonial-dots')
  if (!dots) return
  dots.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-slide]')
    if (!btn) return
    activeSlide = Number(btn.dataset.slide)
    renderTestimonial()
  })
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
          <span class="shrink-0 font-heading font-bold text-[24px] leading-[32px] text-[#FF9F0D]">${Math.round(Number(item.price))}$</span>
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
      .then(res => res.ok ? res.json() : [])
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
