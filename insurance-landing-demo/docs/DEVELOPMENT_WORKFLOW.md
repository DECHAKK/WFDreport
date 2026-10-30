# Development Workflow & Operations Guide

## 1. Prerequisites
- **Node.js:** v18.0.0 or higher (v24.x tested and supported)
- **npm:** v9.0.0 or higher
- **Database:** MySQL 5.7+ or MariaDB 10.4+ (Default in XAMPP)
- **OS:** Windows (PowerShell / CMD), macOS, or Linux
- **IDE:** Visual Studio Code (recommended)

---

## 2. Step-by-Step Initial Setup

### Step 1: Database Initialization (XAMPP / MariaDB)
1. Launch **XAMPP Control Panel** and click **Start** next to MySQL.
2. Open your browser to `http://localhost/phpmyadmin/`.
3. In phpMyAdmin, go to **Import** and import these scripts in order:
   - `insurance-landing-demo/database/001_create_schema.sql`
   - `insurance-landing-demo/database/002_seed_demo_data.sql`
   - `insurance-landing-demo/database/003_calculator_rates.sql`
4. Confirm database `insurance_landing_demo` contains `demo_plans`, `leads`, `calculator_settings`, `payment_factors`, `whole_life_rates`, and `ci50_rates`.
5. Confirm the calculator seed contains 1,200 `whole_life_rates` rows, 200 `ci50_rates` rows, and 4 `payment_factors` rows. The calculator cannot load rates until the third script has been imported.

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd insurance-landing-demo/backend

# Copy environment variables file
cp .env.example .env

# Install backend dependencies
npm install

# Run backend automated tests
npm test

# Start backend development server (listens on http://localhost:3000)
npm run dev
```

### Step 3: Frontend Setup (in a separate terminal)
```bash
# Navigate to frontend directory
cd insurance-landing-demo/frontend

# Copy environment variables file
cp .env.example .env

# Install frontend dependencies
npm install

# Run frontend unit & component tests
npm test

# Start frontend development server (Vite on http://localhost:5173)
npm run dev
```

---

## 3. Verification & Testing Checklist

| Checkpoint | Target | Expected Result |
| :--- | :--- | :--- |
| **API Health** | `GET http://localhost:3000/api/v1/health` | Returns status 200, `database.connected: true` |
| **Demo Plans** | `GET http://localhost:3000/api/v1/plans` | Returns 3 active demo insurance plan cards |
| **Landing Page** | `http://localhost:5173` | Displays hero section, benefits, plans, FAQ, and lead form |
| **Consultation Lead** | Submit form on `http://localhost:5173` | Shows success reference ID, record saved to DB |
| **Admin Dashboard** | `http://localhost:5173/admin` | Lists submitted lead, allows status update and deletion |
| **Validation Reject** | Submit empty form or bad phone | Form highlights errors in Thai without submitting |

---

## 4. Environment Variables Reference

### Backend (`backend/.env`):
```ini
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=insurance_landing_demo
DB_CONNECTION_LIMIT=10
# Optional for XAMPP on macOS when TCP root login is rejected:
# DB_SOCKET_PATH=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend (`frontend/.env`):
```ini
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 5. Build for Production

### Building Frontend:
```bash
cd insurance-landing-demo/frontend
npm run build
```
Outputs optimized static assets to `frontend/dist/`.

### Running Backend in Production:
```bash
cd insurance-landing-demo/backend
export NODE_ENV=production
npm start
```
