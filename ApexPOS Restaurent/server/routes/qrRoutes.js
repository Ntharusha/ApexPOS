const express = require('express');
const router = express.Router();
const qrOrderController = require('../controllers/qrOrderController');

// Customer QR Routes
router.get('/menu', qrOrderController.getTableMenu);
router.post('/table/:tableId/session', qrOrderController.startTableSession);
router.post('/order', qrOrderController.placeOrder);

// KDS Routes
router.get('/kds/orders', qrOrderController.getKDSOrders);
router.patch('/kds/orders/:orderId', qrOrderController.updateKDSStatus);

module.exports = router;
