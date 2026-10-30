# REST API Documentation

**Service Name:** OrangeCare Insurance Demo API  
**Base URL:** `http://localhost:3000/api/v1`  
**Data Format:** JSON (`Content-Type: application/json; charset=utf-8`)

---

## 1. Response Standards

All API responses return a standardized JSON structure:

### Success Response Format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response Format:
```json
{
  "success": false,
  "message": "Human-readable summary of the error",
  "errors": [
    "Specific validation or error description"
  ]
}
```

---

## 2. Standard HTTP Status Codes

- `200 OK`: Successful read or update operations.
- `201 Created`: Successful creation of resources (e.g. Lead submission).
- `400 Bad Request`: Payload validation failures or invalid query parameters.
- `404 Not Found`: Target resource or endpoint does not exist.
- `409 Conflict`: Duplicate submission detected within the cooldown window.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Server or database failure (sanitized, no stack traces leaked).
- `503 Service Unavailable`: Health check reports database connection degraded.

---

## 3. Endpoints Specification

### 3.1 Health Check

#### `GET /health`
Verifies server uptime and MariaDB/MySQL database connectivity.

**Response `200 OK` (when database is connected):**
```json
{
  "success": true,
  "service": "OrangeCare Insurance Demo API",
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-10-24T14:30:00.000Z",
  "uptimeSeconds": 120,
  "database": {
    "connected": true,
    "message": "เชื่อมต่อฐานข้อมูลสำเร็จ"
  },
  "demoNotice": "ข้อมูลทั้งหมดที่ให้บริการผ่าน API นี้เป็นข้อมูลตัวอย่างเพื่อการสาธิตและทดสอบเท่านั้น"
}
```

---

### 3.2 Demo Plans

#### `GET /plans`
Retrieves all active demo insurance plans for display on the landing page.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "ดึงข้อมูลแผนประกันตัวอย่างสำเร็จ",
  "data": [
    {
      "id": 1,
      "planName": "OrangeCare สุขภาพเหมาจ่าย (แผนตัวอย่าง)",
      "description": "แผนคุ้มครองสุขภาพจำลอง ครอบคลุมค่ารักษาพยาบาลผู้ป่วยในและผู้ป่วยนอก",
      "demoPremium": "เริ่มต้น 1,450 บ./เดือน (สมมติ)",
      "coverageSummary": [
        "วงเงินค่ารักษาจำลองสูงสุด 5,000,000 บาท/ปี (ตัวอย่าง)",
        "ครอบคลุมค่าห้องและค่าอาหารแบบเหมาจ่ายตามจริง (ตัวอย่าง)"
      ],
      "isDemo": true,
      "isActive": true
    }
  ]
}
```

#### `GET /plans/:id`
Retrieves a single demo plan by ID. Returns `404 Not Found` if missing.

---

### 3.3 Consultation Requests (Leads)

#### `POST /leads`
Submits a new consultation request from the landing page.

- **Rate Limit:** 15 requests per 15 minutes per IP.
- **Cooldown Window:** 2 minutes for identical phone number.

**Request Body:**
```json
{
  "fullName": "สมชาย ใจดี",
  "phone": "0812345678",
  "email": "somchai@example.com",
  "insuranceInterest": "health",
  "preferredContactMethod": "phone",
  "consentGiven": true
}
```

**Validation Constraints:**
- `fullName`: String, 2-150 characters (required).
- `phone`: Standard 9-10 digit telephone format starting with `0` (e.g. `0812345678`) (required).
- `email`: Valid email syntax, max 150 characters (optional).
- `insuranceInterest`: One of `['health', 'life', 'accident', 'savings', 'car', 'other']` (required).
- `preferredContactMethod`: One of `['phone', 'email', 'line']` (required).
- `consentGiven`: Boolean `true` strictly required.

**Success Response `201 Created`:**
```json
{
  "success": true,
  "message": "บันทึกคำขอรับคำปรึกษาตัวอย่างสำเร็จ",
  "data": {
    "id": 1,
    "status": "pending",
    "isDemo": true,
    "fullName": "สมชาย ใจดี",
    "phone": "0812345678"
  }
}
```

**Validation Error Response `400 Bad Request`:**
```json
{
  "success": false,
  "message": "ข้อมูลการขอคำปรึกษาไม่ถูกต้องตามเงื่อนไข",
  "errors": [
    "กรุณาระบุชื่อ-นามสกุลให้ถูกต้อง (อย่างน้อย 2 ตัวอักษร)",
    "กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (เช่น 0812345678 หรือ 021234567)"
  ]
}
```

**Conflict Response `409 Conflict` (when submitting same phone within 2 min):**
```json
{
  "success": false,
  "message": "ท่านได้ส่งคำขอคำปรึกษาด้วยเบอร์โทรนี้ไปแล้ว กรุณารอสักครู่ก่อนทำรายการใหม่อีกครั้ง",
  "errors": [
    "ท่านได้ส่งคำขอคำปรึกษาด้วยเบอร์โทรนี้ไปแล้ว กรุณารอสักครู่ก่อนทำรายการใหม่อีกครั้ง"
  ]
}
```

---

### 3.4 Admin Leads Management

> [!NOTE]
> The admin endpoints below are provided for demo evaluation purposes. In a production environment, they must be guarded by an authentication and authorization layer.

#### `GET /leads`
Lists leads with optional query filtering and pagination.

**Query Parameters:**
- `search` (optional): Filter by substring matching `full_name` or `phone`.
- `status` (optional): Filter by `pending`, `contacted`, `closed`, `cancelled`, or `all`.
- `limit` (optional, default 50): Page size.
- `offset` (optional, default 0): Pagination offset.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "ดึงข้อมูลรายการคำขอสำเร็จ",
  "data": [
    {
      "id": 1,
      "fullName": "สมชาย ใจดี",
      "phone": "0812345678",
      "email": "somchai@example.com",
      "insuranceInterest": "health",
      "preferredContactMethod": "phone",
      "consentGiven": true,
      "status": "pending",
      "isDemo": true,
      "createdAt": "2026-10-24T14:00:00.000Z",
      "updatedAt": "2026-10-24T14:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

#### `PATCH /leads/:id/status`
Updates the status of a demo lead.

**Request Body:**
```json
{
  "status": "contacted"
}
```
*Allowed status values:* `pending`, `contacted`, `closed`, `cancelled`.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "อัปเดตสถานะคำขอเป็น contacted สำเร็จ",
  "data": {
    "id": 1,
    "previousStatus": "pending",
    "currentStatus": "contacted"
  }
}
```

#### `DELETE /leads/:id`
Deletes a demo lead record by ID.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "ลบรายการคำขอตัวอย่าง #1 สำเร็จ",
  "data": {
    "id": 1,
    "deleted": true
  }
}
```

---

### 3.5 Calculator Rates

#### `GET /rates`
Retrieves the complete MySQL-backed rate dataset used by the interactive quotation calculator. The endpoint validates the high-coverage threshold, all four payment factors, and every whole-life and CI50 age table before returning data. It returns a sanitized `500 Internal Server Error` response if the calculator migration is missing or its seed data is incomplete.

**Database prerequisite:** Import `database/003_calculator_rates.sql` after the core schema and demo seed scripts.

**Response `200 OK` (abridged):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลอัตราเบี้ยสำหรับเครื่องคำนวณสำเร็จ",
  "data": {
    "highCoverageThreshold": 500000,
    "paymentFactors": {
      "annual": 1,
      "semiAnnual": 0.52,
      "quarterly": 0.27,
      "monthly": 0.09
    },
    "wholeLife": {
      "standard": {
        "10": { "M": [19.9], "F": [16.2] },
        "20": { "M": [11.4], "F": [9.2] },
        "90": { "M": [0], "F": [0] }
      },
      "highCoverage": {
        "10": { "M": [18.9], "F": [15.2] },
        "20": { "M": [10.4], "F": [8.2] },
        "90": { "M": [0], "F": [0] }
      }
    },
    "ci50": {
      "M": [0],
      "F": [0]
    }
  }
}
```

Each gender array contains 100 entries indexed directly by age (0–99). Each whole-life rate set contains the payment terms `10`, `20`, and `90`; values are rates per 1,000 THB of coverage. The arrays above are abridged for readability and are not valid standalone calculation fixtures.
