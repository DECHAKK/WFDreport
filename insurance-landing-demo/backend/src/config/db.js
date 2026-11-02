const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const DEFAULT_PORT = 3306;
const DEFAULT_DB_NAME = 'insurance_landing_demo';
const DEFAULT_CONNECTION_LIMIT = 10;

/**
 * Variables the project must be explicit about when running in production.
 * Errors reference variable NAMES only - never values - so nothing sensitive
 * can leak through a startup failure message or a log line.
 */
const REQUIRED_PRODUCTION_VARS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

/**
 * Parses a truthy-ish environment flag ('1', 'true', 'yes', 'on').
 */
function isTruthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

/**
 * Production mode is the only switch that changes database behaviour.
 * Anything else (unset, development, test) keeps the original XAMPP behaviour.
 */
function isProduction(env = process.env) {
  return String(env.NODE_ENV || 'development').trim().toLowerCase() === 'production';
}

/**
 * Parses an integer with a safe fallback for malformed values.
 */
function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Validates the production database environment variables.
 *
 * Only enforced when NODE_ENV=production, so local XAMPP/development setups are
 * never affected. Returns a list of human-readable problems that contain
 * variable names exclusively.
 */
function validateProductionConfig(env = process.env) {
  if (!isProduction(env)) {
    return { valid: true, errors: [] };
  }

  const errors = [];

  REQUIRED_PRODUCTION_VARS.forEach((key) => {
    const value = env[key];
    if (value === undefined || String(value).trim() === '') {
      errors.push(`Missing required production variable: ${key}`);
    }
  });

  if (env.DB_PORT !== undefined && String(env.DB_PORT).trim() !== '') {
    const port = Number(env.DB_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push('DB_PORT must be an integer between 1 and 65535.');
    }
  }

  if (env.DB_SOCKET_PATH) {
    errors.push('DB_SOCKET_PATH must not be set in production; Aiven requires a TCP connection.');
  }

  if (!isTruthy(env.DB_SSL_ENABLED)) {
    errors.push('DB_SSL_ENABLED must be "true" in production (Aiven requires TLS).');
  }

  if (!env.DB_SSL_CA_PATH && !env.DB_SSL_CA) {
    errors.push('Provide the Aiven CA certificate via DB_SSL_CA_PATH or DB_SSL_CA.');
  }

  if (env.DB_SSL_CA_PATH) {
    try {
      fs.accessSync(path.resolve(env.DB_SSL_CA_PATH), fs.constants.R_OK);
    } catch (accessError) {
      errors.push('DB_SSL_CA_PATH does not point to a readable certificate file.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Builds the mysql2 TLS options.
 *
 * Returns null when TLS is disabled, which keeps the local XAMPP connection
 * completely unchanged (no `ssl` key is passed to the driver).
 *
 * `rejectUnauthorized` is hardcoded to `true`. There is deliberately no
 * environment variable that can disable certificate verification, so the Aiven
 * CA can never be silently bypassed.
 */
function loadSslOptions(env = process.env) {
  // TLS is mandatory in production and opt-in everywhere else.
  const sslEnabled = isProduction(env) || isTruthy(env.DB_SSL_ENABLED);
  if (!sslEnabled) {
    return null;
  }

  const sslOptions = {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  };

  if (env.DB_SSL_CA_PATH) {
    // Preferred: path to the ca.pem downloaded from the Aiven console.
    sslOptions.ca = fs.readFileSync(path.resolve(env.DB_SSL_CA_PATH), 'utf8');
  } else if (env.DB_SSL_CA) {
    // Fallback for hosts where a secret file cannot be mounted. Newlines are
    // commonly escaped as \n inside environment variables.
    sslOptions.ca = String(env.DB_SSL_CA).replace(/\\n/g, '\n');
  }

  return sslOptions;
}

/**
 * Builds the mysql2 pool configuration for the given environment.
 * Mirrors the original option precedence and defaults exactly.
 */
function buildDbConfig(env = process.env) {
  const config = {
    host: env.DB_HOST || '127.0.0.1',
    port: parseInteger(env.DB_PORT, DEFAULT_PORT),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || DEFAULT_DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInteger(env.DB_CONNECTION_LIMIT, DEFAULT_CONNECTION_LIMIT),
    queueLimit: 0,
    charset: 'utf8mb4',
  };

  // Local socket support (XAMPP socket-only authentication). Never applied in
  // production, where a socket path would silently override host and port.
  if (!isProduction(env) && env.DB_SOCKET_PATH) {
    config.socketPath = env.DB_SOCKET_PATH;
  }

  const ssl = loadSslOptions(env);
  if (ssl) {
    config.ssl = ssl;
  }

  return config;
}

/**
 * Removes the configured database password from a driver error message so it
 * can never reach a log line or an API response.
 */
function sanitizeDbErrorMessage(error, env = process.env) {
  const rawMessage = (error && error.message) || 'Unknown database error';
  const password = env.DB_PASSWORD;

  if (typeof password !== 'string' || password.length === 0) {
    return rawMessage;
  }

  return rawMessage.split(password).join('***');
}

/**
 * Log-friendly description of the configured target.
 * Never includes the user name or the password.
 */
function describeConnectionTarget(config = dbConfig) {
  const target = config.socketPath
    ? `${config.socketPath} (local socket)`
    : `${config.host}:${config.port}`;

  return `${target}/${config.database} ${config.ssl ? '(TLS)' : '(no TLS)'}`;
}

// Fail fast on an invalid production configuration instead of silently falling
// back to local defaults. Development and test environments skip this branch.
const configValidation = validateProductionConfig(process.env);
if (!configValidation.valid) {
  const configError = new Error(
    `Invalid production database configuration:\n- ${configValidation.errors.join('\n- ')}`
  );
  configError.code = 'DB_CONFIG_INVALID';
  throw configError;
}

// Create the connection pool
const dbConfig = buildDbConfig(process.env);
const pool = mysql.createPool(dbConfig);

/**
 * Checks the database connection and returns health status.
 * Never throws an uncaught error.
 */
async function checkConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();
    return { isConnected: true, message: 'เชื่อมต่อฐานข้อมูลสำเร็จ' };
  } catch (error) {
    return {
      isConnected: false,
      message: 'ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL/MariaDB ได้',
      error: sanitizeDbErrorMessage(error),
    };
  } finally {
    // Always return the connection to the pool, even when ping() fails.
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        // Releasing a connection must never mask the original error.
      }
    }
  }
}

module.exports = {
  pool,
  dbConfig,
  checkConnection,
  validateProductionConfig,
  buildDbConfig,
  describeConnectionTarget,
  sanitizeDbErrorMessage,
};
