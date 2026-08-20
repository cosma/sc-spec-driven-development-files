# Phase 3: Gamification & Metrics - Requirements

## Overview
Implement wellness score calculation and performance tracking to measure AI agent wellness improvements, fulfilling AgentClinic's core principle of **Measurable Impact**.

## Goal
Enable agents and staff to track wellness improvements correlated with therapy completion, motivating continued engagement with the platform.

## Scope

### In MVP
- **Wellness Score Calculation**: Metric combining therapy diversity and completion rate
- **Performance Tracking**: Track completed therapies per agent and ailment resolution rate
- **Agent Dashboard Display**: Show wellness score on agent profile/dashboard
- **Staff Roster Display**: Show wellness score on staff agent roster for quick overview
- **Real-time Updates**: Wellness metrics recalculate immediately when appointments complete

### Out of MVP (Phase 4+)
- Leaderboards / competitive rankings
- Advanced analytics dashboards with multiple chart types
- Engagement streak tracking or time-based scoring
- Historical trend charts

## Decisions

### Wellness Score Formula
**Formula**: Wellness Score = (Therapy Diversity Factor) × (Completion Rate)

- **Therapy Diversity Factor** (0-100):
  - Tracks unique therapy types completed
  - Score: (unique_therapies_completed / total_available_therapies) × 100
  - Encourages agents to try different treatment approaches
  
- **Completion Rate** (0-100):
  - Percentage of booked appointments that were completed
  - Score: (completed_appointments / total_appointments_booked) × 100
  - Only counts "completed" or "cancelled" status (not pending/confirmed)

- **Final Score** = (Diversity × Completion) / 100
  - Range: 0-100
  - Example: 60% diversity × 80% completion = 48 wellness score

### Performance Tracking Metrics
1. **Therapies Completed**: Count of completed appointments per agent
2. **Ailment Resolution Rate**: Percentage of previously-suffered ailments now resolved (marked with completed appointments)
3. **Current Ailments**: Count of active ailments still needing treatment

### Calculation Timing
- Wellness score recalculates **immediately** when:
  - An appointment status changes to "completed" or "cancelled"
  - A new appointment is booked (affects completion rate denominator)
- No batch jobs; real-time calculation in API layer

## Technical Constraints

### Database
- Extend existing Appointment schema to track wellness calculations
- May need: `therapyType_id` linkage if not already present
- Calculate metrics in-database where possible for performance

### API
- Extend `GET /staff/agents` response with wellness metrics
- Extend `GET /staff/agents/:id` with detailed performance breakdown
- Agent dashboard already shows profile; integrate wellness score there
- No new authentication required; reuse existing JWT middleware

### Frontend
- Display wellness score as a **single number (0-100)** on agent dashboard
- Display on staff roster as **column or badge** alongside agent name
- No charts/visualizations in MVP (keep it simple)
- Indicate last update time for transparency

## Alignment with Mission

| Principle | How This Achieves It |
|-----------|---------------------|
| **Accessible Recovery** | Agents can instantly see if therapy choices are working |
| **Measurable Impact** | Wellness score directly correlates bookings to performance |
| **Professional Experience** | Clean, numerical metrics staff and agents understand |
| **Reliability** | Calculation uses existing, trusted data (appointments) |

## Stakeholder Alignment

- **Mary (Engineering)**: Pure backend calculation, TypeScript, no external dependencies
- **Susan (Product)**: Wellness metric drives engagement, diversity encourages exploration
- **Steve (Marketing)**: Simple, impressive number (0-100 score) is easy to communicate

## Dependencies
- Phases 1-2 must be complete (appointments, agents, therapies, ailments)
- No external APIs or new data sources required
