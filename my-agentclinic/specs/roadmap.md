# AgentClinic Roadmap

## Phase 1: MVP - Core Booking System (Weeks 1-2)
**Goal**: Agents can browse therapies and book appointments

### Deliverables
- [ ] Database schema: Agents, Therapies, Appointments, Ailments
- [ ] API endpoints:
  - `GET /therapies` - list available treatments
  - `GET /ailments` - list agent ailments/issues
  - `POST /appointments` - book an appointment
  - `GET /agents/:id/appointments` - view agent's bookings
- [ ] Basic dashboard: Agent profile + therapy browser + booking form
- [ ] Simple authentication (agents can log in)

### Success Criteria
- Agents can view available therapies (sorted by ailment category)
- Agents can book appointments for specific therapies
- Bookings appear in agent's appointment list

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
- **Testing**: Unit + integration tests for each phase
- **Review**: Align with stakeholders after each phase
