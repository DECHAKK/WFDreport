# Deploying the OrangeCare Demo on Vercel

The repository root is the Vercel project: the SPA is built from
`insurance-landing-demo/frontend` and the Express API is exposed as a single
serverless function (`api/index.js`), so the app and the API share one origin
and no CORS setup is required in production.

```
WFDreport/
├── api/index.js          # serverless entrypoint (re-exports backend/src/app)
├── package.json          # deps installed for the function (express, mysql2, …)
├── vercel.json           # build, output dir, rewrites, function settings
├── .vercelignore
└── insurance-landing-demo/
    ├── backend/          # unchanged layered Express app
    └── frontend/         # unchanged Vite React SPA (+ .env.production)
```

---

## 1. Requirements checklist

| Requirement | Status / action |
| :--- | :--- |
| Vercel account + GitHub repo connected | required |
| Node runtime | `engines.node = 22.x` (set in root `package.json`) |
| Aiven MySQL service in **RUNNING** state | required — the API fails fast without a database |
| Aiven CA certificate | supply as **`DB_SSL_CA`** (PEM text); serverless cannot mount `ca.pem` |
| `DB_CONNECTION_LIMIT` | keep **2–5** (serverless instances × Aiven free plan limits) |
| Region | pick **Singapore (sin1)** for both the function and the database |
| Secrets | never commit `.env`, `*.pem`, `*.cnf` (already git-ignored) |

---

## 2. Environment variables (Project → Settings → Environment Variables)

| Name | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | switches `db.js` into Aiven mode with mandatory TLS |
| `DB_HOST` | `<service>-<project>.aivencloud.com` | from Aiven → Connection information |
| `DB_PORT` | `25060` (or the port Aiven shows) | |
| `DB_USER` | `avnadmin` | |
| `DB_PASSWORD` | `<password>` | mark as **Sensitive** |
| `DB_NAME` | `defaultdb` | `avnadmin` cannot create databases on Aiven |
| `DB_SSL_ENABLED` | `true` | forced anyway in production |
| `DB_SSL_CA` | `<contents of ca.pem>` | paste the whole PEM block; use literal `\n` if the UI collapses newlines |
| `DB_CONNECTION_LIMIT` | `5` | |
| `CLIENT_ORIGIN` | `https://<project>.vercel.app` | restricts CORS to the deployed SPA |

> `DB_SOCKET_PATH` must **not** be set in production — `db.js` ignores it and the
> configuration validator rejects it.

---

## 3. Import the database first

```bash
cd insurance-landing-demo
node database/scripts/import-aiven.js --cnf ~/Desktop/aiven.cnf --database defaultdb
```

The script prints the row-count table and fails if any table is incomplete.

---

## 4. Deploy

### Option A — Dashboard
1. **Add New → Project → Import** the `WFDreport` repository.
2. Framework preset: **Other**. Root directory: **`/`** (leave empty).
   Build/output settings are already defined in `vercel.json`.
3. Add the environment variables from section 2.
4. **Deploy**, then verify the endpoints below.

### Option B — CLI
```bash
npm i -g vercel
cd /Users/mac/Desktop/WFDreport
vercel            # link the project (first time)
vercel --prod     # production deploy
```

---

## 5. Post-deploy verification

```bash
BASE=https://<project>.vercel.app
curl -s $BASE/api/v1/health | jq .status
curl -s $BASE/api/v1/index-linked/plans | jq '.data.plans[].planCode'
curl -s -X POST $BASE/api/v1/index-linked/quote \
  -H 'Content-Type: application/json' \
  -d '{"planCode":"SS25_7","gender":"F","age":30,"sumAssured":100000}' \
  | jq '.data.scenarios[] | {annualIndexChangePercent, ngAtSplitYear, irrPercent}'
```

Expected: `healthy`, `SS25_7`/`SS25_15`, and NG values `52,045 / 110,565 / 176,260 / 249,830`
with IRRs `1.75 / 3.61 / 5.69 / 7.95`.

Open the SPA at `https://<project>.vercel.app/index-linked` and confirm the
projection table renders.

---

## 6. Known limitations of the serverless deployment

- **Cold starts** (≈1–2 s) plus Aiven connection setup make the first request slower than the local Express server.
- **Connection pooling**: the pool lives inside each function instance; keep `DB_CONNECTION_LIMIT` low or enable Aiven connection pooling.
- **In-memory rate limiting** on `POST /api/v1/leads` is per instance, so the effective limit is higher than configured.
- **No cron/background jobs**: everything runs per request.
- If sustained traffic or websockets are needed, host the Express API on a long-running platform (Render / Railway / Fly.io) and keep only the SPA on Vercel — set `VITE_API_BASE_URL` to that host instead of `/api/v1`.
