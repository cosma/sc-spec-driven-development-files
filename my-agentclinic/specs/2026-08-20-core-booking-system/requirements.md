# Phase 1 Requirements: MVP - Core Booking System

## Scope
Deliver a functional booking system allowing AI agents to discover wellness therapies and schedule appointments. This phase establishes the core data model and workflows that all future phases depend on.

**Duration**: Weeks 1-2 (14 days)

---

## Functional Requirements

### FR1: Therapy Catalog
- System maintains a catalog of therapies (treatments)
- Each therapy has: name, description, target ailments, duration, required staff
- Agents can list all available therapies
- Agents can filter therapies by ailment category
- Therapies are sortable by name or category

### FR2: Ailment Management
- System maintains a catalog of ailments/issues agents might face
- Each ailment has: name, description, category (e.g., "stress", "burnout", "skill-gap")
- Agents can view all available ailments
- Therapies are linked to one or more ailments they address

### FR3: Appointment Booking
- Agents can book an appointment for a therapy
- Booking captures: agent ID, therapy ID, desired appointment time, optional notes
- System confirms booking and shows confirmation
- Agents can see upcoming and past appointments in their profile

### FR4: Agent Authentication
- Agents can create accounts or log in
- Authentication is required to book appointments or view personal data
- Session is maintained during agent's active use

### FR5: Home Page (Public Landing Page)
- Home page is accessible to unauthenticated visitors at root URL (`/`)
- Home page displays AgentClinic branding and mission statement
- Home page shows overview of available therapies (featured list or aggregate count)
- Home page shows overview of available ailments (featured categories or count)
- Home page includes prominent "Sign In" and "Register" call-to-action buttons
- Home page includes brief explanation of how the platform works
- Home page is styled professionally with TailwindCSS

### FR6: Agent Dashboard
- Dashboard shows agent's profile information
- Dashboard displays therapy browser with search/filter capabilities
- Dashboard provides booking form to schedule appointments
- Dashboard shows agent's appointment history (upcoming and completed)
- Dashboard is only accessible to authenticated agents

---

## Non-Functional Requirements

### NFR1: Technology Stack
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Server-side rendered with EJS + TailwindCSS
- **Testing**: Jest for unit and integration tests
- **Code Quality**: ESLint + Prettier

### NFR2: Type Safety
- 100% TypeScript compilation (strict mode)
- Type definitions auto-generated from Prisma schema
- No `any` types unless explicitly justified
- Request/response DTOs for all API endpoints

### NFR3: Database Design
- Normalized schema avoiding redundancy
- Proper foreign key relationships
- Migrations for schema changes
- Seed script for demo data

### NFR4: API Design
- RESTful endpoints following standard conventions
- Consistent error response format
- Request validation with clear error messages
- JSON request/response bodies

### NFR5: Security Baseline
- Input sanitization to prevent injection attacks
- Authentication required for agent-specific endpoints
- Basic RBAC for agent vs. staff roles
- Environment variables for sensitive config

---

## Key Decisions

### D1: Agent Authentication Mechanism
**Decision**: Use simple JWT token-based authentication stored in HTTP-only cookies.
**Rationale**: Simpler than session-based for REST API; HTTP-only cookies prevent XSS attacks.

### D2: Therapy-Ailment Relationship
**Decision**: Many-to-many: therapies address multiple ailments; ailments can be addressed by multiple therapies.
**Rationale**: Realistic domain model; allows flexible recommendations in future phases.

### D3: Appointment Status Model
**Decision**: Start with simple status enum: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`.
**Rationale**: Sufficient for MVP; can expand in Phase 2 for staff management.

### D4: Frontend Technology
**Decision**: Server-side rendered (EJS) instead of React for Phase 1.
**Rationale**: Faster to ship, simpler deployment, sufficient for MVP. Can add React later if needed.

### D5: Deployment Target
**Decision**: Dockerized and runnable locally; deployment pipeline in Phase 4.
**Rationale**: Focuses MVP on functionality; deployment optimized for conferences/demos later.

---

## Context & Alignment

### Stakeholder Alignment
- **Mary (Engineering)**: TypeScript + Express + PostgreSQL aligns with "popular stack" requirement
- **Susan (Product)**: Covers core booking workflow; gamification comes in Phase 3
- **Steve (Marketing)**: TailwindCSS + polished UI set stage for attractive system; full polish in Phase 4

### Dependency on Mission
Phase 1 enables the mission pillars:
1. **Accessible Recovery**: Agents can discover and book therapies
2. **Measurable Impact**: Appointments create data for metrics (Phase 3)
3. **Professional Experience**: Dashboard provides agent-facing interface
4. **Reliability**: Built on trusted, proven tech stack

### Foundations for Future Phases
- **Phase 2** (Staff Dashboard) relies on appointment data and role-based access
- **Phase 3** (Gamification) needs rich appointment history and outcome data
- **Phase 4** (Polish & Scale) extends this foundation

---

## Out of Scope for Phase 1
- Appointment scheduling/calendar (fixed time slots OK)
- Analytics or wellness metrics
- Staff-facing features (coming Phase 2)
- Email notifications
- Payment or subscription management
- Advanced UI features (animations, real-time updates)
- Performance optimization beyond baseline
