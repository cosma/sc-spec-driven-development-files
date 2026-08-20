# AgentClinic Test Suite

Comprehensive test suite for the AgentClinic API using Vitest and Supertest.

## Overview

The test suite validates:
- **Health checks** - Server status endpoint
- **Authentication** - User registration and login flows
- **Ailments API** - Browsing and filtering ailments
- **Therapies API** - Listing therapies and filtering by ailment
- **Appointments API** - Booking and viewing appointments
- **Integration workflows** - Complete end-to-end user journeys

## Test Files

### `health.test.js`
Tests the health check endpoint that verifies the server is running.

**Coverage:**
- ✅ Health endpoint returns status ok

### `auth.test.js`
Tests user registration and login flows.

**Coverage:**
- ✅ Agent registration with valid data
- ✅ Rejection of incomplete registrations
- ✅ Rejection of short passwords
- ✅ Prevention of duplicate email registration
- ✅ Login with correct credentials
- ✅ Rejection of invalid credentials
- ✅ Rejection of missing login fields

### `ailments.test.js`
Tests ailment listing and filtering.

**Coverage:**
- ✅ List all ailments
- ✅ Filter ailments by category
- ✅ Retrieve specific ailment by ID
- ✅ Handle non-existent ailment IDs
- ✅ Return empty results for non-existent categories

### `therapies.test.js`
Tests therapy browsing with ailment relationships.

**Coverage:**
- ✅ List all therapies with related ailments
- ✅ Filter therapies by ailment ID
- ✅ Retrieve specific therapy details
- ✅ Include related ailment data with therapies
- ✅ Handle non-existent therapy IDs

### `appointments.test.js`
Tests appointment booking and retrieval (requires authentication).

**Coverage:**
- ✅ Create appointments with valid data
- ✅ Reject unauthenticated appointments
- ✅ Reject invalid therapy IDs
- ✅ Retrieve agent's appointments
- ✅ Filter appointments by authenticated agent
- ✅ Reject unauthorized token access
- ✅ Order appointments by scheduled date

### `integration.test.js`
End-to-end workflow tests covering complete user journeys.

**Coverage:**
- ✅ Complete booking workflow (public browse → register → book)
- ✅ Prevention of unauthenticated bookings
- ✅ Login after registration
- ✅ Access bookings with login token
- ✅ Therapy details with ailment relationships
- ✅ Error handling for invalid therapies
- ✅ Concurrent registration prevention

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test tests/auth.test.js
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run with coverage report
```bash
npm test -- --coverage
```

### Run tests with UI (if available)
```bash
npm test -- --ui
```

## Test Database

Tests use an isolated SQLite database (`tests/test.db`) that is:
- Created fresh before each test
- Automatically cleaned up after each test
- Never interferes with development database

## Test Structure

Each test file follows this pattern:

```javascript
describe('Feature Name', () => {
  let app, testApp, token;

  beforeAll(async () => {
    testApp = createTestApp();
    app = testApp.app;
    await testApp.initializeDb();
    // Seed data if needed
  });

  afterAll(() => {
    testApp.closeDb();
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('field');
  });
});
```

## Key Testing Patterns

### Authenticated Requests
```javascript
const response = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${token}`)
  .send(data)
  .expect(201);
```

### Testing Errors
```javascript
const response = await request(app)
  .post('/auth/login')
  .send({ email: 'wrong@example.com', password: 'wrong' })
  .expect(401);

expect(response.body.error).toBeDefined();
```

### Seeding Test Data
```javascript
const id = testApp.generateId();
await testApp.dbRun(
  `INSERT INTO ailments (id, name, description, category)
   VALUES (?, ?, ?, ?)`,
  [id, 'Test', 'Description', 'category']
);
```

## Test Coverage Goals

- **Lines**: ≥ 70% for critical paths (auth, booking, listing)
- **Branches**: All major code paths tested
- **Functions**: All API endpoints covered
- **Statements**: All endpoint logic verified

## Debugging Tests

### See detailed output
```bash
npm test -- --reporter=verbose
```

### Stop on first failure
```bash
npm test -- --bail
```

### Run only failing tests
```bash
npm test -- --only-failed
```

## Adding New Tests

When adding new endpoints or features:

1. Create test cases covering:
   - Happy path (valid input, correct behavior)
   - Error cases (invalid input, error responses)
   - Edge cases (boundary conditions, special cases)
   - Authorization (if applicable)

2. Follow the existing test patterns for consistency

3. Name tests descriptively: `it('should [expected behavior]', ...)`

4. Use meaningful assertions: `expect(response.body.error).toContain('...')`

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- No external dependencies required
- Isolated test database
- Fast execution (< 10 seconds)
- Deterministic results
- Clear pass/fail indicators

## Dependencies

- **Vitest**: Fast unit test framework
- **Supertest**: HTTP assertion library
- **SQLite3**: In-memory test database
- **bcryptjs**: Password hashing for auth tests
- **jsonwebtoken**: JWT token validation for tests
