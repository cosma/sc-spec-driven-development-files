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
- **Technology**: Server-side rendered HTML5 with vanilla JavaScript
- **CSS**: PicoCSS (minimal, classless CSS framework) + custom responsive utilities
- **Responsive Design**: Mobile-first approach with breakpoints:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+
- **Design Principles**: Modern, accessible, device-agnostic (Steve's requirement); semantic HTML with minimal CSS overhead

## DevOps & Quality
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Vitest for unit/integration tests (blazing fast, TypeScript-first)
- **Environment**: Docker-ready structure

## Rationale
This stack prioritizes:
1. **Reliability**: Popular, battle-tested technologies
2. **TypeScript**: Type safety across the entire stack
3. **Developer Experience**: Clear, well-documented tools
4. **Scalability**: Easy to add React frontend or additional services later
5. **Modern UX**: TailwindCSS provides attractive design without heavy lifting
