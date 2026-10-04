const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:5000/api'
  : '/api';


const getToken = () => localStorage.getItem('token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  addAddress: (address) => request('/auth/address', { method: 'POST', body: JSON.stringify(address) }),
  deleteAddress: (id) => request(`/auth/address/${id}`, { method: 'DELETE' }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'PUT', body: JSON.stringify(payload) }),
  getUsers: () => request('/auth/users'),
  toggleBlockUser: (id) => request(`/auth/users/${id}/block`, { method: 'PUT' }),

  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getFeaturedProducts: () => request('/products/featured'),
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (item) => request('/cart/add', { method: 'POST', body: JSON.stringify(item) }),
  updateCartItem: (data) => request('/cart/update', { method: 'PUT', body: JSON.stringify(data) }),
  removeFromCart: (identifier) => request(`/cart/remove/${identifier}`, { method: 'DELETE' }),
  clearCart: () => request('/cart/clear', { method: 'DELETE' }),

  // Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getMyOrders: () => request('/orders/my'),
  getOrderById: (id) => request(`/orders/${id}`),
  getAllOrders: (status) => request(`/orders${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (id, status, trackingNote) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, trackingNote }) }),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'PUT' }),
  getDashboardStats: () => request('/orders/dashboard/stats'),

  // Reviews
  getProductReviews: (productId) => request(`/reviews/${productId}`),
  createReview: (productId, reviewData) =>
    request(`/reviews/${productId}`, { method: 'POST', body: JSON.stringify(reviewData) }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  voteHelpful: (id) => request(`/reviews/${id}/helpful`, { method: 'PUT' }),

  // Coupons
  validateCoupon: (code, subtotal) =>
    request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  getCoupons: () => request('/coupons'),
  createCoupon: (data) => request('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id, data) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCoupon: (id) => request(`/coupons/${id}`, { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  toggleWishlist: (productId) => request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) })
};
