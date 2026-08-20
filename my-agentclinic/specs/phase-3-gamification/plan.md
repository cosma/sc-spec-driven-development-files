# Phase 3: Gamification & Metrics - Implementation Plan

## Overview
Break Phase 3 MVP into discrete, testable tasks. Each task should be completable in a single PR.

## Phase Timeline
- **Target**: 1-2 weeks (depending on parallelization)
- **Approach**: Backend complete before frontend UI updates

## Tasks

### 1. Database & Schema Updates
**Status**: `todo`  
**Effort**: 1 day  
**Owner**: Backend

**Acceptance Criteria**:
- [ ] No schema migrations needed (calculate from existing data)
- [ ] Verify appointment table has `therapy_id` for grouping by therapy type
- [ ] Verify appointment table has `status` field (pending/confirmed/completed/cancelled)
- [ ] Document how to calculate wellness score from existing data

**Changes**:
- Review Prisma schema and appointment queries
- Confirm `therapy_id` is accessible in queries
- No schema changes required if data model supports it

---

### 2. Backend: Wellness Score Calculation Function
**Status**: `todo`  
**Effort**: 1 day  
**Owner**: Backend

**Acceptance Criteria**:
- [ ] Function calculates wellness score based on formula in requirements.md
- [ ] Therapy diversity factor correctly counts unique therapy types
- [ ] Completion rate correctly counts completed vs. total appointments
- [ ] Final score is 0-100 range
- [ ] Function handles edge cases (no appointments, no completed, etc.)
- [ ] Unit tests cover all branches

**Changes**:
- Create `src/services/wellnessCalculator.ts` with:
  - `calculateWellnessScore(agentId: string): Promise<number>`
  - `calculateTherapyDiversity(agentId: string): Promise<number>`
  - `calculateCompletionRate(agentId: string): Promise<number>`
  - `getPerformanceMetrics(agentId: string)`: therapies completed, ailment resolution
- Add unit tests in `src/services/__tests__/wellnessCalculator.test.ts`

---

### 3. Backend: Performance Metrics Service
**Status**: `todo`  
**Effort**: 1 day  
**Owner**: Backend

**Acceptance Criteria**:
- [ ] Therapies completed count is accurate
- [ ] Ailment resolution rate calculated correctly
- [ ] Metrics include current active ailments count
- [ ] All metrics handle edge cases (new agents, no appointments)
- [ ] Unit tests for all calculations

**Changes**:
- Extend `wellnessCalculator.ts` with:
  - `getTherapiesCompleted(agentId: string): Promise<number>`
  - `getAilmentResolutionRate(agentId: string): Promise<number>`
  - `getActiveAilments(agentId: string): Promise<number>`
- Add unit tests

---

### 4. Backend: Update Staff Roster API
**Status**: `todo`  
**Effort**: 1 day  
**Owner**: Backend

**Acceptance Criteria**:
- [ ] `GET /staff/agents` includes wellness score for each agent
- [ ] `GET /staff/agents` includes performance metrics (therapies completed, resolution rate)
- [ ] Response time acceptable with calculations (< 500ms for roster)
- [ ] Integration tests pass

**Changes**:
- Update `GET /staff/agents` endpoint to:
  - Call wellness calculation service for each agent
  - Return: `wellnessScore`, `therapiesCompleted`, `ailmentResolutionRate`
- Update `GET /staff/agents/:id` to include detailed breakdown
- Add integration tests

---

### 5. Backend: Update Agent Profile API
**Status**: `todo`  
**Effort**: 0.5 day  
**Owner**: Backend

**Acceptance Criteria**:
- [ ] Agent profile endpoint includes wellness score
- [ ] Calculation happens on-demand (real-time)
- [ ] Tests pass

**Changes**:
- Create new endpoint: `GET /agents/profile` (or extend existing if needed)
- Return agent details + wellness score + performance metrics
- Add tests

---

### 6. Frontend: Display Wellness on Agent Dashboard
**Status**: `todo`  
**Effort**: 1 day  
**Owner**: Frontend

**Acceptance Criteria**:
- [ ] Wellness score (0-100) displayed prominently on agent profile tab
- [ ] Performance metrics shown (therapies completed, ailment resolution %)
- [ ] Score updates immediately after booking/completing appointment
- [ ] Responsive design (mobile-friendly)
- [ ] Last updated time shown

**Changes**:
- Update `src/public/agent-dashboard.html` Profile tab to:
  - Fetch wellness score from backend
  - Display large, clear wellness number
  - Show performance breakdown (therapies completed, resolution rate)
  - Add timestamp of last update
- Update JavaScript to refresh metrics after appointment actions
- Update CSS if needed for prominent display

---

### 7. Frontend: Display Wellness on Staff Roster
**Status**: `todo`  
**Effort**: 1 day  
**Owner**: Frontend

**Acceptance Criteria**:
- [ ] Wellness score shown in agent roster (column or badge)
- [ ] Staff roster remains sortable/filterable
- [ ] UI doesn't clutter with too many metrics (1-2 key ones visible)
- [ ] Mobile-responsive
- [ ] Scores refresh on page reload

**Changes**:
- Update `src/public/staff-dashboard.html` agent roster table to:
  - Add wellness score column
  - Optional: color-code scores (red/yellow/green ranges)
  - Maintain existing sorting/filtering
- Update JavaScript to fetch wellness metrics with roster
- Update CSS if needed

---

### 8. Testing & Validation
**Status**: `todo`  
**Effort**: 1 day  
**Owner**: Full team

**Acceptance Criteria**:
- [ ] All unit tests pass (backend calculations)
- [ ] Integration tests pass (API endpoints)
- [ ] E2E scenarios work (book → complete → see score increase)
- [ ] Edge cases tested (zero appointments, mixed status, etc.)
- [ ] Performance acceptable (< 1s dashboard load)

**Changes**:
- Add integration tests for API endpoints
- Add E2E test scenarios in `src/__tests__/e2e/`
- Document test approach in test README

---

## Implementation Order
1. Start with Tasks 1-3 (backend calculation foundation)
2. Parallel: Tasks 4-5 (API updates) while Task 6 starts
3. Task 7 (staff roster) after Task 4 is ready
4. Task 8 (testing) runs throughout, finalized at end

## Definition of Done
- [ ] All tasks completed
- [ ] Code reviewed and merged to MVP branch
- [ ] All tests passing
- [ ] Validation checklist from `validation.md` complete
- [ ] Ready for stakeholder demo
