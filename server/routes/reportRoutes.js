const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/profit-loss', reportController.getProfitLoss);
router.get('/daily-closing', reportController.getDailyClosing);
router.get('/low-stock', reportController.getLowStock);

// New Report Routes
router.get('/sales', reportController.getSalesReports);
router.get('/stock', reportController.getStockReports);
router.get('/salary', reportController.getSalaryReports);
router.get('/expenses', reportController.getExpensesReports);
router.get('/repair-profit', reportController.getRepairProfitReports);
router.get('/suppliers', reportController.getSupplierReports);
router.get('/vehicle-load', reportController.getVehicleLoadReports);
router.get('/type/:type', reportController.getGenericReport);

module.exports = router;
