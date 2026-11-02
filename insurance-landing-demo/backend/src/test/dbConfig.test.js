const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Must run before config/db.js is required. dotenv never overwrites an existing
// key, so this also neutralises a NODE_ENV=production value in a local .env.
process.env.NODE_ENV = 'test';

const {
  pool,
  dbConfig,
  checkConnection,
  validateProductionConfig,
  buildDbConfig,
  describeConnectionTarget,
  sanitizeDbErrorMessage,
} = require('../config/db');

const XAMPP_ENV = {
  NODE_ENV: 'development',
  DB_HOST: '127.0.0.1',
  DB_PORT: '3306',
  DB_USER: 'root',
  DB_PASSWORD: '',
  DB_NAME: 'insurance_landing_demo',
  DB_CONNECTION_LIMIT: '10',
  DB_SOCKET_PATH: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
};

const PRODUCTION_ENV = {
  NODE_ENV: 'production',
  DB_HOST: 'mysql-demo-project.aivencloud.com',
  DB_PORT: '25000',
  DB_USER: 'avnadmin',
  DB_PASSWORD: 'demo-password-should-never-leak',
  DB_NAME: 'defaultdb',
  DB_CONNECTION_LIMIT: '10',
  DB_SSL_ENABLED: 'true',
  DB_SSL_CA: '-----BEGIN CERTIFICATE-----\\nMIIBdemo\\n-----END CERTIFICATE-----',
};

/**
 * Creates a throwaway CA file and always removes it afterwards.
 */
async function withTempCaFile(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wfdreport-ca-'));
  const caPath = path.join(directory, 'aiven-ca.pem');
  fs.writeFileSync(caPath, '-----BEGIN CERTIFICATE-----\nMIIBdemo\n-----END CERTIFICATE-----\n');

  try {
    return await callback(caPath);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

describe('Database config - development (XAMPP) stays identical', () => {
  it('builds the previous XAMPP connection: no TLS, socket path honoured', () => {
    const config = buildDbConfig(XAMPP_ENV);

    assert.strictEqual(config.ssl, undefined);
    assert.strictEqual(config.socketPath, XAMPP_ENV.DB_SOCKET_PATH);
    assert.strictEqual(config.host, '127.0.0.1');
    assert.strictEqual(config.port, 3306);
    assert.strictEqual(config.user, 'root');
    assert.strictEqual(config.password, '');
    assert.strictEqual(config.database, 'insurance_landing_demo');
  });

  it('preserves every original pool option and default', () => {
    const config = buildDbConfig({ NODE_ENV: 'development' });

    assert.strictEqual(config.waitForConnections, true);
    assert.strictEqual(config.connectionLimit, 10);
    assert.strictEqual(config.queueLimit, 0);
    assert.strictEqual(config.charset, 'utf8mb4');
    assert.strictEqual(config.port, 3306);
    assert.strictEqual(config.user, 'root');
    assert.strictEqual(config.password, '');
    assert.strictEqual(config.database, 'insurance_landing_demo');
    assert.strictEqual(config.ssl, undefined);
    assert.strictEqual(config.socketPath, undefined);
  });

  it('never validates a non-production environment', () => {
    const result = validateProductionConfig({ NODE_ENV: 'development' });

    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

describe('Database config - production (Aiven) with TLS', () => {
  it('accepts a complete production configuration with a CA file', async () => {
    await withTempCaFile(async (caPath) => {
      const env = { ...PRODUCTION_ENV, DB_SSL_CA_PATH: caPath };
      delete env.DB_SSL_CA;

      const result = validateProductionConfig(env);
      assert.strictEqual(result.valid, true, result.errors.join(' | '));

      const config = buildDbConfig(env);
      assert.strictEqual(config.ssl.rejectUnauthorized, true);
      assert.strictEqual(config.ssl.minVersion, 'TLSv1.2');
      assert.ok(config.ssl.ca.includes('BEGIN CERTIFICATE'));
      assert.strictEqual(config.socketPath, undefined);
      assert.strictEqual(config.host, PRODUCTION_ENV.DB_HOST);
      assert.strictEqual(config.port, 25000);
    });
  });

  it('supports an inline CA PEM via DB_SSL_CA with escaped newlines', () => {
    const config = buildDbConfig(PRODUCTION_ENV);

    assert.strictEqual(config.ssl.rejectUnauthorized, true);
    assert.ok(config.ssl.ca.includes('\nMIIBdemo\n'));
  });

  it('forces TLS in production even when DB_SSL_ENABLED is false', () => {
    const disabledEnv = { ...PRODUCTION_ENV, DB_SSL_ENABLED: 'false' };

    assert.strictEqual(buildDbConfig(disabledEnv).ssl.rejectUnauthorized, true);
    assert.strictEqual(validateProductionConfig(disabledEnv).valid, false);
  });

  it('ignores DB_SOCKET_PATH in production', () => {
    const config = buildDbConfig({ ...PRODUCTION_ENV, DB_SOCKET_PATH: '/tmp/mysql.sock' });

    assert.strictEqual(config.socketPath, undefined);
    assert.strictEqual(config.host, PRODUCTION_ENV.DB_HOST);
  });

  it('reports missing variables without leaking secret values', () => {
    const result = validateProductionConfig({
      NODE_ENV: 'production',
      DB_PASSWORD: 'demo-password-should-never-leak',
    });

    assert.strictEqual(result.valid, false);
    const combined = result.errors.join(' ');
    assert.ok(combined.includes('DB_HOST'));
    assert.ok(combined.includes('DB_USER'));
    assert.ok(combined.includes('DB_NAME'));
    assert.ok(!combined.includes('demo-password-should-never-leak'));
  });

  it('rejects a socket path in production', () => {
    const result = validateProductionConfig({ ...PRODUCTION_ENV, DB_SOCKET_PATH: '/tmp/mysql.sock' });

    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((message) => message.includes('DB_SOCKET_PATH')));
  });

  it('rejects a production configuration without a CA certificate', () => {
    const env = { ...PRODUCTION_ENV };
    delete env.DB_SSL_CA;

    const result = validateProductionConfig(env);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((message) => message.includes('DB_SSL_CA')));
  });

  it('rejects a CA path that cannot be read', () => {
    const env = {
      ...PRODUCTION_ENV,
      DB_SSL_CA_PATH: path.join(os.tmpdir(), 'wfdreport-missing-ca.pem'),
    };
    delete env.DB_SSL_CA;

    const result = validateProductionConfig(env);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((message) => message.includes('DB_SSL_CA_PATH')));
  });

  it('rejects an invalid DB_PORT', () => {
    const result = validateProductionConfig({ ...PRODUCTION_ENV, DB_PORT: '70000' });

    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((message) => message.includes('DB_PORT')));
  });

  it('never disables certificate verification in any mode', () => {
    const scenarios = [
      { ...PRODUCTION_ENV },
      { ...PRODUCTION_ENV, DB_SSL_ENABLED: 'false' },
      { ...PRODUCTION_ENV, DB_SSL_ENABLED: '0' },
      { ...PRODUCTION_ENV, NODE_ENV: 'development', DB_SSL_ENABLED: 'true' },
    ];

    scenarios.forEach((env) => {
      assert.strictEqual(buildDbConfig(env).ssl.rejectUnauthorized, true);
    });
  });
});

describe('Database config - safety helpers', () => {
  it('describeConnectionTarget never exposes credentials', () => {
    const description = describeConnectionTarget({
      host: 'db.example.internal',
      port: 25000,
      database: 'defaultdb',
      user: 'avnadmin',
      password: 'demo-password-should-never-leak',
      ssl: { rejectUnauthorized: true },
    });

    assert.ok(description.includes('db.example.internal:25000/defaultdb'));
    assert.ok(description.includes('(TLS)'));
    assert.ok(!description.includes('demo-password-should-never-leak'));
    assert.ok(!description.includes('avnadmin'));
  });

  it('sanitizeDbErrorMessage redacts the configured password', () => {
    const message = sanitizeDbErrorMessage(
      new Error('Access denied using demo-password-should-never-leak'),
      { DB_PASSWORD: 'demo-password-should-never-leak' }
    );

    assert.ok(!message.includes('demo-password-should-never-leak'));
    assert.ok(message.includes('***'));
  });

  it('checkConnection keeps its original contract', async () => {
    const result = await checkConnection();

    assert.strictEqual(typeof result.isConnected, 'boolean');
    assert.strictEqual(typeof result.message, 'string');

    if (!result.isConnected) {
      assert.strictEqual(typeof result.error, 'string');
      if (dbConfig.password) {
        assert.ok(!result.error.includes(dbConfig.password));
      }
    }
  });
});

after(async () => {
  await pool.end().catch(() => {});
});