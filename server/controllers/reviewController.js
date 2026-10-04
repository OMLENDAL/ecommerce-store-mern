const store = require('../data/store');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = (req, res) => {
  const reviews = store.getReviews(req.params.productId);
  res.json(reviews);
};

// @desc    Create a product review
// @route   POST /api/reviews/:productId
// @access  Private
const createReview = (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Please provide both rating and review text.' });
  }

  const product = store.getProductById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  // Check if user already reviewed
  const existingReviews = store.getReviews(productId);
  const alreadyReviewed = existingReviews.find(r => r.userId === req.user.id);
  if (alreadyReviewed) {
    return res.status(400).json({ message: 'You have already submitted a review for this product.' });
  }

  const review = store.createReview({
    productId,
    userId: req.user.id,
    userName: req.user.name,
    userAvatar: req.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.user.name)}`,
    rating: Number(rating),
    comment
  });

  res.status(201).json(review);
};

// @desc    Delete a review (Admin or Author)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = (req, res) => {
  const reviews = store.getReviews();
  const review = reviews.find(r => r.id === req.params.id);

  if (!review) {
    return res.status(404).json({ message: 'Review not found.' });
  }

  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this review.' });
  }

  store.deleteReview(req.params.id);
  res.json({ message: 'Review deleted successfully.' });
};

// @desc    Vote review helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Public
const voteHelpful = (req, res) => {
  const reviews = store.getReviews();
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ message: 'Review not found.' });
  }

  review.helpfulCount = (review.helpfulCount || 0) + 1;
  store.save();
  res.json({ helpfulCount: review.helpfulCount });
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
  voteHelpful
};
