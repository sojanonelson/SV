const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const companyController = require('../controllers/companyController');

// router.use(authMiddleware.authenticate);

router.get('/', companyController.getCompany);
router.put('/:id', companyController.updateCompany);

module.exports = router;