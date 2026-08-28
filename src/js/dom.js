/* ============================================================
   dom.js — Xử lý tương tác DOM dùng chung
   Mobile Menu, Tabs, Lightbox, Scroll Animations
   ============================================================ */

/**
 * initMobileMenu — Đóng/mở menu hamburger trên mobile.
 *
 * Đổi giao diện là phải đổi CẢ trạng thái ARIA đi kèm. Chỉ bật/tắt class
 * `hidden` thì với trình đọc màn hình, menu vẫn đang đóng mãi mãi.
 * Vì vậy setOpen() chạm đủ 4 thứ, phục vụ 4 nhóm người dùng khác nhau:
 *   1. class hidden      → người nhìn thấy
 *   2. aria-expanded     → người dùng trình đọc màn hình
 *   3. aria-label        → người ra lệnh bằng giọng nói
 *   4. body overflow     → người dùng điện thoại (chặn nền cuộn sau lưng menu)
 *
 * Có 3 cách đóng vì người dùng không ai giống ai: phím ESC, bấm ra ngoài
 * vùng header, và khi màn hình phóng lên desktop.
 */
export function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn')
  const mobileMenu = document.getElementById('mobile-menu')

  if (!menuBtn || !mobileMenu) return

  const isVi = () => document.documentElement.lang !== 'en'

  function setOpen(open) {
    mobileMenu.classList.toggle('hidden', !open)
    menuBtn.setAttribute('aria-expanded', String(open))
    menuBtn.setAttribute(
      'aria-label',
      open ? (isVi() ? 'Đóng menu' : 'Close menu')
           : (isVi() ? 'Mở menu' : 'Open menu')
    )
    document.body.classList.toggle('overflow-hidden', open)

    const icon = menuBtn.querySelector('svg')
    if (icon) icon.classList.toggle('rotate-90', open)
  }

  const isOpen = () => menuBtn.getAttribute('aria-expanded') === 'true'

  // Trạng thái ban đầu: menu đóng
  menuBtn.setAttribute('aria-controls', 'mobile-menu')
  setOpen(false)

  menuBtn.addEventListener('click', () => setOpen(!isOpen()))

  // Cách đóng 1 — phím ESC. Kèm menuBtn.focus() để trả tiêu điểm về nút,
  // nếu không người dùng bàn phím sẽ bị "lạc" tiêu điểm ở giữa trang.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false)
      menuBtn.focus()
    }
  })

  // Cách đóng 2 — bấm ra ngoài vùng header
  document.addEventListener('click', (e) => {
    if (!isOpen()) return
    if (menuBtn.contains(e.target) || mobileMenu.contains(e.target)) return
    setOpen(false)
  })

  // Cách đóng 3 — màn hình phóng lên desktop (breakpoint lg của Tailwind)
  const desktop = window.matchMedia('(min-width: 1024px)')
  desktop.addEventListener('change', (e) => {
    if (e.matches && isOpen()) setOpen(false)
  })
}

/**
 * initHeaderOnScroll — Đổ bóng cho header khi trang đã cuộn xuống.
 *
 * Dùng IntersectionObserver chứ KHÔNG dùng sự kiện scroll: sự kiện scroll
 * bắn hàng trăm lần mỗi giây, còn IntersectionObserver chỉ báo đúng hai lần
 * — lúc #nav-sentinel rời khỏi màn hình và lúc nó quay lại.
 *
 * #nav-sentinel là một <div> rỗng đặt ngay đầu <body>. Khi nó trôi khỏi
 * viewport nghĩa là trang đã cuộn.
 */
export function initHeaderOnScroll() {
  const sentinel = document.getElementById('nav-sentinel')
  const header = document.querySelector('header')
  if (!sentinel || !header) return

  const observer = new IntersectionObserver(([entry]) => {
    const scrolled = !entry.isIntersecting
    header.classList.toggle('shadow-lg', scrolled)
    header.classList.toggle('shadow-black/30', scrolled)
  })

  observer.observe(sentinel)
}

/**
 * initTabs — Xử lý tab switching cho trang Menu
 * @param {string} containerSelector - CSS selector của container chứa tabs
 */
export function initTabs(containerSelector = '.tabs-container') {
  const container = document.querySelector(containerSelector)
  if (!container) return

  const tabs = container.querySelectorAll('[data-tab]')      // Các nút tab
  const panels = container.querySelectorAll('[data-panel]')  // Các panel nội dung

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.dataset.tab // Lấy giá trị data-tab

      // Xóa trạng thái active của tất cả tabs
      tabs.forEach(t => {
        t.classList.remove('bg-primary', 'text-text-white')
        t.classList.add('text-text-muted')
      })

      // Ẩn tất cả panels
      panels.forEach(p => p.classList.add('hidden'))

      // Active tab hiện tại
      tab.classList.add('bg-primary', 'text-text-white')
      tab.classList.remove('text-text-muted')

      // Hiện panel tương ứng
      const activePanel = container.querySelector(`[data-panel="${targetPanel}"]`)
      if (activePanel) activePanel.classList.remove('hidden')
    })
  })
}

/**
 * initLightbox — Phóng to ảnh khi click (dùng cho Gallery, Shop Details)
 * Tạo overlay modal hiển thị ảnh full-size
 */
export function initLightbox() {
  const lightboxImages = document.querySelectorAll('[data-lightbox]')
  if (!lightboxImages.length) return

  // Tạo modal overlay cho lightbox
  const overlay = document.createElement('div')
  overlay.id = 'lightbox-overlay'
  overlay.className = 'fixed inset-0 bg-black/80 z-50 hidden flex items-center justify-center cursor-pointer'
  overlay.innerHTML = `
    <img id="lightbox-img" class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" src="" alt="" />
    <button class="absolute top-6 right-6 text-white text-4xl font-bold hover:text-primary">&times;</button>
  `
  document.body.appendChild(overlay)

  // Click ảnh → mở lightbox
  lightboxImages.forEach(img => {
    img.addEventListener('click', () => {
      const lightboxImg = document.getElementById('lightbox-img')
      lightboxImg.src = img.src
      lightboxImg.alt = img.alt
      overlay.classList.remove('hidden')
      document.body.style.overflow = 'hidden' // Khóa scroll khi mở lightbox
    })
  })

  // Click overlay hoặc nút close → đóng lightbox
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.tagName === 'BUTTON') {
      overlay.classList.add('hidden')
      document.body.style.overflow = '' // Mở lại scroll
    }
  })

  // Phím Escape → đóng lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden')
      document.body.style.overflow = ''
    }
  })
}

/**
 * initScrollReveal — Hiệu ứng xuất hiện khi scroll vào viewport
 * Sử dụng Intersection Observer API thay vì thư viện AOS
 */
export function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]')
  if (!revealElements.length) return

  // Người bị rối loạn tiền đình có thể chóng mặt thật sự vì hiệu ứng trượt.
  // Hệ điều hành có sẵn công tắc, việc của mình là nghe theo: hiện thẳng
  // nội dung, không đặt opacity 0 và không animate.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach(el => { el.style.opacity = '1' })
    return
  }

  // Intersection Observer — theo dõi khi phần tử vào viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up')
        observer.unobserve(entry.target) // Chỉ animate 1 lần
      }
    })
  }, {
    threshold: 0.1,   // Trigger khi 10% phần tử hiện
    rootMargin: '0px 0px -50px 0px'
  })

  revealElements.forEach(el => {
    el.style.opacity = '0' // Ẩn ban đầu
    observer.observe(el)
  })
}

/**
 * initCounters — Đếm số chạy khi cuộn tới, dùng IntersectionObserver
 * Áp dụng cho phần tử có [data-count-to="420"] (và [data-count-suffix] tuỳ chọn, vd "+")
 * Tôn trọng prefers-reduced-motion: nếu user bật, hiện thẳng số cuối, không chạy animation.
 */
export function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]')
  if (!counters.length) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const animateCount = (el) => {
    const target = parseInt(el.dataset.countTo, 10) || 0
    const suffix = el.dataset.countSuffix || ''

    if (prefersReducedMotion) {
      el.textContent = target + suffix
      return
    }

    const duration = 1500 // ms
    const startTime = performance.now()

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.5 })

  counters.forEach(el => observer.observe(el))
}
