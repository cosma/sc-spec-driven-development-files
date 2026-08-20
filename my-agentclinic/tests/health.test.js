import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';

describe('Health Endpoint', () => {
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

  it('should return status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });
});
