const store = require('../data/store');

// @desc    Validate a promo coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = (req, res) => {
  const { code, subtotal = 0 } = req.body;
  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required.' });
  }

  const coupon = store.getCouponByCode(code);
  if (!coupon) {
    return res.status(404).json({ message: 'Invalid or expired coupon code.' });
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return res.status(400).json({ message: 'This coupon code has expired.' });
  }

  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return res.status(400).json({ message: 'This coupon usage limit has been reached.' });
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return res.status(400).json({
      message: `Minimum order amount of $${coupon.minOrderValue} required for this coupon.`
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, subtotal);

  res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: parseFloat(discount.toFixed(2)),
    message: `Coupon applied: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}`
  });
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = (req, res) => {
  const coupons = store.getCoupons();
  res.json(coupons);
};

// @desc    Create coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = (req, res) => {
  const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ message: 'Code, discount type, and discount value are required.' });
  }

  const existing = store.getCouponByCode(code);
  if (existing) {
    return res.status(400).json({ message: 'Coupon code already exists.' });
  }

  const coupon = store.createCoupon({
    code: code.trim(),
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minOrderValue: Number(minOrderValue || 0),
    expiryDate: expiryDate || '2027-12-31',
    usageLimit: Number(usageLimit || 1000)
  });

  res.status(201).json(coupon);
};

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = (req, res) => {
  const updated = store.updateCoupon(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'Coupon not found.' });
  }
  res.json(updated);
};

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = (req, res) => {
  const success = store.deleteCoupon(req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'Coupon not found.' });
  }
  res.json({ message: 'Coupon deleted successfully.' });
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
