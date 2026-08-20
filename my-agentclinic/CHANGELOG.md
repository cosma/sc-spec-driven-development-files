# Changelog

All notable changes to AgentClinic are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Responsive design support across all breakpoints (mobile, tablet, desktop)
- Comprehensive Vitest test suite with 35+ test cases
- Health, auth, ailments, therapies, appointments, and integration tests
- Supertest for HTTP assertion testing
- Responsive design documentation (RESPONSIVE_DESIGN.md)
- Testing documentation (TESTING.md)
- Enhanced CSS with media queries for all screen sizes
- Touch-friendly UI (44px minimum tap targets)
- Print styles for all pages
- High pixel density display support

### Changed
- Updated tech-stack documentation to specify Vitest testing framework
- Refactored CSS with comprehensive responsive design breakpoints
- Enhanced all HTML pages with responsive media queries
- Updated feature specs to include responsive design requirements
- Improved form inputs with 44px minimum height for mobile

## [1.0.0] - 2026-08-20

### Added
- Phase 1 MVP: Core Booking System
- Database schema with SQLite (Agents, Therapies, Ailments, Appointments)
- Express.js REST API with JWT authentication
- User registration and login endpoints
- Therapy browsing and filtering by ailment
- Appointment booking system (authenticated)
- Dashboard with tabbed interface
- Profile view with wellness status
- Therapy browser with search and filtering
- Appointment history with status tracking
- Home page with landing section
- Mission overview section
- Featured therapies section
- Responsive layout components (header, footer, main)
- Shared CSS component system
- TailwindCSS styling
- Password hashing with bcryptjs
- Basic authentication with JWT (7-day expiry)
- API documentation (API_DOCS.md)
- Setup guide (README.md)
- Tech stack documentation
- Database seeding script with sample data

### Features
- ✅ Agents can register and login
- ✅ Agents can browse available therapies
- ✅ Agents can filter therapies by ailment
- ✅ Agents can book appointments
- ✅ Agents can view their appointments
- ✅ Staff-facing features (planned for Phase 2)
- ✅ Authentication required for booking
- ✅ Secure password storage with bcryptjs
- ✅ JWT token-based session management

### Technical Details
- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Frontend**: HTML5 + Vanilla JavaScript + TailwindCSS
- **Auth**: JWT tokens with 7-day expiry
- **API**: RESTful endpoints with JSON
- **Deployment**: Docker-ready structure
