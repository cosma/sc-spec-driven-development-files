# Staff Dashboard Validation & Acceptance Criteria

## 1. Unit Tests (API & Logic)

### Auth Middleware
- [ ] Valid JWT token allows access to `/staff/*` endpoints
- [ ] Expired JWT token returns 401
- [ ] Missing JWT token returns 401
- [ ] Invalid token signature returns 401
- [ ] Agent JWT does not grant staff access (cross-role check)

### Staff Login/Register
- [ ] `POST /auth/staff-register` with valid email/password creates staff account
- [ ] `POST /auth/staff-register` rejects duplicate email
- [ ] `POST /auth/staff-register` returns JWT on success
- [ ] `POST /auth/staff-login` with correct credentials returns JWT
- [ ] `POST /auth/staff-login` with wrong password returns 401
- [ ] `POST /auth/staff-login` with non-existent email returns 404
- [ ] Passwords are hashed (never stored in plaintext)

### Appointment Endpoints
- [ ] `GET /staff/appointments` returns all appointments (with pagination)
- [ ] `GET /staff/appointments?status=pending` filters by status
- [ ] `GET /staff/appointments?agent_id=123` filters by agent
- [ ] `GET /staff/appointments?start_date=2026-08-20&end_date=2026-08-31` filters by date range
- [ ] `GET /staff/appointments?search=john` finds agent by name or therapy name
- [ ] `GET /staff/appointments/:id` returns single appointment details
- [ ] `PATCH /appointments/:id` with `status=confirmed` updates successfully
- [ ] `PATCH /appointments/:id` with `status=completed` updates successfully
- [ ] `PATCH /appointments/:id` with invalid status returns 400
- [ ] `PATCH /appointments/:id` requires staff JWT (auth check)

### Wellness Metrics
- [ ] Wellness score = (completed_therapies / total_booked) * 100
- [ ] `GET /staff/agents` returns all agents with wellness scores
- [ ] `GET /staff/agents/:id` returns individual agent with appointment history
- [ ] Completed appointment count reflects in agent's metric
- [ ] Score updates after appointment status changes

## 2. End-to-End Tests

### Staff Login Flow
```
1. POST /auth/staff-login with email/password
2. Receive JWT token
3. Use token to access GET /staff/appointments
4. Verify appointments are returned (status 200)
```
- [ ] Test succeeds with valid credentials
- [ ] Test fails with invalid credentials (401)

### Appointment Management Workflow
```
1. Staff logs in
2. GET /staff/appointments (retrieve pending appointments)
3. PATCH /appointments/:id with status=confirmed
4. GET /staff/appointments/:id to verify status changed
5. Confirm appointment appears as "confirmed" in list
```
- [ ] All steps succeed
- [ ] Status change persists after page reload

### Agent Wellness Discovery
```
1. Staff logs in
2. GET /staff/agents to see roster with wellness scores
3. Click on agent → GET /staff/agents/:id
4. Review agent's appointment history
5. Verify wellness score matches completed appointments
```
- [ ] Roster displays 10+ agents
- [ ] Wellness scores are calculated correctly
- [ ] Clicking agent shows appointment history

### Search & Filter Workflow
```
1. GET /staff/appointments (initial load)
2. Filter: status=pending → results update
3. Filter: date range (last 7 days) → results update
4. Search: agent name "John" → results update
5. Search: therapy type "massage" → results update
```
- [ ] Each filter returns correct subset
- [ ] Filters can be combined (e.g., pending + last 7 days)
- [ ] Empty results handled gracefully

## 3. Manual Acceptance Tests

### Dashboard Usability
- [ ] Staff login page loads without errors
- [ ] Form validation shows clear error messages (invalid email, weak password, etc.)
- [ ] Successful login redirects to appointment dashboard
- [ ] Logout clears session and redirects to login page
- [ ] Navigation is intuitive (dashboard → agents → appointment detail)

### Appointment Management UI
- [ ] Appointment list is readable (columns: agent, therapy, time, status)
- [ ] Status buttons (confirm, complete, cancel) are clearly labeled
- [ ] Clicking status button shows confirmation dialog
- [ ] After status change, list updates without page reload
- [ ] Filters (dropdown for status, date picker for range) work smoothly
- [ ] Search input provides real-time feedback (debounced)

### Agent Wellness Dashboard
- [ ] Agent roster displays with wellness scores visible
- [ ] Color coding makes sense (green = good, yellow = needs attention, red = critical)
- [ ] Clicking agent shows:
  - Last 5 appointments
  - Appointment history (sortable by date)
  - Wellness trend chart or indicator
- [ ] Agent details are accurate (name, email, appointment count)

### Responsive Design (Tablet/Desktop)
- [ ] Dashboard looks good at 768px (tablet portrait)
- [ ] Sidebar or hamburger menu works on tablet
- [ ] Table columns don't overflow; scrolling is smooth
- [ ] Buttons and inputs are touch-friendly (min 44px height)
- [ ] At 1024px+ (desktop), full layout with side-by-side panels

### Error Handling
- [ ] Network error shows user-friendly message (not JSON dump)
- [ ] 404 (appointment not found) handled gracefully
- [ ] Timeout (slow API) shows loading spinner, then retry option
- [ ] Invalid status update shows error message in modal

### Accessibility
- [ ] All form inputs have associated labels
- [ ] Buttons have descriptive aria-labels
- [ ] Color is not the only indicator (also use icons/text)
- [ ] Keyboard navigation works (Tab through form, Enter to submit)
- [ ] Focus indicators are visible

## 4. Performance Baseline Tests

### Load & Response Times
- [ ] `GET /staff/appointments` returns <500ms for 100+ appointments
- [ ] Dashboard UI renders in <2 seconds (with network latency)
- [ ] Search/filter returns results in <1 second
- [ ] `PATCH /appointments/:id` responds in <300ms

### Concurrent User Load
- [ ] 10 staff members viewing dashboard simultaneously → no errors
- [ ] Status updates from multiple users don't cause race conditions
- [ ] Database connection pool handles concurrent requests

### Data Volume
- [ ] System works correctly with:
  - 100+ agents
  - 500+ appointments (historical)
  - 50+ pending appointments
  - 1000+ completed appointments

## Acceptance Sign-Off

### Definition of Done
The Staff Dashboard phase is complete when:
1. ✅ All unit tests pass (auth, endpoints, metrics)
2. ✅ All E2E workflows execute without errors
3. ✅ All manual acceptance tests pass (staff signs off on usability)
4. ✅ Performance baselines are met (<2s dashboard load)
5. ✅ No critical bugs (P1 issues); known limitations documented
6. ✅ Code review approved by team lead
7. ✅ Documentation updated (API docs, setup guide)

### Stakeholder Review Checklist
- [ ] **Mary (Engineering)**: Code quality, test coverage, TypeScript types
- [ ] **Susan (Product)**: Feature completeness, workflow smoothness
- [ ] **Steve (Marketing)**: UI looks professional, no rough edges

### Demo Preparation
- [ ] Create demo script with sample data:
  - 20 agents with varied profiles
  - 50 appointments (pending, confirmed, completed)
  - Wellness scores ranging from 20% to 90%
- [ ] Practice demo workflow: Login → Filter → Confirm → View metrics
- [ ] Prepare Q&A for stakeholders (e.g., "How are wellness scores calculated?")
