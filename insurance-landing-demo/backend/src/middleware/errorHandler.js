/**
 * Global 404 handler for unmatched routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `ไม่พบเส้นทางที่ร้องขอ: ${req.method} ${req.originalUrl}`,
    errors: ['ไม่พบปลายทาง (Endpoint) ที่ร้องขอในระบบ'],
  });
}

/**
 * Global application error handler
 * Sanitizes errors and prevents internal stack traces or SQL details from leaking to clients
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  // Log error internally for debugging without exposing secrets
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    status: statusCode,
    code: err.code || 'INTERNAL_ERROR',
  });

  // Client-safe response
  let safeMessage = err.isOperational ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิดในระบบเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';

  // If database connection issue
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    safeMessage = 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้ กรุณาตรวจสอบสถานะการทำงานของ MySQL/MariaDB ในเครื่อง';
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    errors: err.errors || [safeMessage],
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
