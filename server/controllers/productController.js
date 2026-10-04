const store = require('../data/store');

// @desc    Fetch all products with filtering, search, sorting and pagination
// @route   GET /api/products
// @access  Public
const getProducts = (req, res) => {
  let products = [...store.getProducts()];

  // Only active products for regular requests, unless admin query flag is set
  if (!req.query.allStatus) {
    products = products.filter(p => p.isActive !== false);
  }

  // 1. Keyword search (name, description, brand, category)
  if (req.query.keyword) {
    const kw = req.query.keyword.trim().toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      (p.description && p.description.toLowerCase().includes(kw)) ||
      (p.brand && p.brand.toLowerCase().includes(kw)) ||
      (p.category && p.category.toLowerCase().includes(kw))
    );
  }

  // 2. Category filter
  if (req.query.category && req.query.category !== 'all') {
    const cat = req.query.category.toLowerCase();
    products = products.filter(p =>
      (p.category && p.category.toLowerCase() === cat) ||
      (p.categorySlug && p.categorySlug.toLowerCase() === cat)
    );
  }

  // 3. Brand filter
  if (req.query.brand && req.query.brand !== 'all') {
    const brand = req.query.brand.toLowerCase();
    products = products.filter(p => p.brand && p.brand.toLowerCase() === brand);
  }

  // 4. Price range filter
  if (req.query.minPrice) {
    const minP = Number(req.query.minPrice);
    if (!isNaN(minP)) {
      products = products.filter(p => p.price >= minP);
    }
  }
  if (req.query.maxPrice) {
    const maxP = Number(req.query.maxPrice);
    if (!isNaN(maxP)) {
      products = products.filter(p => p.price <= maxP);
    }
  }

  // 5. Min Rating filter
  if (req.query.rating) {
    const minR = Number(req.query.rating);
    if (!isNaN(minR)) {
      products = products.filter(p => (p.rating || 0) >= minR);
    }
  }

  // 6. In stock filter
  if (req.query.inStock === 'true') {
    products = products.filter(p => (p.stock || 0) > 0);
  }

  // 7. Sorting
  const sort = req.query.sort || 'newest';
  switch (sort) {
    case 'price_asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'popularity':
      products.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
      break;
    case 'newest':
    default:
      // Keep natural creation order / id order
      products.sort((a, b) => (b.id > a.id ? 1 : -1));
      break;
  }

  // Available metadata for filters
  const allProds = store.getProducts();
  const availableCategories = [...new Set(allProds.map(p => p.category).filter(Boolean))];
  const availableBrands = [...new Set(allProds.map(p => p.brand).filter(Boolean))];
  const minAvailablePrice = Math.min(...allProds.map(p => p.price || 0), 0);
  const maxAvailablePrice = Math.max(...allProds.map(p => p.price || 0), 1000);

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const total = products.length;
  const pages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedProducts = products.slice(startIndex, startIndex + limit);

  res.json({
    products: paginatedProducts,
    page,
    pages,
    total,
    availableCategories,
    availableBrands,
    priceRange: {
      min: minAvailablePrice,
      max: maxAvailablePrice
    }
  });
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = (req, res) => {
  const featured = store.getProducts().filter(p => p.isFeatured && p.isActive !== false);
  res.json(featured.slice(0, 8));
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  // Fetch related products in the same category
  const related = store.getProducts()
    .filter(p => p.id !== product.id && p.category === product.category && p.isActive !== false)
    .slice(0, 4);

  // Fetch reviews for this product
  const reviews = store.getReviews(product.id);

  res.json({
    ...product,
    related,
    reviews
  });
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = (req, res) => {
  const { name, price, description, category, brand, stock, images, originalPrice, discount, isFeatured, variants, specs } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Name and price are required.' });
  }

  const newProduct = store.createProduct({
    name,
    description: description || '',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Number(price),
    discount: discount ? Number(discount) : 0,
    category: category || 'Electronics & Gadgets',
    categorySlug: (category || 'Electronics & Gadgets').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    brand: brand || 'Store Brand',
    stock: stock !== undefined ? Number(stock) : 10,
    images: Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80'
    ],
    isFeatured: !!isFeatured,
    variants: variants || { colors: ['Standard'], sizes: ['Standard'] },
    specs: specs || {}
  });

  res.status(201).json(newProduct);
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const updated = store.updateProduct(product.id, req.body);
  res.json(updated);
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = (req, res) => {
  const success = store.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'Product not found or already deleted.' });
  }
  res.json({ message: 'Product deleted successfully.' });
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
