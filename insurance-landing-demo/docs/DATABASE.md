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
   ```
5. Verify that 3 rows exist in `demo_plans` and 3 demo rows exist in `leads`.
6. Verify the final result of the third script reports 1,200 `whole_life_rates`, 200 `ci50_rates`, and 4 `payment_factors`. The `/api/v1/rates` endpoint validates that every required age and payment-frequency rate is present.

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
```
*(If your root user has no password, you can omit `-p`).*

---

## 6. Security & Parameterized Query Rules
- **No Concatenated Queries:** Every query in `leadRepository.js` and `planRepository.js` uses `?` placeholders provided by `mysql2/promise`.
- **Strict Data Types:** Status updates are validated against an allowed set before hitting SQL.
- **Port Isolation:** The MySQL service is configured to bind to `127.0.0.1` and must not be exposed to the public Internet without a firewall.
