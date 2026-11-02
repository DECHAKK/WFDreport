#!/usr/bin/env node
/**
 * Import the demo database dump into Aiven MySQL (or any MySQL/MariaDB server)
 * using the mysql2 driver that the backend already depends on.
 *
 * Why this script exists: the XAMPP machine has no `mysql` binary on PATH, and
 * the bundled MariaDB 10.4 client cannot talk to Aiven's MySQL 8
 * (`caching_sha2_password` + `--ssl-mode`). mysql2 handles both.
 *
 * Usage:
 *   node database/scripts/import-aiven.js --cnf ~/Desktop/aiven.cnf
 *   node database/scripts/import-aiven.js --cnf ~/Desktop/aiven.cnf \
 *        --database defaultdb --dump database/exports/<file>.sql
 *
 * Options file ([client] group):
 *   host=... port=25060 user=avnadmin password=... ssl-ca=/path/to/ca.pem
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function loadMysql() {
  const candidates = [
    path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mysql2', 'promise'),
    'mysql2/promise',
  ];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      /* try the next candidate */
    }
  }
  fail('ไม่พบไลบรารี mysql2 — ให้รัน `npm install` ในโฟลเดอร์ backend ก่อน');
  return null;
}

function expandHome(target) {
  if (!target) return target;
  return target.startsWith('~') ? path.join(os.homedir(), target.slice(1)) : target;
}

/** Read the [client] group of a MySQL option file. */
function parseOptionFile(file) {
  if (!fs.existsSync(file)) fail(`ไม่พบไฟล์ options: ${file}`);
  const options = {};
  let group = null;

  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;

    const header = line.match(/^\[(.+)]$/);
    if (header) {
      group = header[1].trim().toLowerCase();
      continue;
    }
    if (group !== 'client') continue;

    const separator = line.indexOf('=');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase().replace(/-/g, '_');
    options[key] = line.slice(separator + 1).trim();
  }
  return options;
}

function parseArgs(argv) {
  const args = { database: 'defaultdb' };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--cnf') { args.cnf = expandHome(value); i += 1; }
    else if (key === '--dump') { args.dump = expandHome(value); i += 1; }
    else if (key === '--database') { args.database = value; i += 1; }
    else if (key === '--verify-only') { args.verifyOnly = true; }
    else if (key === '--dry-run') { args.dryRun = true; }
    else if (key === '--help' || key === '-h') { args.help = true; }
  }
  return args;
}

const VERIFY_SQL = `
  SELECT 'calculator_settings' AS table_name, COUNT(*) AS rows_ FROM calculator_settings UNION ALL
  SELECT 'payment_factors', COUNT(*) FROM payment_factors UNION ALL
  SELECT 'whole_life_rates', COUNT(*) FROM whole_life_rates UNION ALL
  SELECT 'ci50_rates', COUNT(*) FROM ci50_rates UNION ALL
  SELECT 'demo_plans', COUNT(*) FROM demo_plans UNION ALL
  SELECT 'leads', COUNT(*) FROM leads UNION ALL
  SELECT 'index_linked_plans', COUNT(*) FROM index_linked_plans UNION ALL
  SELECT 'index_linked_plan_schedule', COUNT(*) FROM index_linked_plan_schedule UNION ALL
  SELECT 'index_linked_scenarios', COUNT(*) FROM index_linked_scenarios`;

const EXPECTED = {
  calculator_settings: 1,
  payment_factors: 4,
  whole_life_rates: 1200,
  ci50_rates: 200,
  demo_plans: 3,
  leads: 3,
  index_linked_plans: 2,
  index_linked_plan_schedule: 50,
  index_linked_scenarios: 4,
};


/** Remove statements that are useless (or unhelpful) on Aiven MySQL 8. */
function prepareSql(rawSql) {
  return rawSql
    .split(/\r?\n/)
    .filter((line) => !/^(LOCK TABLES|UNLOCK TABLES)/.test(line.trim()))
    .filter((line) => !/^\/\*!40000 ALTER TABLE .* (DISABLE|ENABLE) KEYS \*\/;$/.test(line.trim()))
    .join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log('Usage: node database/scripts/import-aiven.js --cnf <options.cnf> [--database defaultdb] [--dump <file.sql>] [--verify-only] [--dry-run]');
    return;
  }

  const cnfPath = args.cnf || expandHome('~/Desktop/aiven.cnf');
  const dumpPath = args.dump
    || path.join(__dirname, '..', 'exports', 'insurance_landing_demo_aiven_20261102.sql');

  const options = parseOptionFile(cnfPath);
  const host = options.host;
  const port = Number(options.port || 3306);
  const user = options.user;
  const password = options.password || '';
  const sslCa = options.ssl_ca || options.sslca;

  if (!host || host.includes('<')) fail(`ยังไม่ได้ใส่ host ในไฟล์ ${cnfPath}`);
  if (!user) fail(`ยังไม่ได้ใส่ user ในไฟล์ ${cnfPath}`);
  if (password.includes('<')) fail(`ยังไม่ได้ใส่ password ในไฟล์ ${cnfPath}`);
  if (!args.verifyOnly && !fs.existsSync(dumpPath)) fail(`ไม่พบไฟล์ dump: ${dumpPath}`);

  let ssl;
  if (sslCa) {
    const caPath = expandHome(sslCa);
    if (!fs.existsSync(caPath)) fail(`ไม่พบไฟล์ CA certificate: ${caPath}`);
    ssl = { ca: fs.readFileSync(caPath), rejectUnauthorized: true };
  } else if (options.ssl_mode && options.ssl_mode.toUpperCase() !== 'DISABLED') {
    fail('ต้องระบุ ssl-ca ในไฟล์ options เมื่อเปิดใช้ ssl-mode (Aiven บังคับ TLS)');
  }

  console.log(`==> 1/3 เชื่อมต่อ ${host}:${port} (user ${user}, database ${args.database}, TLS ${ssl ? 'verify CA' : 'ปิด'})`);
  const mysql = loadMysql();
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database: args.database,
    ssl,
    charset: 'utf8mb4',
    multipleStatements: true,
    connectTimeout: 20000,
  });

  try {
    const [versionRows] = await connection.query(
      'SELECT VERSION() AS server_version, CURRENT_USER() AS connected_user, DATABASE() AS current_db',
    );
    console.log(`    server=${versionRows[0].server_version} user=${versionRows[0].connected_user} db=${versionRows[0].current_db}`);

    if (!args.verifyOnly) {
      const sql = prepareSql(fs.readFileSync(dumpPath, 'utf8'));
      console.log(`==> 2/3 import ${path.basename(dumpPath)} (${(sql.length / 1024).toFixed(1)} KB)`);
      if (args.dryRun) {
        console.log('    dry-run: ข้ามการ import');
      } else {
        await connection.query(sql);
        console.log('    import สำเร็จ');
      }
    }

    console.log('==> 3/3 ตรวจสอบจำนวนแถว');
    const [rows] = await connection.query(VERIFY_SQL);
    let mismatched = 0;
    for (const row of rows) {
      const expected = EXPECTED[row.table_name];
      const actual = Number(row.rows_);
      const ok = expected === actual;
      if (!ok) mismatched += 1;
      console.log(`    ${ok ? 'OK  ' : 'FAIL'} ${row.table_name.padEnd(26)} ${String(actual).padStart(6)} (คาดว่า ${expected})`);
    }

    if (mismatched > 0) fail(`จำนวนแถวไม่ตรง ${mismatched} ตาราง`);
    console.log('==> เสร็จสิ้น: ข้อมูลบน Aiven ครบทุกตาราง');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  fail(error.message);
});
