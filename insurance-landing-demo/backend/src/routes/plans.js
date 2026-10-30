const express = require('express');
const planController = require('../controllers/planController');

const router = express.Router();

router.get('/', planController.getPlans);
router.get('/:id', planController.getPlanById);

module.exports = router;
