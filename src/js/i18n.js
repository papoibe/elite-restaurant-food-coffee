/* ============================================================
   i18n.js — Chuyển đổi ngôn ngữ Tiếng Việt / English cho toàn site
   Lưu lựa chọn vào localStorage, áp dụng qua thuộc tính data-i18n.
   Vanilla JS thuần, không dùng thư viện ngoài — đúng yêu cầu Đề 01.
   ============================================================ */

const LANG_KEY = 'elite-lang'

/**
 * getLang — Ngôn ngữ hiện tại. Mặc định "vi" nếu chưa từng chọn.
 */
export function getLang() {
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'vi'
}

/**
 * setLang — Lưu ngôn ngữ mới rồi tải lại trang.
 * Dùng reload (thay vì re-render tay từng phần) vì rất nhiều nội dung
 * trên trang là do JS khác render động (menu, chefs, blog, giỏ hàng...) —
 * reload đảm bảo áp dụng đúng ngôn ngữ cho toàn bộ trang, không sót chỗ nào.
 */
export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang === 'en' ? 'en' : 'vi')
  location.reload()
}

/**
 * dict — Từ điển tra cứu theo khoá dùng chung cho cả thuộc tính data-i18n
 * (áp dụng lên text tĩnh trong HTML) lẫn hàm t() (dùng trong chuỗi JS render động).
 */
const dict = {
  vi: {
    // Header / nav
    'nav.home': 'Trang chủ',
    'nav.menu': 'Thực đơn',
    'nav.blog': 'Blog',
    'nav.pages': 'Trang khác',
    'nav.about': 'Giới thiệu',
    'nav.shop': 'Cửa hàng',
    'nav.contact': 'Liên hệ',
    'nav.account': 'Tài khoản',
    'nav.theme': 'Đổi giao diện',
    'nav.cart': 'Giỏ hàng',
    'nav.menuBtn': 'Menu',
    'nav.langBtn': 'Đổi ngôn ngữ',
    'auth.signin': 'Đăng nhập',
    'auth.signup': 'Đăng ký',
    'auth.logout': 'Đăng xuất',
    'auth.hi': 'Chào',
    'auth.fillAll': 'Vui lòng điền đầy đủ thông tin!',
    'auth.passwordMin': 'Mật khẩu phải có ít nhất 6 ký tự!',
    'auth.invalidEmail': 'Email không hợp lệ!',
    'auth.emailTaken': 'Email này đã được đăng ký!',
    'auth.registerSuccess': 'Đăng ký thành công! Hãy đăng nhập.',
    'auth.fillEmailPassword': 'Vui lòng điền email và mật khẩu!',
    'auth.wrongCredentials': 'Email hoặc mật khẩu không đúng!',
    'auth.welcome': 'Chào mừng {name}!',
    'auth.passwordMismatch': 'Mật khẩu xác nhận không khớp!',

    // Footer
    'footer.supportTitle1': 'V',
    'footer.supportTitle2': 'ẫn cần chúng tôi hỗ trợ?',
    'footer.supportDesc': 'Đừng ngại để lại lời nhắn thông minh & hợp lý. Rất đơn giản thôi.',
    'footer.emailPlaceholder': 'Nhập email của bạn',
    'footer.subscribe': 'Đăng ký nhận tin',
    'footer.aboutTitle': 'Về chúng tôi.',
    'footer.aboutDesc': 'Khách hàng doanh nghiệp và du khách luôn tin tưởng lựa chọn dịch vụ đưa đón đáng tin cậy, an toàn và chuyên nghiệp tại nhiều thành phố lớn.',
    'footer.hours': 'Giờ mở cửa',
    'footer.hoursValue': 'Thứ 2 - Thứ 7 (8:00 - 18:00)',
    'footer.hoursClosed': 'Chủ nhật - Nghỉ',
    'footer.usefulLinks': 'Liên kết hữu ích',
    'footer.link.about': 'Giới thiệu',
    'footer.link.news': 'Tin tức',
    'footer.link.team': 'Đội ngũ',
    'footer.link.menu': 'Thực đơn',
    'footer.link.contact': 'Liên hệ',
    'footer.help': 'Trợ giúp?',
    'footer.link.faq': 'Câu hỏi thường gặp',
    'footer.link.terms': 'Điều khoản',
    'footer.link.reporting': 'Báo cáo',
    'footer.link.docs': 'Tài liệu',
    'footer.link.support': 'Chính sách hỗ trợ',
    'footer.link.privacy': 'Bảo mật',
    'footer.recentPost': 'Bài viết gần đây',
    'footer.copyright': 'Bản quyền © 2026 thuộc về Elite Restaurant. Đã đăng ký bảo hộ.',
    'footer.copyrightAyeman': 'Bản quyền © 2022 thuộc về Ayeman. Đã đăng ký bảo hộ.',
    'footer.aboutDesc2': 'Khách hàng doanh nghiệp và du khách luôn tin tưởng lựa chọn dịch vụ đưa đón đáng tin cậy, an toàn và chuyên nghiệp tại nhiều thành phố lớn trên thế giới.',
    'footer.hoursValue2': 'Thứ 2 - Thứ 7 (8:00 - 18:00)',
    'footer.link.partners': 'Đối tác',
    'footer.link.team2': 'Đội ngũ',

    // Buttons / common labels dùng lại nhiều nơi
    'common.addToCart': 'Thêm vào giỏ',
    'common.buyNow': 'Mua ngay',
    'common.seeMore': 'Xem thêm',
    'common.readMore': 'Đọc thêm',
    'common.shopNow': 'Mua ngay',
    'common.inStock': 'Còn hàng',
    'common.description': 'Mô tả',
    'common.reviews': 'Đánh giá',
    'common.compare': 'So sánh',
    'common.share': 'Chia sẻ',
    'common.addToWishlist': 'Thêm vào yêu thích',
    'common.wishlisted': 'Đã yêu thích',
    'common.category': 'Danh mục',
    'common.tag': 'Thẻ',
    'common.rating': 'Đánh giá',
    'common.review': 'lượt đánh giá',
    'common.prev': 'Trước',
    'common.next': 'Tiếp',
    'common.searchProduct': 'Tìm sản phẩm',
    'common.sortBy': 'Sắp xếp',
    'common.show': 'Hiển thị',
    'common.filterByPrice': 'Lọc theo giá',
    'common.filter': 'Lọc',
    'common.newest': 'Mới nhất',
    'common.priceLowHigh': 'Giá: Thấp đến cao',
    'common.priceHighLow': 'Giá: Cao đến thấp',
    'common.default': 'Mặc định',
    'common.similarProducts': 'Sản phẩm tương tự',
    'common.placeOrder': 'Đặt hàng',
    'common.comments': 'Bình luận',
    'common.reply': 'Trả lời',
    'common.tags': 'Thẻ:',
    'common.postComment': 'Đăng bình luận',
    'common.name': 'Họ tên',
    'common.email': 'Email',
    'common.writeComment': 'Viết bình luận',
    'common.cancel': 'Huỷ',
    'blog.commentingAs': 'Đang bình luận với tên: {name}',
    'blog.guestNotice': 'Bạn đang bình luận với tên khách {name}.',
    'blog.signinForRealName': 'Đăng nhập để bình luận bằng tên thật',
    'blog.replyingTo': 'Đang trả lời {name}',
    'blog.noComments': 'Chưa có bình luận nào. Hãy là người đầu tiên!',
    'blog.commentEmpty': 'Vui lòng nhập nội dung bình luận.',
    'blog.commentPosted': 'Đã đăng bình luận!',
    'blog.replyPosted': 'Đã đăng trả lời!',
    'common.remember': 'Ghi nhớ đăng nhập?',
    'common.forgotPassword': 'Quên mật khẩu?',
    'common.password': 'Mật khẩu',
    'common.confirmPassword': 'Xác nhận mật khẩu',
    'common.backToShop': 'Về trang cửa hàng',
    'common.notFound': 'Không tìm thấy sản phẩm!',

    // Toast / thông báo (JS)
    'toast.addedToCart': 'Đã thêm {qty}x "{name}" vào giỏ hàng!',
    'toast.addedToWishlist': 'Đã thêm "{name}" vào Yêu thích!',
    'toast.removedFromWishlist': 'Đã bỏ "{name}" khỏi Yêu thích.',
    'toast.copiedLink': 'Đã chép liên kết!',
    'toast.copyFailed': 'Không thể sao chép liên kết trên trình duyệt này.',
    'toast.orderSuccess': 'Đặt hàng thành công!',
    'toast.emptyCart': 'Giỏ hàng chưa có sản phẩm nào.',

    // Tiêu đề trang (breadcrumb / hero mỗi trang)
    'page.home.tab': 'Trang chủ',
    'page.menu.title': 'Thực Đơn Của Chúng Tôi',
    'page.menu.crumb': 'Thực đơn',
    'page.blog.title': 'Danh Sách Blog',
    'page.blog.crumb': 'Blog',
    'page.blogDetails.title': 'Chi Tiết Bài Viết',
    'page.blogDetails.crumb': 'Chi tiết bài viết',
    'page.about.title': 'Giới Thiệu',
    'page.about.crumb': 'Giới thiệu',
    'page.shop.title': 'Cửa Hàng',
    'page.shop.crumb': 'Cửa hàng',
    'page.shopDetails.title': 'Chi Tiết Sản Phẩm',
    'page.shopDetails.crumb': 'Chi tiết sản phẩm',
    'page.contact.title': 'Liên Hệ',
    'page.contact.crumb': 'Liên hệ',
    'page.faq.title': 'Câu Hỏi Thường Gặp',
    'page.faq.crumb': 'Câu hỏi thường gặp',
    'page.cart.title': 'Giỏ Hàng',
    'page.cart.crumb': 'Giỏ hàng',
    'page.checkout.title': 'Thanh Toán',
    'page.checkout.crumb': 'Thanh toán',
    'page.chefs.title': 'Đầu Bếp Của Chúng Tôi',
    'page.chefs.crumb': 'Đầu bếp',
    'page.coffeeShop.title': 'Quán Cà Phê',
    'page.coffeeShop.crumb': 'Quán cà phê',
    'page.signin.title': 'Đăng Nhập',
    'page.signup.title': 'Đăng Ký',
    'page.404.title': 'Không Tìm Thấy Trang',

    // Trang chủ
    'home.hero.tag': 'Tất Cả Về Món Ngon',
    'home.hero.title': '<span class="text-primary">Ngh</span>ệ Thuật Ẩm Thực<br/>Nhanh Mà Chất',
    'home.hero.desc': 'Hương vị Á Đông tinh tế hoà quyện cùng kỹ thuật chế biến hiện đại, phục vụ nhanh mà vẫn giữ trọn chất lượng từng món ăn.',
    'home.hero.cta': 'Xem thực đơn',
    'home.about.tag': 'Về chúng tôi',
    'home.about.title': 'Chúng Tôi Tạo Nên Món Ngon Tuyệt Vời',
    'home.about.desc': 'Từ nguyên liệu tuyển chọn mỗi sáng đến bàn tay chế biến tỉ mỉ của đội ngũ đầu bếp — mỗi món ăn tại Elite đều kể một câu chuyện riêng.',
    'home.foodCat.tag': 'Danh Mục Món Ăn',
    'home.foodCat.title': '<span class="text-primary">Ch</span>ọn Món Bạn Thích',
    'home.stats.chefs': 'Đầu Bếp Chuyên Nghiệp',
    'home.stats.items': 'Món Ăn',
    'home.stats.years': 'Năm Kinh Nghiệm',
    'home.stats.customers': 'Khách Hàng Hài Lòng',
    'home.menuPreview.tag': 'Chọn Món Bạn Yêu Thích',
    'home.menuPreview.title': '<span class="text-primary">Tr</span>ong Thực Đơn Của Chúng Tôi',
    'home.tab.breakfast': 'Bữa sáng',
    'home.tab.lunch': 'Bữa trưa',
    'home.tab.dinner': 'Bữa tối',
    'home.tab.dessert': 'Tráng miệng',
    'home.discover.tag': 'Khám Phá',
    'home.discover.title': '<span class="text-primary">Món</span> Mới Khám Phá',
    'home.discover.desc': 'Gợi ý món ăn từ khắp nơi trên thế giới — powered by TheMealDB API',
    'home.chefs.tag': 'Đầu Bếp',
    'home.chefs.title': '<span class="text-primary">Gặ</span>p Gỡ Đầu Bếp Của Chúng Tôi',
    'home.blog.tag': 'Bài Viết',
    'home.blog.title': '<span class="text-primary">Ti</span>n Tức & Blog Mới Nhất',
    'common.loading': 'Đang tải...',

    // Trang 404
    'page.404.error': 'Lỗi 404',
    'page.404.crumb': '404',
    'page.404.oops': 'Ôi! Có gì đó không ổn rồi',
    'page.404.desc': 'Không tìm thấy trang bạn cần! Chúng tôi sẽ khắc phục sớm nhất.<br/>Trong lúc chờ đợi, bạn có thể thử các gợi ý sau:',

    // Trang Coffee Shop
    'page.coffeeShop.tag': 'Cà Phê Của Chúng Tôi',
    'page.coffeeShop.heroTitle': '<span class="text-primary">Trải Nghiệm</span> Cà Phê<br/>Thượng Hạng',
    'page.coffeeShop.heroDesc': 'Tận hưởng hương vị cà phê thượng hạng từ những hạt cà phê được chọn lọc kỹ lưỡng, rang xay thủ công mỗi ngày.',
    'page.coffeeShop.viewMenu': 'Xem thực đơn đầy đủ',
    'about.team': 'Đội Ngũ Đầu Bếp',

    // Shop
    'shop.showingResults': 'Hiển thị {count} kết quả',
    'shop.noResults': 'Không tìm thấy sản phẩm phù hợp.',
    'shop.viewDetails': 'Xem chi tiết',
    'shop.decreaseQty': 'Giảm số lượng',
    'shop.increaseQty': 'Tăng số lượng',
    'shop.copyLink': 'Sao chép liên kết chia sẻ',
    'shop.belongsTo': 'Món thuộc nhóm',
    'shop.priced': 'giá',
    'shop.avgRating': 'Đánh giá trung bình',
    'shop.noReviewsYet': 'Món này chưa có bài đánh giá chi tiết nào — hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận!',
    'menu.emptyCategory': 'Chưa có món trong nhóm này.',
    'chefs.specialty': 'Sở trường',
    'home.discover.loadError': 'Không thể tải dữ liệu. Vui lòng thử lại.',
    'cart.empty': 'Giỏ hàng của bạn đang trống.',
    'cart.couponSuccess': 'Áp dụng mã giảm 10% thành công!',
    'cart.couponInvalid': 'Mã không hợp lệ!',
    'checkout.backToShopping': 'Quay lại mua sắm',
    'checkout.dish': 'Món ăn',
    'checkout.loginRequiredTitle': 'Vui lòng đăng nhập để tiếp tục',
    'checkout.loginRequiredDesc': 'Bạn cần đăng nhập vào tài khoản trước khi hoàn tất thanh toán.',
    'validate.required': 'Vui lòng nhập thông tin này',
    'validate.email': 'Email không hợp lệ',
    'validate.phone': 'Số điện thoại không hợp lệ',
    'validate.minLength': 'Tối thiểu {min} ký tự',
    'validate.min': 'Giá trị tối thiểu là {min}',
    'validate.max': 'Giá trị tối đa là {max}',
    'validate.success': 'Thành công!',
    'auth.emailPlaceholder': 'Nhập email của bạn',
    'auth.passwordPlaceholder': 'Nhập mật khẩu',
    'auth.namePlaceholder': 'Nhập họ tên của bạn',
    'auth.minCharsPlaceholder': 'Tối thiểu 6 ký tự',
    'auth.reenterPlaceholder': 'Nhập lại mật khẩu',
    'auth.noAccount': 'Chưa có tài khoản?',
    'auth.signupHere': 'Đăng ký ngay',
    'auth.haveAccount': 'Đã có tài khoản?',
    'auth.signinHere': 'Đăng nhập ngay',
  },

  en: {
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.blog': 'Blog',
    'nav.pages': 'Pages',
    'nav.about': 'About',
    'nav.shop': 'Shop',
    'nav.contact': 'Contact',
    'nav.account': 'Account',
    'nav.theme': 'Toggle theme',
    'nav.cart': 'Cart',
    'nav.menuBtn': 'Menu',
    'nav.langBtn': 'Switch language',
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Log out',
    'auth.hi': 'Hi',
    'auth.fillAll': 'Please fill in all fields!',
    'auth.passwordMin': 'Password must be at least 6 characters!',
    'auth.invalidEmail': 'Invalid email address!',
    'auth.emailTaken': 'This email is already registered!',
    'auth.registerSuccess': 'Registered successfully! Please sign in.',
    'auth.fillEmailPassword': 'Please enter your email and password!',
    'auth.wrongCredentials': 'Incorrect email or password!',
    'auth.welcome': 'Welcome {name}!',
    'auth.passwordMismatch': 'Password confirmation does not match!',

    'footer.supportTitle1': 'St',
    'footer.supportTitle2': 'ill You Need Our Support ?',
    'footer.supportDesc': "Don't wait make a smart & logical quote here. Its pretty easy.",
    'footer.emailPlaceholder': 'Enter Your Email',
    'footer.subscribe': 'Subscribe Now',
    'footer.aboutTitle': 'About Us.',
    'footer.aboutDesc': 'Corporate clients and leisure travelers have been relying on Groundlink for dependable, safe, and professional chauffeured car service in major cities across the World.',
    'footer.hours': 'Opening Hours',
    'footer.hoursValue': 'Mon - Sat (8:00 - 6:00)',
    'footer.hoursClosed': 'Sunday - Closed',
    'footer.usefulLinks': 'Useful Links',
    'footer.link.about': 'About',
    'footer.link.news': 'News',
    'footer.link.team': 'Team',
    'footer.link.menu': 'Menu',
    'footer.link.contact': 'Contact',
    'footer.help': 'Help?',
    'footer.link.faq': 'FAQ',
    'footer.link.terms': 'Term & Condition',
    'footer.link.reporting': 'Reporting',
    'footer.link.docs': 'Documentation',
    'footer.link.support': 'Support Policy',
    'footer.link.privacy': 'Privacy',
    'footer.recentPost': 'Recent Post',
    'footer.copyright': 'Copyright © 2026 by Elite Restaurant. All Rights Reserved.',
    'footer.copyrightAyeman': 'Copyright © 2022 by Ayeman. All Rights Reserved.',
    'footer.aboutDesc2': 'Corporate clients and leisure travelers have been relying on Groundlink for dependable, safe, and professional chauffeured car service in major cities across the World.',
    'footer.hoursValue2': 'Mon - Sat (8.00 - 6.00)',
    'footer.link.partners': 'Partners',
    'footer.link.team2': 'Team',

    'common.addToCart': 'Add to Cart',
    'common.buyNow': 'Buy Now',
    'common.seeMore': 'See More',
    'common.readMore': 'Read More',
    'common.shopNow': 'Shop Now',
    'common.inStock': 'In stock',
    'common.description': 'Description',
    'common.reviews': 'Reviews',
    'common.compare': 'Compare',
    'common.share': 'Share',
    'common.addToWishlist': 'Add to Wishlist',
    'common.wishlisted': 'Wishlisted',
    'common.category': 'Category',
    'common.tag': 'Tag',
    'common.rating': 'Rating',
    'common.review': 'Review',
    'common.prev': 'Prev',
    'common.next': 'Next',
    'common.searchProduct': 'Search Product',
    'common.sortBy': 'Sort By',
    'common.show': 'Show',
    'common.filterByPrice': 'Filter By Price',
    'common.filter': 'Filter',
    'common.newest': 'Newest',
    'common.priceLowHigh': 'Price: Low to High',
    'common.priceHighLow': 'Price: High to Low',
    'common.default': 'Default',
    'common.similarProducts': 'Similar Products',
    'common.placeOrder': 'Place an order',
    'common.comments': 'Comments',
    'common.reply': 'Reply',
    'common.tags': 'Tags:',
    'common.postComment': 'Post comment',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.writeComment': 'Write a comment',
    'common.cancel': 'Cancel',
    'blog.commentingAs': 'Commenting as: {name}',
    'blog.guestNotice': 'You are commenting as guest {name}.',
    'blog.signinForRealName': 'Sign in to comment with your real name',
    'blog.replyingTo': 'Replying to {name}',
    'blog.noComments': 'No comments yet. Be the first!',
    'blog.commentEmpty': 'Please write a comment.',
    'blog.commentPosted': 'Comment posted!',
    'blog.replyPosted': 'Reply posted!',
    'common.remember': 'Remember me?',
    'common.forgotPassword': 'Forgot password?',
    'common.password': 'Password',
    'common.confirmPassword': 'Confirm Password',
    'common.backToShop': 'Back to Shop',
    'common.notFound': 'Product not found!',

    'toast.addedToCart': 'Added {qty}x "{name}" to cart!',
    'toast.addedToWishlist': 'Added "{name}" to Wishlist!',
    'toast.removedFromWishlist': 'Removed "{name}" from Wishlist.',
    'toast.copiedLink': 'Link copied!',
    'toast.copyFailed': 'Unable to copy the link in this browser.',
    'toast.orderSuccess': 'Order placed successfully!',
    'toast.emptyCart': 'Your cart is empty.',

    'page.home.tab': 'Home',
    'page.menu.title': 'Our Menu',
    'page.menu.crumb': 'Menu',
    'page.blog.title': 'Blog List',
    'page.blog.crumb': 'Blog',
    'page.blogDetails.title': 'Blog Details',
    'page.blogDetails.crumb': 'Blog details',
    'page.about.title': 'About Us',
    'page.about.crumb': 'About',
    'page.shop.title': 'Our Shop',
    'page.shop.crumb': 'Shop',
    'page.shopDetails.title': 'Shop Details',
    'page.shopDetails.crumb': 'Shop details',
    'page.contact.title': 'Contact Us',
    'page.contact.crumb': 'Contact',
    'page.faq.title': 'FAQ Page',
    'page.faq.crumb': 'FAQ',
    'page.cart.title': 'Shopping Cart',
    'page.cart.crumb': 'Cart',
    'page.checkout.title': 'Checkout',
    'page.checkout.crumb': 'Checkout',
    'page.chefs.title': 'Our Chefs',
    'page.chefs.crumb': 'Chefs',
    'page.coffeeShop.title': 'Coffee Shop',
    'page.coffeeShop.crumb': 'Coffee Shop',
    'page.signin.title': 'Sign In',
    'page.signup.title': 'Sign Up',
    'page.404.title': 'Page Not Found',

    // Home page
    'home.hero.tag': "Its all about Good Food",
    'home.hero.title': '<span class="text-primary">Th</span>e Art of speed<br/>food Quality',
    'home.hero.desc': 'Sophisticated Asian flavours meet modern cooking technique, served fast without ever compromising on quality.',
    'home.hero.cta': 'See Menu',
    'home.about.tag': 'About us',
    'home.about.title': 'We Create the best foody product',
    'home.about.desc': "From ingredients hand-picked every morning to the meticulous craft of our chefs — every dish at Elite tells its own story.",
    'home.foodCat.tag': 'Food Category',
    'home.foodCat.title': '<span class="text-primary">Ch</span>oose Food Item',
    'home.stats.chefs': 'Professional Chefs',
    'home.stats.items': 'Items Of Food',
    'home.stats.years': 'Years Of Experienced',
    'home.stats.customers': 'Happy Customers',
    'home.menuPreview.tag': 'Choose & Pick',
    'home.menuPreview.title': '<span class="text-primary">Fr</span>om Our Menu',
    'home.tab.breakfast': 'Breakfast',
    'home.tab.lunch': 'Lunch',
    'home.tab.dinner': 'Dinner',
    'home.tab.dessert': 'Dessert',
    'home.discover.tag': 'Discover',
    'home.discover.title': '<span class="text-primary">New</span> Dishes To Discover',
    'home.discover.desc': 'Dish ideas from around the world — powered by TheMealDB API',
    'home.chefs.tag': 'Chefs',
    'home.chefs.title': '<span class="text-primary">Me</span>et Our Chef',
    'home.blog.tag': 'Blog Post',
    'home.blog.title': '<span class="text-primary">La</span>test News & Blog',
    'common.loading': 'Loading...',

    // 404 page
    'page.404.error': 'Error 404',
    'page.404.crumb': '404',
    'page.404.oops': 'Oops! Look likes something going wrong',
    'page.404.desc': "Page Cannot be found! we'll have it figured out in no time.<br/>Meanwhile, check out these fresh ideas:",

    // Coffee Shop page
    'page.coffeeShop.tag': 'Our Coffee',
    'page.coffeeShop.heroTitle': '<span class="text-primary">Premium</span> Coffee<br/>Experience',
    'page.coffeeShop.heroDesc': 'Enjoy premium coffee flavour from carefully selected beans, hand-roasted every day.',
    'page.coffeeShop.viewMenu': 'View Full Menu',
    'about.team': 'Team Member',

    // Shop
    'shop.showingResults': 'Showing {count} results',
    'shop.noResults': 'No products found matching your search.',
    'shop.viewDetails': 'View details',
    'shop.decreaseQty': 'Decrease quantity',
    'shop.increaseQty': 'Increase quantity',
    'shop.copyLink': 'Copy share link',
    'shop.belongsTo': 'This dish belongs to',
    'shop.priced': 'priced at',
    'shop.avgRating': 'Average rating',
    'shop.noReviewsYet': "This dish has no detailed reviews yet — be the first to try it and share your thoughts!",
    'menu.emptyCategory': 'No dishes in this category yet.',
    'chefs.specialty': 'Specialty',
    'home.discover.loadError': 'Unable to load data. Please try again.',
    'cart.empty': 'Your cart is empty.',
    'cart.couponSuccess': '10% discount code applied successfully!',
    'cart.couponInvalid': 'Invalid code!',
    'checkout.backToShopping': 'Back to shopping',
    'checkout.dish': 'Dish',
    'checkout.loginRequiredTitle': 'Please Sign In to Continue',
    'checkout.loginRequiredDesc': 'You need to sign in to your account before completing payment.',
    'validate.required': 'Please fill in this field',
    'validate.email': 'Invalid email address',
    'validate.phone': 'Invalid phone number',
    'validate.minLength': 'Minimum {min} characters',
    'validate.min': 'Minimum value is {min}',
    'validate.max': 'Maximum value is {max}',
    'validate.success': 'Success!',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.namePlaceholder': 'Enter your name',
    'auth.minCharsPlaceholder': 'Min 6 characters',
    'auth.reenterPlaceholder': 'Re-enter password',
    'auth.noAccount': "Don't have an account?",
    'auth.signupHere': 'Sign Up here',
    'auth.haveAccount': 'Already have an account?',
    'auth.signinHere': 'Sign In here',
  },
}

/**
 * t — Tra cứu chuỗi dịch theo khoá, dùng trong JS render động (template string).
 * @param {string} key
 * @param {Record<string,string|number>} [vars] - thay thế {placeholder} trong chuỗi
 */
export function t(key, vars) {
  const lang = getLang()
  let str = dict[lang]?.[key] ?? dict.vi[key] ?? key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v)
    })
  }
  return str
}

/**
 * applyStaticTranslations — Duyệt toàn bộ [data-i18n] trong DOM và gán textContent
 * theo ngôn ngữ hiện tại. Hỗ trợ thêm [data-i18n-placeholder] cho input/textarea.
 * Chạy 1 lần lúc DOMContentLoaded — vì chuyển ngôn ngữ luôn reload trang (xem setLang).
 */
export function applyStaticTranslations() {
  const lang = getLang()
  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'vi')

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')
    if (dict[lang]?.[key] !== undefined) el.textContent = dict[lang][key]
  })
  // data-i18n-html — dùng cho tiêu đề có span highlight màu (vd 2 ký tự đầu tô màu primary)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html')
    if (dict[lang]?.[key] !== undefined) el.innerHTML = dict[lang][key]
  })
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder')
    if (dict[lang]?.[key] !== undefined) el.setAttribute('placeholder', dict[lang][key])
  })
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label')
    if (dict[lang]?.[key] !== undefined) el.setAttribute('aria-label', dict[lang][key])
  })
}

/**
 * initLangToggle — Gắn nút chuyển ngôn ngữ trong header (#lang-toggle).
 * Hiển thị chữ của ngôn ngữ SẼ chuyển sang khi bấm (giống pattern nút dark-mode).
 */
export function initLangToggle() {
  const btn = document.getElementById('lang-toggle')
  if (!btn) return

  const current = getLang()
  btn.textContent = current === 'vi' ? 'EN' : 'VI'
  btn.setAttribute('aria-label', t('nav.langBtn'))
  btn.setAttribute('title', current === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt')

  btn.addEventListener('click', () => {
    setLang(current === 'vi' ? 'en' : 'vi')
  })
}
