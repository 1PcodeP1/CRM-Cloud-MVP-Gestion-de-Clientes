# CRM Cloud MVP

Sistema de gestión de relaciones con clientes (CRM) desarrollado con **React + Vite** en el frontend y **NestJS** en el backend, utilizando **PostgreSQL** como base de datos y orquestado con **Docker Compose**.

---

## 🚀 Tecnologías

| Capa                | Stack                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| **Frontend**        | React 18, TypeScript, Vite, Tailwind CSS, React Router DOM, React Hook Form, Zod, Axios, Lucide React |
| **Backend**         | NestJS, TypeScript, TypeORM, PostgreSQL, Passport.js, JWT, bcryptjs, class-validator                  |
| **Infraestructura** | Docker, Docker Compose                                                                                |
| **Testing**         | Jest, Supertest (backend) · Vitest, Testing Library, MSW (frontend)                                   |

---

## 🛠️ Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v20+)
- [Node.js](https://nodejs.org/) (v18+)

---

## 🏃‍♂️ Inicio Rápido

1. Clona el repositorio y entra a la carpeta del proyecto.

2. Copia el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

3. Levanta toda la aplicación con un solo comando:

   ```bash
   docker compose up --build -d
   ```

4. Accede a los servicios:

   | Servicio       | URL                                            |
   | -------------- | ---------------------------------------------- |
   | 🌐 Frontend    | [http://localhost:5173](http://localhost:5173) |
   | ⚙️ Backend API | [http://localhost:3000](http://localhost:3000) |
   | 🗄️ PostgreSQL  | `localhost:5432` (usuario: `postgres`)         |

---

## 🐳 Comandos Docker

| Comando                          | Descripción                                                  |
| -------------------------------- | ------------------------------------------------------------ |
| `docker compose up --build -d`   | Construir imágenes y levantar todos los servicios            |
| `docker compose up -d`           | Levantar servicios (sin reconstruir imágenes)                |
| `docker compose down`            | Detener y eliminar contenedores                              |
| `docker compose down -v`         | Detener, eliminar contenedores **y volúmenes** (borra la BD) |
| `docker compose logs -f`         | Ver logs de todos los servicios en tiempo real               |
| `docker compose logs -f backend` | Ver logs solo del backend                                    |
| `docker compose restart backend` | Reiniciar solo el backend                                    |

> **💡 Tip:** Después de hacer cambios en el código, ejecuta `docker compose up --build -d` para reconstruir y aplicar los cambios.

---

## 🧪 Testing

### Backend (Jest)

```bash
cd backend
npm install        # solo la primera vez
npx jest --verbose
```

### Frontend (Vitest)

```bash
cd frontend
npm install        # solo la primera vez
npx vitest run
```

### Archivos de prueba

```text
backend/src/auth/
├── auth.service.spec.ts       # Pruebas unitarias del servicio de auth
└── auth.controller.spec.ts    # Pruebas de integración HTTP

frontend/src/__tests__/
├── RegisterForm.test.tsx      # Pruebas del formulario de registro
├── LoginForm.test.tsx         # Pruebas del formulario de login
└── ProtectedRoute.test.tsx    # Pruebas de guards de navegación
```

---

## 🗄️ Estructura del Proyecto

```text
Tic2/
├── backend/                   # API NestJS
│   ├── src/
│   │   ├── auth/              # Módulo de autenticación (JWT, guards)
│   │   │   ├── dto/           # Data Transfer Objects (validaciones)
│   │   │   ├── guards/        # JWT Auth Guard
│   │   │   ├── strategies/    # Passport JWT Strategy
│   │   │   └── decorators/    # Custom decorators
│   │   ├── users/             # Módulo de usuarios (entidad, servicio)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/                  # App React + Vite
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── auth/          # LoginForm, RegisterForm
│   │   │   ├── router/        # ProtectedRoute, PublicRoute
│   │   │   └── ui/            # InputField, Banners
│   │   ├── hooks/             # useAuth
│   │   ├── pages/             # LandingPage, LoginPage, RegisterPage
│   │   ├── schemas/           # Validaciones Zod
│   │   ├── services/          # authService (Axios)
│   │   ├── router/            # Configuración de rutas
│   │   ├── types/             # Interfaces TypeScript
│   │   └── __tests__/         # Pruebas unitarias frontend
│   └── package.json
├── docker-compose.yml         # Orquestador Docker
├── .env                       # Variables de entorno
├── AGENTS.md                  # Guía para agentes de IA
└── README.md
```

---

## 🔒 Autenticación

Se implementó un flujo completo de autenticación con las siguientes características:

- **Registro** con validación de campos (nombre, email, teléfono, contraseña)
- **Login** con JWT almacenado en `localStorage` (`crm_token`, `crm_user`, `crm_timestamp`)
- **Contraseñas** encriptadas con bcrypt (salt rounds: 10)
- **Emails** normalizados a minúsculas automáticamente
- **Sesión** con expiración de 24 horas
- **Rutas protegidas** que redirigen a `/login` si no hay sesión

### Acceso a la base de datos

```bash
docker exec -it crm_postgres psql -U postgres -d crm_cloud
```

Consultas útiles:

```sql
SELECT id, first_name, last_name, email, company FROM users;
```

---

## 👥 Autores

Proyecto desarrollado como parte del módulo CRM Cloud — Sprint 2.
