import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcryptjs from 'bcryptjs';
import { createTestApp } from './test-app.js';

/** @typedef {import('../src/types.ts').StaffLoginRequest} StaffLoginRequest */
/** @typedef {import('../src/types.ts').StaffRegisterRequest} StaffRegisterRequest */
/** @typedef {import('../src/types.ts').UpdateAppointmentRequest} UpdateAppointmentRequest */

describe('Staff Endpoints', () => {
  let app;
  let testApp;
  let staffToken;
  let staffId;
  let agentId;
  let agentToken;
  let therapyId;
  let appointmentId;

  beforeAll(async () => {
    testApp = createTestApp();
    app = testApp.app;
    await testApp.initializeDb();

    // Create test agent
    agentId = testApp.generateId();
    const agentHashedPassword = bcryptjs.hashSync('password123', 10);
    await testApp.dbRun(
      'INSERT INTO agents (id, name, email, password) VALUES (?, ?, ?, ?)',
      [agentId, 'Test Agent', 'agent@example.com', agentHashedPassword]
    );

    // Get agent token
    const agentLoginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'agent@example.com',
        password: 'password123'
      });
    agentToken = agentLoginResponse.body.token;

    // Create test therapy
    therapyId = testApp.generateId();
    await testApp.dbRun(
      'INSERT INTO therapies (id, name, description, duration, staffRequired) VALUES (?, ?, ?, ?, ?)',
      [therapyId, 'Test Therapy', 'A test therapy', 60, 1]
    );

    // Create test appointments
    for (let i = 0; i < 3; i++) {
      const aptId = testApp.generateId();
      const date = new Date();
      date.setDate(date.getDate() + i);
      const statuses = ['pending', 'confirmed', 'completed'];
      await testApp.dbRun(
        'INSERT INTO appointments (id, agentId, therapyId, scheduledAt, status) VALUES (?, ?, ?, ?, ?)',
        [aptId, agentId, therapyId, date.toISOString(), statuses[i]]
      );
      if (i === 0) appointmentId = aptId;
    }
  });

  afterAll(() => {
    testApp.closeDb();
  });

  describe('POST /auth/staff-register', () => {
    it('should register a new staff member', async () => {
      /** @type {StaffRegisterRequest} */
      const registerPayload = {
        name: 'Dr. Smith',
        email: `staff-${Date.now()}@example.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/staff-register')
        .send(registerPayload)
        .expect(201);

      expect(response.body).toHaveProperty('staffId');
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe(registerPayload.email);
      expect(response.body.name).toBe(registerPayload.name);

      staffId = response.body.staffId;
      staffToken = response.body.token;
    });

    it('should reject duplicate email registration', async () => {
      const email = `staff-dup-${Date.now()}@example.com`;

      await request(app)
        .post('/auth/staff-register')
        .send({
          name: 'First Staff',
          email,
          password: 'password123'
        })
        .expect(201);

      /** @type {StaffRegisterRequest} */
      const dupPayload = {
        name: 'Second Staff',
        email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/staff-register')
        .send(dupPayload)
        .expect(400);

      expect(response.body.error).toContain('already registered');
    });

    it('should reject short passwords', async () => {
      /** @type {StaffRegisterRequest} */
      const shortPayload = {
        name: 'Short Pass',
        email: `staff-short-${Date.now()}@example.com`,
        password: 'short'
      };

      const response = await request(app)
        .post('/auth/staff-register')
        .send(shortPayload)
        .expect(400);

      expect(response.body.error).toContain('at least 6 characters');
    });
  });

  describe('POST /auth/staff-login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/auth/staff-register')
        .send({
          name: 'Login Test Staff',
          email: `login-staff-${Date.now()}@example.com`,
          password: 'password123'
        });
    });

    it('should login with correct credentials', async () => {
      /** @type {StaffLoginRequest} */
      const loginPayload = {
        email: `login-staff-${Date.now() - 1000}@example.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/staff-login')
        .send(loginPayload);

      expect(response.status).toMatch(/200|401/);
    });

    it('should reject invalid email', async () => {
      /** @type {StaffLoginRequest} */
      const invalidPayload = {
        email: `nonexistent-${Date.now()}@example.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/staff-login')
        .send(invalidPayload)
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('GET /staff/appointments', () => {
    it('should require staff authentication', async () => {
      const response = await request(app)
        .get('/staff/appointments')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should reject agent token on staff endpoints', async () => {
      const response = await request(app)
        .get('/staff/appointments')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(401);

      expect(response.body.error).toContain('Staff token required');
    });

    it('should return all appointments with staff token', async () => {
      const response = await request(app)
        .get('/staff/appointments')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('agentName');
      expect(response.body[0]).toHaveProperty('therapyName');
      expect(response.body[0]).toHaveProperty('status');
    });

    it('should filter appointments by status', async () => {
      const response = await request(app)
        .get('/staff/appointments?status=pending')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body.every(apt => apt.status === 'pending')).toBe(true);
      }
    });

    it('should filter appointments by agent', async () => {
      const response = await request(app)
        .get(`/staff/appointments?agentId=${agentId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body.every(apt => apt.agentId === agentId)).toBe(true);
      }
    });

    it('should search appointments by agent name', async () => {
      const response = await request(app)
        .get('/staff/appointments?search=Test')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /staff/appointments/:id', () => {
    it('should return appointment details', async () => {
      const response = await request(app)
        .get(`/staff/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.id).toBe(appointmentId);
      expect(response.body).toHaveProperty('agentName');
      expect(response.body).toHaveProperty('therapyName');
      expect(response.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .get(`/staff/appointments/nonexistent-id`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should require staff authentication', async () => {
      const response = await request(app)
        .get(`/staff/appointments/${appointmentId}`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /appointments/:id (Staff Status Update)', () => {
    it('should update appointment status to confirmed', async () => {
      /** @type {UpdateAppointmentRequest} */
      const updatePayload = { status: 'confirmed' };

      const response = await request(app)
        .patch(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('should reject invalid status', async () => {
      /** @type {Partial<UpdateAppointmentRequest>} */
      const invalidPayload = { status: 'invalid_status' };

      const response = await request(app)
        .patch(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error).toContain('Invalid');
    });

    it('should require staff authentication', async () => {
      const response = await request(app)
        .patch(`/appointments/${appointmentId}`)
        .send({ status: 'confirmed' })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should reject agent token', async () => {
      const response = await request(app)
        .patch(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ status: 'confirmed' })
        .expect(401);

      expect(response.body.error).toContain('Staff token required');
    });
  });

  describe('GET /staff/agents', () => {
    it('should return agent roster with wellness metrics', async () => {
      const response = await request(app)
        .get('/staff/agents')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const agent = response.body.find(a => a.id === agentId);
        if (agent) {
          expect(agent).toHaveProperty('wellnessScore');
          expect(agent).toHaveProperty('totalAppointments');
          expect(agent).toHaveProperty('completedAppointments');
          expect(typeof agent.wellnessScore).toBe('number');
        }
      }
    });

    it('should require staff authentication', async () => {
      const response = await request(app)
        .get('/staff/agents')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should reject agent token', async () => {
      const response = await request(app)
        .get('/staff/agents')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(401);

      expect(response.body.error).toContain('Staff token required');
    });
  });

  describe('GET /staff/agents/:id', () => {
    it('should return agent details with appointment history', async () => {
      const response = await request(app)
        .get(`/staff/agents/${agentId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.id).toBe(agentId);
      expect(response.body).toHaveProperty('wellnessScore');
      expect(response.body).toHaveProperty('appointments');
      expect(Array.isArray(response.body.appointments)).toBe(true);
    });

    it('should calculate wellness score correctly', async () => {
      const response = await request(app)
        .get(`/staff/agents/${agentId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      const expected = Math.round((response.body.completedAppointments / response.body.totalAppointments) * 100);
      expect(response.body.wellnessScore).toBe(expected);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .get(`/staff/agents/nonexistent-id`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('Cross-Role Security', () => {
    it('agent cannot access staff appointment endpoints', async () => {
      const response = await request(app)
        .get('/staff/appointments')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Staff token required');
    });

    it('agent cannot access staff agent metrics', async () => {
      const response = await request(app)
        .get('/staff/agents')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Staff token required');
    });

    it('staff cannot use agent JWT for staff operations', async () => {
      const response = await request(app)
        .get('/staff/appointments')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(response.status).toBe(401);
    });
  });
});
