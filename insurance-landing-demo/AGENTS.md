# AGENTS.md - Project Guidelines & Rules

## 1. Project Identity & Purpose
- **Project Name:** OrangeCare Insurance Demo (`insurance-landing-demo`)
- **Nature:** Demonstration and learning sandbox for a modern, responsive insurance landing page.
- **Brand Disclaimer:** This project is an independent educational demo. It does NOT impersonate FWD or any official insurer, does NOT use copyrighted assets, and does NOT sell real insurance or collect payments. All products, coverage limits, and sample premiums are strictly **DEMO DATA**.

---

## 2. Core Architectural & Code Conventions

### Backend (Node.js / Express)
- **Base URL:** `/api/v1`
- **Architecture:** Layered Architecture:
  - `routes/` -> Map endpoints and middleware
  - `middleware/` -> Request validation, error handling, rate limiting, security headers
  - `controllers/` -> HTTP request/response orchestration
  - `services/` -> Business logic & validation rules
  - `repositories/` -> SQL query execution using parameterized queries with `mysql2/promise`
  - `config/` -> Environment configuration and database connection pool
- **Database Rules:**
  - Table engine: `InnoDB`, Character Set: `utf8mb4`.
  - NEVER use concatenated SQL queries. Always use parameterized queries (`?` placeholders).
  - Use database transactions when performing multiple related writes.
  - Never return raw database stack traces or SQL errors to client responses.
  - Return standardized JSON responses:
    `{ "success": boolean, "message": string, "data": any, "errors"?: string[] }`
- **Security:**
  - `helmet` for secure HTTP headers.
  - Strict `cors` configuration allowing only configured frontend origins.
  - Request body size limits (e.g., 50kb).
  - Rate limiting on public submission endpoints.
  - Do NOT store or collect sensitive PII (credit cards, national IDs, passwords).

### Frontend (React / Vite / TypeScript / Tailwind CSS)
- **Component Design:**
  - Small, single-purpose components.
  - Strict TypeScript interfaces for all props, states, and API contracts.
  - Tailwind CSS for all utility styling following the OrangeCare warm-orange palette (`#F97316`, `#EA580C`, `#FFF7ED`, `#1F2937`).
  - Clear visual states: Loading (skeleton/spinner), Error (alert banner with retry), Success (confirmation modal/banner), Empty (friendly zero-state).
  - Responsive design targeting Mobile (<640px), Tablet (640px-1024px), and Desktop (>1024px).
  - Prominent "DEMO DATA" badges and educational disclaimers across all sample plans and forms.

---

## 3. Communication & Error Handling Standards
- When backend is unavailable, NEVER silently show mock data as if it were live from the database. Show a clear network error banner explaining the status.
- Keep frontend and backend schemas strictly synchronized.
- Log server errors to console with sanitization (never log plain personal data or secrets).

---

## 4. Testing Standards
- Unit & integration tests for backend using Vitest / Supertest.
- Component & render tests for frontend using Vitest and React Testing Library.
- Clearly document test commands and outcomes in `docs/TEST_REPORT.md`.
