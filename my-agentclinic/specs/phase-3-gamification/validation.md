# Phase 3: Gamification & Metrics - Validation

## Definition of Complete
The MVP is ready to merge when all validation criteria pass.

---

## Functional Validation

### Wellness Score Calculation
- [ ] **Accuracy**: Score calculated as `(therapy_diversity × completion_rate) / 100`
- [ ] **Range**: Score is always 0-100, never negative or exceeds 100
- [ ] **Therapy Diversity**: Correctly counts unique therapy types completed (e.g., 3 unique therapies out of 8 available = 37.5%)
- [ ] **Completion Rate**: Correctly calculates completed ÷ total appointments (only counts "completed" or "cancelled" statuses)
- [ ] **Edge Case - New Agent**: Agent with no appointments shows wellness score of 0, not error
- [ ] **Edge Case - All Pending**: Agent with only pending/confirmed (not completed) appointments shows realistic score
- [ ] **Edge Case - All Completed**: Agent with 5 completed appointments across 3 therapies (60% diverse) = 60 score minimum

### Performance Metrics
- [ ] **Therapies Completed**: Count accurately reflects number of "completed" appointments
- [ ] **Ailment Resolution Rate**: Percentage calculated as (completed appointments addressing ailments) ÷ (original/current ailments) × 100
- [ ] **Active Ailments**: Count reflects ailments without completed appointments in current period
- [ ] **All Metrics Zero-Initialized**: Agents with no activity show 0 for all metrics, not null/undefined

### Real-time Updates
- [ ] **After Booking**: Appointment appears immediately in dashboard/API
- [ ] **After Completing**: Wellness score visibly increases within 1 second
- [ ] **Multiple Completions**: Score updates correctly after each appointment completion
- [ ] **Status Changes**: Changing appointment from "pending" → "completed" immediately recalculates metrics

---

## API Validation

### `GET /staff/agents` Response
```json
{
  "agents": [
    {
      "id": "agent-123",
      "name": "Agent Name",
      "email": "agent@clinic.local",
      "wellnessScore": 48,
      "therapiesCompleted": 5,
      "ailmentResolutionRate": 75,
      "activeAilments": 2
    }
  ]
}
```

**Validation**:
- [ ] Response includes `wellnessScore` (0-100) for each agent
- [ ] Response includes `therapiesCompleted` (count)
- [ ] Response includes `ailmentResolutionRate` (0-100 percentage)
- [ ] Response includes `activeAilments` (count)
- [ ] All values are numbers, not strings
- [ ] Response time < 500ms for roster of 10+ agents

### `GET /staff/agents/:id` Response
```json
{
  "id": "agent-123",
  "name": "Agent Name",
  "wellnessScore": 48,
  "therapiesCompleted": 5,
  "ailmentResolutionRate": 75,
  "activeAilments": 2,
  "therapiesByType": {
    "therapy-1-name": 2,
    "therapy-2-name": 1,
    "therapy-3-name": 2
  },
  "ailmentsResolved": ["Anxiety", "Sleep Deprivation"],
  "ailmentsActive": ["Burnout", "Indecision"]
}
```

**Validation**:
- [ ] Includes all wellness metrics
- [ ] Includes breakdown of therapies by type
- [ ] Lists which ailments have been resolved
- [ ] Lists which ailments are still active
- [ ] Response time < 300ms

### `GET /agents/profile` or Agent Dashboard Endpoint
- [ ] Returns agent details + `wellnessScore`, `therapiesCompleted`, `ailmentResolutionRate`
- [ ] Response time < 200ms

---

## Frontend - Agent Dashboard

### Profile Tab Display
- [ ] **Wellness Score Visible**: Number 0-100 displayed prominently (large font, color-coded if desired)
- [ ] **Performance Breakdown**: Shows
  - Therapies completed (count)
  - Ailment resolution rate (percentage)
  - Active ailments (count)
- [ ] **Last Updated**: Timestamp or "just now" shown
- [ ] **Responsive**: Displays well on mobile (320px), tablet (768px), desktop (1024px+)
- [ ] **After Booking**: Page refreshes after appointment booking modal closes
- [ ] **After Completing** (if agent can mark complete): Score updates immediately
- [ ] **No Errors**: Page loads without console errors even if API slow (< 3s)

### Visual Design
- [ ] Score displayed in easy-to-read format (e.g., "Wellness Score: 48/100")
- [ ] Consistent with existing agent dashboard styling (Tailwind + PicoCSS)
- [ ] Metrics use clear labels (not abbreviations)

---

## Frontend - Staff Roster

### Agent Roster Table
- [ ] **Wellness Score Column**: Shows 0-100 score for each agent
- [ ] **Visible by Default**: Wellness score is part of main roster view (not hidden behind modal)
- [ ] **Sortable** (if applicable): Can sort roster by wellness score
- [ ] **Responsive**: Wellness column doesn't break layout on mobile (may stack or scroll)
- [ ] **Updates on Reload**: Scores refresh when page reloaded
- [ ] **Color Coding** (optional): Could use visual indicators (green = high, yellow = medium, red = low) but not required for MVP

### Staff Can Take Action
- [ ] Staff can click on agent row to see detailed metrics
- [ ] Detail view shows full breakdown (therapies by type, ailments, etc.)

---

## Integration Scenarios

### Scenario 1: New Agent Books and Completes Therapy
1. Agent logs in, wellness score shows 0
2. Agent books 1 appointment for "Anxiety" (Therapy A)
3. Wellness score still 0 (not completed yet)
4. Staff marks appointment "completed"
5. ✓ Agent's wellness score > 0 (ideally 50 if 1 therapy ÷ 2 available = 50% diversity)
6. ✓ Therapies completed = 1
7. ✓ Ailment resolution rate > 0 (1 ailment addressed)

### Scenario 2: Agent Completes Multiple Therapy Types
1. Agent books & completes 3 appointments across 3 different therapy types
2. Therapies completed = 3
3. ✓ Therapy diversity = 3 ÷ available_therapies × 100
4. ✓ Completion rate = 100% (all completed)
5. ✓ Wellness score = (diversity × 100) ÷ 100

### Scenario 3: Staff Views Roster, Takes Action
1. Staff dashboard loads
2. ✓ Roster shows wellness scores for all agents
3. ✓ Scores are sorted/comparable
4. Staff clicks on high-wellness agent
5. ✓ Detail view shows breakdown of which therapies helped

### Scenario 4: Real-time Update
1. Agent dashboard is open, wellness score shows 45
2. Staff marks pending appointment "completed"
3. ✓ Agent refreshes dashboard (or page auto-refreshes)
4. ✓ Wellness score updates to new value (not 45)

---

## Performance Validation

- [ ] Wellness calculation for one agent: < 100ms
- [ ] Wellness calculation for 10 agents (roster): < 500ms total
- [ ] Agent detail page load: < 300ms
- [ ] No N+1 queries in roster endpoint (use batch calculation or join)
- [ ] Dashboard page load time acceptable (metric loads before Cumulative Layout Shift)

---

## Code Quality Validation

- [ ] All wellness calculation logic unit tested (100% coverage of calculations)
- [ ] API endpoints have integration tests (happy path + edge cases)
- [ ] No TypeScript errors (`npm run type-check` passes)
- [ ] No lint errors (`npm run lint` passes)
- [ ] Code follows existing project patterns (error handling, logging, etc.)

---

## Stakeholder Validation

### Mary (Engineering)
- [ ] Implementation uses TypeScript, existing Prisma queries
- [ ] No new external dependencies
- [ ] Code is maintainable and testable

### Susan (Product)
- [ ] Wellness score drives agent engagement (visible, meaningful)
- [ ] Diversity bonus encourages trying different therapies
- [ ] Staff can see impact of treatments in roster

### Steve (Marketing)
- [ ] Wellness score is easy to communicate ("AI agents improve wellness from 0 to 85!")
- [ ] Dashboard looks professional and impressive
- [ ] Demo-friendly (clear before/after improvement visible)

---

## Sign-off Checklist

- [ ] All functional validation criteria passed
- [ ] All API responses validated
- [ ] All frontend displays working
- [ ] All integration scenarios tested
- [ ] Performance benchmarks met
- [ ] Code quality validated
- [ ] Stakeholder requirements aligned
- [ ] PR approved and ready to merge
- [ ] Documentation updated (API docs, if needed)
