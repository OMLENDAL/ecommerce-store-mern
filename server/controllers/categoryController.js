const store = require('../data/store');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = (req, res) => {
  const categories = store.getCategories();
  res.json(categories);
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = (req, res) => {
  const { name, image, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  const category = store.createCategory({
    name,
    image: image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    description: description || ''
  });

  res.status(201).json(category);
};

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = (req, res) => {
  const updated = store.updateCategory(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'Category not found.' });
  }
  res.json(updated);
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = (req, res) => {
  const success = store.deleteCategory(req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'Category not found.' });
  }
  res.json({ message: 'Category removed successfully.' });
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
