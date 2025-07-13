const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.createCompany);
router.post('/login', authController.login);
router.get('/check-company', authController.checkCompany);

module.exports = router;