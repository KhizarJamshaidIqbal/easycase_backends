const express = require('express');
const { adminGetAllProducts, updateProductStatus } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Admin routes for product management
router.get('/products', authenticate, isAdmin, adminGetAllProducts);
router.patch('/products/:id/status', authenticate, isAdmin, updateProductStatus);

module.exports = router;