const fs = require('fs');
const path = require('path');
const { getInitialData } = require('../utils/seedData');

const DATA_DIR = path.join(__dirname);
const DATA_FILE = path.join(DATA_DIR, 'ecommerce_store.json');

class DataStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse existing data file, re-seeding...', err);
        this.data = getInitialData();
        this.save();
      }
    } else {
      this.data = getInitialData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save data store:', err);
    }
  }

  // --- Users ---
  getUsers() {
    return this.data.users || [];
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const user = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      addresses: [],
      isBlocked: false,
      role: 'user',
      ...userData
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Products ---
  getProducts() {
    return this.data.products || [];
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id || p.slug === id);
  }

  createProduct(productData) {
    const product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      rating: 5.0,
      numReviews: 0,
      isActive: true,
      isFeatured: false,
      images: productData.images && productData.images.length > 0 
        ? productData.images 
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80'],
      variants: productData.variants || { colors: ['Standard'], sizes: ['Standard'] },
      specs: productData.specs || {},
      ...productData,
      price: Number(productData.price),
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : Number(productData.price),
      discount: productData.discount ? Number(productData.discount) : 0,
      stock: Number(productData.stock || 0)
    };
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : this.data.products[idx].price,
      stock: updates.stock !== undefined ? Number(updates.stock) : this.data.products[idx].stock
    };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id) {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
    return this.data.products.length < initialLen;
  }

  // --- Categories ---
  getCategories() {
    return this.data.categories || [];
  }

  createCategory(categoryData) {
    const category = {
      id: `cat-${Date.now()}`,
      isActive: true,
      ...categoryData,
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };
    this.data.categories.push(category);
    this.save();
    return category;
  }

  updateCategory(id, updates) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  deleteCategory(id) {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.save();
    return this.data.categories.length < initialLen;
  }

  // --- Cart ---
  getCart(userId) {
    if (!this.data.carts) this.data.carts = {};
    if (!this.data.carts[userId]) {
      this.data.carts[userId] = { items: [] };
    }
    return this.data.carts[userId];
  }

  updateCart(userId, items) {
    if (!this.data.carts) this.data.carts = {};
    this.data.carts[userId] = { items: items || [] };
    this.save();
    return this.data.carts[userId];
  }

  // --- Orders ---
  getOrders() {
    return this.data.orders || [];
  }

  getOrderById(id) {
    return this.getOrders().find(o => o.id === id || o.orderId === id);
  }

  createOrder(orderData) {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const order = {
      id: `ord-${Date.now()}-${seq}`,
      orderId: `ORD-${Date.now().toString().slice(-4)}${seq.toString().slice(-2)}`,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      trackingTimeline: [
        { status: 'Order Placed', time: new Date().toISOString(), done: true },
        { status: 'Processing & Packed', time: 'Pending', done: false },
        { status: 'Shipped', time: 'Pending', done: false },
        { status: 'Delivered', time: 'Pending', done: false }
      ],
      ...orderData
    };
    this.data.orders.unshift(order);

    // Reduce stock for ordered items
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const prod = this.getProductById(item.productId);
        if (prod) {
          prod.stock = Math.max(0, (prod.stock || 0) - (item.qty || 1));
        }
      });
    }

    this.save();
    return order;
  }

  updateOrderStatus(id, status, trackingNote) {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.status = status;
    
    // Update tracking timeline appropriately
    if (status === 'Processing') {
      order.trackingTimeline[1] = { status: 'Processing & Packed', time: new Date().toISOString(), done: true };
    } else if (status === 'Shipped') {
      order.trackingTimeline[1].done = true;
      order.trackingTimeline[2] = { status: `Shipped (${trackingNote || 'Standard Courier'})`, time: new Date().toISOString(), done: true };
    } else if (status === 'Delivered') {
      order.trackingTimeline.forEach(t => t.done = true);
      order.trackingTimeline[3] = { status: 'Delivered', time: new Date().toISOString(), done: true };
    } else if (status === 'Cancelled') {
      order.trackingTimeline.push({ status: 'Order Cancelled', time: new Date().toISOString(), done: true });
    }
    
    this.save();
    return order;
  }

  // --- Reviews ---
  getReviews(productId) {
    const reviews = this.data.reviews || [];
    if (!productId) return reviews;
    return reviews.filter(r => r.productId === productId);
  }

  createReview(reviewData) {
    const review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
      ...reviewData
    };
    if (!this.data.reviews) this.data.reviews = [];
    this.data.reviews.unshift(review);

    // Recalculate product rating
    const prodReviews = this.getReviews(review.productId);
    const prod = this.getProductById(review.productId);
    if (prod && prodReviews.length > 0) {
      const sum = prodReviews.reduce((acc, curr) => acc + Number(curr.rating || 5), 0);
      prod.rating = parseFloat((sum / prodReviews.length).toFixed(1));
      prod.numReviews = prodReviews.length;
    }

    this.save();
    return review;
  }

  deleteReview(id) {
    const rev = (this.data.reviews || []).find(r => r.id === id);
    if (!rev) return false;
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);
    
    // Recalculate product rating
    const prodReviews = this.getReviews(rev.productId);
    const prod = this.getProductById(rev.productId);
    if (prod) {
      if (prodReviews.length > 0) {
        const sum = prodReviews.reduce((acc, curr) => acc + Number(curr.rating || 5), 0);
        prod.rating = parseFloat((sum / prodReviews.length).toFixed(1));
        prod.numReviews = prodReviews.length;
      } else {
        prod.rating = 5.0;
        prod.numReviews = 0;
      }
    }
    this.save();
    return true;
  }

  // --- Coupons ---
  getCoupons() {
    return this.data.coupons || [];
  }

  getCouponByCode(code) {
    return this.getCoupons().find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
  }

  createCoupon(couponData) {
    const coupon = {
      id: `coup-${Date.now()}`,
      usedCount: 0,
      isActive: true,
      ...couponData,
      code: couponData.code.toUpperCase()
    };
    if (!this.data.coupons) this.data.coupons = [];
    this.data.coupons.push(coupon);
    this.save();
    return coupon;
  }

  updateCoupon(id, updates) {
    const idx = (this.data.coupons || []).findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.save();
    return this.data.coupons[idx];
  }

  deleteCoupon(id) {
    const initialLen = (this.data.coupons || []).length;
    this.data.coupons = (this.data.coupons || []).filter(c => c.id !== id);
    this.save();
    return (this.data.coupons || []).length < initialLen;
  }

  // --- Wishlist ---
  getWishlist(userId) {
    if (!this.data.wishlists) this.data.wishlists = {};
    return this.data.wishlists[userId] || [];
  }

  toggleWishlist(userId, productId) {
    if (!this.data.wishlists) this.data.wishlists = {};
    let list = this.data.wishlists[userId] || [];
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
    } else {
      list.push(productId);
    }
    this.data.wishlists[userId] = list;
    this.save();
    return list;
  }
}

const store = new DataStore();
module.exports = store;
