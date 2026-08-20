const request = require('supertest');
const { createTestApp } = require('./test-app.js');
const bcryptjs = require('bcryptjs');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message, actual = null) {
  if (!condition) {
    testsFailed++;
    const detail = actual !== null ? ` (got: ${actual})` : '';
    console.error(`❌ ${message}${detail}`);
    throw new Error(message);
  } else {
    testsPassed++;
    console.log(`✅ ${message}`);
  }
}

async function testRegister() {
  console.log('\n📋 Testing Authentication - Register\n');
  const testApp = createTestApp();
  const app = testApp.app;
  await testApp.initializeDb();

  try {
    // Test valid registration
    const testEmail = `test-register-${Date.now()}@example.com`;
    const response = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test Agent',
        email: testEmail,
        password: 'password123'
      });

    if (response.status !== 201) {
      console.log('Response body:', response.body);
    }
    assert(response.status === 201, 'Register returns 201 status', response.status);
    assert(response.body.agentId, 'Register response contains agentId');
    assert(response.body.token, 'Register response contains token');
    assert(response.body.email === testEmail, 'Register response contains correct email');

    // Test duplicate email rejection
    const dupResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'Another Agent',
        email: testEmail,
        password: 'password123'
      });

    assert(dupResponse.status === 400, 'Duplicate email returns 400 status');
    assert(dupResponse.body.error.includes('already registered'), 'Duplicate email error message is correct');

    // Test short password rejection
    const shortEmail = `test-short-${Date.now()}@example.com`;
    const shortResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'Short Pass',
        email: shortEmail,
        password: 'short'
      });

    assert(shortResponse.status === 400, 'Short password returns 400 status');
    assert(shortResponse.body.error.includes('at least 6 characters'), 'Short password error message is correct');
  } finally {
    testApp.closeDb();
  }
}

async function testLogin() {
  console.log('\n📋 Testing Authentication - Login\n');
  const testApp = createTestApp();
  const app = testApp.app;
  await testApp.initializeDb();
  // Clear agents table
  await testApp.dbRun('DELETE FROM agents');

  try {
    // Setup - create an agent
    const loginEmail = `test-login-${Date.now()}@example.com`;
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Login Test',
        email: loginEmail,
        password: 'password123'
      });

    // Test valid login
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: loginEmail,
        password: 'password123'
      });

    assert(response.status === 200, 'Login returns 200 status');
    assert(response.body.agentId, 'Login response contains agentId');
    assert(response.body.token, 'Login response contains token');

    // Test invalid email
    const invalidResponse = await request(app)
      .post('/auth/login')
      .send({
        email: `nonexistent-${Date.now()}@example.com`,
        password: 'password123'
      });

    assert(invalidResponse.status === 401, 'Invalid email returns 401 status');
    assert(invalidResponse.body.error.includes('Invalid'), 'Invalid email error message is correct');

    // Test wrong password
    const wrongResponse = await request(app)
      .post('/auth/login')
      .send({
        email: loginEmail,
        password: 'wrongpassword'
      });

    assert(wrongResponse.status === 401, 'Wrong password returns 401 status');
    assert(wrongResponse.body.error.includes('Invalid'), 'Wrong password error message is correct');
  } finally {
    testApp.closeDb();
  }
}

async function testAppointments() {
  console.log('\n📋 Testing Appointments\n');
  const testApp = createTestApp();
  const app = testApp.app;
  await testApp.initializeDb();
  // Clear previous data
  await testApp.dbRun('DELETE FROM appointments');
  await testApp.dbRun('DELETE FROM agents');
  await testApp.dbRun('DELETE FROM therapies');

  try {
    // Setup - create agent and therapy
    const agentId = testApp.generateId();
    const hashedPassword = bcryptjs.hashSync('password123', 10);
    await testApp.dbRun(
      'INSERT INTO agents (id, name, email, password) VALUES (?, ?, ?, ?)',
      [agentId, 'Test Agent', 'test@example.com', hashedPassword]
    );

    const therapyId = testApp.generateId();
    await testApp.dbRun(
      'INSERT INTO therapies (id, name, description, duration, staffRequired) VALUES (?, ?, ?, ?, ?)',
      [therapyId, 'Test Therapy', 'A test therapy', 60, 1]
    );

    // Get token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    const token = loginResponse.body.token;

    // Test create appointment
    const createResponse = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        therapyId,
        scheduledAt: '2025-09-20T10:00:00Z',
        notes: 'First appointment'
      });

    assert(createResponse.status === 201, 'Create appointment returns 201 status');
    assert(createResponse.body.id, 'Create appointment response contains id');
    assert(createResponse.body.agentId === agentId, 'Create appointment response contains correct agentId');
    assert(createResponse.body.therapyId === therapyId, 'Create appointment response contains correct therapyId');

    // Test get appointments
    const getResponse = await request(app)
      .get('/appointments')
      .set('Authorization', `Bearer ${token}`);

    assert(getResponse.status === 200, 'Get appointments returns 200 status');
    assert(Array.isArray(getResponse.body), 'Get appointments returns array');
    assert(getResponse.body.length > 0, 'Get appointments returns at least one appointment');
    assert(getResponse.body[0].agentId === agentId, 'Appointments belong to authenticated agent');

    // Test missing auth
    const noAuthResponse = await request(app)
      .get('/appointments');

    assert(noAuthResponse.status === 401, 'Missing auth returns 401 status');
    assert(noAuthResponse.body.error, 'Missing auth returns error message');
  } finally {
    testApp.closeDb();
  }
}

async function runAllTests() {
  console.log('🧪 Running Tests with Extracted TypeScript Types\n');
  console.log('='.repeat(50));

  try {
    await testRegister();
    await testLogin();
    await testAppointments();

    console.log('\n' + '='.repeat(50));
    console.log(`\n✨ Test Results: ${testsPassed} passed, ${testsFailed} failed\n`);

    if (testsFailed === 0) {
      console.log('🎉 All tests passed!\n');
      process.exit(0);
    } else {
      console.log('💔 Some tests failed\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
    process.exit(1);
  }
}

runAllTests();
