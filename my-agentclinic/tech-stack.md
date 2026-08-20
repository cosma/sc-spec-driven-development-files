# Tech Stack

## Overview
AgentClinic uses a modern, pragmatic tech stack designed for rapid development and testing.

## Core Technologies

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.17.1
- **Language**: TypeScript 3.9.5
- **Database**: SQLite 5.0.11

### API & Security
- **CORS**: 2.8.5
- **JWT**: jsonwebtoken 8.5.1
- **Password Hashing**: bcryptjs 2.4.3
- **Body Parsing**: body-parser 1.19.0
- **Environment Management**: dotenv 8.2.0

## Testing

### Vitest
We use **Vitest** for all unit and integration test validation. Vitest is a blazing fast unit test framework powered by Vite, offering:
- Fast test execution
- ES modules and CommonJS support
- TypeScript support out of the box
- Familiar Jest-like API
- Watch mode for development

Run tests with:
```bash
npm run test
```

## Development

### Type Checking
TypeScript provides static type safety throughout the codebase.

### Scripts
- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run seed` - Run database seed script
- `npm run test` - Run Vitest test suite
