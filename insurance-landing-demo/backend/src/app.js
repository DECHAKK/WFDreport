const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const healthRoutes = require('./routes/health');
const planRoutes = require('./routes/plans');
const rateRoutes = require('./routes/rates');
const indexLinkedRoutes = require('./routes/indexLinked');
const leadRoutes = require('./routes/leads');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsing with size limits
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'ยินดีต้อนรับสู่ระบบ API ของ OrangeCare Insurance Demo',
    version: '1.0.0',
    documentation: '/api/v1/health',
    demoNotice: 'ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่างสมมติเพื่อการสาธิตเท่านั้น',
  });
});

// REST API v1 Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/rates', rateRoutes);
app.use('/api/v1/index-linked', indexLinkedRoutes);
app.use('/api/v1/leads', leadRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
