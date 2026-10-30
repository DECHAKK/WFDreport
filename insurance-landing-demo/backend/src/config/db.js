const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'insurance_landing_demo',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  charset: 'utf8mb4',
};

// Use a local socket when provided (for XAMPP socket-only authentication).
if (process.env.DB_SOCKET_PATH) {
  dbConfig.socketPath = process.env.DB_SOCKET_PATH;
}

// Create the connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Checks the database connection and returns health status.
 * Never throws an uncaught error.
 */
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { isConnected: true, message: 'เชื่อมต่อฐานข้อมูลสำเร็จ' };
  } catch (error) {
    return {
      isConnected: false,
      message: 'ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL/MariaDB ได้',
      error: error.message,
    };
  }
}

module.exports = {
  pool,
  dbConfig,
  checkConnection,
};
