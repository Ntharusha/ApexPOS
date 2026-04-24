const express = require('express');
const router = express.Router();
const liabilityController = require('../controllers/liabilityController');

router.post('/', liabilityController.createLiability);
router.get('/', liabilityController.getLiabilities);

module.exports = router;
