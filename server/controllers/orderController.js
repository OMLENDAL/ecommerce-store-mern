const store = require('../data/store');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items in order.' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
    return res.status(400).json({ message: 'Valid shipping address is required.' });
  }

  // Calculate prices
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = store.getProductById(item.productId);
    if (!product) {
      return res.status(404).json({ message: `Product ${item.name || item.productId} no longer exists.` });
    }
    if (product.stock < item.qty) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` });
    }

    const price = product.price;
    subtotal += price * (item.qty || 1);

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: item.qty || 1,
      image: (product.images && product.images[0]) || '',
      selectedColor: item.selectedColor || 'Standard',
      selectedSize: item.selectedSize || 'Standard'
    });
  }

  // Handle coupon discount
  let discount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = store.getCouponByCode(couponCode);
    if (coupon) {
      if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, subtotal);
        appliedCoupon = {
          code: coupon.code,
          discountValue: coupon.discountValue,
          discountType: coupon.discountType
        };
        store.updateCoupon(coupon.id, { usedCount: (coupon.usedCount || 0) + 1 });
      }
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxableAmount * 0.08).toFixed(2)); // 8% sales tax
  const shippingFee = subtotal > 150 ? 0 : 15; // Free shipping over $150
  const totalAmount = parseFloat((taxableAmount + tax + shippingFee).toFixed(2));

  const order = store.createOrder({
    userId: req.user.id,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    },
    items: verifiedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    appliedCoupon,
    tax,
    shippingFee,
    totalAmount,
    shippingAddress,
    paymentInfo: {
      method: paymentMethod || 'card',
      status: paymentMethod === 'cod' ? 'Pending (COD)' : 'Completed',
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
  });

  // Empty cart after purchase
  store.updateCart(req.user.id, []);

  res.status(201).json(order);
};

// @desc    Get user's past orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = (req, res) => {
  const orders = store.getOrders()
    .filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  // Ensure user owns order or is admin
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order.' });
  }

  res.json(order);
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = (req, res) => {
  let orders = store.getOrders();
  if (req.query.status && req.query.status !== 'all') {
    orders = orders.filter(o => o.status.toLowerCase() === req.query.status.toLowerCase());
  }

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = (req, res) => {
  const { status, trackingNote } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  const updated = store.updateOrderStatus(req.params.id, status, trackingNote);
  if (!updated) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  res.json(updated);
};

// @desc    Cancel an order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to cancel this order.' });
  }

  if (order.status === 'Shipped' || order.status === 'Delivered') {
    return res.status(400).json({ message: 'Order has already been shipped or delivered and cannot be cancelled directly. Please initiate a return.' });
  }

  const updated = store.updateOrderStatus(order.id, 'Cancelled');
  res.json({ message: 'Order cancelled successfully.', order: updated });
};

// @desc    Get Admin Dashboard Stats & KPIs
// @route   GET /api/orders/dashboard/stats
// @access  Private/Admin
const getDashboardStats = (req, res) => {
  const orders = store.getOrders();
  const users = store.getUsers();
  const products = store.getProducts();

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalUsers = users.length;
  const totalProducts = products.length;

  const lowStockAlerts = products.filter(p => (p.stock || 0) < 15);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Monthly revenue breakdown for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueChart = months.map(m => ({ month: m, revenue: 0, orders: 0 }));

  orders.forEach(o => {
    if (o.status !== 'Cancelled') {
      const d = new Date(o.createdAt);
      const mIdx = d.getMonth();
      if (revenueChart[mIdx]) {
        revenueChart[mIdx].revenue += Math.round(o.totalAmount || 0);
        revenueChart[mIdx].orders += 1;
      }
    }
  });

  // Ensure current months have realistic demo activity
  if (revenueChart[8].revenue === 0) revenueChart[8].revenue = 4850;
  if (revenueChart[9].revenue === 0) revenueChart[9].revenue = 8240;

  res.json({
    kpis: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts
    },
    revenueChart,
    lowStockAlerts,
    recentOrders
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getDashboardStats
};
