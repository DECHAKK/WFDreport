# Database Schema & Administration Guide

## 1. Overview
The database for **OrangeCare Insurance Demo** is named `insurance_landing_demo` and is designed for MariaDB / MySQL (compatible with XAMPP, Docker, and standalone MySQL 5.7+ / 8.0+).

- **Storage Engine:** `InnoDB` (ACID compliant, supports transactions and row-level locking)
- **Character Set:** `utf8mb4`
- **Collation:** `utf8mb4_unicode_ci` (Full Thai and multilingual unicode support)

---

## 2. Table Specifications

### 2.1 Table: `demo_plans`
Stores hypothetical insurance package options displayed on the landing page.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT PRIMARY KEY` | Unique plan ID |
| `plan_name` | `VARCHAR(150)` | `NOT NULL` | Demo plan display name |
| `description` | `TEXT` | `NOT NULL` | Marketing description |
| `demo_premium` | `VARCHAR(100)` | `NOT NULL` | Sample premium string (e.g. 'เริ่มต้น 1,450 บ./เดือน (สมมติ)') |
| `coverage_summary` | `TEXT` | `NOT NULL` | JSON string array of key coverage points |
| `is_demo` | `BOOLEAN` | `NOT NULL DEFAULT 1` | Demo classification flag |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT 1` | Visibility toggle |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last updated timestamp |

**Indexes:**
- `idx_plans_active` on (`is_active`)
- `idx_plans_demo` on (`is_demo`)

---

### 2.2 Table: `leads`
Stores consultation requests submitted by visitors.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT PRIMARY KEY` | Unique lead ID |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Visitor full name |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Validated phone number (e.g. 0812345678) |
| `email` | `VARCHAR(150)` | `NULL DEFAULT NULL` | Optional email address |
| `insurance_interest`| `VARCHAR(50)` | `NOT NULL` | Interest key (`health`, `life`, `accident`, `savings`, `car`, `other`) |
| `preferred_contact_method`| `VARCHAR(20)` | `NOT NULL DEFAULT 'phone'` | Method (`phone`, `email`, `line`) |
| `consent_given` | `BOOLEAN` | `NOT NULL DEFAULT 1` | Explicit user consent flag |
| `status` | `ENUM(...)` | `NOT NULL DEFAULT 'pending'` | Lead lifecycle status: `pending`, `contacted`, `closed`, `cancelled` |
| `is_demo` | `BOOLEAN` | `NOT NULL DEFAULT 1` | Flag ensuring demo classification |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Submission timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Status change timestamp |

**Indexes:**
- `idx_leads_status` on (`status`)
- `idx_leads_phone` on (`phone`)
- `idx_leads_created_at` on (`created_at`)

---

## 3. Calculator Rate Tables

The interactive calculator requires the tables created and seeded by `003_calculator_rates.sql`:

| Table | Purpose | Required seed data |
| :--- | :--- | :--- |
| `calculator_settings` | Calculator-wide numeric settings, including `high_coverage_threshold` | 1 setting |
| `payment_factors` | Installment multipliers for `annual`, `semiAnnual`, `quarterly`, and `monthly` | 4 rows |
| `whole_life_rates` | Rates per 1,000 THB by coverage tier, payment term, gender, and age | 1,200 rows (2 tiers × 3 terms × 2 genders × 100 ages) |
| `ci50_rates` | CI50 rider rates per 1,000 THB by gender and age | 200 rows (2 genders × 100 ages) |

Both rate tables use composite primary keys so the script can be safely re-imported to update demo rates without creating duplicates. Ages run from 0 through 99; ages outside a product's eligibility range contain zero placeholders and are rejected by the calculator's validation rules.

---

## 3.1 Index Linked Savings Tables

`004_index_linked_plans.sql` creates the tables behind the 25/7 and 25/15 index linked savings calculators:

| Table | Purpose | Required seed data |
| :--- | :--- | :--- |
| `index_linked_plans` | Plan header: payment term, coverage term, issue ages, minimum sum assured (including the senior band), premium per 1,000 THB, guaranteed cashback, maturity %, death benefit %, participation rate, non-guaranteed split year | 2 rows (`SS25_7`, `SS25_15`) |
| `index_linked_plan_schedule` | One row per policy year with premium per 1,000 THB, cashback % and cash value per 1,000 THB | 50 rows (2 plans × 25 years) |
| `index_linked_scenarios` | Index growth assumptions rendered as table columns | 4 rows (2%, 4%, 6%, 8%) |

All monetary columns are stored **per 1,000 THB of sum assured**, so any valid sum assured can be projected without extra seed data. Every row is upserted by its primary key, so the script can be re-imported safely.

**Data provenance (important)**
- The cash value curve of `SS25_7` is taken 1:1 from a real Thai quotation (sum assured 100,000 / premium 100,000 × 7 years).
- `SS25_15` has no published cash value table in the source document, so its curve applies the same "cash value ÷ maturity benefit" ratio of `SS25_7` to its 1,480% maturity benefit. **Replace both curves with the actual policy value table before any production use.**

---

## 4. How to Import via phpMyAdmin (XAMPP)

1. Open **XAMPP Control Panel** and ensure **MySQL** is started (Status: Running, Port 3306).
2. Open your web browser and navigate to:
   ```
   http://localhost/phpmyadmin/
   ```
3. Click on the **"Import"** (นำเข้า) tab on the top menu.
4. Import each of the following scripts in order, clicking **"Go"** (ลงมือ) after each one:
   ```
   insurance-landing-demo/database/001_create_schema.sql
   insurance-landing-demo/database/002_seed_demo_data.sql
   insurance-landing-demo/database/003_calculator_rates.sql
   insurance-landing-demo/database/004_index_linked_plans.sql
   ```
5. Verify that 3 rows exist in `demo_plans` and 3 demo rows exist in `leads`.
6. Verify the final result of the third script reports 1,200 `whole_life_rates`, 200 `ci50_rates`, and 4 `payment_factors`. The `/api/v1/rates` endpoint validates that every required age and payment-frequency rate is present.
7. Verify the fourth script reports 2 `index_linked_plans`, 50 `index_linked_plan_schedule`, and 4 `index_linked_scenarios`. The `/api/v1/index-linked/plans` endpoint rejects incomplete schedules.

---

## 5. How to Import via Command Line (MySQL / MariaDB CLI)

In PowerShell or Terminal:
```bash
# Create the core schema
mysql -u root -p < database/001_create_schema.sql

# Seed demo plans and leads
mysql -u root -p < database/002_seed_demo_data.sql

# Create and seed calculator rate tables (required)
mysql -u root -p < database/003_calculator_rates.sql

# Create and seed the index linked savings plans (required for /index-linked)
mysql -u root -p < database/004_index_linked_plans.sql
```
*(If your root user has no password, you can omit `-p`).*

**XAMPP on macOS without the `mysql` binary on `PATH`:**
```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root \
  --socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock \
  < database/004_index_linked_plans.sql
```

---

## 6. Export & Import to Aiven MySQL (Production)

### 6.1 Export from XAMPP (source of truth for the demo data)

```bash
cd insurance-landing-demo

/Applications/XAMPP/xamppfiles/bin/mysqldump -u root \
  --socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock \
  --no-tablespaces --single-transaction --quick --skip-triggers \
  --default-character-set=utf8mb4 \
  insurance_landing_demo > database/exports/insurance_landing_demo_aiven_$(date +%Y%m%d).sql
```

Notes:
- `database/exports/` is git-ignored together with `*.pem`, so dumps and certificates can never be committed.
- A single-database dump contains **no `CREATE DATABASE` / `USE` statement**, which is required on Aiven: `avnadmin` normally cannot create new databases, so the dump is imported into the existing `defaultdb`.
- `--skip-triggers` is safe here because the schema defines no triggers, routines, or views.

### 6.2 Import into Aiven

Create a client option file once (never paste the password into a shell command or commit it):

```ini
# /tmp/aiven.cnf   → chmod 600 /tmp/aiven.cnf
[client]
host=<service>-<project>.aivencloud.com
port=<port>            # MySQL services usually use 25060-25100
user=avnadmin
password=<your-password>
ssl-ca=/path/to/ca.pem
ssl-mode=VERIFY_CA
```

Then import and verify:

### Recommended: Node importer (no MySQL client required)

The XAMPP machine has no `mysql` binary on `PATH`, and the bundled MariaDB 10.4 client cannot authenticate against Aiven's MySQL 8 (`caching_sha2_password`). This script reuses the `mysql2` driver that the backend already depends on, so nothing has to be installed:

```bash
cd insurance-landing-demo
node database/scripts/import-aiven.js --cnf ~/Desktop/aiven.cnf --database defaultdb
```

It prints the connected server and user, streams the dump, then verifies every table:

```text
==> 1/3 เชื่อมต่อ <host>:25060 (user avnadmin, database defaultdb, TLS verify CA)
==> 2/3 import insurance_landing_demo_aiven_20261102.sql (84.2 KB)
==> 3/3 ตรวจสอบจำนวนแถว
    OK   whole_life_rates             1200 (คาดว่า 1200)
    ...
==> เสร็จสิ้น: ข้อมูลบน Aiven ครบทุกตาราง
```

Useful flags: `--verify-only` (counts only), `--dry-run` (connect + validate file, skip the import), `--dump <file>`, `--database <name>`.

### Alternative: mysql CLI (requires a MySQL 8 client)

```bash
mysql --defaults-extra-file=/tmp/aiven.cnf defaultdb \
  < database/exports/insurance_landing_demo_aiven_20261102.sql

mysql --defaults-extra-file=/tmp/aiven.cnf defaultdb -e "
  SELECT 'whole_life_rates', COUNT(*) FROM whole_life_rates UNION ALL
  SELECT 'ci50_rates', COUNT(*) FROM ci50_rates UNION ALL
  SELECT 'index_linked_plan_schedule', COUNT(*) FROM index_linked_plan_schedule;"
```

Or use the bash helper (`./database/scripts/import-aiven.sh`), which does the same three steps with the `mysql` client.

Expected row counts: `calculator_settings` 1, `payment_factors` 4, `whole_life_rates` 1,200, `ci50_rates` 200, `demo_plans` 3, `index_linked_plans` 2, `index_linked_plan_schedule` 50, `index_linked_scenarios` 4.

### 6.3 Point the backend at Aiven

```ini
NODE_ENV=production
DB_HOST=<service>-<project>.aivencloud.com
DB_PORT=<port>
DB_USER=avnadmin
DB_PASSWORD=<your-password>
DB_NAME=defaultdb
DB_SSL_ENABLED=true
DB_SSL_CA_PATH=/path/to/ca.pem
# DB_SOCKET_PATH must stay unset in production
```

`backend/src/config/db.js` fails fast (`DB_CONFIG_INVALID`) when production settings are incomplete, forces `rejectUnauthorized: true`, and ignores `DB_SOCKET_PATH` outside development.

---

## 7. Security & Parameterized Query Rules

- **No Concatenated Queries:** Every query in `leadRepository.js`, `planRepository.js`, `rateRepository.js` and `indexLinkedRepository.js` uses `?` placeholders provided by `mysql2/promise`.
- **Strict Data Types:** Status updates are validated against an allowed set before hitting SQL.
- **Port Isolation:** The local MySQL service is configured to bind to `127.0.0.1` and must not be exposed to the public Internet without a firewall. Aiven connections use TLS with `rejectUnauthorized: true` and a CA bundle path.
