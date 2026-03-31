const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.get('/', deliveryController.getDeliveries);
router.post('/', deliveryController.createDelivery);
router.patch('/:id/status', deliveryController.updateDeliveryStatus);
router.delete('/:id', deliveryController.deleteDelivery);

module.exports = router;
