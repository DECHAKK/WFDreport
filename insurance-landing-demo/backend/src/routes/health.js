const express = require('express');
const { checkConnection } = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const dbHealth = await checkConnection();

  const isHealthy = dbHealth.isConnected;
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    success: isHealthy,
    service: 'OrangeCare Insurance Demo API',
    status: isHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbHealth.isConnected,
      message: dbHealth.message,
    },
    demoNotice: 'ข้อมูลทั้งหมดที่ให้บริการผ่าน API นี้เป็นข้อมูลตัวอย่างเพื่อการสาธิตและทดสอบเท่านั้น',
  });
});

module.exports = router;
