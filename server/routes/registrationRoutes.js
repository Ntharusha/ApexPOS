const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Staff routes
router.get('/staff', registrationController.getStaff);
router.post('/staff', registrationController.createStaff);
router.patch('/staff/:id', registrationController.updateStaff);
router.delete('/staff/:id', registrationController.deleteStaff);

// Customer routes
router.get('/customers', registrationController.getCustomers);
router.post('/customers', registrationController.createCustomer);
router.patch('/customers/:id', registrationController.updateCustomer);
router.delete('/customers/:id', registrationController.deleteCustomer);

// Supplier routes
router.get('/suppliers', registrationController.getSuppliers);
router.post('/suppliers', registrationController.createSupplier);
router.patch('/suppliers/:id', registrationController.updateSupplier);
router.delete('/suppliers/:id', registrationController.deleteSupplier);

module.exports = router;
