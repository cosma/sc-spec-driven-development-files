# AgentClinic Roadmap

## Phase 1: MVP - Core Booking System ✅ COMPLETE
**Goal**: Agents can browse therapies and book appointments

**Status**: COMPLETE (Completed on 2026-08-20)

### Deliverables
- [x] Database schema: Agents, Therapies, Appointments, Ailments
  - SQLite3 database with 5 tables
  - Support for many-to-many therapy-ailment relationships
  - Automatic table creation on server startup
  - Sample data seeding script
- [x] API endpoints:
  - `GET /therapies` - list available treatments (with ailment filtering)
  - `GET /ailments` - list agent ailments/issues (with category filtering)
  - `POST /appointments` - book an appointment (authenticated)
  - `GET /appointments` - view agent's appointments (authenticated)
  - `POST /auth/register` - agent registration with password hashing
  - `POST /auth/login` - agent authentication with JWT tokens
- [x] Basic dashboard: Agent profile + therapy browser + booking form
  - Tabbed interface for Profile, Therapies, Appointments
  - Therapy browser with search and filtering
  - Modal-based appointment booking form
  - Appointment history with status tracking
  - Responsive design with mobile support
- [x] Simple authentication (agents can log in)
  - User registration with email validation
  - Login with email/password
  - JWT token-based authentication (7-day expiry)
  - Password hashing with bcryptjs (10 salt rounds)
  - Protected API endpoints

### Success Criteria
- [x] Agents can view available therapies (sorted by ailment category)
- [x] Agents can book appointments for specific therapies
- [x] Bookings appear in agent's appointment list

### Implementation Details
- **Backend**: Express.js with SQLite3 database
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Authentication**: JWT tokens with 7-day expiry
- **Styling**: Modular CSS component system with variables
- **Components**: Separate header, footer, main, utilities modules
- **Documentation**: Comprehensive API docs and setup guide

---

## Phase 2: Staff Dashboard (Weeks 3-4)
**Goal**: Staff can manage appointments and see agent wellness

### Deliverables
- [ ] Staff authentication & role-based access control
- [ ] Staff dashboard showing:
  - Upcoming appointments
  - Agent roster with wellbeing status
  - Appointment history
- [ ] API endpoints:
  - `GET /staff/appointments` - view all appointments
  - `PATCH /appointments/:id` - confirm/complete appointment
  - `GET /staff/agents` - see agent wellness metrics

### Success Criteria
- Staff can view and manage appointments
- Dashboard shows real-time appointment status

---

## Phase 3: Gamification & Metrics (Weeks 5-6)
**Goal**: Track wellness improvements and motivate agents

### Deliverables
- [ ] Agent wellness score calculation
- [ ] Performance tracking:
  - Therapies completed
  - Ailment resolution rate
  - Engagement metrics
- [ ] Dashboard enhancements:
  - Agent progress charts
  - Therapy effectiveness stats
- [ ] Leaderboards (optional: agents seeing aggregate wellness trends)

### Success Criteria
- Agents see their wellness metrics improve after therapy
- Staff can correlate treatments with performance improvements

---

## Phase 4: Polish & Scale
- Enhanced UI/UX based on feedback
- Performance optimization
- Deployment pipeline
- Documentation

---

## Development Approach
- **Iteration**: Complete one phase fully before moving to the next
- **Testing**: Unit + integration tests for each phase using Vitest
- **Review**: Align with stakeholders after each phase
