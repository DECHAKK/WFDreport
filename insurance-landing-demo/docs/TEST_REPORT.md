# Quality Assurance & Test Report

**Project:** OrangeCare Insurance Demo (`insurance-landing-demo`)  
**Report Date:** 2026-10-24 (latest run: 2026-11-02 — index linked savings plans added)  
**Executed By:** Senior Full-Stack Engineer & QA Engineer  
**Environment:** Node.js v24.13.0, npm v11.6.2, macOS host, XAMPP MySQL/MariaDB running on port 3306

---

## 0. Latest Run — Index Linked Savings Plans (25/7 and 25/15)

Feature: new MySQL tables + `/api/v1/index-linked` endpoints + `/index-linked` page that renders a single-page
25-year benefit projection table (2%, 4%, 6% and the **new 8%** index growth column).

| Suite | Command | Tests | Passed | Failed |
| :--- | :--- | :---: | :---: | :---: |
| Backend unit (`dbConfig` + `indexLinked`) | `node --test src/test/dbConfig.test.js src/test/indexLinked.test.js` | 28 | **28** | 0 |
| Backend end-to-end API (`api.test.js`) | `npm test` | 20 | **20** | 0 |
| Frontend (vitest) | `cd frontend && npm test` | 19 | **19** | 0 |
| TypeScript + production build | `cd frontend && npm run build` | 1 | **1** | 0 |

**Verification against the source quotation (sum assured 100,000 / age 30 / PR 100%)**

| Index growth | NG at policy year 7 | NG at policy year 25 | Total NG | IRR |
| :---: | ---: | ---: | ---: | ---: |
| 2% | 52,045 | 224,210 | 276,255 | 1.75% |
| 4% | 110,565 | 583,030 | 693,595 | 3.61% |
| 6% | 176,260 | 1,152,165 | 1,328,425 | 5.69% |
| 8% (new) | 249,830 | 2,046,975 | 2,296,805 | 7.95% |

Guaranteed columns also match the quotation exactly: cashback 1,000 THB/year (years 1–24), maturity 700,000 THB,
total guaranteed 724,000 THB, death benefit 101,000 → 707,000 THB, cash value 3,300 (year 1) → 700,000 THB (year 25).
The 2%, 4% and 6% columns are byte-identical to the printed table because the index level is rounded to 2 decimals
before the formula is applied, as the insurer's calculator does.

**API smoke test (live, XAMPP MySQL):** `GET /api/v1/index-linked/plans` → 200; `POST /api/v1/index-linked/quote`
→ 200 with the table above; validation returns `400` (age band, minimum sum assured, missing plan code) and `404`
(unknown plan) with Thai messages and no SQL details.

---

## 1. Executive Summary (initial run — 2026-10-24)

| Category | Total | Passed | Failed | Blocked / Pending DB |
| :--- | :---: | :---: | :---: | :---: |
| **Backend Unit & Integration Tests** | 8 | 8 | 0 | 0 |
| **Frontend Component Tests** | 6 | 6 | 0 | 0 |
| **TypeScript & Production Build** | 1 | 1 | 0 | 0 |
| **Live API Endpoint Integration (curl)** | 2 | 2 | 0 | 0 |
| **Live SQL Write (Requires XAMPP 3306)** | 1 | N/A | 0 | 1 (Requires running MySQL) |

---

## 2. Backend Automated Test Suite (`node --test`)

Command:
```bash
cd insurance-landing-demo/backend && npm test
```

### Results Output:
```text
▶ OrangeCare Demo API Tests
  ✔ GET / should return welcome message and documentation link (29.66ms)
  ✔ GET /api/v1/health should return health payload with headers (31.18ms)
  ✔ GET /api/v1/unknown should return 404 in standardized JSON format (2.97ms)
  ▶ Lead Submission Validation
    ✔ POST /api/v1/leads should fail when required fields are missing (12.37ms)
    ✔ POST /api/v1/leads should fail when phone number is invalid (3.75ms)
    ✔ POST /api/v1/leads should fail when consent is not given (2.63ms)
    ✔ POST /api/v1/leads should fail when insuranceInterest is invalid (2.65ms)
    ✔ PATCH /api/v1/leads/1/status should fail with invalid status value (2.70ms)
  ✔ Lead Submission Validation (24.61ms)
✔ OrangeCare Demo API Tests (89.61ms)
ℹ tests 8
ℹ suites 2
ℹ pass 8
ℹ fail 0
```
**Status:** **PASSED (8/8)**

---

## 3. Frontend Component Test Suite (`vitest run`)

Command:
```bash
cd insurance-landing-demo/frontend && npm test
```

### Results Output:
```text
 ✓ src/test/components.test.tsx (6)
   ✓ Frontend Component Tests (6)
     ✓ Navbar renders brand logo and demo badge
     ✓ HeroSection renders Thai headline and CTA buttons
     ✓ BenefitsSection renders sample benefits
     ✓ FAQSection toggles accordion item
     ✓ LeadForm validates required fields before submitting
     ✓ Footer renders prominent demo disclaimer

 Test Files  1 passed (1)
      Tests  6 passed (6)
```
**Status:** **PASSED (6/6)**

---

## 4. Frontend Production Build & Type Checking

Command:
```bash
cd insurance-landing-demo/frontend && npm run build
```

### Results Output:
```text
> tsc && vite build

vite v6.4.5 building for production...
✓ 1594 modules transformed.
dist/index.html                   1.36 kB │ gzip:  0.74 kB
dist/assets/index-CYFCWHbO.css   36.94 kB │ gzip:  6.52 kB
dist/assets/index-CBHsCwAN.js   260.79 kB │ gzip: 73.62 kB
✓ built in 2.30s
```
**Status:** **PASSED (0 TypeScript compile errors, 0 bundle warnings)**

---

## 5. Live Endpoint & Security Smoke Verification

### 5.1 Health Check Resilience
- **Command:** `curl -s http://localhost:3000/api/v1/health`
- **Output:**
  ```json
  {
    "success": false,
    "service": "OrangeCare Insurance Demo API",
    "status": "degraded",
    "version": "1.0.0",
    "timestamp": "2026-10-24T15:08:08.459Z",
    "uptimeSeconds": 9,
    "database": {
      "connected": false,
      "message": "Unable to connect to MySQL/MariaDB database"
    },
    "demoNotice": "All data served by this API is strictly for demonstration and testing purposes."
  }
  ```
- **Finding:** The backend does not crash or expose unhandled stack traces when MySQL is offline. It gracefully returns a client-safe degraded health report with Helmet headers (`x-content-type-options: nosniff`).

### 5.2 Server-Side Validation Rejection
- **Command:**
  ```bash
  curl -s -X POST http://localhost:3000/api/v1/leads \
    -H "Content-Type: application/json" \
    -d '{"fullName":"","phone":"123","consentGiven":false}'
  ```
- **Output:**
  ```json
  {
    "success": false,
    "message": "ข้อมูลการขอคำปรึกษาไม่ถูกต้องตามเงื่อนไข",
    "errors": [
      "กรุณาระบุชื่อ-นามสกุลให้ถูกต้อง (อย่างน้อย 2 ตัวอักษร)",
      "กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (เช่น 0812345678 หรือ 021234567)",
      "กรุณาเลือกประเภทประกันภัยที่สนใจ (health, life, accident, savings, car, other)",
      "กรุณาเลือกช่องทางการติดต่อที่สะดวก (phone, email, line)",
      "ต้องให้ความยินยอมในการประมวลผลข้อมูลตัวอย่างก่อนส่งคำขอ"
    ]
  }
  ```
- **Finding:** Correct HTTP 400 Bad Request with localized Thai feedback.

---

## 6. Verification Status: Tests Passed vs. Pending External Services

### Tests Fully Passed and Verified:
1. Express application bootstrapping, routing, middleware pipeline.
2. Helmet security headers and CORS configuration.
3. Parameterized query templates in `planRepository.js` and `leadRepository.js`.
4. Sanitized error handling (zero SQL traces or credentials leaked).
5. Frontend page routing (`/`, `/privacy`, `/admin`).
6. Responsive OrangeCare Tailwind design tokens (`#F97316`, `#EA580C`, `#FFF7ED`).
7. Form client-side validation and accordion UI interactions.
8. Anti-spam / duplicate submission cooldown logic.

### Tests Pending External Service (XAMPP):
1. **Live SQL Persistence on Port 3306:**
   - **Reason:** In the current test container environment, a local MySQL daemon is not running on port 3306.
   - **Action Required on Target Windows/XAMPP Machine:** Start MySQL in XAMPP and import `database/001_create_schema.sql`, `database/002_seed_demo_data.sql`, and `database/003_calculator_rates.sql` in that order via phpMyAdmin. The third script is required for the calculator's `/api/v1/rates` endpoint.

---

## 7. Thai Localization Pass (2026-10-29)

**Scope:** Remaining English UI strings were translated into Thai so the whole user journey (landing page, calculator, quote document, admin dashboard, privacy notice, API responses) is Thai-first. Product codes and proper nouns (`CI50`, `PDF`, `PNG`, `MariaDB/MySQL`, `PDPA`, bank names, the `OrangeCare` brand) were intentionally kept.

### Files localized:
| Layer | Files | What changed |
| :--- | :--- | :--- |
| Frontend components | `Navbar`, `HeroSection`, `PlansSection`, `FAQSection`, `Footer`, `LeadForm`, `InsuranceCalculator`, `QuoteResultCard` | Badges (`Demo Project`, `PROTOTYPE`, `Demo Data`, `DEMO DATA NOTICE`), English parentheticals, form option labels (`(Health)`, `(Life)`, `(Optional)`), payment labels (`(Annual)`, `(Monthly)`), placeholders |
| Frontend pages | `AdminPage`, `CalculatorPage`, `PrivacyPage`, `HomePage` | Status labels/dropdowns (`Pending`, `Contacted`, `Closed`, `Cancelled`), table header `#ID`, `Demo Record`, interest/contact-method labels (now mapped Thai), security & privacy notices |
| Frontend services | `quoteCalculationService`, `apiClient`, `pdfExportService` | Plan display names (`CI Fixed Pay 90/5` → `ประกันโรคร้ายแรงชำระเบี้ยคงที่ 90/5`, `Ultra Care 5M` → `วงเงิน 5 ล้าน`), rate-lookup error, network/HTTP error messages |
| Backend | `app.js`, `controllers/*`, `middleware/errorHandler`, `middleware/validateLead`, `routes/health`, `routes/leads`, `config/db`, `services/leadService`, `services/rateService` | All client-facing `message` / `errors` payloads now Thai (still machine-parseable `success`, `status`, `code` fields) |
| Database seed | `002_seed_demo_data.sql` | `(Demo Plan)` → `(แผนตัวอย่าง)`, `(Demo)` → `(ตัวอย่าง)`, sample lead names `(ตัวอย่าง Demo)` → `(ตัวอย่าง)` |
| Docs & tests | `docs/API.md`, `backend/src/test/api.test.js`, `frontend/src/test/components.test.tsx`, `frontend/src/test/quoteCalculationService.test.ts` | Sample payloads and assertions kept in sync with the Thai strings |

### Verification results:
```text
backend  : npm test            -> 16/16 tests passed (suites 2, fail 0)
frontend : npm test (vitest)   -> 15/15 tests passed (2 files)
frontend : npm run build       -> tsc clean + vite build succeeded
live API : GET /api/v1/plans   -> {"message":"ดึงข้อมูลแผนประกันตัวอย่างสำเร็จ", ... "(แผนตัวอย่าง)"}
live API : GET /api/v1/health  -> database.message "เชื่อมต่อฐานข้อมูลสำเร็จ"
```

### Local database alignment:
The existing local `insurance_landing_demo` database still held the previous English seed values, so the demo rows were updated in place (targeted `UPDATE ... REPLACE(...)` statements — no re-import, leads preserved), and `database/003_calculator_rates.sql` was imported locally (1,200 whole-life rates, 200 CI50 rates, 4 payment factors) so `GET /api/v1/rates` and the calculator work.

