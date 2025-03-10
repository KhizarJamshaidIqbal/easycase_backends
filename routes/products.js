const express = require('express');
const { createProduct, getProducts, searchProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Protected routes for products
router.post('/', authenticate, createProduct);
router.get('/', authenticate, getProducts);
router.get('/search', authenticate, searchProducts);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);


module.exports = router; 