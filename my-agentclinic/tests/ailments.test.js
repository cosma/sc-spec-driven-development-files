import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';

describe('Ailments Endpoints', () => {
  let app;
  let testApp;
  let ailmentId;

  beforeAll(async () => {
    testApp = createTestApp();
    app = testApp.app;
    await testApp.initializeDb();

    // Seed sample ailment
    ailmentId = testApp.generateId();
    await testApp.dbRun(
      `INSERT INTO ailments (id, name, description, category)
       VALUES (?, ?, ?, ?)`,
      [ailmentId, 'Test Anxiety', 'Test anxiety disorder', 'mental-health']
    );
  });

  afterAll(() => {
    testApp.closeDb();
  });

  describe('GET /ailments', () => {
    it('should return list of ailments', async () => {
      const response = await request(app)
        .get('/ailments')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('category');
    });

    it('should filter ailments by category', async () => {
      const response = await request(app)
        .get('/ailments?category=mental-health')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every(a => a.category === 'mental-health')).toBe(true);
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/ailments?category=nonexistent')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /ailments/:id', () => {
    it('should return specific ailment by id', async () => {
      const response = await request(app)
        .get(`/ailments/${ailmentId}`)
        .expect(200);

      expect(response.body.id).toBe(ailmentId);
      expect(response.body.name).toBe('Test Anxiety');
    });

    it('should return 404 for non-existent ailment', async () => {
      const response = await request(app)
        .get('/ailments/nonexistent-id')
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });
});
