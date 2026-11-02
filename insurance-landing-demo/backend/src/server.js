const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { checkConnection, describeConnectionTarget } = require('./config/db');

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  // Check Database connection on startup
  console.log('----------------------------------------------------');
  console.log('🚀 Starting OrangeCare Insurance Demo API Server...');
  console.log('----------------------------------------------------');

  const dbStatus = await checkConnection();
  const dbTarget = describeConnectionTarget();
  if (dbStatus.isConnected) {
    console.log(`✅ Connected to MariaDB/MySQL database successfully: ${dbTarget}`);
  } else {
    console.warn('⚠️  Database Connection Notice:');
    console.warn(`   ${dbStatus.message}`);
    console.warn(`   Target: ${dbTarget}`);
    console.warn('   Ensure the database service is running and the target database is imported.');
  }

  const server = app.listen(PORT, () => {
    console.log(`📡 Server listening on http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
    console.log(`🩺 Health:   http://localhost:${PORT}/api/v1/health`);
    console.log(`📋 Plans:    http://localhost:${PORT}/api/v1/plans`);
    console.log(`🧮 Rates:    http://localhost:${PORT}/api/v1/rates`);
    console.log(`📩 Leads:    http://localhost:${PORT}/api/v1/leads`);
    console.log('----------------------------------------------------');
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n🛑 Gracefully shutting down Express server...');
    server.close(() => {
      console.log('👋 Express server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
