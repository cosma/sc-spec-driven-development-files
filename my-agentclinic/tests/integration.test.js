import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';

describe('Integration: End-to-End Workflows', () => {
  let app;
  let testApp;

  beforeAll(async () => {
    testApp = createTestApp();
    app = testApp.app;
    await testApp.initializeDb();

    // Seed database with sample data
    const ailmentIds = [];
    for (let i = 1; i <= 3; i++) {
      const id = testApp.generateId();
      ailmentIds.push(id);
      await testApp.dbRun(
        `INSERT INTO ailments (id, name, description, category)
         VALUES (?, ?, ?, ?)`,
        [id, `Ailment ${i}`, `Description ${i}`, `category-${i}`]
      );
    }

    // Seed therapies
    const therapyIds = [];
    for (let i = 1; i <= 5; i++) {
      const id = testApp.generateId();
      therapyIds.push(id);
      await testApp.dbRun(
        `INSERT INTO therapies (id, name, description, duration, staffRequired)
         VALUES (?, ?, ?, ?, ?)`,
        [id, `Therapy ${i}`, `Description ${i}`, 60, 1]
      );

      // Link therapy to ailment
      await testApp.dbRun(
        `INSERT INTO therapy_ailments (therapyId, ailmentId)
         VALUES (?, ?)`,
        [id, ailmentIds[0]]
      );
    }
  });

  afterAll(() => {
    testApp.closeDb();
  });

  describe('Complete Agent Booking Journey', () => {
    it('should complete full workflow: register -> view therapies -> book appointment', async () => {
      // Step 1: Health check
      const healthResponse = await request(app)
        .get('/health')
        .expect(200);
      expect(healthResponse.body.status).toBe('ok');

      // Step 2: View available ailments (public)
      const ailmentsResponse = await request(app)
        .get('/ailments')
        .expect(200);
      expect(ailmentsResponse.body.length).toBeGreaterThan(0);
      const ailmentId = ailmentsResponse.body[0].id;

      // Step 3: View available therapies (public)
      const therapiesResponse = await request(app)
        .get('/therapies')
        .expect(200);
      expect(therapiesResponse.body.length).toBeGreaterThan(0);
      const therapyId = therapiesResponse.body[0].id;

      // Step 4: Filter therapies by ailment
      const filteredResponse = await request(app)
        .get(`/therapies?ailmentId=${ailmentId}`)
        .expect(200);
      expect(filteredResponse.body.length).toBeGreaterThan(0);

      // Step 5: Register new agent
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          name: 'Integration Test Agent',
          email: 'integration@test.com',
          password: 'password123'
        })
        .expect(201);
      const token = registerResponse.body.token;

      // Step 6: Book appointment
      const bookResponse = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          therapyId,
          scheduledAt: '2025-09-25T14:00:00Z',
          notes: 'Integration test booking'
        })
        .expect(201);
      expect(bookResponse.body.status).toBe('scheduled');

      // Step 7: View agent appointments
      const appointmentsResponse = await request(app)
        .get('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(appointmentsResponse.body.length).toBeGreaterThan(0);
      expect(appointmentsResponse.body[0].id).toBe(bookResponse.body.id);
    });

    it('should prevent unauthenticated booking', async () => {
      const therapiesResponse = await request(app)
        .get('/therapies')
        .expect(200);
      const therapyId = therapiesResponse.body[0].id;

      const response = await request(app)
        .post('/appointments')
        .send({
          therapyId,
          scheduledAt: '2025-09-25T14:00:00Z'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should allow login after registration and access bookings', async () => {
      // Register
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          name: 'Login Test Agent',
          email: 'login-test@test.com',
          password: 'password123'
        })
        .expect(201);
      const registeredToken = registerResponse.body.token;
      const agentEmail = registerResponse.body.email;

      // Get therapy
      const therapiesResponse = await request(app)
        .get('/therapies')
        .expect(200);
      const therapyId = therapiesResponse.body[0].id;

      // Book appointment
      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send({
          therapyId,
          scheduledAt: '2025-10-01T10:00:00Z'
        })
        .expect(201);

      // Login with same credentials
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: agentEmail,
          password: 'password123'
        })
        .expect(200);
      const loginToken = loginResponse.body.token;

      // Access bookings with login token
      const appointmentsResponse = await request(app)
        .get('/appointments')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(appointmentsResponse.body.length).toBeGreaterThan(0);
      expect(appointmentsResponse.body[0].agentId).toBe(loginResponse.body.agentId);
    });

    it('should display therapy details with related ailments', async () => {
      const therapiesResponse = await request(app)
        .get('/therapies')
        .expect(200);
      const therapyId = therapiesResponse.body[0].id;

      const detailResponse = await request(app)
        .get(`/therapies/${therapyId}`)
        .expect(200);

      expect(detailResponse.body.id).toBe(therapyId);
      expect(Array.isArray(detailResponse.body.ailments)).toBe(true);
    });
  });

  describe('Error Handling in Workflows', () => {
    it('should handle invalid therapy booking gracefully', async () => {
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          name: 'Error Test Agent',
          email: 'error-test@test.com',
          password: 'password123'
        })
        .expect(201);
      const token = registerResponse.body.token;

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          therapyId: 'invalid-therapy-id',
          scheduledAt: '2025-09-25T14:00:00Z'
        })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should handle concurrent registrations with same email', async () => {
      const response1 = await request(app)
        .post('/auth/register')
        .send({
          name: 'Concurrent Agent 1',
          email: 'concurrent@test.com',
          password: 'password123'
        })
        .expect(201);

      const response2 = await request(app)
        .post('/auth/register')
        .send({
          name: 'Concurrent Agent 2',
          email: 'concurrent@test.com',
          password: 'password123'
        })
        .expect(400);

      expect(response2.body.error).toContain('already registered');
    });
  });
});
