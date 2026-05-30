const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');

router.get('/', repairController.getRepairs);
router.post('/', repairController.createRepair);
router.patch('/:id/status', repairController.updateRepairStatus);

module.exports = router;
