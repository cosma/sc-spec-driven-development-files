# Phase 1 Implementation Plan: MVP - Core Booking System

## Overview
Build the foundation of AgentClinic: a booking system where agents can browse therapies and book appointments.

---

## Task Group 1: Database Schema & ORM Setup
1. Create Prisma schema with models:
   - `Agent` (id, name, email, createdAt, updatedAt)
   - `Ailment` (id, name, description, category)
   - `Therapy` (id, name, description, targetAilments, duration, staffRequired)
   - `Appointment` (id, agentId, therapyId, scheduledAt, status, notes)
2. Create and run initial Prisma migration
3. Set up TypeScript types generated from Prisma
4. Seed database with sample ailments and therapies

## Task Group 2: Backend API Foundation
1. Initialize Express.js server with TypeScript configuration
2. Set up middleware:
   - CORS for frontend communication
   - JSON body parsing
   - Error handling (centralized error middleware)
   - Request logging
3. Configure environment variables (.env setup)
4. Set up basic authentication middleware (agent login)

## Task Group 3: Core API Endpoints
1. Implement `GET /therapies` - list available therapies with filtering by ailment
2. Implement `GET /ailments` - list available ailments
3. Implement `POST /appointments` - create new appointment booking
4. Implement `GET /agents/:id/appointments` - retrieve agent's appointment history
5. Add input validation and error responses for all endpoints
6. Write Jest unit tests for each endpoint

## Task Group 4: Home Page Frontend
1. Create landing/home page for unauthenticated visitors
2. Display AgentClinic branding and mission statement
3. Show overview of available therapies (featured list or count)
4. Show overview of available ailments (featured categories)
5. Add prominent "Sign In" and "Register" call-to-action buttons
6. Link to information about the platform (benefits, how it works)
7. Style with TailwindCSS for professional, welcoming appearance

## Task Group 5: Agent Dashboard Frontend
1. Create base HTML/EJS templates with TailwindCSS
2. Build agent profile view (showing agent info and wellness status placeholder)
3. Build therapy browser:
   - List therapies with search/filter by ailment
   - Show therapy details (name, description, duration)
4. Build appointment booking form:
   - Select therapy
   - Choose appointment time
   - Submit and confirmation feedback
5. Build appointment history view (list agent's booked appointments)
6. Implement simple session management for logged-in agents

## Task Group 6: Authentication & Security
1. Implement agent login endpoint (`POST /auth/login`)
2. Implement agent registration endpoint (`POST /auth/register`)
3. Add session/token management (simple JWT or session-based)
4. Add middleware to protect agent routes (require valid session)
5. Add middleware to protect staff routes (basic role check)
6. Add input sanitization for user inputs

## Task Group 7: Testing & Documentation
1. Write integration tests covering the happy path:
   - Agent visits home page
   - Agent registers and logs in
   - Agent browses therapies
   - Agent books an appointment
   - Agent views booked appointments
2. Document API endpoints with request/response examples
3. Create setup guide for running the project locally

---

## Dependencies & Milestones
- **After Task Group 1-2**: Database and server running locally
- **After Task Group 3**: API endpoints testable via Postman/curl
- **After Task Group 4**: Public-facing home page live; no auth required
- **After Task Group 5**: Authenticated dashboard can interact with API
- **After Task Group 6**: System requires authentication to use protected features
- **After Task Group 7**: System is documented and tested; ready for Phase 2
