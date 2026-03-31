const express = require('express');
const router = express.Router();
const hospitalityController = require('../controllers/hospitalityController');

// Table routes
router.get('/tables', hospitalityController.getTables);
router.post('/tables', hospitalityController.createTable);
router.patch('/tables/:id/status', hospitalityController.updateTableStatus);

// Order/KOT routes
router.post('/orders', hospitalityController.createOrder);
router.get('/orders/:id', hospitalityController.getOrder);
router.patch('/orders/:id/items', hospitalityController.updateOrderItems);
router.post('/orders/:id/pay', hospitalityController.closeOrderAndBill);

module.exports = router;
