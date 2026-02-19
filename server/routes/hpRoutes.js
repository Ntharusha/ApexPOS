const express = require('express');
const router = express.Router();
const hpController = require('../controllers/hpController');

router.get('/', hpController.getHPAccounts);
router.post('/', hpController.createHPAccount);
router.patch('/:id/collect', hpController.collectPayment);

module.exports = router;
