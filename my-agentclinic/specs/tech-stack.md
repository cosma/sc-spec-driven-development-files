# AgentClinic Tech Stack

## Backend
- **Runtime**: Node.js (LTS)
- **Language**: TypeScript
- **Framework**: Express.js (recommended)
  - Lightweight and well-proven
  - Excellent TypeScript support with `@types/express`
  - Massive ecosystem and community
  - Aligns with Mary's "popular stack" requirement
  - Easy to extend with middleware for auth, validation, logging

## Database
- **Primary**: PostgreSQL (relational for structured booking/user data)
- **ORM**: Prisma (TypeScript-first, excellent DX)

## Frontend
- **Technology**: Server-side rendered initially (could add React later if needed)
- **Templating**: EJS or Handlebars for initial dashboards
- **CSS**: TailwindCSS for modern, attractive design (Steve's requirement)

## DevOps & Quality
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest for unit/integration tests
- **Environment**: Docker-ready structure

## Rationale
This stack prioritizes:
1. **Reliability**: Popular, battle-tested technologies
2. **TypeScript**: Type safety across the entire stack
3. **Developer Experience**: Clear, well-documented tools
4. **Scalability**: Easy to add React frontend or additional services later
5. **Modern UX**: TailwindCSS provides attractive design without heavy lifting
