import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';

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
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test Agent',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('agentId');
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test Agent');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'incomplete@example.com'
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test Agent',
          email: 'short@example.com',
          password: 'short'
        })
        .expect(400);

      expect(response.body.error).toContain('at least 6 characters');
    });

    it('should reject duplicate email registration', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'First Agent',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Second Agent',
          email: 'duplicate@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toContain('already registered');
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@example.com',
          password: 'password123'
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('agentId');
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('login@example.com');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com'
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });
  });
});
