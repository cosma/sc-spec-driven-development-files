import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcryptjs from 'bcryptjs';
import { createTestApp } from './test-app.js';

describe('Appointments Endpoints', () => {
  let app;
  let testApp;
  let therapyId;
  let agentId;
  let token;
  let appointmentId;

  beforeAll(async () => {
    testApp = createTestApp();
    app = testApp.app;
    await testApp.initializeDb();

    // Create agent
    agentId = testApp.generateId();
    const hashedPassword = bcryptjs.hashSync('password123', 10);
    await testApp.dbRun(
      `INSERT INTO agents (id, name, email, password)
       VALUES (?, ?, ?, ?)`,
      [agentId, 'Test Agent', 'test@example.com', hashedPassword]
    );

    // Get token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = loginResponse.body.token;

    // Create therapy
    therapyId = testApp.generateId();
    await testApp.dbRun(
      `INSERT INTO therapies (id, name, description, duration, staffRequired)
       VALUES (?, ?, ?, ?, ?)`,
      [therapyId, 'Test Therapy', 'A test therapy', 60, 1]
    );
  });

  afterAll(() => {
    testApp.closeDb();
  });

  describe('POST /appointments', () => {
    it('should create appointment with valid data and auth', async () => {
      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          therapyId,
          scheduledAt: '2025-09-20T10:00:00Z',
          notes: 'First appointment'
        })
        .expect(201);

      appointmentId = response.body.id;
      expect(response.body).toHaveProperty('id');
      expect(response.body.agentId).toBe(agentId);
      expect(response.body.therapyId).toBe(therapyId);
      expect(response.body.status).toBe('scheduled');
    });

    it('should reject appointment without authentication', async () => {
      const response = await request(app)
        .post('/appointments')
        .send({
          therapyId,
          scheduledAt: '2025-09-20T10:00:00Z'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should reject appointment with missing required fields', async () => {
      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          therapyId
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject appointment with non-existent therapy', async () => {
      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          therapyId: 'nonexistent-id',
          scheduledAt: '2025-09-20T10:00:00Z'
        })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should store optional notes', async () => {
      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          therapyId,
          scheduledAt: '2025-09-21T14:00:00Z',
          notes: 'Special request: morning preferred'
        })
        .expect(201);

      expect(response.body.notes).toBe('Special request: morning preferred');
    });
  });

  describe('GET /appointments', () => {
    it('should return agent appointments with auth', async () => {
      const response = await request(app)
        .get('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('agentId');
      expect(response.body[0]).toHaveProperty('therapyName');
      expect(response.body[0]).toHaveProperty('duration');
    });

    it('should only return authenticated agent appointments', async () => {
      const response = await request(app)
        .get('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.every(a => a.agentId === agentId)).toBe(true);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/appointments')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should reject with invalid token', async () => {
      const response = await request(app)
        .get('/appointments')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should order appointments by scheduled date descending', async () => {
      // Create another appointment with earlier date
      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          therapyId,
          scheduledAt: '2025-08-20T10:00:00Z'
        });

      const response = await request(app)
        .get('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length >= 2) {
        expect(new Date(response.body[0].scheduledAt) >= new Date(response.body[1].scheduledAt)).toBe(true);
      }
    });
  });
});
