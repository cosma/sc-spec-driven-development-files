# AgentClinic Tech Stack

## Guiding Principle
**Keep it simple.** Proven, stable, boring technology. Focus on product, not infrastructure complexity.

## Core Stack

### Frontend
- **React** — modern UI, component-driven
- **TypeScript** — type safety, developer experience
- **Browser APIs** — modern, widely-supported features

### Backend
- **Node.js + TypeScript** — consistent language across stack
- **API layer** — RESTful endpoints for dashboard and mobile web

### Database
- **PostgreSQL** — reliable, battle-tested RDBMS
- **Migrations** — version-controlled schema changes

### Deployment
- **Standard hosting** — container-ready, simple scaling
- **Environment-based config** — dev/staging/production

## No-Gos (Intentional Gaps)
- ❌ AI/LLM integrations (scope creep)
- ❌ Vector databases or RAG (not needed for MVP)
- ❌ Complex multi-tenancy (single tenant initially)
- ❌ Microservices (monolith is fine for this size)

## May Revisit
- Authentication/authorization (basic RBAC first)
- Real-time features (polling is acceptable for MVP)
- Advanced caching (optimize if needed)

## Developer Experience Requirements
- Easy local development setup
- Fast feedback loop (hot reload, quick builds)
- Clear error messages and debugging
- Comprehensive but minimal test coverage
