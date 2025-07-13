const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const partyController = require('../controllers/partyController');

// router.use(authMiddleware.authenticate);

router.post('/', partyController.createParty);
router.get('/', partyController.getParties);
router.put('/:id', partyController.updateParty);
router.delete('/:id', partyController.deleteParty);

module.exports = router;