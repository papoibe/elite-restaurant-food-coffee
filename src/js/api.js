/* ============================================================
   api.js — Kết nối REST API (TheMealDB)
   Fetch dữ liệu món ăn động cho section "Món Mới Khám Phá"
   API Doc: https://www.themealdb.com/api.php
   ============================================================ */

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1' // TheMealDB API v1 (miễn phí)

/**
 * fetchRandomMeals — Lấy danh sách món ngẫu nhiên
 * Gọi endpoint /random.php nhiều lần để lấy nhiều món
 * @param {number} count - Số lượng món cần lấy
 * @returns {Promise<Array>} Danh sách meal objects
 */
export async function fetchRandomMeals(count = 6) {
  try {
    // Gọi đồng thời nhiều request random bằng Promise.all
    const promises = Array.from({ length: count }, () =>
      fetch(`${BASE_URL}/random.php`).then(res => res.json())
    )
    const results = await Promise.all(promises)

    // Trích xuất meal từ mỗi response (mỗi response có 1 meal)
    return results
      .map(r => r.meals?.[0])
      .filter(Boolean) // Loại bỏ null/undefined
  } catch (error) {
    console.error('❌ Lỗi khi fetch random meals:', error)
    return []
  }
}

/**
 * fetchMealsByCategory — Lấy món theo danh mục
 * Endpoint: /filter.php?c={category}
 * @param {string} category - Tên danh mục (Beef, Chicken, Seafood, Dessert...)
 * @returns {Promise<Array>} Danh sách meal objects (chỉ có id, name, thumb)
 */
export async function fetchMealsByCategory(category) {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?c=${category}`)
    const data = await response.json()
    return data.meals || []
  } catch (error) {
    console.error(`❌ Lỗi khi fetch meals theo category "${category}":`, error)
    return []
  }
}

/**
 * fetchMealById — Lấy chi tiết đầy đủ 1 món theo ID
 * Endpoint: /lookup.php?i={id}
 * @param {string} id - ID của meal
 * @returns {Promise<Object|null>} Meal object đầy đủ
 */
export async function fetchMealById(id) {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`)
    const data = await response.json()
    return data.meals?.[0] || null
  } catch (error) {
    console.error(`❌ Lỗi khi fetch meal ID "${id}":`, error)
    return null
  }
}

/**
 * searchMeals — Tìm kiếm món theo tên
 * Endpoint: /search.php?s={query}
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách meal objects
 */
export async function searchMeals(query) {
  try {
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`)
    const data = await response.json()
    return data.meals || []
  } catch (error) {
    console.error(`❌ Lỗi khi search meals "${query}":`, error)
    return []
  }
}

/**
 * fetchCategories — Lấy danh sách tất cả danh mục
 * Endpoint: /categories.php
 * @returns {Promise<Array>} Danh sách category objects
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories.php`)
    const data = await response.json()
    return data.categories || []
  } catch (error) {
    console.error('❌ Lỗi khi fetch categories:', error)
    return []
  }
}

/**
 * renderMealCard — Tạo HTML card cho 1 món ăn (dùng cho section "Món Mới Khám Phá")
 * @param {Object} meal - Meal object từ API
 * @returns {string} HTML string
 */
export function renderMealCard(meal) {
  return `
    <div class="bg-white dark:bg-bg-dark-3 rounded-lg overflow-hidden card-hover shadow-card">
      <div class="relative overflow-hidden">
        <img
          src="${meal.strMealThumb}"
          alt="${meal.strMeal}"
          class="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
        <span class="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
          ${meal.strCategory || 'New'}
        </span>
      </div>
      <div class="p-4">
        <h3 class="font-heading font-semibold text-lg text-text-dark dark:text-text-white mb-1 truncate">
          ${meal.strMeal}
        </h3>
        <p class="text-text-muted text-sm mb-2">
          ${meal.strArea || 'International'} Cuisine
        </p>
      </div>
    </div>
  `
}
