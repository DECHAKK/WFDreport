const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');

describe('OrangeCare Demo API - End-to-End Suite', () => {
  it('GET / should return welcome message and documentation link', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.message.includes('OrangeCare'));
    assert.ok(res.body.demoNotice);
  });

  it('GET /api/v1/health should return 200 and healthy database status', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.service, 'OrangeCare Insurance Demo API');
    assert.strictEqual(res.body.status, 'healthy');
    assert.strictEqual(res.body.database.connected, true);
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  });

  it('GET /api/v1/plans should retrieve seeded demo plans from MySQL', async () => {
    const res = await request(app).get('/api/v1/plans');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
    assert.strictEqual(res.body.data[0].isDemo, true);
    assert.ok(res.body.data[0].planName.includes('แผนตัวอย่าง'));
  });

  it('GET /api/v1/plans/:id should retrieve specific demo plan by id', async () => {
    const res = await request(app).get('/api/v1/plans/1');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.id, 1);
  });

  it('GET /api/v1/plans/99999 should return 404 for nonexistent plan', async () => {
    const res = await request(app).get('/api/v1/plans/99999');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/v1/rates should retrieve complete calculator rates from MySQL', async () => {
    const res = await request(app).get('/api/v1/rates');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.highCoverageThreshold, 500000);
    assert.strictEqual(res.body.data.paymentFactors.monthly, 0.09);
    assert.strictEqual(res.body.data.wholeLife.standard[20].F.length, 100);
    assert.strictEqual(res.body.data.wholeLife.highCoverage[20].F.length, 100);
    assert.strictEqual(res.body.data.ci50.F.length, 100);
    assert.strictEqual(res.body.data.wholeLife.standard[20].F[30], 19.4);
    assert.strictEqual(res.body.data.wholeLife.highCoverage[20].F[30], 18.4);
    assert.strictEqual(res.body.data.ci50.F[30], 1.85);
  });

  it('GET /api/v1/unknown should return 404 in standardized JSON format', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('ไม่พบเส้นทางที่ร้องขอ'));
  });

  describe('Lead Submission Validation & Flow', () => {
    it('POST /api/v1/leads should fail when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({});

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(Array.isArray(res.body.errors));
      assert.ok(res.body.errors.length > 0);
    });

    it('POST /api/v1/leads should fail when phone number is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({
          fullName: 'ทดสอบ ผู้ใช้',
          phone: '12345',
          insuranceInterest: 'health',
          preferredContactMethod: 'phone',
          consentGiven: true,
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors.some((e) => e.includes('เบอร์โทรศัพท์')));
    });

    it('POST /api/v1/leads should fail when consent is not given', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({
          fullName: 'ทดสอบ ผู้ใช้',
          phone: '0812345678',
          insuranceInterest: 'health',
          preferredContactMethod: 'phone',
          consentGiven: false,
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors.some((e) => e.includes('ความยินยอม')));
    });

    it('POST /api/v1/leads should fail when insuranceInterest is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({
          fullName: 'ทดสอบ ผู้ใช้',
          phone: '0812345678',
          insuranceInterest: 'crypto-insurance',
          preferredContactMethod: 'phone',
          consentGiven: true,
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors.some((e) => e.includes('ประเภทประกันภัย')));
    });

    it('PATCH /api/v1/leads/1/status should fail with invalid status value', async () => {
      const res = await request(app)
        .patch('/api/v1/leads/1/status')
        .send({ status: 'invalid-status-key' });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors[0].includes('สถานะไม่ถูกต้อง'));
    });

    let createdLeadId = null;
    const testPhone = `08${Math.floor(10000000 + Math.random() * 90000000)}`;

    it('POST /api/v1/leads should successfully create a lead in MySQL', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({
          fullName: 'คุณทดสอบ ระบบจำลอง',
          phone: testPhone,
          email: 'test.user@demo.example',
          insuranceInterest: 'health',
          preferredContactMethod: 'line',
          consentGiven: true,
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.strictEqual(res.body.data.status, 'pending');
      assert.strictEqual(res.body.data.isDemo, true);
      createdLeadId = res.body.data.id;
    });

    it('POST /api/v1/leads should reject duplicate submission within 2 min window', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({
          fullName: 'คุณทดสอบ ซ้ำ',
          phone: testPhone,
          insuranceInterest: 'life',
          preferredContactMethod: 'phone',
          consentGiven: true,
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('ท่านได้ส่งคำขอคำปรึกษาด้วยเบอร์โทรนี้ไปแล้ว'));
    });

    it('GET /api/v1/leads should return list of leads including created lead', async () => {
      const res = await request(app).get('/api/v1/leads');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.some((l) => l.id === createdLeadId));
    });

    it('GET /api/v1/leads?search=... should filter leads by phone', async () => {
      const res = await request(app).get(`/api/v1/leads?search=${testPhone}`);
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length >= 1);
      assert.strictEqual(res.body.data[0].phone, testPhone);
    });

    it('PATCH /api/v1/leads/:id/status should update lead status in MySQL', async () => {
      const res = await request(app)
        .patch(`/api/v1/leads/${createdLeadId}/status`)
        .send({ status: 'contacted' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.currentStatus, 'contacted');
    });

    it('DELETE /api/v1/leads/:id should delete lead from MySQL', async () => {
      const res = await request(app).delete(`/api/v1/leads/${createdLeadId}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.deleted, true);

      // Verify lead is gone
      const checkRes = await request(app).get(`/api/v1/leads/${createdLeadId}`);
      assert.strictEqual(checkRes.status, 404);
    });
  });
});
