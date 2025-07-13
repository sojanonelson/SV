const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

// router.use(authMiddleware.authenticate);

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/getById/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;