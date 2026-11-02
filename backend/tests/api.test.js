const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

describe('Backend API Test Suite (TDD)', () => {
  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.service, 'CarbonCoin Backend API');
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/signup rejects missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Test User' });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    it('POST /api/auth/signup registers a new user', async () => {
      const randomEmail = `farmer_${Date.now()}@carboncoin.in`;
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Ramesh Patel',
          email: randomEmail,
          phone: '9876543210',
          password: 'password123'
        });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.user.name, 'Ramesh Patel');
      assert.strictEqual(res.body.user.email, randomEmail);
      assert.strictEqual(res.body.user.carbonCoins, 0);
    });

    it('POST /api/auth/login authenticates with demo credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrPhone: 'demo@carboncoin.in',
          password: 'password123'
        });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.email, 'demo@carboncoin.in');
      assert.ok(typeof res.body.user.carbonCoins === 'number');
    });

    it('POST /api/auth/login rejects incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrPhone: 'demo@carboncoin.in',
          password: 'wrongpassword'
        });
      assert.strictEqual(res.status, 401);
      assert.ok(res.body.error);
    });
  });

  describe('Identity Verification Endpoints', () => {
    it('POST /api/verify/identity validates identity and returns match score', async () => {
      const res = await request(app)
        .post('/api/verify/identity')
        .send({
          email: 'demo@carboncoin.in',
          aadhaarProvided: true,
          selfieProvided: true
        });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.verified, true);
      assert.ok(res.body.matchScore >= 95);
      assert.ok(res.body.status, 'Verified');
    });

    it('POST /api/verify/identity rejects if documents missing', async () => {
      const res = await request(app)
        .post('/api/verify/identity')
        .send({
          email: 'demo@carboncoin.in',
          aadhaarProvided: false
        });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.verified, false);
    });
  });

  describe('Property & Green Asset Verification Endpoints', () => {
    it('POST /api/assets/register adds a new green asset application', async () => {
      const res = await request(app)
        .post('/api/assets/register')
        .send({
          userEmail: 'demo@carboncoin.in',
          assetType: 'Agroforestry & Neem Trees',
          treeCount: 500,
          landArea: 3.5,
          state: 'Maharashtra',
          district: 'Nagpur',
          species: 'Neem & Teak'
        });
      assert.strictEqual(res.status, 201);
      assert.ok(res.body.asset.id);
      assert.strictEqual(res.body.asset.treeCount, 500);
      assert.strictEqual(res.body.asset.status, 'Pending Verification');
    });

    it('POST /api/assets/verify simulates satellite AI scan and computes carbon credits', async () => {
      const res = await request(app)
        .post('/api/assets/verify')
        .send({
          userEmail: 'demo@carboncoin.in',
          treeCount: 500,
          landArea: 3.5,
          species: 'Neem',
          treeAgeYears: 5
        });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.verified, true);
      assert.ok(res.body.ndviScore > 0.6);
      assert.ok(res.body.co2SequesteredTons > 0);
      assert.ok(res.body.carbonCoinsIssued > 0);
    });

    it('GET /api/assets returns user registered assets', async () => {
      const res = await request(app)
        .get('/api/assets?email=demo@carboncoin.in');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.assets));
      assert.ok(res.body.assets.length > 0);
    });
  });

  describe('Credits & Marketplace Trading Endpoints', () => {
    it('GET /api/credits/balance returns current wallet balance', async () => {
      const res = await request(app)
        .get('/api/credits/balance?email=demo@carboncoin.in');
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.body.carbonCoins === 'number');
      assert.ok(Array.isArray(res.body.corporateBuyers));
    });

    it('POST /api/credits/trade successfully sells carbon credits to buyer', async () => {
      const res = await request(app)
        .post('/api/credits/trade')
        .send({
          email: 'demo@carboncoin.in',
          coinsToSell: 10,
          buyerName: 'Viksit Bharat Clean Energy Corp',
          pricePerCoin: 650
        });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.coinsSold, 10);
      assert.strictEqual(res.body.payoutAmount, 6500);
      assert.ok(res.body.receiptId);
    });
  });
});
