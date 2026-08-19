/* ============================================================
   dom.js — Xử lý tương tác DOM dùng chung
   Mobile Menu, Tabs, Lightbox, Scroll Animations
   ============================================================ */

/**
 * initMobileMenu — Toggle hamburger menu cho responsive mobile
 * Tìm button #mobile-menu-btn và nav #mobile-menu, toggle class 'hidden'
 */
export function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn')
  const mobileMenu = document.getElementById('mobile-menu')

  if (!menuBtn || !mobileMenu) return

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden') // Toggle hiển thị menu
    // Toggle icon hamburger ↔ close
    const icon = menuBtn.querySelector('svg')
    if (icon) {
      icon.classList.toggle('rotate-90')
    }
  })
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
