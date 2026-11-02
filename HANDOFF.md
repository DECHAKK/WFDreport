# 📌 HANDOFF — บันทึกงาน & แผนงานถัดไป

> ไฟล์นี้เป็นบันทึกการทำงาน (session notes) ไม่ใช่เอกสารผลิตภัณฑ์
> ใช้สำหรับกลับมาทำงานต่อในวันถัดไป

| รายการ | ค่า |
| :--- | :--- |
| **วันที่บันทึก** | 2026-10-31 (ศุกร์) |
| **กำหนดทำงานต่อ** | 2026-11-01 (เสาร์) |
| **โปรเจกต์** | WFDreport → `insurance-landing-demo` |
| **Branch** | `main` |
| **Commit ล่าสุดก่อนเริ่มงาน** | `a32c090` — "update to git" |
| **สถานะ** | 🟡 โค้ดเสร็จและทดสอบผ่านแล้ว — **ยังไม่ commit, ยังไม่ deploy, ยังไม่ migrate** |

---

## ✅ 1. สิ่งที่ทำเสร็จวันนี้ (2026-10-31)

**งาน:** เพิ่มการรองรับ **Aiven MySQL สำหรับ Production** โดยไม่กระทบ XAMPP เดิม

### ไฟล์ที่เปลี่ยนแปลง

| ไฟล์ | สถานะ | สาระ |
| :--- | :--- | :--- |
| `backend/src/config/db.js` | 🔧 แก้ไข (+222) | env resolution, `validateProductionConfig()`, TLS builder, fail-fast, `try/finally` release, error sanitizer |
| `backend/src/server.js` | 🔧 แก้ไข (+9) | log แสดง target จริงผ่าน `describeConnectionTarget()` แทนข้อความ XAMPP ที่ hardcode |
| `backend/.env.example` | 🔧 แก้ไข (+46) | เอกสารแยก 2 environment (dev / production) |
| `backend/src/test/dbConfig.test.js` | 🆕 ใหม่ | 16 unit tests — รันได้โดยไม่ต้องเปิด MySQL |

### ไม่แตะเลย (ยืนยันแล้ว)
`backend/.env` (mtime ยัง 29 ต.ค.) · `package.json` (ไม่มี dependency ใหม่) · `frontend/` ทั้งหมด ·
`routes/` · `controllers/` · `services/` · `repositories/` · `middleware/` · `database/*.sql`

### หลักการที่ใช้
- **`NODE_ENV` เป็นสวิตช์เดียว** — ไม่ใช่ production = พฤติกรรมเดิมทุกอย่าง
- **`rejectUnauthorized` hardcode เป็น `true`** — ไม่มี env ใดปิด certificate verification ได้
- **`checkConnection()` คงเดิม 100%** — ชื่อ, signature, return shape, ข้อความไทยทั้ง 2 ประโยค
- **`socketPath` ใช้เฉพาะ dev** — production ใช้ TCP เท่านั้น

### Environment variables ที่เพิ่ม
```ini
DB_SSL_ENABLED=true|false     # dev = false (default), prod = บังคับ true
DB_SSL_CA_PATH=/path/ca.pem   # ทางที่แนะนำ — ใช้ใน production
DB_SSL_CA=<PEM text>          # ทางเลือก สำหรับ host ที่ mount secret file ไม่ได้
```

---

## 🧪 2. ผลทดสอบ ณ วันนี้

```bash
cd insurance-landing-demo/backend && npm test
```

| | ก่อนงานนี้ | หลังงานนี้ |
| :--- | ---: | ---: |
| tests | 18 | **34** |
| pass | 7 | **23** |
| fail | 11 | **11** (เท่าเดิม) |

- ✅ **เทสใหม่ 16 ตัวผ่านทั้งหมด** — ครอบคลุม dev/XAMPP, production validation, TLS/SSL, credential leak
- ⚠️ **11 เทสที่ fail เป็นปัญหาเดิม ไม่เกี่ยวกับงานนี้** → `connect ENOENT /Applications/XAMPP/xamppfiles/var/mysql/mysql.sock`
  → สาเหตุ: **XAMPP MySQL ยังไม่เปิด** (ไม่ใช่ bug ในโค้ด)

### การรันจริงที่บันทึกไว้
- Dev mode → `has ssl key=false`, `socketPath` ทำงาน, pool `true/10/0/utf8mb4` → **เหมือนเดิม**
- Prod config ไม่ครบ → `DB_CONFIG_INVALID` พร้อมบอกชื่อตัวแปร (ไม่มีค่า secret)
- Prod config ถูกต้อง → `ssl.rejectUnauthorized=true`, `minVersion=TLSv1.2`, `socketPath` ถูกเพิกเฉย
- `checkConnection()` เมื่อ fail → `isConnected=false`, คืน connection แล้ว (`allCount=0` ไม่รั่ว)

---

## 🚨 3. เรื่องที่ค้างอยู่ (ต้องจัดการ)

1. **XAMPP MySQL ยังไม่เปิด** → ทำให้ 11 เทสเดิม fail
2. **`backend/.env` ของเครื่องนี้มี `DB_SOCKET_PATH`** → ถ้ารัน `NODE_ENV=production` จะ fail validation
   (ถูกต้องแล้ว แต่ต้องรู้ตัว — ห้ามมีค่านี้ใน production)
3. **ยังไม่ได้ commit** งานวันนี้
4. **ยังไม่ deploy / migrate database** (ตามข้อกำหนดงาน)
5. **`frontend/dist/` เก่า** — gitignored อยู่ ไม่กระทบ แต่ถ้าใช้ serve build ต้อง rebuild

---

## 🎯 4. แผนงานพรุ่งนี้ (2026-11-01) — เรียงตามลำดับ

### 🔴 ลำดับที่ 1: ทำให้ test เขียวครบ 34 (สำคัญที่สุด)
```bash
# 1) เปิด MySQL ใน XAMPP Control Panel
# 2) import 3 script ตามลำดับ ผ่าน phpMyAdmin
#    database/001_create_schema.sql
#    database/002_seed_demo_data.sql
#    database/003_calculator_rates.sql   <- จำเป็นสำหรับ /api/v1/rates

# 3) รันเทส
cd insurance-landing-demo/backend && npm test        # คาดหวัง: tests 34 / pass 34 / fail 0

# 4) ตรวจ health
npm run dev
curl http://localhost:3000/api/v1/health             # คาดหวัง: 200, database.connected=true
```

### 🟠 ลำดับที่ 2: เตรียม Aiven (ยังไม่ต้อง deploy)
- [ ] สร้าง Aiven MySQL service
- [ ] ดาวน์โหลด `ca.pem` จาก Aiven Console
- [ ] เก็บ `ca.pem` + password ลง secret manager (**ห้าม commit**)
- [ ] ทดสอบเชื่อมจากเครื่อง local แบบ read-only:
```bash
cd insurance-landing-demo/backend
NODE_ENV=production DB_SOCKET_PATH= \
DB_HOST=<service>.aivencloud.com DB_PORT=<port> \
DB_USER=avnadmin DB_PASSWORD=<secret> DB_NAME=defaultdb \
DB_SSL_ENABLED=true DB_SSL_CA_PATH=/path/to/ca.pem \
node -e "const d=require('./src/config/db'); d.pool.query('SELECT 1').then(([r])=>{console.log('OK',r);return d.pool.end()}).catch(e=>{console.error(e.message);process.exit(1)})"
```

### 🟡 ลำดับที่ 3: ตัดสินใจเรื่อง Database migration
- ยัง **ไม่ทำ** ตามข้อกำหนด — ต้องขออนุมัติก่อน
- คำถามที่ต้องตอบ: จะย้าย schema + seed ขึ้น Aiven อย่างไร (manual import / script / CLI)

### 🟢 ลำดับที่ 4: เอกสารให้ตรงกับความจริง
- [ ] `docs/DEVELOPMENT_WORKFLOW.md` §4 — เพิ่มตัวแปร SSL + ตัวอย่าง production
- [ ] `docs/DATABASE.md` — เพิ่มหัวข้อ "Aiven MySQL (Production)"
- [ ] `docs/TEST_REPORT.md` — ตัวเลขจริงชุดใหม่ (34/23/11) พร้อมคำอธิบายว่า 11 ตัว fail เพราะ MySQL ปิด
- [ ] `docs/ARCHITECTURE.md` §TLS — ปัจจุบันเขียนว่า "Terminate SSL via Nginx" → ควรระบุว่า DB layer มี TLS แล้ว

### 🔵 ลำดับที่ 5: หนี้ทางเทคนิคที่เจอ (ยังไม่แก้)
- **Test runner ไม่ตรงกับ AGENTS.md** — เอกสารบอก Vitest/Supertest แต่ `backend/package.json` ใช้ `node --test`
  (frontend ใช้ `vitest run` ถูกต้องแล้ว) → ต้องเลือกว่าจะแก้อันไหน
- `frontend/dist/` ค้างในเครื่อง (gitignored)

### 🟣 ลำดับที่ 6: Commit
```bash
cd /Users/mac/Desktop/WFDreport
git add insurance-landing-demo/backend/src/config/db.js \
        insurance-landing-demo/backend/src/server.js \
        insurance-landing-demo/backend/.env.example \
        insurance-landing-demo/backend/src/test/dbConfig.test.js
git commit -m "feat(db): support Aiven MySQL in production with verified TLS"
```
> ⚠️ ก่อน commit ให้ `git status` ตรวจว่า **ไม่มี `.env` หรือไฟล์ cert/key ติดไปด้วย**

---

## 🧭 5. คำสั่งที่ใช้บ่อยในโปรเจกต์นี้

```bash
cd /Users/mac/Desktop/WFDreport/insurance-landing-demo

# Backend
cd backend
npm install          # ครั้งแรก
npm run dev          # http://localhost:3000
npm start            # production start
npm test             # node --test

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run
npm run build        # tsc && vite build
```

> หมายเหตุ: terminal บนเครื่องนี้รายงาน "Command completion could not be observed" (shell integration)
> แต่คำสั่งทำงานปกติ — ถ้าไม่เห็น output ให้เขียนลงไฟล์แล้ว `cat` เช่น
> `npm test > /tmp/out.txt 2>&1; cat /tmp/out.txt`

---

## 🔐 6. กติกาความปลอดภัยที่ต้องคงไว้ (ห้ามละเมิด)

1. **ห้าม commit** `.env`, password, private key, `ca.pem` ที่มีข้อมูลอ่อนไหว
2. **ห้ามใช้** `rejectUnauthorized: false` — แม้แต่ใน dev ที่ต่อ Aiven
3. **ห้ามให้ password หลุด** ใน log หรือ error response (ใช้ `sanitizeDbErrorMessage()`)
4. **ห้าม hardcode** host/user/password ของ Aiven ในโค้ด
5. ใช้ parameterized query (`?`) เท่านั้น — ห้ามต่อ string SQL (ตาม `AGENTS.md`)
6. **ห้ามตั้ง `DB_SOCKET_PATH` ใน production**

---

## 📎 7. ข้อมูลอ้างอิงเร็ว

- Base URL API: `/api/v1` → `/health`, `/plans`, `/rates`, `/leads`
- `db.js` exports: `{ pool, dbConfig, checkConnection, validateProductionConfig, buildDbConfig, describeConnectionTarget, sanitizeDbErrorMessage }`
- สีแบรนด์: `#F97316` / `#EA580C` / `#FFF7ED` / `#1F2937`
- เอกสารในโปรเจกต์: `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/API.md`, `docs/DEVELOPMENT_WORKFLOW.md`, `docs/TEST_REPORT.md`
