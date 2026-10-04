const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const store = require('../data/store');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields (name, email, password).' });
  }

  const existingUser = store.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'An account with this email address already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = store.createUser({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'user',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    addresses: []
  });

  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    avatar: newUser.avatar,
    token: generateToken(newUser.id)
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  const user = store.getUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user.id)
  });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = (req, res) => {
  const user = store.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    addresses: user.addresses || [],
    createdAt: user.createdAt
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = (req, res) => {
  const user = store.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.avatar) updates.avatar = req.body.avatar;
  if (req.body.password) {
    updates.password = bcrypt.hashSync(req.body.password, 10);
  }

  const updatedUser = store.updateUser(user.id, updates);

  res.json({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    addresses: updatedUser.addresses || [],
    token: generateToken(updatedUser.id)
  });
};

// @desc    Add / Update shipping address
// @route   POST /api/auth/address
// @access  Private
const addAddress = (req, res) => {
  const user = store.getUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const { fullName, street, city, state, zipCode, country, phone, isDefault } = req.body;
  if (!fullName || !street || !city || !zipCode) {
    return res.status(400).json({ message: 'Please provide full address details.' });
  }

  const addresses = user.addresses || [];
  if (isDefault) {
    addresses.forEach(a => a.isDefault = false);
  }

  const newAddress = {
    id: `addr-${Date.now()}`,
    fullName,
    street,
    city,
    state: state || '',
    zipCode,
    country: country || 'United States',
    phone: phone || '',
    isDefault: isDefault || addresses.length === 0
  };

  addresses.push(newAddress);
  store.updateUser(user.id, { addresses });

  res.status(201).json(addresses);
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
const deleteAddress = (req, res) => {
  const user = store.getUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const { addressId } = req.params;
  const addresses = (user.addresses || []).filter(a => a.id !== addressId);
  store.updateUser(user.id, { addresses });

  res.json(addresses);
};

// @desc    Forgot password simulation
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = (req, res) => {
  const { email } = req.body;
  const user = store.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'No registered user found with that email.' });
  }

  // Generate demo reset token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  store.updateUser(user.id, { resetToken, resetTokenExpires: Date.now() + 3600000 });

  res.json({
    message: 'Password reset OTP link generated successfully.',
    demoToken: resetToken // Provided for effortless local verification
  });
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
const resetPassword = (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = store.getUserByEmail(email);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.resetToken !== token) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  store.updateUser(user.id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpires: null
  });

  res.json({ message: 'Password has been updated successfully. You can now log in.' });
};

// --- Admin Controls ---
// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = (req, res) => {
  const users = store.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    isBlocked: !!u.isBlocked,
    createdAt: u.createdAt,
    orderCount: store.getOrders().filter(o => o.userId === u.id).length
  }));
  res.json(users);
};

// @desc    Toggle user block status (Admin only)
// @route   PUT /api/auth/users/:id/block
// @access  Private/Admin
const toggleBlockUser = (req, res) => {
  const user = store.getUserById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Cannot block administrator accounts.' });
  }

  const updated = store.updateUser(user.id, { isBlocked: !user.isBlocked });
  res.json({ message: `User ${updated.isBlocked ? 'blocked' : 'unblocked'} successfully.`, user: updated });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
  getAllUsers,
  toggleBlockUser
};
