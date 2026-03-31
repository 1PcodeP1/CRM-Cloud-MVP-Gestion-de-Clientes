# AGENTS.md — Guía para agentes de IA

Este archivo describe el proyecto, su estructura, cómo ejecutar pruebas y convenciones importantes para que cualquier agente de IA pueda contribuir de manera efectiva y segura.

---

## Descripción del proyecto

**CRM Cloud MVP** es un sistema de gestión de relaciones con clientes construido con:

| Capa | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router DOM, React Hook Form, Zod, Axios, Lucide React |
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL, Passport.js, JWT, bcryptjs, class-validator |
| Infraestructura | Docker, Docker Compose |
| Testing | Jest + Supertest (backend) · Vitest + Testing Library (frontend) |

---

## Estructura del repositorio

```
CRM-Cloud-MVP-Gestion-de-Clientes/
├── backend/                        # API NestJS
│   ├── src/
│   │   ├── auth/                   # Módulo autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.spec.ts   # 9 tests integración HTTP
│   │   │   ├── auth.service.spec.ts      # 13 tests unitarios
│   │   │   ├── dto/                # LoginDto, RegisterDto (class-validator)
│   │   │   ├── guards/             # JwtAuthGuard
│   │   │   └── strategies/        # JwtStrategy (Passport)
│   │   ├── users/
│   │   │   ├── users.service.ts
│   │   │   └── entities/user.entity.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── jest.config.js
│   └── package.json
├── frontend/                       # App React + Vite
│   ├── src/
│   │   ├── __tests__/              # Pruebas unitarias Vitest
│   │   │   ├── LoginForm.test.tsx         # 9 tests
│   │   │   ├── RegisterForm.test.tsx      # 14 tests
│   │   │   └── ProtectedRoute.test.tsx    # 8 tests
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── layout/
│   │   │   │   └── DashboardLayout.tsx    # Sidebar con botón logout
│   │   │   ├── router/
│   │   │   │   ├── ProtectedRoute.tsx     # Guard: requiere sesión válida
│   │   │   │   └── PublicRoute.tsx        # Guard: redirige si ya autenticado
│   │   │   └── ui/
│   │   │       ├── InputField.tsx         # Input reutilizable (id="field-{name}")
│   │   │       └── Banner.tsx             # Mensajes de éxito/error/info
│   │   ├── hooks/
│   │   │   └── useAuth.ts                 # user, token, setAuth, logout, checkSessionExpiration
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── router/
│   │   │   └── index.tsx                  # Rutas: / /login /register /dashboard
│   │   ├── schemas/
│   │   │   ├── loginSchema.ts             # Zod: email + password
│   │   │   └── registerSchema.ts          # Zod: campos de registro + superRefine
│   │   ├── services/
│   │   │   ├── authService.ts             # Axios: POST /auth/login, /auth/register
│   │   │   └── storageService.ts          # localStorage: crm_token, crm_user, crm_timestamp
│   │   ├── setupTests.ts                  # import '@testing-library/jest-dom'
│   │   └── types/
│   ├── vite.config.ts                     # test: { globals, jsdom, setupFiles }
│   └── package.json
├── docker-compose.yml
├── .env                            # NO rastrear (ver .env.example)
├── .env.example
├── .gitignore
├── README.md
├── AGENTS.md                       # Este archivo
└── docs/
    └── SPRINT2-IMPLEMENTACION.md
```

---

## Levantar el entorno

### Requisitos

- Docker Desktop v20+
- Node.js v18+

### Arrancar todo con Docker

```bash
cd CRM-Cloud-MVP-Gestion-de-Clientes
cp .env.example .env   # solo la primera vez
docker compose up -d
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

### Variables de entorno (`.env`)

```env
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=crm_cloud
JWT_SECRET=<secreto>
JWT_EXPIRES_IN=24h
```

---

## Ejecutar las pruebas

### Backend (Jest)

```bash
cd CRM-Cloud-MVP-Gestion-de-Clientes/backend
npm install          # solo la primera vez
npm test
```

Resultado esperado: **22/22 PASS**

### Frontend (Vitest)

```bash
cd CRM-Cloud-MVP-Gestion-de-Clientes/frontend
npm install          # solo la primera vez
npx vitest run
```

Resultado esperado: **30/30 PASS**

> **Regla crítica:** No modificar los archivos de prueba (`*.spec.ts`, `*.test.tsx`). Representan los criterios de aceptación del proyecto. Si una prueba falla, corregir el código de producción, no el test.

---

## Convenciones importantes

### Autenticación

- El JWT se almacena en `localStorage` con las claves: `crm_token`, `crm_user`, `crm_timestamp`.
- La expiración de sesión es de **24 horas** verificada en el frontend por `storageService.ts` y en el backend por la configuración JWT.
- `ProtectedRoute` llama a `checkSessionExpiration()` en cada render vía `useEffect`. Todo mock de `useAuth` en tests **debe incluir** `checkSessionExpiration: vi.fn()`.

### Componente `InputField`

- El `<input>` lleva `id="field-{name}"` y el `<label>` lleva `htmlFor="field-{name}"`.
- Esto es requerido para que `getByLabelText()` funcione en los tests. No eliminar ni cambiar este patrón.

### Validación de formularios

- Se usan esquemas Zod ubicados en `src/schemas/`.
- `RegisterForm` usa un `registerResolver` personalizado (no `zodResolver` directo) para garantizar que el error de contraseñas no coincidentes se muestre correctamente cuando otros campos también tienen errores.

### Rutas

| Ruta | Tipo | Componente guard |
|---|---|---|
| `/` | Pública | — |
| `/login` | Pública | `PublicRoute` (redirige si hay sesión) |
| `/register` | Pública | `PublicRoute` (redirige si hay sesión) |
| `/dashboard` | Privada | `ProtectedRoute` |
| `/clients` | Privada | `ProtectedRoute` (próximo sprint) |

### Mensajes de usuario (exactos — no cambiar)

| Situación | Mensaje |
|---|---|
| Email con formato inválido | "Ingresa una dirección de correo válida" |
| Credenciales incorrectas | "El correo o la contraseña son incorrectos" |
| Acceso sin sesión | "Debes iniciar sesión para acceder a esta sección" |
| Sesión expirada | "Tu sesión ha expirado. Por favor ingresa de nuevo" |
| Logout exitoso | "Has cerrado sesión correctamente" |
| Olvidé contraseña | "Esta función estará disponible próximamente" |

---

## Historial de sprints

| Sprint | Épica | Historias | Estado |
|---|---|---|---|
| Sprint 1 | EP-01 | HU-01 (Registro empresa), HU-02 (Confirmación visual) | Completado |
| Sprint 2 | EP-02 | HU-03 (Login), HU-04 (Rutas protegidas), HU-05 (Logout) | Completado |
| Sprint 3 | EP-03 | HU-06–HU-08 (CRUD clientes) | Completado |
| Sprint 4 | EP-03 | HU-09–HU-10 (Búsqueda y filtros) | Completado |
| Sprint 5 | EP-04 | HU-11–HU-13 (Dashboard métricas) | Pendiente |
| Sprint 6 | EP-05 | HU-14–HU-16 (Seguridad/encriptación) | Pendiente |

---

## Comandos útiles de base de datos

```bash
# Acceder a PostgreSQL
docker exec -it crm_postgres psql -U postgres -d crm_cloud

# Listar usuarios registrados
SELECT id, first_name, last_name, email, company FROM users;

# Usuario de prueba para Sprint 2
-- email: test@sprint2.com  |  password: Test1234
```

---

## Archivos ignorados por git

Los siguientes archivos están en `.gitignore` y **no deben commitearse**:

- `.env` (variables de entorno con secretos)
- `node_modules/`
- `dist/`, `build/`
- `SPRINT*-REPORT.md` (reportes locales de sprint)
- `coverage/`
