# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CRM Cloud MVP** — A customer relationship management system built as a university project (UPB, Semester 7). The active code lives inside `CRM-Cloud-MVP-Gestion-de-Clientes/`.

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router DOM, React Hook Form, Zod, Axios, Lucide React |
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL, Passport.js, JWT, bcryptjs, class-validator |
| Infrastructure | Docker, Docker Compose |
| Testing | Jest + Supertest (backend) · Vitest + Testing Library (frontend) |

## Development Environment

### Start with Docker (recommended)

```bash
cd CRM-Cloud-MVP-Gestion-de-Clientes
cp .env.example .env   # first time only
docker compose up -d
```

Services: Frontend → http://localhost:5173 | Backend → http://localhost:3000 | PostgreSQL → localhost:5432

### Local development (without Docker)

```bash
# Backend
cd CRM-Cloud-MVP-Gestion-de-Clientes/backend
npm install
npm run start:dev      # watch mode

# Frontend
cd CRM-Cloud-MVP-Gestion-de-Clientes/frontend
npm install
npm run dev
```

## Commands

### Backend (from `CRM-Cloud-MVP-Gestion-de-Clientes/backend/`)

```bash
npm test                      # run all tests (expect 22/22 PASS)
npm run test:watch            # watch mode
npm run test:cov              # with coverage
npm run build                 # compile to dist/
npm run lint                  # ESLint --fix
```

### Frontend (from `CRM-Cloud-MVP-Gestion-de-Clientes/frontend/`)

```bash
npx vitest run                # run all tests (expect 30/30 PASS)
npx vitest run src/__tests__/LoginForm.test.tsx   # single test file
npm run build                 # tsc + vite build
npm run lint                  # ESLint
```

### Database

```bash
docker exec -it crm_postgres psql -U postgres -d crm_cloud
```

## Architecture

### Backend — NestJS Modules

- **AppModule** (`app.module.ts`): Root module. Wires ConfigModule (env vars) and TypeORM (PostgreSQL, auto-sync in non-prod).
- **AuthModule** (`auth/`): Handles `POST /auth/register` and `POST /auth/login`. Uses Passport JWT strategy. JWT expires in 24h.
- **UsersModule** (`users/`): `UsersService` with `findByEmail` / `create`. `User` entity has UUID PK, stores firstName, lastName, email (unique), phone, company, industry, password (bcrypt, 10 rounds).

Auth flow: register → hash password → save user → return JWT. Login → find user by email → compare hash → return JWT.

### Frontend — React SPA

**State management**: `useAuth` hook (`hooks/useAuth.ts`) uses a listeners pattern (no Redux/Context Provider) — global state shared via module-level variable + subscriber list.

**Session persistence**: `storageService.ts` manages localStorage keys `crm_token`, `crm_user`, `crm_timestamp`. Session validity is 24h, checked client-side on every `ProtectedRoute` render.

**Routing**:
| Route | Guard | Notes |
|---|---|---|
| `/` | — | Public landing |
| `/login`, `/register` | `PublicRoute` | Redirects to `/dashboard` if already authenticated |
| `/dashboard`, `/clients` | `ProtectedRoute` | Redirects to `/login` if no valid session |

**Form validation**: Zod schemas in `src/schemas/`. `RegisterForm` uses a custom `registerResolver` (not `zodResolver` directly) to ensure the password-mismatch error displays correctly even when other fields have errors.

## Critical Conventions

### Do not modify test files
`*.spec.ts` and `*.test.tsx` files are acceptance criteria. Fix production code, not tests.

### InputField component
`<input id="field-{name}">` + `<label htmlFor="field-{name}">` — required for `getByLabelText()` in tests. Do not change this pattern.

### Mocking `useAuth` in frontend tests
Every mock of `useAuth` **must include** `checkSessionExpiration: vi.fn()` because `ProtectedRoute` calls it on every render.

### Exact user-facing messages (do not change)
| Situation | Message |
|---|---|
| Invalid email format | "Ingresa una dirección de correo válida" |
| Wrong credentials | "El correo o la contraseña son incorrectos" |
| Access without session | "Debes iniciar sesión para acceder a esta sección" |
| Expired session | "Tu sesión ha expirado. Por favor ingresa de nuevo" |
| Successful logout | "Has cerrado sesión correctamente" |

### TypeScript strictness
- Backend: `strictNullChecks: false`, `noImplicitAny: false` — lenient config.
- Frontend: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` — strict config. Path alias `@/*` → `./src/*`.

## Sprint Roadmap

| Sprint | Epic | Stories | Status |
|---|---|---|---|
| 1 | EP-01 | HU-01 (Company registration), HU-02 (Visual confirmation) | Done |
| 2 | EP-02 | HU-03 (Login), HU-04 (Protected routes), HU-05 (Logout) | Done |
| 3 | EP-03 | HU-06–HU-08 (Client CRUD) | Pending |
| 4 | EP-03 | HU-09–HU-10 (Search & filters) | Pending |
| 5 | EP-04 | HU-11–HU-13 (Metrics dashboard) | Pending |
| 6 | EP-05 | HU-14–HU-16 (Security/encryption) | Pending |

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

```
DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME
JWT_SECRET   # change in production
JWT_EXPIRES_IN=24h
VITE_API_URL=http://localhost:3000
```
