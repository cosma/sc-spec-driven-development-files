# Staff Dashboard Requirements

## Scope

### In Scope for Phase 2
- Single staff role (no role differentiation; all staff have same permissions)
- Staff authentication (login/register)
- Appointment management:
  - View all appointments across all agents
  - Filter by status, date range, agent name
  - Update appointment status (confirm, complete, cancel)
  - Search by therapy type or agent
- Agent wellness metrics dashboard:
  - Display roster of agents with wellness scores
  - Show appointment history per agent
  - Track metrics: therapies completed, ailments resolved, last appointment
  - Trend indicators (improving, stable, declining)
- Responsive UI for tablet/desktop (not mobile-first for staff)

### Out of Scope for Phase 2
- Advanced role-based access control (therapist vs admin vs manager roles)
- Therapy recommendation engine
- Bulk appointment operations
- Appointment scheduling (only management of existing bookings)
- Integration with external calendar systems
- Staff-to-agent messaging or notes
- Advanced analytics dashboards or export functionality

## Key Decisions

### 1. Authentication Model
**Decision**: Separate staff accounts from agent accounts
- **Rationale**: Staff and agents have different needs, permissions, and login flows. Cleaner separation of concerns.
- **Implementation**: Create `staff_accounts` table or add `is_staff` flag with role field
- **JWT**: Use same JWT library but different token prefix/validation for staff vs agents

### 2. Wellness Score Calculation
**Decision**: Simple, transparent score based on appointment completion
- **Formula**: `score = (completed_therapies / booked_therapies) * 100` + bonus for consistent engagement
- **Rationale**: Motivating for agents, easy for staff to understand and explain
- **Future**: Can evolve to weighted scores per therapy type or ailment category

### 3. Appointment Status Lifecycle
**Decision**: Four-state model: `pending` → `confirmed` → `completed` / `cancelled`
- **Rationale**: Covers typical workflow (agent books, staff confirms, outcome tracked)
- **Staff Responsibilities**: Confirm appointments within 24 hours; mark complete after therapy session

### 4. Dashboard Granularity
**Decision**: Agent-level view, not individual therapist view
- **Rationale**: Staff may be administrators/managers rather than therapists. Focus on agent outcomes, not therapist workload.
- **Extensibility**: Can add therapist assignments and schedules in Phase 3+

### 5. Performance Expectations
**Decision**: Dashboard must load appointment list in <2 seconds for 100+ agents
- **Strategy**: Use database pagination (limit 50 per page), lazy-load agents on demand
- **Monitoring**: Log query times; alert if >500ms

## Context & Stakeholder Alignment

### Mission Alignment
From `specs/mission.md`:
- **Measurable Impact**: Staff dashboard enables tracking of treatment effectiveness via wellness scores
- **Professional Experience**: Design for both agents and staff; this phase covers staff needs
- **Reliable System**: Build on tested Express.js + SQLite/Postgres stack

### Stakeholder Requirements
From `specs/mission.md`:
- **Mary (Engineering)**: Maintain TypeScript reliability; extend existing Express API cleanly
- **Susan (Product)**: Enable staff to manage workflow and see agent outcomes (sets up for gamification in Phase 3)
- **Steve (Marketing)**: Professional, modern dashboard UI showcasing the platform's sophistication

### Tech Stack Constraints
From `specs/tech-stack.md`:
- **Backend**: Continue Express.js + TypeScript
- **Database**: Use existing schema; extend with staff tables and appointment status
- **Frontend**: Server-rendered HTML5 + PicoCSS (minimal, semantic CSS framework)
- **Testing**: Vitest for unit/integration tests
- **No new dependencies** unless critical (keep stack lean and familiar)

## Open Questions (For Clarification)
1. Should staff registration be open or require an invite code?
2. Do we need audit logs of appointment status changes?
3. Should agents see that staff has confirmed their appointment?
4. What's the default appointment duration for booking (already in Phase 1?)?
5. Should staff be able to reschedule appointments, or only confirm/complete?

## Success Criteria
- All endpoints pass tests (unit + integration)
- Staff can log in and access restricted endpoints
- Appointment filtering/search works with realistic data
- Wellness metrics calculate correctly
- Dashboard loads in target time
- UI is mobile-responsive for tablet viewing
