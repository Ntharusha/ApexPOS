const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');


router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales-trend', dashboardController.getSalesTrend);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
