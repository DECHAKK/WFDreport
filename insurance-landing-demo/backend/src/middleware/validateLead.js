/**
 * Middleware to validate lead consultation submission
 */
const ALLOWED_INTERESTS = ['health', 'life', 'accident', 'savings', 'car', 'other'];
const ALLOWED_CONTACT_METHODS = ['phone', 'email', 'line'];
const ALLOWED_STATUSES = ['pending', 'contacted', 'closed', 'cancelled'];

// Thai labels shown to end users in validation messages
const INTEREST_LABELS = {
  health: 'สุขภาพ',
  life: 'ชีวิต',
  accident: 'อุบัติเหตุ',
  savings: 'สะสมทรัพย์',
  car: 'รถยนต์',
  other: 'อื่นๆ',
};
const CONTACT_METHOD_LABELS = { phone: 'โทรศัพท์', email: 'อีเมล', line: 'ไลน์' };

const joinThaiLabels = (values, labels) => values.map((value) => labels[value] || value).join(', ');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Standard Thai phone format: 9-10 digits starting with 0 (e.g. 0812345678, 021234567)
const PHONE_REGEX = /^0\d{8,9}$/;

function validateLeadSubmission(req, res, next) {
  const { fullName, phone, email, insuranceInterest, preferredContactMethod, consentGiven } = req.body;
  const errors = [];

  // Validate fullName
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('กรุณาระบุชื่อ-นามสกุลให้ถูกต้อง (อย่างน้อย 2 ตัวอักษร)');
  } else if (fullName.trim().length > 150) {
    errors.push('ชื่อ-นามสกุลมีความยาวเกิน 150 ตัวอักษร');
  }

  // Validate phone
  const cleanPhone = phone ? String(phone).replace(/[-\s]/g, '') : '';
  if (!cleanPhone || !PHONE_REGEX.test(cleanPhone)) {
    errors.push('กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (เช่น 0812345678 หรือ 021234567)');
  }

  // Validate email if provided
  if (email !== undefined && email !== null && String(email).trim() !== '') {
    const trimmedEmail = String(email).trim();
    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 150) {
      errors.push('รูปแบบอีเมลไม่ถูกต้อง');
    }
  }

  // Validate insuranceInterest
  if (!insuranceInterest || !ALLOWED_INTERESTS.includes(insuranceInterest)) {
    errors.push(`กรุณาเลือกประเภทประกันภัยที่สนใจ (${joinThaiLabels(ALLOWED_INTERESTS, INTEREST_LABELS)})`);
  }

  // Validate preferredContactMethod
  if (!preferredContactMethod || !ALLOWED_CONTACT_METHODS.includes(preferredContactMethod)) {
    errors.push(`กรุณาเลือกช่องทางการติดต่อที่สะดวก (${joinThaiLabels(ALLOWED_CONTACT_METHODS, CONTACT_METHOD_LABELS)})`);
  }

  // Validate consentGiven
  if (consentGiven !== true && consentGiven !== 'true') {
    errors.push('ต้องให้ความยินยอมในการประมวลผลข้อมูลตัวอย่างก่อนส่งคำขอ');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลการขอคำปรึกษาไม่ถูกต้องตามเงื่อนไข',
      errors,
    });
  }

  // Normalize cleaned values into request
  req.body.fullName = fullName.trim();
  req.body.phone = cleanPhone;
  req.body.email = email && String(email).trim() !== '' ? String(email).trim().toLowerCase() : null;
  req.body.consentGiven = true;

  next();
}

function validateLeadStatusUpdate(req, res, next) {
  const { status } = req.body;
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `สถานะไม่ถูกต้อง สถานะที่ยอมรับได้แก่: ${ALLOWED_STATUSES.join(', ')}`,
      errors: [`สถานะไม่ถูกต้อง ค่าที่อนุญาต: ${ALLOWED_STATUSES.join(', ')}`],
    });
  }
  next();
}

module.exports = {
  validateLeadSubmission,
  validateLeadStatusUpdate,
  ALLOWED_INTERESTS,
  ALLOWED_CONTACT_METHODS,
  ALLOWED_STATUSES,
};
