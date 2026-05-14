# CRM Cloud MVP — Gestión de Clientes

Sistema de gestión de relaciones con clientes (CRM) desarrollado como proyecto universitario en UPB (Semestre 7, TIC2). Permite a empresas registrar, organizar y visualizar su base de clientes desde la nube, con métricas en tiempo real, gráficas de crecimiento y control de acceso por usuario.

**Producción:** Frontend en Vercel · Backend en Render · Base de datos en Supabase

---

## Tecnologías

| Capa | Stack |
| --- | --- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router DOM, React Hook Form, Zod, Axios, Lucide React |
| **Backend** | NestJS, TypeScript, TypeORM, Passport.js, JWT, bcryptjs, class-validator, nestjs/throttler |
| **Base de datos** | PostgreSQL 15 (local/Docker · Supabase en producción) |
| **Infraestructura** | Docker, Docker Compose, Vercel, Render |
| **Testing** | Jest + Supertest (backend) · Vitest + Testing Library (frontend) |

---

## URLs de producción

| Servicio | URL |
| --- | --- |
| Frontend | Vercel (CI/CD automático desde `main`) |
| Backend API | `https://crm-cloud-mvp-gestion-de-clientes.onrender.com` |
| Base de datos | Supabase · `aws-1-us-east-2.pooler.supabase.com:6543` |

---

## Desarrollo local

### Con Docker (recomendado)

```bash
cp .env.example .env   # solo la primera vez
docker compose up --build -d
```

| Servicio | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

Después de cambios en el código: `docker compose up --build -d`  
Para reiniciar solo el backend: `docker restart crm_backend`

### Sin Docker

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend (otra terminal)
cd frontend && npm install && npm run dev
```

---

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores para tu entorno local. El archivo `.env.example` incluye todas las variables necesarias con valores seguros para desarrollo.

> `.env` está en `.gitignore` y nunca debe subirse al repositorio.

---

## Comandos Docker

| Comando | Descripción |
| --- | --- |
| `docker compose up --build -d` | Construir y levantar todos los servicios |
| `docker compose up -d` | Levantar sin reconstruir |
| `docker compose down` | Detener y eliminar contenedores |
| `docker compose down -v` | Detener, eliminar contenedores **y volúmenes** (borra la BD) |
| `docker compose logs -f backend` | Ver logs del backend en tiempo real |
| `docker compose restart backend` | Reiniciar el backend |

---

## Testing

### Backend — 26/26 tests

```bash
cd backend
npm test              # todos los tests
npm run test:watch    # modo watch
npm run test:cov      # con cobertura
```

### Frontend — 34/36 tests

```bash
cd frontend
npx vitest run                                        # todos los tests
npx vitest run src/__tests__/LoginForm.test.tsx       # archivo específico
```

> Los 2 tests de `DashboardPage.test.tsx` (CRITERIO 56/57/59 y 60) tienen un fallo pre-existente: el mock del test solo cubre `clientService.getClients` pero el componente también llama a `getMonthlyStats()` y `getAttentionClients()` (añadidos en Sprint 6). Las llamadas sin mock hacen que el `Promise.all` falle y el componente muestre el estado de error en lugar de los KPIs.

### Archivos de prueba

```
backend/src/
├── auth/
│   ├── auth.service.spec.ts          # Unitarios del servicio de autenticación
│   └── auth.controller.spec.ts       # Integración HTTP de auth
└── clients/
    ├── clients.service.spec.ts       # Unitarios del servicio de clientes
    └── clients.controller.spec.ts    # Integración HTTP de clientes

frontend/src/__tests__/
├── RegisterForm.test.tsx             # Formulario de registro
├── LoginForm.test.tsx                # Formulario de login
├── ProtectedRoute.test.tsx           # Guards de navegación
├── ClientsPage.test.tsx              # Listado y filtros de clientes
├── ClientDetailPage.test.tsx         # Detalle y edición de cliente
└── DashboardPage.test.tsx            # KPIs del dashboard (2 fallos conocidos)
```

---

## Estructura del proyecto

```
CRM-Cloud-MVP-Gestion-de-Clientes/
├── backend/
│   ├── src/
│   │   ├── auth/              # Registro, login, JWT strategy, guards
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── strategies/
│   │   ├── users/             # Entidad User, UsersService
│   │   ├── clients/           # CRUD de clientes, stats, atención
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   ├── app.module.ts      # Módulo raíz (TypeORM, ThrottlerGuard)
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # LoginForm, RegisterForm
│   │   │   ├── layout/        # DashboardLayout, Sidebar
│   │   │   ├── router/        # ProtectedRoute, PublicRoute
│   │   │   └── ui/            # InputField, Banners, Modal
│   │   ├── hooks/             # useAuth (estado global de sesión)
│   │   ├── pages/             # LandingPage, LoginPage, RegisterPage,
│   │   │                      # DashboardPage, ClientsPage,
│   │   │                      # ClientDetailPage, EditClientPage
│   │   ├── schemas/           # Validaciones Zod
│   │   ├── services/          # authService, clientService (Axios)
│   │   ├── storage/           # storageService (localStorage)
│   │   ├── router/            # Configuración de rutas
│   │   ├── types/             # Interfaces TypeScript
│   │   └── __tests__/
│   ├── vercel.json            # Rewrites para React Router en Vercel
│   └── package.json
├── docs/
│   ├── INFORME-DESPLIEGUE.md  # Retos y soluciones del despliegue a producción
│   ├── BUGS_Y_REGRESIONES.md  # Historial completo de bugs (37 documentados)
│   └── CASOS_DE_PRUEBA.md     # Casos de prueba desde la perspectiva del usuario
├── docker-compose.yml
├── .env.example               # Plantilla de variables de entorno
└── README.md
```

---

## Autenticación y seguridad

- **Registro** con validación Zod: nombre, apellido, empresa, industria, email, contraseña
- **Login** con JWT (expiración 24h) almacenado en `localStorage`
- **Contraseñas** encriptadas con bcrypt (10 rounds)
- **Emails** normalizados a minúsculas
- **Sesión verificada en background** cada 60s mientras el usuario navega
- **Rutas protegidas** con `ProtectedRoute` — redirige a `/login` si no hay sesión válida
- **Rate limiting** en endpoints de auth: 5 req/min por IP
- **Aislamiento por usuario**: cada usuario solo ve y gestiona sus propios clientes
- **Validación de `JWT_SECRET`** al arrancar: `process.exit(1)` si no está definido en producción

### Acceso a la BD (local)

```bash
docker exec -it crm_postgres psql -U postgres -d crm_cloud
```

---

## Funcionalidades

| Sprint | Historias | Funcionalidad |
| --- | --- | --- |
| 1 | HU-01, HU-02 | Registro de empresa, confirmación visual |
| 2 | HU-03–05 | Login, rutas protegidas, logout |
| 3 | HU-06–07 | Registro y listado de clientes |
| 4 | HU-08–09 | Detalle, edición y búsqueda/filtros |
| 5 | HU-10–11 | Eliminación de clientes, dashboard KPIs |
| 6 | HU-12–16 | Gráfica de crecimiento, clientes que requieren atención, auditoría de seguridad |
