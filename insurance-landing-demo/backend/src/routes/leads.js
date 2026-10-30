const express = require('express');
const rateLimit = require('express-rate-limit');
const leadController = require('../controllers/leadController');
const { validateLeadSubmission, validateLeadStatusUpdate } = require('../middleware/validateLead');

const router = express.Router();

// Rate limiter for lead submissions: max 15 submissions per 15 minutes per IP
const leadSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'มีการส่งคำขอคำปรึกษาถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
    errors: ['ส่งคำขอถี่เกินกำหนด กรุณาลองใหม่อีกครั้งในภายหลัง'],
  },
});

// Public Consultation Submission
router.post('/', leadSubmissionLimiter, validateLeadSubmission, leadController.submitLead);

// Admin Demo Endpoints (Note: Demo purpose; documented that auth is required for production)
router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.patch('/:id/status', validateLeadStatusUpdate, leadController.updateStatus);
router.delete('/:id', leadController.deleteLead);

module.exports = router;
