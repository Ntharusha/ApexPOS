const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { auth } = require('../middleware/auth');

router.get('/current', auth, shiftController.getCurrentShift);
router.get('/history', auth, shiftController.getShiftHistory);
router.post('/open', auth, shiftController.openShift);
router.patch('/:id/close', auth, shiftController.closeShift);

module.exports = router;
