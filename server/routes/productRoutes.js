const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.patch('/:id/stock', productController.updateStock);
router.patch('/:id/refill', productController.refillStock);

module.exports = router;
