const store = require('../data/store');

// Helper to populate items with full product details
const populateCart = (cart) => {
  const items = (cart.items || []).map(item => {
    const product = store.getProductById(item.productId);
    return {
      ...item,
      product: product ? {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: (product.images && product.images[0]) || '',
        stock: product.stock
      } : null
    };
  }).filter(item => item.product !== null); // Filter out any deleted products

  const totalCount = items.reduce((sum, item) => sum + (item.qty || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * (item.qty || 1)), 0);

  return {
    items,
    totalCount,
    subtotal: parseFloat(subtotal.toFixed(2))
  };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = (req, res) => {
  const cart = store.getCart(req.user.id);
  res.json(populateCart(cart));
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = (req, res) => {
  const { productId, qty = 1, selectedColor, selectedSize } = req.body;
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  const product = store.getProductById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const cart = store.getCart(req.user.id);
  const items = [...(cart.items || [])];

  const existingIndex = items.findIndex(
    item => item.productId === productId &&
      item.selectedColor === (selectedColor || 'Standard') &&
      item.selectedSize === (selectedSize || 'Standard')
  );

  const quantityToAdd = Number(qty) || 1;

  if (existingIndex > -1) {
    const newQty = items[existingIndex].qty + quantityToAdd;
    if (newQty > product.stock) {
      return res.status(400).json({ message: `Cannot add more. Only ${product.stock} available in stock.` });
    }
    items[existingIndex].qty = newQty;
  } else {
    if (quantityToAdd > product.stock) {
      return res.status(400).json({ message: `Cannot add ${quantityToAdd}. Only ${product.stock} available in stock.` });
    }
    items.push({
      itemId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId,
      qty: quantityToAdd,
      selectedColor: selectedColor || 'Standard',
      selectedSize: selectedSize || 'Standard',
      price: product.price
    });
  }

  store.updateCart(req.user.id, items);
  res.json(populateCart({ items }));
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = (req, res) => {
  const { itemId, productId, qty } = req.body;
  const newQty = Number(qty);

  if (newQty < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1.' });
  }

  const cart = store.getCart(req.user.id);
  let items = [...(cart.items || [])];

  const idx = items.findIndex(item => (itemId && item.itemId === itemId) || item.productId === productId);
  if (idx === -1) {
    return res.status(404).json({ message: 'Item not found in cart.' });
  }

  const product = store.getProductById(items[idx].productId);
  if (product && newQty > product.stock) {
    return res.status(400).json({ message: `Cannot set quantity to ${newQty}. Only ${product.stock} in stock.` });
  }

  items[idx].qty = newQty;
  store.updateCart(req.user.id, items);
  res.json(populateCart({ items }));
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:identifier
// @access  Private
const removeFromCart = (req, res) => {
  const { identifier } = req.params;
  const cart = store.getCart(req.user.id);
  
  // identifier can be itemId or productId
  const items = (cart.items || []).filter(item => item.itemId !== identifier && item.productId !== identifier);
  store.updateCart(req.user.id, items);
  res.json(populateCart({ items }));
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = (req, res) => {
  store.updateCart(req.user.id, []);
  res.json({ items: [], totalCount: 0, subtotal: 0 });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
