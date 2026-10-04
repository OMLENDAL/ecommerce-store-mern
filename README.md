# 🛒 AURA LUXE — Full-Stack E-Commerce Store

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-black?logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

A state-of-the-art, full-stack E-Commerce web application featuring a rich storefront, glassmorphic UI aesthetics, dark/light theme switcher, real-time live search auto-suggestions, product filters & sorting, shopping cart, interactive checkout, order tracking timelines, verified customer reviews, wishlist, and an analytics-powered Admin Control Center.

---

## 🚀 Deploy (Live — No Local Setup Needed!)

You can run this project **live on the internet for free** using [Render](https://render.com). No local installation required!

### Option A — One-Click Deploy via Render Blueprint
1. Push this repo to your GitHub (or fork it)
2. Go to 👉 **[https://dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)**
3. Click **"New Blueprint Instance"**
4. Connect your GitHub repo — Render will auto-detect `render.yaml` and deploy everything

### Option B — Manual Deploy on Render (step by step)
1. Go to **[https://render.com](https://render.com)** and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect this repository: `OMLENDAL/ecommerce-store-mern`
4. Use these settings:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
5. Add these **Environment Variables**:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(any long random string, e.g. `mysecretkey123abc`)*
6. Click **"Create Web Service"** — your live URL will appear in ~2 minutes!

> ⚠️ **Note on free tier:** Render's free tier spins down after inactivity. The first load after sleep may take ~30 seconds.

> 💡 **Data persistence:** The app uses a local JSON file as its database. Since Render's free tier has ephemeral storage, data resets on each deploy/restart. For persistent data, set `MONGODB_URI` to a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

---



## 🌟 Key Features

### 🛍️ Customer Experience (Storefront)
- **Hero Promotion Carousel**: Interactive banner slides with smooth transitions and call-to-actions.
- **Curated Category Grid**: Quick navigation by category with dynamic item previews.
- **Product Catalog & Filtering**:
  - Grid & List view switcher
  - Live search bar with instant auto-suggestions dropdown
  - Multi-facet filters: Categories, price range slider ($0 - $800), minimum star rating, and in-stock toggle
  - Sorting: Price (Low to High / High to Low), Newest Arrivals, Customer Rating, Most Popular
  - Pagination controls
- **Product Details & Gallery**:
  - High-res image gallery with interactive thumbnail selector and image zoom
  - Color swatches & size selector variants
  - Real-time stock status indicator
  - Quantity stepper controls
  - One-click **"Buy Now"** (instant redirect to checkout) & **"Add to Shopping Bag"**
  - Technical specifications accordion
  - Verified buyer ratings & reviews with helpful voting
  - Related items recommendation grid
- **Interactive Shopping Bag & Drawer**:
  - Slide-out mini cart drawer accessible from any page
  - Free global shipping progress tracker bar (unlocks free shipping at $150)
  - Full shopping cart management page
  - Promo coupon redemption with real-time discount calculation (`WELCOME50`, `SAVE20`, `SPECIAL10`)
- **Frictionless Multi-Step Checkout**:
  - Recipient address management (saved addresses or new entry)
  - Multiple payment options: Credit/Debit card mockup, UPI / NetBanking, and Cash on Delivery (COD)
  - Order summary breakdown (Subtotal, Discount, 8% Tax, Shipping, Total)
  - Celebration confetti animation upon successful order completion!
- **Order Management & Live Tracking**:
  - Order tracking timeline: `Order Placed` ➔ `Processing & Packed` ➔ `Shipped` ➔ `Delivered`
  - Download & print official PDF/Tax Invoices
  - Customer order cancellation capability (if pending or processing)
- **Wishlist & Favorites**: Save items with quick "Move to Bag" capability.
- **Dark / Light Mode**: Instant CSS variable theme toggle.

### 🛡️ Admin Control Suite
- **Analytics KPI Dashboard**:
  - Total Revenue, Total Orders, Active Catalog Items, Registered Customers
  - Annual/Monthly revenue trend SVG chart
  - Low stock warning table (<15 units remaining) with 1-click restock
  - Recent orders quick-view
- **Product Management**: Full CRUD (Create, Read, Update, Delete) with image URLs, pricing, discounts, stock, and featured toggles.
- **Order Processing**: Real-time fulfillment status updates (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) with courier tracking notes.
- **User Management**: View customer order counts and toggle Account Block / Unblock statuses.
- **Coupon Management**: Create flat or percentage discount coupons with minimum order criteria and expiration dates.

---

## 👥 Demo Credentials (1-Click Login Available)

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Administrator** | `admin@store.com` | `admin123` | Full Admin Dashboard, Catalog CRUD, Order Fulfillment, User Management |
| **Customer** | `customer@store.com` | `user123` | Shopping, Checkout, Order Tracking, Reviews, Wishlist |

> 💡 **Tip:** In the login modal, you can simply click the **"Admin Demo"** or **"Customer Demo"** button to log in instantly without typing!

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS (Design Tokens, Glassmorphism, CSS Variables), Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (JWT), Bcrypt password hashing, CORS.
- **Database**: Dual-Mode Architecture:
  - **Embedded Persistent Store**: High-speed JSON document store (`server/data/ecommerce_store.json`) with atomic file writes so the project runs 100% out of the box with zero external DB prerequisites.
  - **MongoDB Ready**: Connect easily to MongoDB Atlas or local MongoDB by setting `MONGODB_URI` in `server/.env`.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.
```bash
node -v
npm -v
```

### 2. Installation
Install dependencies for both client and server:
```bash
# In project root:
npm --prefix server install
npm --prefix client install
```

### 3. Run Development Servers
You can start both the backend API (port 5000) and the frontend Vite app (port 5173) simultaneously:
```bash
npm run dev
```

Alternatively, run them in separate terminals:
```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev
```

Open your browser at:
👉 **http://localhost:5173**

Backend API Health Check:
👉 **http://localhost:5000/api/health**

---

## 🔗 RESTful API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/profile` — Get authenticated user details
- `PUT /api/auth/profile` — Update name, avatar, or password
- `POST /api/auth/address` — Save new delivery address
- `POST /api/auth/forgot-password` — Generate password reset token
- `PUT /api/auth/reset-password` — Set new password using token
- `GET /api/auth/users` — *(Admin)* List all registered users
- `PUT /api/auth/users/:id/block` — *(Admin)* Block/unblock user account

### 📦 Products (`/api/products`)
- `GET /api/products` — Filter products by keyword, category, brand, price, rating, stock, sort, and page
- `GET /api/products/featured` — Top 8 featured items
- `GET /api/products/:id` — Single product details with related items and reviews
- `POST /api/products` — *(Admin)* Create product
- `PUT /api/products/:id` — *(Admin)* Update product
- `DELETE /api/products/:id` — *(Admin)* Remove product

### 🛒 Cart & Wishlist (`/api/cart`, `/api/wishlist`)
- `GET /api/cart` — Get user's cart with calculated subtotal and totals
- `POST /api/cart/add` — Add item to cart with variant specifications
- `PUT /api/cart/update` — Update item quantity
- `DELETE /api/cart/remove/:id` — Remove item from cart
- `DELETE /api/cart/clear` — Clear entire cart
- `GET /api/wishlist` — Get saved wishlist items
- `POST /api/wishlist/toggle` — Toggle favorite item

### 📋 Orders (`/api/orders`)
- `POST /api/orders` — Checkout and place order with stock deduction
- `GET /api/orders/my` — Customer order history
- `GET /api/orders/:id` — Single order invoice details
- `PUT /api/orders/:id/cancel` — Cancel pending/processing order
- `GET /api/orders` — *(Admin)* View all store orders
- `PUT /api/orders/:id/status` — *(Admin)* Update order status and tracking courier notes
- `GET /api/orders/dashboard/stats` — *(Admin)* KPI statistics, charts, low stock alerts

### 🎟️ Coupons & Reviews (`/api/coupons`, `/api/reviews`)
- `POST /api/coupons/validate` — Validate promo code against current cart
- `GET /api/coupons` — *(Admin)* List all active coupons
- `POST /api/coupons` — *(Admin)* Create promotional coupon
- `GET /api/reviews/:productId` — Get verified buyer reviews
- `POST /api/reviews/:productId` — Post a verified review (1-5 stars)
- `PUT /api/reviews/:id/helpful` — Upvote helpful review

---

## 🎨 Sample Coupon Codes
- `WELCOME50` — **$50 Flat OFF** on orders over $200
- `SAVE20` — **20% OFF** on orders over $100
- `SPECIAL10` — **10% OFF** on orders over $50

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
