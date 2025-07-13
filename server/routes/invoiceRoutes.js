const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const invoiceController = require('../controllers/invoiceController');

// router.use(authMiddleware.authenticate);

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/party/:partyId', invoiceController.getInvoicesByParty);
router.get('/:id', invoiceController.getInvoice);
router.put('/:id/payment', invoiceController.updateInvoicePayment);
router.delete('/:id', invoiceController.deleteInvoice);


module.exports = router;