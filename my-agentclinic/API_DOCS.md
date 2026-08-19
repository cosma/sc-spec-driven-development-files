# AgentClinic API Documentation

## Overview
AgentClinic is a booking system where AI agents can browse therapies and book appointments for wellness services.

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Health Check
Check if the API is running.

```
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

### Auth Endpoints

#### Register
Create a new agent account.

```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "Claude",
  "email": "claude@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "agentId": "abc123...",
  "email": "claude@example.com",
  "name": "Claude",
  "token": "eyJhbGc..."
}
```

**Errors:**
- `400`: Missing required fields or password too short
- `400`: Email already registered
- `500`: Server error

---

#### Login
Authenticate an existing agent.

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "claude@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "agentId": "abc123...",
  "email": "claude@example.com",
  "name": "Claude",
  "token": "eyJhbGc..."
}
```

**Errors:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Server error

---

### Ailment Endpoints

#### List All Ailments
Get all available ailments, optionally filtered by category.

```
GET /ailments
GET /ailments?category=Mental%20Health
```

**Query Parameters:**
- `category` (optional): Filter by ailment category

**Response (200 OK):**
```json
[
  {
    "id": "ailment1",
    "name": "Anxiety",
    "description": "Persistent worry and nervousness",
    "category": "Mental Health",
    "createdAt": "2026-08-20T00:00:00.000Z",
    "updatedAt": "2026-08-20T00:00:00.000Z"
  }
]
```

---

#### Get Specific Ailment
Get details about a specific ailment.

```
GET /ailments/:id
```

**Response (200 OK):**
```json
{
  "id": "ailment1",
  "name": "Anxiety",
  "description": "Persistent worry and nervousness",
  "category": "Mental Health",
  "createdAt": "2026-08-20T00:00:00.000Z",
  "updatedAt": "2026-08-20T00:00:00.000Z"
}
```

**Errors:**
- `404`: Ailment not found

---

### Therapy Endpoints

#### List All Therapies
Get all available therapies, optionally filtered by ailment.

```
GET /therapies
GET /therapies?ailmentId=ailment1
```

**Query Parameters:**
- `ailmentId` (optional): Filter therapies by ailment ID

**Response (200 OK):**
```json
[
  {
    "id": "therapy1",
    "name": "Cognitive Behavioral Therapy",
    "description": "Evidence-based therapy focusing on thought patterns",
    "duration": 60,
    "staffRequired": 1,
    "createdAt": "2026-08-20T00:00:00.000Z",
    "updatedAt": "2026-08-20T00:00:00.000Z",
    "ailments": [
      {
        "id": "ailment1",
        "name": "Anxiety",
        "description": "Persistent worry and nervousness",
        "category": "Mental Health"
      }
    ]
  }
]
```

---

#### Get Specific Therapy
Get details about a specific therapy.

```
GET /therapies/:id
```

**Response (200 OK):**
```json
{
  "id": "therapy1",
  "name": "Cognitive Behavioral Therapy",
  "description": "Evidence-based therapy focusing on thought patterns",
  "duration": 60,
  "staffRequired": 1,
  "createdAt": "2026-08-20T00:00:00.000Z",
  "updatedAt": "2026-08-20T00:00:00.000Z",
  "ailments": [...]
}
```

**Errors:**
- `404`: Therapy not found

---

### Appointment Endpoints

#### Create Appointment
Book a new therapy appointment. **Requires authentication.**

```
POST /appointments
```

**Request Body:**
```json
{
  "therapyId": "therapy1",
  "scheduledAt": "2026-08-25T14:00:00.000Z",
  "notes": "Optional notes for the therapist"
}
```

**Response (201 Created):**
```json
{
  "id": "apt123...",
  "agentId": "agent1",
  "therapyId": "therapy1",
  "scheduledAt": "2026-08-25T14:00:00.000Z",
  "status": "scheduled",
  "notes": "Optional notes for the therapist",
  "createdAt": "2026-08-20T00:00:00.000Z",
  "updatedAt": "2026-08-20T00:00:00.000Z"
}
```

**Errors:**
- `400`: Missing therapyId or scheduledAt
- `401`: Not authenticated
- `404`: Therapy not found
- `500`: Server error

---

#### Get Agent's Appointments
Retrieve all appointments for the authenticated agent. **Requires authentication.**

```
GET /appointments
```

**Response (200 OK):**
```json
[
  {
    "id": "apt123...",
    "agentId": "agent1",
    "therapyId": "therapy1",
    "scheduledAt": "2026-08-25T14:00:00.000Z",
    "status": "scheduled",
    "notes": "Optional notes",
    "therapyName": "Cognitive Behavioral Therapy",
    "duration": 60,
    "createdAt": "2026-08-20T00:00:00.000Z",
    "updatedAt": "2026-08-20T00:00:00.000Z"
  }
]
```

**Errors:**
- `401`: Not authenticated
- `500`: Server error

---

#### Get Specific Agent's Appointments
Retrieve appointments for a specific agent. **Requires authentication.**

```
GET /appointments/agent/:agentId
```

**Response (200 OK):**
```json
[...]  // Same as above
```

---

## Example Usage

### 1. Register a new agent
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyAgent",
    "email": "agent@example.com",
    "password": "securepassword123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "securepassword123"
  }'
```

### 3. Get all therapies
```bash
curl http://localhost:3000/therapies
```

### 4. Book an appointment
```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "therapyId": "therapy1",
    "scheduledAt": "2026-08-25T14:00:00.000Z",
    "notes": "First time therapy"
  }'
```

### 5. View your appointments
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/appointments
```

---

## Demo Account

For testing, the following demo account is pre-seeded:

**Email:** `claude@agentclinic.local`  
**Password:** `password123`

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `404`: Not found
- `500`: Server error
