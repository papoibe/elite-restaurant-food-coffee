# Savoria — ĐỀ 01: Website nhà hàng & quán cà phê (E-commerce)

> Đây là README kỹ thuật của mã nguồn.
> **Thông tin nộp bài đầy đủ** (thành viên, phân công, link deploy, ảnh chụp ba
> breakpoint) nằm ở [README gốc của repo](../README.md).

> **Môn học:** THIẾT KẾ WEB (INTE03010) — ĐH Mở TP.HCM  
> **Sản phẩm:** <https://elite-restaurant-food-coffee.vercel.app>  
> **Figma:** [Elite — Food Restaurant & Coffee Free Template](https://www.figma.com/design/8SfLwyfu5cKVMFrUN3ETvm)

## Thành viên nhóm (Phân công 6-5-5)

| STT | Họ và Tên | Vai trò | Phụ trách chính (Trang) |
|-----|-----------|---------|-----------------|
| 1 | Thịnh | Nhóm trưởng | **6 Trang:** Home, Menu, About, Chefs, Coffee Shop, Contact |
| 2 | Kiệt | Thành viên | **5 Trang:** Shop List, Shop Details, Blog, Blog Details, FAQ |
| 3 | Thuận | Thành viên | **5 Trang:** Cart, Checkout, Sign In, Sign Up, 404 |

## Hướng dẫn cài đặt & Chạy dự án

```bash
# 1. Clone dự án về máy
git clone <đường-dẫn-repo>
cd elite-restaurant

# 2. Cài đặt dependencies (Chỉ làm lần đầu)
npm install

# 3. Chạy dev server
npm run dev
# Mở trình duyệt tại: http://localhost:5173/

# 4. Build production
npm run build
```

## Công nghệ sử dụng

- **HTML5** (Semantic)
- **Tailwind CSS v4** (via Vite plugin)
- **JavaScript ES6+** (Modules)
- **Vite** (Build tool)
- **TheMealDB API** (REST API công khai)

## Sơ đồ cấu trúc dự án

```text
elite-restaurant/
├── public/                 ← Nơi chứa tất cả tài nguyên tĩnh (không qua build)
│   ├── assets/
│   │   ├── images/         ← HÌNH ẢNH CẮT TỪ FIGMA ĐỂ Ở ĐÂY
│   │   └── fonts/          ← Các file font chữ đặc biệt
│   ├── favicon.svg         
│   └── icons.svg           
├── src/                    ← Nơi chứa source code chính
│   ├── css/
│   │   └── main.css        ← File CSS dùng chung (Tailwind config & Design tokens)
│   ├── js/
│   │   ├── main.js         ← Entry point JS (Import CSS, chạy các hàm khởi tạo)
│   │   ├── dom.js          ← Logic UI (Menu, Tabs, Lightbox)
│   │   ├── api.js          ← Logic gọi API TheMealDB
│   │   ├── cart.js         ← Logic xử lý giỏ hàng LocalStorage
│   │   ├── theme.js        ← Logic Dark/Light mode
│   │   └── validate.js     ← Logic validate form
│   └── pages/              ← Chứa 15 trang con (MỖI NGƯỜI LÀM FILE CỦA MÌNH TẠI ĐÂY)
│       ├── about.html      ← Thịnh
│       ├── cart.html       ← Thuận
│       ├── shop-list.html  ← Kiệt
│       └── ... 
├── index.html              ← Trang chủ chính (Thịnh) - chứa Header/Footer mẫu
├── package.json            
├── vite.config.js          ← Cấu hình Vite (Multi-page 16 trang)
└── README.md               
```

##  Hướng dẫn dành cho Team

### 1. Quy tắc làm việc với Page
- **Của ai nấy làm:** Tuyệt đối chỉ viết code trên các trang `.html` mà mình được phân công.
- **Copy Header & Footer:** Mở file `index.html`, copy phần thẻ `<header>...</header>` và `<footer>...</footer>` dán vào các trang phụ của mình.

### 2. Quy tắc CSS & JavaScript
- Dùng **Tailwind CSS v4** cho UI. Sử dụng màu được cấu hình sẵn (`bg-bg-dark`, `text-primary`, `btn-primary`,...).
- Hỗ trợ **Dark Mode** bằng cách thêm class `dark:bg-...` và `dark:text-...`.
- JS dùng chung ở `src/js/` (`dom.js`, `validate.js`). Nhớ `<script type="module" src="/src/js/main.js"></script>` ở cuối file.

### 3. Tài nguyên tĩnh (Hình ảnh)
- Hình ảnh/Icon xuất từ Figma **phải** lưu vào `public/assets/images/`.
- Khi dùng trong HTML: `<img src="/assets/images/ten-hinh.jpg">`.

### 4. Quy trình Git (Rất quan trọng)
**KHÔNG PUSH TRỰC TIẾP LÊN MAIN.** Hãy tạo nhánh riêng của bạn:

```bash
# Lấy code mới nhất
git checkout main
git pull origin main

# Tạo nhánh riêng và làm việc trên đó
git checkout -b nhanh-cua-kiet

# ... code và lưu file ...

# Add và Commit
git add .
git commit -m "Dựng xong UI trang abc"

# Push nhánh riêng lên Github
git push origin nhanh-cua-kiet
```
*Sau khi push, báo cho Nhóm trưởng (Thịnh) để review và merge vào main.*
