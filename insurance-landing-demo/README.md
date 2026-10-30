# OrangeCare Insurance Demo 🍊

> **Disclaimer & Notice:** This project is an independent educational and technical demonstration for learning software architecture, modern web development, and lead management systems. It is **NOT** affiliated with, authorized by, or impersonating FWD or any commercial insurer. All sample insurance products, premiums, and benefits are strictly **HYPOTHETICAL DEMO DATA**. No real insurance policies are issued, and no real monetary transactions are accepted.

---

## 🌟 Highlights
- **Modern Orange Brand Aesthetic:** Warm, approachable design using Tailwind CSS (`#F97316`, `#EA580C`, `#FFF7ED`, `#1F2937`).
- **Full-Stack Separation:** React 18 + Vite + TypeScript frontend paired with an Express.js layered REST API.
- **Relational SQL Database:** MariaDB/MySQL with `InnoDB` and `utf8mb4` character set, ready for XAMPP phpMyAdmin import.
- **Consultation Leads Pipeline:** Clean validation, anti-spam duplicate prevention, rate limiting, and CRM management.
- **Full Admin Demo Page:** Search, filter, update lead status, and delete test records.
- **Security-First Practices:** Parameterized SQL queries, Helmet headers, CORS restrictions, body size limits, no sensitive credentials exposed.

---

## 📁 Repository Structure
```
insurance-landing-demo/
├── frontend/                     # React + Vite + TypeScript + Tailwind CSS
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── assets/               # Branding assets
│   │   ├── components/           # Navbar, Hero, Benefits, Plans, HowItWorks, FAQ, LeadForm, Footer
│   │   ├── pages/                # HomePage, AdminPage, PrivacyPage
│   │   ├── services/             # apiClient.ts (Typed HTTP client)
│   │   ├── types/                # TypeScript data interfaces
│   │   ├── App.tsx               # Client-side router
│   │   ├── main.tsx              # React DOM entry point
│   │   └── index.css             # Tailwind base & animations
│   ├── .env.example              # Sample frontend environment config
│   └── package.json
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # db.js (mysql2/promise pool & health check)
│   │   ├── middleware/           # errorHandler.js, validateLead.js
│   │   ├── routes/               # health.js, plans.js, leads.js
│   │   ├── controllers/          # planController.js, leadController.js
│   │   ├── services/             # leadService.js
│   │   ├── repositories/         # planRepository.js, leadRepository.js
│   │   ├── app.js                # Express app configuration
│   │   └── server.js             # Server startup & graceful shutdown
│   ├── .env.example              # Sample backend environment config
│   └── package.json
│
├── database/                     # MariaDB / MySQL (XAMPP Compatible)
│   ├── 001_create_schema.sql     # Database schema & core tables
│   ├── 002_seed_demo_data.sql    # Hypothetical demo seed data
│   └── 003_calculator_rates.sql  # Calculator settings and complete rate tables
│
├── docs/                         # Detailed Technical Documentation
│   ├── ARCHITECTURE.md           # Architecture diagrams & component responsibilities
│   ├── DATABASE.md               # Database dictionary & phpMyAdmin import guide
│   ├── API.md                    # REST API endpoint reference
│   ├── DEVELOPMENT_WORKFLOW.md   # Step-by-step developer guide
│   └── TEST_REPORT.md            # Verified test suite execution results
│
├── .gitignore
├── README.md
└── AGENTS.md                     # Agentic guidelines & code standards
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (XAMPP / MariaDB)
1. Start MySQL in XAMPP Control Panel.
2. Open `http://localhost/phpmyadmin/`.
3. In phpMyAdmin, click **Import** and upload all three scripts in order:
   - `database/001_create_schema.sql`
   - `database/002_seed_demo_data.sql`
   - `database/003_calculator_rates.sql`

   The third script is required for `GET /api/v1/rates` and the interactive calculator. It creates the calculator tables and loads 1,200 whole-life rates, 200 CI50 rates, and four payment-frequency factors.

### 2. Start Backend API
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Backend runs on `http://localhost:3000`. Test health at `http://localhost:3000/api/v1/health`.

### 3. Start Frontend Client
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🧪 Testing

### Backend Unit & Integration Tests:
```bash
cd backend
npm test
```

### Frontend Component Tests:
```bash
cd frontend
npm test
```

---

## 🛡️ Security & Compliance Roadmap
Before launching an insurance web application into production:
1. **Authentication & Authorization:** Secure the admin portal with multi-factor authentication (MFA) and RBAC.
2. **PDPA & Consent:** Implement formal consent audit trails and data retention destruction policies.
3. **Transport Security:** Enforce HTTPS / TLS 1.3 across all client and backend communications.
4. **Insurer Partnership:** Secure formal regulatory approvals and API integration agreements with licensed insurers.
