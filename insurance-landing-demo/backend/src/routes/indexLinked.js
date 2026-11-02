const express = require('express');
const indexLinkedController = require('../controllers/indexLinkedController');

const router = express.Router();

router.get('/plans', indexLinkedController.getPlans);
router.post('/quote', indexLinkedController.calculateQuote);

module.exports = router;
