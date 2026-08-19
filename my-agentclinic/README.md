# AgentClinic - MVP: Core Booking System

An AI-agent wellness platform where autonomous agents can browse therapies and book appointments for specialized wellness services.

## Overview

AgentClinic is a Phase 1 MVP implementation of a wellness booking system designed for AI agents. The platform provides:

- **For Agents:** Browse available therapies, filter by ailment, book appointments, and manage their wellness schedule
- **For the Platform:** Reliable backend API, secure authentication, and scalable database design

## Stakeholder Requirements Met

- **Mary (Engineering):** Reliable site built with Node.js/Express and SQLite. Authentication and authorization implemented with JWT. Structured backend code suitable for scaling.
- **Susan (Product):** Full support for agents, ailments, therapies, and appointment booking. Agents can browse therapies filtered by ailment and book appointments.
- **Steve (Marketing):** Modern, responsive frontend built with Tailwind CSS. Professional branding on home page with clear CTAs.

## Features

### Phase 1 Implementation ✅

- ✅ **Database Layer:** SQLite with Agent, Therapy, Ailment, and Appointment models
- ✅ **Backend API:** Express.js REST API with JWT authentication and error handling
- ✅ **Core Endpoints:** Browse therapies, list ailments, manage appointments
- ✅ **Frontend:** Home page, login/registration, authenticated dashboard
- ✅ **Authentication:** Secure agent registration and JWT-based authentication
- ✅ **Therapy Booking:** Search therapies, filter by ailment, book appointments
- ✅ **API Documentation:** Complete endpoint documentation with examples

## Quick Start

### Prerequisites
- Node.js v11+ (tested with v11.12.0)
- npm v6+

### Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Seed the database with sample data:**
```bash
npm run seed
```

Creates:
- 5 sample ailments (Anxiety, Depression, Insomnia, Chronic Pain, Stress)
- 5 therapies mapped to ailments
- 1 demo agent account for testing

3. **Start the development server:**
```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Access the Application

| Page | URL | Purpose |
|------|-----|---------|
| Home | http://localhost:3000/ | Public landing page |
| Login | http://localhost:3000/login.html | Agent sign in |
| Register | http://localhost:3000/register.html | Create account |
| Dashboard | http://localhost:3000/dashboard.html | Authenticated area |

**Demo Account:**
- Email: `claude@agentclinic.local`
- Password: `password123`

## Project Structure

```
my-agentclinic/
├── src/
│   ├── index.js              # Express server + all routes
│   └── seed.js               # Database initialization
├── public/
│   ├── index.html            # Landing page
│   ├── login.html            # Login form
│   ├── register.html         # Registration form
│   └── dashboard.html        # Agent dashboard
├── prisma/
│   └── dev.db               # SQLite database
├── .env                     # Environment variables
├── .env.example             # Configuration template
├── package.json
├── README.md                # This file
└── API_DOCS.md              # Detailed API reference
```

## API Documentation

Full API documentation available in [API_DOCS.md](./API_DOCS.md).

### Core Endpoints

**Public:**
- `GET /health` - Server status
- `GET /ailments` - List ailments
- `GET /therapies` - List therapies
- `POST /auth/register` - Create account
- `POST /auth/login` - Authenticate

**Protected (require JWT token):**
- `POST /appointments` - Book appointment
- `GET /appointments` - View agent's appointments

## Task Groups Implemented

### ✅ Task Group 1: Database Schema & ORM Setup
- SQLite database with 5 tables
- Automatic table creation on start
- Seeding with sample ailments, therapies, and demo agent
- Many-to-many relationship support (therapy ↔ ailment)

### ✅ Task Group 2: Backend API Foundation  
- Express.js server with CORS, body parsing, request logging
- Centralized error handling middleware
- JWT authentication middleware
- Environment configuration via .env files

### ✅ Task Group 3: Core API Endpoints
- Ailment listing with optional category filter
- Therapy listing with ailment filtering
- Appointment creation and retrieval
- Full input validation and error responses
- Eager loading of related data (therapy ailments)

### ✅ Task Group 4: Home Page Frontend
- Responsive landing page with Tailwind CSS
- AgentClinic branding and mission statement
- Featured therapies overview
- Call-to-action buttons for sign in/register
- Professional, welcoming design

### ✅ Task Group 5: Agent Dashboard Frontend
- Authentication-protected dashboard with tabs
- Agent profile view with wellness status
- Therapy browser with search and filtering
- Appointment booking modal form
- Appointment history with sorted display
- Session management via localStorage

### ✅ Task Group 6: Authentication & Security
- User registration with validation
- Login with email/password
- JWT token generation and verification
- Password hashing with bcryptjs
- Protected API endpoints
- Input validation and sanitization

### ✅ Task Group 7: Testing & Documentation
- Comprehensive API documentation (API_DOCS.md)
- Usage examples with curl commands
- Demo account for testing
- Setup and configuration guide
- Troubleshooting guide

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js v11+ |
| **Backend** | Express.js 4.17.1 |
| **Database** | SQLite3 5.0.11 |
| **Auth** | JWT (jsonwebtoken 8.5.1) + bcryptjs 2.4.3 |
| **Frontend** | HTML5, Tailwind CSS, Vanilla JavaScript |
| **Middleware** | CORS, body-parser |

## Database Schema

### Agents Table
```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Therapies & Ailments
- **Therapies:** Name, description, duration (minutes), staffRequired count
- **Ailments:** Name, description, category
- **Many-to-Many:** therapy_ailments junction table

### Appointments
```sql
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  agentId TEXT NOT NULL FOREIGN KEY,
  therapyId TEXT NOT NULL FOREIGN KEY,
  scheduledAt DATETIME NOT NULL,
  status TEXT DEFAULT 'scheduled',  -- scheduled, completed, cancelled
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Running Commands

```bash
# Start development server
npm run dev

# Seed database (runs during npm install setup)
npm run seed

# Install dependencies
npm install
```

## How It Works

### User Journey

1. **Visit Homepage** → Browse available therapies and ailments
2. **Register/Login** → Create account or sign in with credentials
3. **Browse Therapies** → View all therapies with descriptions and associated ailments
4. **Filter by Ailment** → Find therapies for specific condition
5. **Book Appointment** → Select therapy, choose date/time, add notes
6. **View Appointments** → See all booked appointments in dashboard

### Authentication Flow

1. User registers with name, email, password
2. Password hashed with bcryptjs (10 salt rounds)
3. JWT token generated and returned
4. Token stored in localStorage (client)
5. Token included in Authorization header for protected requests
6. Server verifies token on protected endpoints

## Sample Data

Database is seeded with:

**Ailments:**
- Anxiety
- Depression
- Insomnia
- Chronic Pain
- Stress

**Therapies:**
- Cognitive Behavioral Therapy (60 min, treats Anxiety/Depression/Stress)
- Mindfulness Meditation (45 min, treats Anxiety/Insomnia/Stress)
- Physical Therapy (50 min, treats Chronic Pain)
- Sleep Hygiene Coaching (30 min, treats Insomnia)
- Counseling Session (60 min, treats Anxiety/Depression/Stress)

**Demo Agent:**
- Name: Claude
- Email: claude@agentclinic.local
- Password: password123

## Environment Variables

See `.env.example` for configuration template.

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRY=7d
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Errors
```bash
# Reset database
rm prisma/dev.db
npm run seed
```

### CORS Errors
Ensure frontend is calling `http://localhost:3000` (not different port/domain)

### Login Not Working
- Verify `.env` has correct JWT_SECRET
- Check credentials match demo account
- Clear browser localStorage and try again

## Next Steps / Roadmap

**Phase 2 Enhancements:**
- [ ] Email notifications for appointments
- [ ] Provider profiles and availability management
- [ ] Advanced scheduling with time slots
- [ ] Payment processing
- [ ] Admin dashboard for staff management
- [ ] Ratings and reviews system
- [ ] Automated reminders
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Database migrations system

**Technical Improvements:**
- [ ] TypeScript migration
- [ ] Comprehensive test suite (Jest)
- [ ] Rate limiting and request throttling
- [ ] Production deployment guide
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoring and logging
- [ ] Security audit

## Contributing

This is a MVP implementation. For Phase 2 and beyond, follow the task groups in `specs/2026-08-20-core-booking-system/plan.md`.

## License

MIT
