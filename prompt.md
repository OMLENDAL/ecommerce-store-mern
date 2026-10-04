# 🛒 Standard E-Commerce Store — Project Prompt

## 📌 Project Overview

Build a **full-stack E-Commerce Store** web application that allows users to browse products,
manage a shopping cart, place orders, and make payments. The admin panel should allow managing
products, categories, orders, and users.

---

## 🎯 Objectives

- Provide a seamless online shopping experience
- Implement secure user authentication and authorization
- Enable product management for admins
- Integrate a payment gateway for order processing
- Ensure responsive design for mobile and desktop

---

## 👥 User Roles

| Role      | Permissions                                             |
|-----------|---------------------------------------------------------|
| **Guest** | Browse products, view details, register/login           |
| **User**  | Add to cart, place orders, view order history, manage profile |
| **Admin** | Full CRUD on products/categories, manage users & orders |

---

## 🗂️ Core Features

### 🔐 Authentication & Authorization
- User registration with email verification
- Login / Logout (JWT-based or Session-based)
- Password reset via email (OTP or link)
- Role-based access control (User / Admin)
- OAuth login (Google) — optional

### 🏠 Homepage
- Hero banner / carousel with promotions
- Featured products section
- New arrivals section
- Category grid navigation
- Footer with links, newsletter subscription

### 📦 Product Module
- Product listing with grid/list view toggle
- Search bar with auto-suggestions
- Filters: Category, Price range, Rating, Brand
- Sorting: Price (Low-High / High-Low), Newest, Popularity
- Pagination or Infinite scroll
- Product detail page:
  - Multiple images with zoom
  - Product title, description, price, discount badge
  - Stock availability
  - Size / Color / Variant selector
  - Add to Cart / Buy Now button
  - Star ratings and user reviews
  - Related products section

### 🛒 Cart Module
- Add / Remove / Update quantity of items
- Real-time price calculation
- Apply coupon/promo codes
- Cart persistence (even after page refresh)
- Mini cart dropdown in navbar

### 💳 Checkout Module
- Delivery address form (Add / Select saved address)
- Order summary review
- Payment options:
  - Credit / Debit Card (Stripe or Razorpay)
  - UPI / Net Banking (India)
  - Cash on Delivery (COD)
- Order confirmation with order ID
- Confirmation email sent to user

### 📋 Order Management (User)
- View all past orders with status
- Order status tracking: Pending → Processing → Shipped → Delivered
- Cancel order (if not shipped)
- Download invoice as PDF
- Return / Refund request

### ⭐ Reviews & Ratings
- Users can rate and review purchased products only
- Star rating (1–5)
- Helpful / Not Helpful votes on reviews
- Admin can moderate/delete reviews

### ❤️ Wishlist
- Add / Remove products from wishlist
- Move wishlist item to cart

### 🔔 Notifications
- In-app notifications for order updates
- Email notifications for key events
- Optionally: Push notifications (PWA)

---

## 🛠️ Admin Panel

### Dashboard
- Total sales, orders, users, revenue — KPI cards
- Revenue chart (weekly/monthly)
- Recent orders table
- Low stock alerts

### Product Management
- Add / Edit / Delete products
- Upload multiple images (Cloudinary or S3)
- Set price, discount, stock quantity, category
- Mark as featured / active / inactive

### Category Management
- Create nested categories (e.g., Electronics > Mobiles)
- Upload category image
- Enable/Disable categories

### Order Management
- View and filter all orders
- Update order status
- View order details and customer info
- Generate and send invoice

### User Management
- View all registered users
- Block / Unblock users
- View user order history

### Coupon Management
- Create discount coupons (flat / percentage)
- Set expiry date and usage limit
- Activate / Deactivate coupons

---

## 🗄️ Database Schema (Key Models)

```
User         → id, name, email, password, role, avatar, addresses[]
Product      → id, name, description, price, discount, images[], stock, category, ratings[]
Category     → id, name, parentCategory, image
Cart         → id, userId, items[{productId, qty, price}]
Order        → id, userId, items[], totalAmount, status, paymentInfo, address
Review       → id, userId, productId, rating, comment
Coupon       → id, code, discountType, discountValue, expiryDate, usageLimit
Wishlist     → id, userId, products[]
```

---

## 💻 Recommended Tech Stack

### Option A — MERN Stack (JavaScript Full-Stack)
| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React.js + Tailwind CSS           |
| State Mgmt  | Redux Toolkit / Zustand           |
| Backend     | Node.js + Express.js              |
| Database    | MongoDB + Mongoose                |
| Auth        | JWT + bcrypt                      |
| Payment     | Stripe / Razorpay                 |
| File Upload | Cloudinary / AWS S3               |
| Email       | Nodemailer / SendGrid             |
| Deployment  | Vercel (FE) + Railway/Render (BE) |

### Option B — Django + React (Python)
| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React.js + Tailwind CSS           |
| Backend     | Django + Django REST Framework    |
| Database    | PostgreSQL                        |
| Auth        | Django Auth + JWT (SimpleJWT)     |
| Payment     | Stripe                            |
| File Upload | Cloudinary                        |
| Deployment  | Vercel (FE) + Railway (BE)        |

---

## 📁 Project Folder Structure (MERN)

```
ecommerce-store/
├── client/                     # React Frontend
│   ├── public/
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Route-level pages
│       ├── redux/              # Redux store & slices
│       ├── hooks/              # Custom React hooks
│       ├── services/           # API call functions
│       └── utils/              # Helper functions
│
├── server/                     # Node.js Backend
│   ├── config/                 # DB, Cloudinary, etc.
│   ├── controllers/            # Route logic
│   ├── middleware/             # Auth, error handling
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   └── utils/                  # Email, JWT helpers
│
├── .env
├── .gitignore
└── README.md
```

---

## 🔗 API Endpoints (RESTful)

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
PUT    /api/auth/reset-password/:token
```

### Products
```
GET    /api/products             # List with filters/search/sort
GET    /api/products/:id         # Single product
POST   /api/products             # Admin: Create
PUT    /api/products/:id         # Admin: Update
DELETE /api/products/:id         # Admin: Delete
```

### Cart
```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update
DELETE /api/cart/remove/:productId
```

### Orders
```
POST   /api/orders               # Place order
GET    /api/orders/my            # User's orders
GET    /api/orders/:id           # Single order
PUT    /api/orders/:id/status    # Admin: Update status
```

### Reviews
```
POST   /api/reviews/:productId
GET    /api/reviews/:productId
DELETE /api/reviews/:id          # Admin
```

---

## 🎨 UI/UX Requirements

- Fully **responsive** (mobile-first design)
- Clean, modern UI using Tailwind CSS or Material UI
- Loading skeletons while fetching data
- Toast notifications for actions (success/error)
- Empty state illustrations for cart, wishlist, orders
- 404 and error pages
- Smooth page transitions / animations

---

## 🔒 Security Requirements

- All passwords hashed with **bcrypt**
- **JWT tokens** with expiry + refresh token strategy
- Input validation and sanitization (express-validator / Zod)
- Rate limiting on auth routes (express-rate-limit)
- CORS configured for specific origins
- Environment variables for secrets (never hardcoded)
- HTTPS in production

---

## 🧪 Testing (Bonus)

- Unit tests for API routes (Jest + Supertest)
- Component tests (React Testing Library)
- At least 10 test cases for core flows (register, login, cart, order)

---

## 🚀 Deployment Checklist

- [ ] Frontend deployed on **Vercel**
- [ ] Backend deployed on **Railway / Render**
- [ ] MongoDB on **MongoDB Atlas**
- [ ] Environment variables configured in hosting platform
- [ ] Custom domain (optional)
- [ ] SSL/HTTPS enabled
- [ ] README with setup instructions and live demo link

---

## 📄 README Must Include

- Project title + description
- Live demo link
- Tech stack badges
- Features list
- Screenshots / GIFs of the app
- Local setup instructions (`npm install`, `.env` setup, `npm run dev`)
- API documentation link or Postman collection
- Future improvements
- License

---

## 📅 Suggested Timeline (8 Weeks)

| Week | Milestone                               |
|------|-----------------------------------------|
| 1    | Setup, Auth (Register/Login), DB design |
| 2    | Product listing, search, filters        |
| 3    | Product detail, cart functionality      |
| 4    | Checkout, payment integration           |
| 5    | Order management, email notifications   |
| 6    | Admin panel (products, orders, users)   |
| 7    | Reviews, wishlist, coupons              |
| 8    | Testing, deployment, documentation      |

---

## 💡 Bonus Features (Stand Out in Interviews)

- 🔍 **Elasticsearch** integration for advanced product search
- 📊 **Analytics dashboard** with charts (Chart.js / Recharts)
- 🌍 **Multi-language support** (i18n)
- 🌙 **Dark mode** toggle
- 📦 **Real-time order tracking** map
- 🤖 **AI product recommendations** (based on browsing history)
- 📱 **PWA** (Progressive Web App) support
- 🔔 **Push notifications**

---

*Use this prompt as your project specification document, GitHub README draft, or AI code generation prompt.*
