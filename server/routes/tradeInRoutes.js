const express = require('express');
const router = express.Router();
const tradeInController = require('../controllers/tradeInController');

router.post('/', tradeInController.createTradeIn);
router.get('/', tradeInController.getTradeIns);

module.exports = router;
