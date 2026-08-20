import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';

/** @typedef {import('../src/types.ts').RegisterRequest} RegisterRequest */
/** @typedef {import('../src/types.ts').LoginRequest} LoginRequest */

describe('Authentication', () => {
  let app;
  let testApp;

  beforeAll(async () => {
    testApp = createTestApp();
    app = testApp.app;
    await testApp.initializeDb();
  });

  afterAll(() => {
    testApp.closeDb();
  });

  describe('POST /auth/register', () => {
    it('should register a new agent', async () => {
      /** @type {RegisterRequest} */
      const registerPayload = {
        name: 'Test Agent',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(registerPayload)
        .expect(201);

      expect(response.body).toHaveProperty('agentId');
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test Agent');
    });

    it('should reject registration with missing fields', async () => {
      /** @type {Partial<RegisterRequest>} */
      const invalidPayload = {
        email: 'incomplete@example.com'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject registration with short password', async () => {
      /** @type {RegisterRequest} */
      const shortPasswordPayload = {
        name: 'Test Agent',
        email: 'short@example.com',
        password: 'short'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(shortPasswordPayload)
        .expect(400);

      expect(response.body.error).toContain('at least 6 characters');
    });

    it('should reject duplicate email registration', async () => {
      /** @type {RegisterRequest} */
      const firstPayload = {
        name: 'First Agent',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/auth/register')
        .send(firstPayload);

      /** @type {RegisterRequest} */
      const secondPayload = {
        name: 'Second Agent',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(secondPayload)
        .expect(400);

      expect(response.body.error).toContain('already registered');
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      /** @type {RegisterRequest} */
      const setupPayload = {
        name: 'Login Test',
        email: 'login@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/auth/register')
        .send(setupPayload);
    });

    it('should login with correct credentials', async () => {
      /** @type {LoginRequest} */
      const loginPayload = {
        email: 'login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginPayload)
        .expect(200);

      expect(response.body).toHaveProperty('agentId');
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('login@example.com');
    });

    it('should reject login with missing fields', async () => {
      /** @type {Partial<LoginRequest>} */
      const invalidPayload = {
        email: 'login@example.com'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject login with invalid email', async () => {
      /** @type {LoginRequest} */
      const invalidEmailPayload = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidEmailPayload)
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });

    it('should reject login with wrong password', async () => {
      /** @type {LoginRequest} */
      const wrongPasswordPayload = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(wrongPasswordPayload)
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });
  });
});
