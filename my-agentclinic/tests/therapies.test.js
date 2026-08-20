import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';

describe('Therapies Endpoints', () => {
  let app;
  let testApp;
  let therapyId;
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

    // Seed sample therapy
    therapyId = testApp.generateId();
    await testApp.dbRun(
      `INSERT INTO therapies (id, name, description, duration, staffRequired)
       VALUES (?, ?, ?, ?, ?)`,
      [therapyId, 'Meditation Session', 'Guided meditation therapy', 60, 1]
    );

    // Link therapy to ailment
    await testApp.dbRun(
      `INSERT INTO therapy_ailments (therapyId, ailmentId)
       VALUES (?, ?)`,
      [therapyId, ailmentId]
    );
  });

  afterAll(() => {
    testApp.closeDb();
  });

  describe('GET /therapies', () => {
    it('should return list of therapies', async () => {
      const response = await request(app)
        .get('/therapies')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('duration');
      expect(response.body[0]).toHaveProperty('ailments');
    });

    it('should include ailments for each therapy', async () => {
      const response = await request(app)
        .get('/therapies')
        .expect(200);

      const therapy = response.body.find(t => t.id === therapyId);
      expect(therapy).toBeDefined();
      expect(Array.isArray(therapy.ailments)).toBe(true);
      expect(therapy.ailments.length).toBeGreaterThan(0);
    });

    it('should filter therapies by ailmentId', async () => {
      const response = await request(app)
        .get(`/therapies?ailmentId=${ailmentId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some(t => t.id === therapyId)).toBe(true);
    });

    it('should return empty array for non-existent ailment filter', async () => {
      const response = await request(app)
        .get('/therapies?ailmentId=nonexistent-id')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /therapies/:id', () => {
    it('should return specific therapy by id', async () => {
      const response = await request(app)
        .get(`/therapies/${therapyId}`)
        .expect(200);

      expect(response.body.id).toBe(therapyId);
      expect(response.body.name).toBe('Meditation Session');
      expect(response.body.duration).toBe(60);
      expect(Array.isArray(response.body.ailments)).toBe(true);
    });

    it('should include related ailments', async () => {
      const response = await request(app)
        .get(`/therapies/${therapyId}`)
        .expect(200);

      expect(response.body.ailments.length).toBeGreaterThan(0);
      expect(response.body.ailments[0].id).toBe(ailmentId);
    });

    it('should return 404 for non-existent therapy', async () => {
      const response = await request(app)
        .get('/therapies/nonexistent-id')
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });
});
