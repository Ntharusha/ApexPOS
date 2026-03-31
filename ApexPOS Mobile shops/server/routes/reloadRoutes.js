const express = require('express');
const router = express.Router();
const reloadController = require('../controllers/reloadController');

router.get('/history', reloadController.getReloadHistory);
router.post('/', reloadController.processReload);

module.exports = router;
