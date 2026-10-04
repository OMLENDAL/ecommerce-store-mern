const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// @desc    Get user's wishlist
// @route   GET /api/wishlist
router.get('/', (req, res) => {
  const productIds = store.getWishlist(req.user.id);
  const products = productIds
    .map(id => store.getProductById(id))
    .filter(Boolean);
  res.json(products);
});

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist/toggle
router.post('/toggle', (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  const updatedIds = store.toggleWishlist(req.user.id, productId);
  const products = updatedIds
    .map(id => store.getProductById(id))
    .filter(Boolean);
  res.json({
    productIds: updatedIds,
    products,
    isInWishlist: updatedIds.includes(productId)
  });
});

module.exports = router;
