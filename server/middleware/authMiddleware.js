const jwt = require('jsonwebtoken');
const store = require('../data/store');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_ecommercestore_2026_modern');
      const user = store.getUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User not found or authorization token invalid.' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired.' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an administrator.' });
  }
};

// Optional auth: populate req.user if token is present, but don't reject if not
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_ecommercestore_2026_modern');
      const user = store.getUserById(decoded.id);
      if (user && !user.isBlocked) {
        req.user = user;
      }
    } catch (e) {
      // Continue without user
    }
  }
  next();
};

module.exports = { protect, admin, optionalAuth };
