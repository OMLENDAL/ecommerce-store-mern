const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_ecommercestore_2026_modern', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
