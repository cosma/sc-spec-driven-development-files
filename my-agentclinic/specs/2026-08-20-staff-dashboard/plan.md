# Staff Dashboard Implementation Plan

**Phase**: Phase 2 (Weeks 3-4)  
**Approach**: Feature-first (Auth → Appointment Mgmt → Agent Metrics)

## Task Groups

### 1. Staff Authentication & Authorization
**Goal**: Enable staff login and establish role-based access control

- [ ] Add `staff_role` column to agents table or create separate staff table with email/password
- [ ] Implement `POST /auth/staff-login` endpoint with JWT token generation
- [ ] Create `POST /auth/staff-register` endpoint (admin-gated or initial setup)
- [ ] Add auth middleware to validate staff JWT tokens
- [ ] Implement role-based route guards (initially single "staff" role)
- [ ] Test: Staff login flow, token expiry, invalid credentials

### 2. Appointment Management Endpoints & Logic
**Goal**: Give staff ability to view, filter, and update appointments

- [ ] Create `GET /staff/appointments` endpoint with filters (status, agent, date range)
- [ ] Implement `GET /staff/appointments/:id` for appointment details
- [ ] Create `PATCH /appointments/:id` endpoint to update status (confirm, complete, cancel)
- [ ] Add appointment status tracking: `pending` → `confirmed` → `completed` / `cancelled`
- [ ] Implement search and filtering logic (by agent name, therapy type, date)
- [ ] Test: Retrieve appointments, filter by status/date, update appointment status

### 3. Staff Dashboard Frontend & UI
**Goal**: Build responsive staff interface for appointment management

- [ ] Create staff login page (email/password form, remember-me toggle)
- [ ] Build appointment list/table view:
  - Display: Agent name, therapy, appointment time, current status
  - Sorting: By date, status, agent
  - Filtering: Status dropdown, date range picker, agent search
- [ ] Add appointment detail modal or sidebar
- [ ] Create status update UI (confirm/complete/cancel buttons)
- [ ] Implement responsive design for tablet/desktop (staff typically on larger screens)
- [ ] Test: Navigation, form submissions, real-time updates

### 4. Agent Wellness Metrics Display
**Goal**: Show staff a view of agent wellbeing and treatment progress

- [ ] Design wellness score schema:
  - Total therapies completed
  - Ailments resolved (marked as "resolved" in appointments)
  - Last appointment date per agent
  - Engagement trend (appointments booked over time)
- [ ] Create `GET /staff/agents` endpoint returning agent roster with wellness metrics
- [ ] Build staff dashboard view: Agent roster with status cards
  - Display: Agent name, wellness score, last appointment, trend indicator
  - Color coding: Green (good), yellow (needs attention), red (critical)
- [ ] Add agent detail view: Individual agent's appointment history and metrics
- [ ] Test: Retrieve metrics, calculate scores, verify correctness

### 5. Integration & Polish
**Goal**: Connect all pieces and ensure everything works end-to-end

- [ ] Verify staff can log in and access restricted endpoints
- [ ] Test full workflows: Log in → View appointments → Filter → Confirm → See metrics update
- [ ] Polish UI: Loading states, error messages, accessibility
- [ ] Performance testing: Dashboard loads with 100+ agents/appointments
- [ ] Prepare demo data and documentation

## Dependencies
- Phase 1 must be complete (agents table, therapies, appointments, auth)
- Existing database schema must be extended (or migration needed)

## Success Metrics
- All endpoints functional and tested
- Staff can perform key workflows without errors
- Dashboard loads in <2 seconds with realistic data
