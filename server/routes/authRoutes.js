const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/pin-login', authController.pinLogin);

// Protected routes
router.post('/register', auth, authController.register);   // Admin registers staff
router.get('/me', auth, authController.me);                // Get current user
router.patch('/set-pin', auth, authController.setPin);     // Update PIN

module.exports = router;
