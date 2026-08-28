import { initScrollReveal, initCounters } from './dom.js'
import { formatPrice } from './format.js'
import { fetchChefs } from './chefs.js'
import { blogPostsData } from './blog/data.js'
import { getLang } from './i18n.js'

let allMenuItems = []

export async function initMenuPreview() {
  const gridContainer = document.getElementById('menu-items-grid')
  const featuredImg = document.getElementById('menu-featured-img')
  const tabButtons = document.querySelectorAll('.menu-tab-btn')

  if (!gridContainer) return

  try {
    const res = await fetch('/src/data/menu.json')
    if (!res.ok) throw new Error('Cannot load menu.json')
    allMenuItems = await res.json()
    renderMenuItems('Breakfast')
  } catch (error) {
    gridContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Failed to load menu data.</p>`
    return
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('text-[#FF9F0D]', 'font-bold')
        b.classList.add('text-[#828282]')
      })
      btn.classList.add('text-[#FF9F0D]', 'font-bold')
      btn.classList.remove('text-[#828282]')

      const selectedMeal = btn.dataset.meal
      renderMenuItems(selectedMeal)
    })
  })

  function renderMenuItems(mealType) {
    const lang = getLang ? getLang() : 'vi'

    let filtered = allMenuItems.filter(item => 
      (item.mealType && item.mealType.toLowerCase() === mealType.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(mealType.toLowerCase())) ||
      (Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase() === mealType.toLowerCase()))
    )

    if (filtered.length === 0) {
      filtered = allMenuItems.slice(0, 8)
    } else {
      filtered = filtered.slice(0, 8)
    }

    if (featuredImg && filtered.length > 0) {
      featuredImg.src = filtered[0].image
    }

    gridContainer.innerHTML = filtered.map(item => {
      const name = lang === 'vi' ? (item.name_vi || item.name) : item.name
      const desc = lang === 'vi' ? (item.description || item.description_en) : (item.description_en || item.description)

      return `
        <div class="flex items-center gap-4 group">
          <a href="/src/pages/shop-details.html?id=${item.id}" class="w-16 h-16 rounded-[4px] overflow-hidden shrink-0">
            <img loading="lazy" 
              src="${item.image}" 
              alt="${name}" 
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              onerror="this.src='https://placehold.co/64x64/222/fff?text=Food'" 
            />
          </a>
          <div class="flex-1 min-w-0 flex flex-col justify-between">
            <a href="/src/pages/shop-details.html?id=${item.id}" class="font-bold text-sm text-white hover:text-[#FF9F0D] transition truncate">
              ${name}
            </a>
            <p class="text-xs text-[#828282] my-1 line-clamp-1">
              ${desc || 'Delicious gourmet recipe with fresh ingredients.'}
            </p>
            <span class="text-[#FF9F0D] font-bold text-sm">${formatPrice(parseFloat(item.price))}</span>
          </div>
        </div>
      `
    }).join('')
  }
}

export function renderChefCard(chef) {
  return `
    <div class="relative w-[312px] h-[391px] rounded-[6px] overflow-hidden group bg-[#1a1a1a]">
      <img loading="lazy" 
        src="${chef.image}" 
        alt="${chef.name}" 
        class="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
        onerror="this.src='https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=500'" 
      />
      <div class="absolute top-[324px] left-0 w-[181px] h-[67px] bg-white rounded-bl-[6px] text-left px-5 flex flex-col justify-center shadow-md z-10">
        <h4 class="font-bold text-base text-[#333333] leading-tight truncate">${chef.name}</h4>
        <p class="text-xs text-[#828282] mt-0.5">${chef.role || chef.position || 'Chef'}</p>
      </div>
    </div>
  `
}

async function renderChefsPreview() {
  const container = document.getElementById('chefs-preview')
  if (!container) return

  try {
    const chefs = await fetchChefs()
    if (chefs && chefs.length) {
      container.innerHTML = chefs.slice(0, 4).map(renderChefCard).join('')
    }
  } catch (err) {
    console.error('Error loading chefs preview:', err)
  }
}

const testimonialsData = [
  {
    name: "Alamin Hasan",
    role: "Food Specialist",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    rating: 4,
    comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque diam pellentesque bibendum non dui volutpat fringilla bibendum. Urna, elit augue urna, vitae feugiat pretium donec id elementum. Ultrices mattis sed vitae mus risus. Lacus nisi, et ac dapibus sit eu velit in consequat."
  },
  {
    name: "Sarah Johnson",
    role: "Restaurant Critic",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    rating: 5,
    comment: "The cuisine here exceeded all my expectations! Every dish is fresh, exquisitely presented, and packed with delicate authentic flavors. Truly a five-star dining experience in every way."
  },
  {
    name: "Michael Chen",
    role: "Master Chef",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    rating: 5,
    comment: "Exceptional culinary techniques and high-quality organic ingredients. The warm-service delivery and attention to detail from the kitchen team are outstanding."
  },
  {
    name: "Emily Davis",
    role: "Culinary Blogger",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
    rating: 4,
    comment: "A wonderful ambiance combined with an impressive menu. The desserts and signature mocktails are absolute must-tries for anyone visiting!"
  }
]

let currentIndex = 0
let autoSlideTimer = null

export function initTestimonials() {
  const avatarEl = document.getElementById('testimonial-avatar')
  const commentEl = document.getElementById('testimonial-comment')
  const ratingEl = document.getElementById('testimonial-rating')
  const nameEl = document.getElementById('testimonial-name')
  const roleEl = document.getElementById('testimonial-role')
  const dotsContainer = document.getElementById('testimonial-dots')

  if (!avatarEl || !commentEl || !dotsContainer) return

  function renderDots() {
    dotsContainer.innerHTML = testimonialsData.map((_, i) => `
      <button 
        class="dot-btn w-3 h-3 rounded-full transition-colors duration-300 cursor-pointer ${i === currentIndex ? 'bg-[#FF9F0D]' : 'bg-[#FF9F0D]/30 hover:bg-[#FF9F0D]/60'}" 
        data-index="${i}" 
        aria-label="Go to slide ${i + 1}">
      </button>
    `).join('')

    dotsContainer.querySelectorAll('.dot-btn').forEach(dot => {
      dot.addEventListener('click', () => {
        currentIndex = parseInt(dot.dataset.index, 10)
        updateTestimonial()
        startAutoSlide()
      })
    })
  }

  function updateTestimonial() {
    const item = testimonialsData[currentIndex]

    avatarEl.style.opacity = '0'
    commentEl.style.opacity = '0'
    nameEl.style.opacity = '0'
    roleEl.style.opacity = '0'

    setTimeout(() => {
      avatarEl.src = item.avatar
      commentEl.textContent = item.comment
      nameEl.textContent = item.name
      roleEl.textContent = item.role

      let starsHtml = ''
      for (let s = 1; s <= 5; s++) {
        starsHtml += s <= item.rating ? '' : '<span class="text-gray-300"></span> '
      }
      ratingEl.innerHTML = starsHtml.trim()

      avatarEl.style.opacity = '1'
      commentEl.style.opacity = '1'
      nameEl.style.opacity = '1'
      roleEl.style.opacity = '1'

      dotsContainer.querySelectorAll('.dot-btn').forEach((dot, i) => {
        if (i === currentIndex) {
          dot.className = 'dot-btn w-3 h-3 rounded-full bg-[#FF9F0D] transition-colors duration-300 cursor-pointer'
        } else {
          dot.className = 'dot-btn w-3 h-3 rounded-full bg-[#FF9F0D]/30 hover:bg-[#FF9F0D]/60 transition-colors duration-300 cursor-pointer'
        }
      })
    }, 200)
  }

  function startAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer)
    autoSlideTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonialsData.length
      updateTestimonial()
    }, 5000)
  }

  renderDots()
  updateTestimonial()
  startAutoSlide()
}

function renderBlogPreview() {
  const container = document.getElementById('blog-preview')
  if (!container || !Array.isArray(blogPostsData)) return

  const lang = getLang ? getLang() : 'vi'

  container.innerHTML = blogPostsData.slice(0, 3).map(post => {
    const title = lang === 'vi' ? (post.title_vi || post.title) : post.title
    const date = lang === 'vi' ? (post.date_vi || post.date) : post.date

    return `
  <div class="border border-white/10 rounded-[4px] overflow-hidden group bg-[#1a1a1a]/30">
    <a href="/src/pages/blog-details.html?id=${post.id}" class="block overflow-hidden h-60">
      <img loading="lazy" src="${post.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${title}" onerror="this.src='https://placehold.co/400x240/222/fff?text=Blog'" />
    </a>
    <div class="p-6 space-y-3 text-left">
      <span class="text-primary text-xs font-medium">${date}</span>
      <h3 class="font-bold text-[24px] text-white hover:text-primary transition line-clamp-2 leading-tight">
        <a href="/src/pages/blog-details.html?id=${post.id}">${title}</a>
      </h3>
      <div class="flex justify-between items-center text-[16px] text-gray-400 pt-3">
        <a href="/src/pages/blog-details.html?id=${post.id}" class="hover:text-primary transition">Learn More</a>
        <div class="flex items-center gap-3 text-white">
          <button class="hover:text-[#FF9F0D] text-white transition-colors cursor-pointer" aria-label="Like">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 10v12"></path>
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"></path>
            </svg>
          </button>
          <button class="text-[#FF9F0D] hover:opacity-80 transition-opacity cursor-pointer" aria-label="Comment">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
          </button>
          <button class="hover:text-[#FF9F0D] text-white transition-colors cursor-pointer" aria-label="Share">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
`

    
  }).join('')
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal()
  initCounters()
  initMenuPreview()
  renderChefsPreview()
  initTestimonials()
  renderBlogPreview()
})

window.addEventListener('languageChanged', () => {
  initMenuPreview()
  renderChefsPreview()
  renderBlogPreview()
})