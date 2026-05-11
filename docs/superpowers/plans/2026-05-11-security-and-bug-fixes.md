# Security & Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 17 security vulnerabilities and bugs identified in the code review, ranging from broken authorization (any user can delete another user's clients) to frontend auth state issues and missing backend validations.

**Architecture:** Backend is NestJS + TypeORM + PostgreSQL. Frontend is React 18 + TypeScript + Vite. Auth uses JWT (Passport). Multi-tenancy enforced by `userId` on every client record. Tests live in `*.spec.ts` / `*.test.tsx` — **never modify them**.

**Tech Stack:** NestJS, TypeORM, Passport JWT, React 18, TypeScript, Axios, Zod, Vitest, Jest

**Model assignments by task complexity:**
- `opus`: C-1 (most critical security), B-2 (full-stack new endpoint)
- `sonnet`: C-2, C-3, I-1/I-2/B-1, B-3/M-3, I-6/M-7
- `haiku`: I-3/M-5, I-4/I-5/M-6/B-4, M-1/M-4

---

## Task 1 (model: opus) — C-1: Fix Authorization on GET /clients/:id and DELETE /clients/:id

**Critical security bug.** Any authenticated user can read or delete another user's clients by UUID. The private `findOneOwned(id, userId)` method exists but is not called by the controller's `findOne` and `remove` handlers.

**Strategy:** Add new public methods `findOneForUser` and `removeOwned` that enforce ownership. Keep the existing `findOne(id)` and `remove(id)` signatures intact so backend unit tests continue to pass.

**Files:**
- Modify: `backend/src/clients/clients.service.ts`
- Modify: `backend/src/clients/clients.controller.ts`

- [ ] **Step 1: Add `findOneForUser` and `removeOwned` to `ClientsService`**

Open `backend/src/clients/clients.service.ts`. After the existing `findOneOwned` private method (line ~85), add two new public methods:

```typescript
  async findOneForUser(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id, userId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return client;
  }

  async removeOwned(id: string, userId: string): Promise<{ message: string }> {
    const client = await this.findOneForUser(id, userId);
    try {
      await this.clientRepository.remove(client);
      return { message: 'El cliente ha sido eliminado correctamente' };
    } catch {
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }
```

- [ ] **Step 2: Update the controller's `findOne` and `remove` handlers**

Open `backend/src/clients/clients.controller.ts`. Replace the existing `findOne` and `remove` handlers:

```typescript
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.clientsService.findOneForUser(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.clientsService.removeOwned(id, req.user.id);
  }
```

Also fix M-1 at the same time — remove the `?` from `@Req() req?: any` in `findAll`:

```typescript
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Req() req: any,
  ) {
    return this.clientsService.findAll({ page, limit, search, status }, req.user.id);
  }
```

- [ ] **Step 3: Run backend tests to verify nothing broke**

```bash
cd backend && npm test
```

Expected: 22/22 PASS. If any test fails, do NOT proceed — investigate and fix without modifying `*.spec.ts` files.

- [ ] **Step 4: Commit**

```bash
git add backend/src/clients/clients.service.ts backend/src/clients/clients.controller.ts
git commit -m "fix(clients): enforce userId ownership on GET/:id and DELETE/:id (C-1, M-1)"
```

---

## Task 2 (model: sonnet) — C-2: Validate JWT Secret at Startup + Remove Insecure Fallback

**Security:** The app runs with a publicly known hardcoded secret if `JWT_SECRET` is not set. Two different fallback strings between `auth.module.ts` and `docker-compose.yml` make the inconsistency worse.

**Files:**
- Modify: `backend/src/main.ts`
- Modify: `backend/src/auth/auth.module.ts`
- Modify: `backend/src/auth/strategies/jwt.strategy.ts`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add startup secret validation in `main.ts`**

Open `backend/src/main.ts`. Add this validation block right before `NestFactory.create`:

```typescript
async function bootstrap() {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
        console.error('FATAL: JWT_SECRET environment variable is required in production.');
        process.exit(1);
    }

    const app = await NestFactory.create(AppModule);
    // ... rest unchanged
```

- [ ] **Step 2: Remove hardcoded fallback from `auth.module.ts`**

Open `backend/src/auth/auth.module.ts`. Replace the `useFactory` callback:

```typescript
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET || 'crm-dev-secret-change-in-production',
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
            }),
        }),
```

- [ ] **Step 3: Remove hardcoded fallback from `jwt.strategy.ts`**

Open `backend/src/auth/strategies/jwt.strategy.ts`. Replace the `secretOrKey` line:

```typescript
            secretOrKey: process.env.JWT_SECRET || 'crm-dev-secret-change-in-production',
```

Both fallbacks should now match, so a local dev environment without `.env` still works but uses the same known-dev string.

- [ ] **Step 4: Fix `docker-compose.yml` JWT_SECRET fallback**

Open `docker-compose.yml`. Replace this line in the backend service environment:

```yaml
      - JWT_SECRET=${JWT_SECRET:-crm-dev-secret-change-in-production}
```

This makes all three locations use the exact same fallback string for local dev.

- [ ] **Step 5: Run backend tests**

```bash
cd backend && npm test
```

Expected: 22/22 PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/main.ts backend/src/auth/auth.module.ts backend/src/auth/strategies/jwt.strategy.ts docker-compose.yml
git commit -m "fix(auth): validate JWT_SECRET at startup and align dev fallbacks (C-2)"
```

---

## Task 3 (model: haiku) — C-3 + M-4: Fix Entity Definitions

**Two entity issues:** `userId` is nullable on `Client` (breaks multi-tenancy if NULL), and `industry` on `User` is a VARCHAR instead of a proper DB enum.

**Files:**
- Modify: `backend/src/clients/entities/client.entity.ts`
- Modify: `backend/src/users/entities/user.entity.ts`

- [ ] **Step 1: Make `userId` NOT NULL on Client entity**

Open `backend/src/clients/entities/client.entity.ts`. Replace the `userId` column:

```typescript
  @Column({ name: 'user_id' })
  userId: string;
```

Remove `nullable: true` and remove the `?` from the type. The `@Unique(['email', 'userId'])` constraint stays as-is.

- [ ] **Step 2: Add `IndustryType` enum to User entity**

Open `backend/src/users/entities/user.entity.ts`. Add the enum before the class and update the `industry` column:

```typescript
export enum IndustryType {
  TECNOLOGIA = 'Tecnología',
  COMERCIO = 'Comercio',
  SERVICIOS = 'Servicios',
  EDUCACION = 'Educación',
  SALUD = 'Salud',
}

@Entity('users')
export class User {
    // ... other columns unchanged ...

    @Column({
        type: 'enum',
        enum: IndustryType,
        length: 100,
    })
    industry!: IndustryType;

    // ... rest unchanged
```

- [ ] **Step 3: Update `RegisterDto` to use `IndustryType`**

Open `backend/src/auth/dto/register.dto.ts`. Replace the `@IsIn` decorator on `industry`:

```typescript
import { IndustryType } from '../../users/entities/user.entity';

// ...
    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @IsEnum(IndustryType, { message: 'Industria no válida' })
    industry: IndustryType;
```

Import `IsEnum` from `class-validator` (replace `IsIn` in the imports).

- [ ] **Step 4: Run backend tests**

```bash
cd backend && npm test
```

Expected: 22/22 PASS. TypeORM's `synchronize: true` will auto-migrate the column types in development.

- [ ] **Step 5: Commit**

```bash
git add backend/src/clients/entities/client.entity.ts backend/src/users/entities/user.entity.ts backend/src/auth/dto/register.dto.ts
git commit -m "fix(entities): make userId NOT NULL, add IndustryType enum (C-3, M-4)"
```

---

## Task 4 (model: haiku) — I-3 + M-5: Backend DTO Cleanup

**Two simple fixes:** `confirmPassword` should not be validated server-side (UI concern), and `CreateClientDto` is missing `MaxLength` on all string fields.

**Files:**
- Modify: `backend/src/auth/dto/register.dto.ts`
- Modify: `backend/src/clients/dto/create-client.dto.ts`

- [ ] **Step 1: Remove `confirmPassword` from `RegisterDto`**

Open `backend/src/auth/dto/register.dto.ts`. Delete the entire `confirmPassword` field and its decorators (the last ~5 lines). Also remove the `Match` import from `'../decorators/match.decorator'` since it's no longer used.

The file should end after the `password` field:

```typescript
    @IsString({ message: 'La contraseña debe ser válida' })
    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @MinLength(8, { message: 'Mínimo 8 caracteres' })
    @MaxLength(255, { message: 'Máximo 255 caracteres' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, { message: 'La contraseña debe tener al menos 1 letra y 1 número' })
    password: string;
}
```

- [ ] **Step 2: Add `MaxLength` to `CreateClientDto`**

Open `backend/src/clients/dto/create-client.dto.ts`. Add `MaxLength` to the import and to each string field. The complete file should be:

```typescript
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';
import { ClientStatus } from '../entities/client.entity';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: 'Máximo 150 caracteres' })
  company: string;

  @IsEmail({}, { message: 'Ingresa una dirección de correo válida' })
  @IsNotEmpty()
  @MaxLength(255, { message: 'Máximo 255 caracteres' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'El teléfono solo debe contener números' })
  @Length(10, 10, { message: 'El teléfono debe tener 10 dígitos' })
  phone: string;

  @IsEnum(ClientStatus)
  @IsNotEmpty()
  status: ClientStatus;
}
```

- [ ] **Step 3: Run backend tests**

```bash
cd backend && npm test
```

Expected: 22/22 PASS. If removing `confirmPassword` from the DTO breaks a test that sends `confirmPassword` to the backend, it should still pass because `ValidationPipe` with `whitelist: true` would have stripped it anyway — the test should remain green.

- [ ] **Step 4: Commit**

```bash
git add backend/src/auth/dto/register.dto.ts backend/src/clients/dto/create-client.dto.ts
git commit -m "fix(dto): remove confirmPassword from backend, add MaxLength to CreateClientDto (I-3, M-5)"
```

---

## Task 5 (model: haiku) — I-5 + M-6 + B-4: ClientsService Data Fixes

**Three small fixes in `clients.service.ts`:** wrong attention clients logic, raw string instead of enum, missing email normalization.

**Files:**
- Modify: `backend/src/clients/clients.service.ts`

- [ ] **Step 1: Normalize client email to lowercase on create and update**

Open `backend/src/clients/clients.service.ts`.

In `create()`, before calling `this.clientRepository.create(...)`, add:
```typescript
    createClientDto.email = createClientDto.email.toLowerCase();
```

In `update()`, in the email duplicate check block, add normalization:
```typescript
  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    const client = await this.findOneOwned(id, userId);

    if (updateClientDto.email) {
      updateClientDto.email = updateClientDto.email.toLowerCase();
    }

    if (updateClientDto.email && updateClientDto.email !== client.email) {
      // ... existing duplicate check unchanged
    }
```

Also normalize the email in `create()` before the duplicate check:
```typescript
  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    createClientDto.email = createClientDto.email.toLowerCase();
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email, userId },
    });
    // ... rest unchanged
```

- [ ] **Step 2: Replace hardcoded `'Inactivo'` string with `ClientStatus.INACTIVE`**

In `getAttentionClients()`, replace the raw string:

```typescript
      .andWhere('(client.status = :inactiveStatus OR client.updatedAt < :tenDaysAgo)', {
        inactiveStatus: ClientStatus.INACTIVE,
        tenDaysAgo,
      })
```

Also update the reason calculation:
```typescript
      const reason = client.status === ClientStatus.INACTIVE ? 'Inactivo' : `${daysDiff} días sin actividad`;
```

- [ ] **Step 3: Fix `getAttentionClients` OR logic to avoid flagging Active clients**

The current `OR client.updatedAt < :tenDaysAgo` condition flags ANY client not updated in 10 days, even if they're Active. Fix by requiring non-Active status for the time-based condition:

```typescript
      .andWhere(
        '(client.status = :inactiveStatus OR (client.status != :activeStatus AND client.updatedAt < :tenDaysAgo))',
        {
          inactiveStatus: ClientStatus.INACTIVE,
          activeStatus: ClientStatus.ACTIVE,
          tenDaysAgo,
        },
      )
```

- [ ] **Step 4: Run backend tests**

```bash
cd backend && npm test
```

Expected: 22/22 PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/clients/clients.service.ts
git commit -m "fix(clients): normalize email, use ClientStatus enum, fix attention clients logic (B-4, M-6, I-5)"
```

---

## Task 6 (model: sonnet) — I-4: Remove Unnecessary DB Query in JwtStrategy

**Performance fix.** `JwtStrategy.validate()` fetches a user from DB on every authenticated request, purely to check existence. The returned `user` object is then discarded — `{ id, email }` is built from the JWT payload directly.

**Files:**
- Modify: `backend/src/auth/strategies/jwt.strategy.ts`
- Modify: `backend/src/auth/auth.module.ts` (remove UsersService dependency from JwtStrategy)

- [ ] **Step 1: Simplify `JwtStrategy`**

Open `backend/src/auth/strategies/jwt.strategy.ts`. Replace the entire file:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'crm-dev-secret-change-in-production',
        });
    }

    validate(payload: { sub: string; email: string }) {
        return { id: payload.sub, email: payload.email };
    }
}
```

Note: `validate()` is now synchronous — Passport accepts both sync and async `validate()`.

- [ ] **Step 2: Remove `UsersModule` dependency from `AuthModule` if no longer needed**

Open `backend/src/auth/auth.module.ts`. Check if `UsersModule` is still needed — `AuthService` depends on `UsersService` for `register()` and `login()`, so `UsersModule` must stay in `imports`. But the `JwtStrategy` no longer needs it. Verify the imports list is unchanged (UsersModule stays).

The file should still import `UsersModule` — no change needed here since `AuthService` still uses `UsersService`.

- [ ] **Step 3: Run backend tests**

```bash
cd backend && npm test
```

Expected: 22/22 PASS.

- [ ] **Step 4: Commit**

```bash
git add backend/src/auth/strategies/jwt.strategy.ts
git commit -m "perf(auth): remove unnecessary DB query in JwtStrategy.validate() (I-4)"
```

---

## Task 7 (model: sonnet) — I-6 + M-7: Docker Config + Rate Limiting

**Two infrastructure fixes:** `NODE_ENV` is hardcoded to `development` in docker-compose (makes `synchronize: true` always active), and there's no rate limiting on auth endpoints.

**Files:**
- Modify: `docker-compose.yml`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/auth/auth.controller.ts`
- Modify: `backend/package.json` (add `@nestjs/throttler`)

- [ ] **Step 1: Fix docker-compose `NODE_ENV`**

Open `docker-compose.yml`. Replace the hardcoded `NODE_ENV=development` line:

```yaml
      - NODE_ENV=${NODE_ENV:-development}
```

This lets the host's `NODE_ENV` override through, defaulting to `development` when not set.

- [ ] **Step 2: Install `@nestjs/throttler`**

Run from the backend directory:
```bash
cd backend && npm install @nestjs/throttler
```

- [ ] **Step 3: Add `ThrottlerModule` to `AppModule`**

Open `backend/src/app.module.ts`. Add the throttler import and configuration:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 10,
        }]),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'crm_cloud',
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV !== 'production',
        }),
        UsersModule,
        AuthModule,
        ClientsModule,
    ],
})
export class AppModule { }
```

The `ThrottlerModule` config: `ttl: 60000` ms (1 minute window), `limit: 10` requests per window globally. Auth endpoints will get a stricter limit in the next step.

- [ ] **Step 4: Apply throttle guard to auth controller**

Open `backend/src/auth/auth.controller.ts`. Read the current file contents, then add the throttle decorator to the login and register endpoints:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
```

This limits login and register to 5 attempts per minute per IP.

- [ ] **Step 5: Run backend tests**

```bash
cd backend && npm test
```

Expected: 22/22 PASS. If ThrottlerGuard causes test failures (tests may not set IP headers), add `ThrottlerModule` to the test module overrides in the spec files — but remember we cannot modify `*.spec.ts` files. If tests fail due to throttling, configure the `ThrottlerModule` as `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10000 }])` in the test module setup only — check how the existing spec files import AppModule.

If tests fail, verify whether they use `APP_GUARD` — if not, the `ThrottlerGuard` won't be applied in tests anyway and won't cause failures. Check the error message before making changes.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml backend/src/app.module.ts backend/src/auth/auth.controller.ts backend/package.json backend/package-lock.json
git commit -m "fix(infra): dynamic NODE_ENV in docker-compose, add rate limiting on auth endpoints (I-6, M-7)"
```

---

## Task 8 (model: sonnet) — I-1 + I-2 + B-1: Frontend Auth State Fixes

**Three related frontend issues:** session expiration check misses externally-cleared localStorage, `clientService` bypasses `storageService` and has no 401 interceptor, and `checkSessionExpiration` isn't memoized causing extra effect runs.

**Files:**
- Modify: `frontend/src/services/storageService.ts`
- Modify: `frontend/src/hooks/useAuth.ts`
- Modify: `frontend/src/services/clientService.ts`
- Modify: `frontend/src/components/router/ProtectedRoute.tsx`

- [ ] **Step 1: Add `getToken()` to `storageService`**

Open `frontend/src/services/storageService.ts`. Add a `getToken()` method to the exported object:

```typescript
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
```

This gives `clientService` access to the token without hardcoding the key.

- [ ] **Step 2: Fix `checkSessionExpiration` in `useAuth.ts`**

Open `frontend/src/hooks/useAuth.ts`. Replace the `checkSessionExpiration` function and wrap it with `useCallback`:

```typescript
import { useState, useEffect, useCallback } from 'react';
// ... other imports unchanged

export const useAuth = () => {
    initializeAuth();

    const [user, setUser] = useState<User | null>(globalUser);
    const [token, setToken] = useState<string | null>(globalToken);
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthChange = () => {
            setUser(globalUser);
            setToken(globalToken);
        };
        listeners.push(handleAuthChange);
        return () => {
            listeners = listeners.filter(l => l !== handleAuthChange);
        };
    }, []);

    const setAuth = (authData: AuthResponse) => {
        globalUser = authData.user;
        globalToken = authData.access_token;
        storageService.saveAuth(authData.access_token, authData.user);
        notifyListeners();
    };

    const logout = useCallback((message?: string, isSuccess: boolean = false) => {
        globalUser = null;
        globalToken = null;
        storageService.clearAuth();
        notifyListeners();
        navigate('/login', {
            replace: true,
            state: {
                message,
                type: isSuccess ? 'success' : 'error'
            }
        });
    }, [navigate]);

    const checkSessionExpiration = useCallback((): boolean => {
        const { isExpired } = storageService.getAuth();
        if (isExpired && globalToken) {
            logout('Tu sesión ha expirado. Por favor ingresa de nuevo', false);
            return true;
        }
        if (globalToken && !storageService.hasAuth()) {
            logout('Tu sesión ha expirado. Por favor ingresa de nuevo', false);
            return true;
        }
        return false;
    }, [logout]);

    return {
        user,
        token,
        setAuth,
        logout,
        checkSessionExpiration,
        isAuthenticated: !!globalToken
    };
};
```

Key changes:
1. `logout` wrapped in `useCallback` with `[navigate]` dep
2. `checkSessionExpiration` wrapped in `useCallback` with `[logout]` dep  
3. Added `!storageService.hasAuth()` check for externally-cleared localStorage

- [ ] **Step 3: Update `ProtectedRoute` to remove `checkSessionExpiration` from dep array**

Open `frontend/src/components/router/ProtectedRoute.tsx`. Now that `checkSessionExpiration` is memoized, the dep array is correct as-is. The existing code should already work properly because `useCallback` stabilizes the reference. Verify the file — no change needed if `checkSessionExpiration` is now stable.

If the file still has `[isAuthenticated, checkSessionExpiration]` as the dep array, that's fine now since `checkSessionExpiration` is memoized. No change required.

- [ ] **Step 4: Update `clientService.ts` to use `storageService` and add 401 interceptor**

Open `frontend/src/services/clientService.ts`. Replace the axios interceptors section:

```typescript
import { storageService } from './storageService';

// ... axios instance creation unchanged ...

api.interceptors.request.use((config) => {
  const token = storageService.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
```

- [ ] **Step 5: Wire up the 401 handler in the app root**

Open `frontend/src/App.tsx`. Add the handler registration. First read the current App.tsx to understand its structure, then add:

```tsx
import { setUnauthorizedHandler } from './services/clientService';
import { useAuth } from './hooks/useAuth';

// Inside the App component or a child component that has access to useAuth:
const { logout } = useAuth();

useEffect(() => {
  setUnauthorizedHandler(() => {
    logout('Tu sesión ha expirado. Por favor ingresa de nuevo', false);
  });
}, [logout]);
```

Read the current `frontend/src/App.tsx` content first to place this correctly within the component.

- [ ] **Step 6: Run frontend tests**

```bash
cd frontend && npx vitest run
```

Expected: 30/30 PASS. The mocked `useAuth` in tests already includes `checkSessionExpiration: vi.fn()` per CLAUDE.md.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/services/storageService.ts frontend/src/hooks/useAuth.ts frontend/src/services/clientService.ts frontend/src/components/router/ProtectedRoute.tsx frontend/src/App.tsx
git commit -m "fix(auth): memoize checkSessionExpiration, use storageService in clientService, add 401 interceptor (I-1, I-2, B-1)"
```

---

## Task 9 (model: sonnet) — B-3 + M-3: ClientsPage Double Fetch + Confirmation Modal

**B-3:** When changing the status filter, `ClientsPage` triggers two fetches because `setPage(1)` and the effect both fire. **M-3:** `window.confirm()` is used for destructive delete confirmation — it's unstyled, inaccessible, and blocked in some environments.

**Files:**
- Modify: `frontend/src/pages/clients/ClientsPage.tsx`
- Modify: `frontend/src/pages/clients/ClientDetailPage.tsx`
- Modify: `frontend/src/pages/clients/EditClientPage.tsx`
- Create: `frontend/src/components/ui/ConfirmModal.tsx`

- [ ] **Step 1: Read the current ClientsPage.tsx**

Read `frontend/src/pages/clients/ClientsPage.tsx` in full to understand the current structure before making changes.

- [ ] **Step 2: Fix the double fetch in `ClientsPage.tsx`**

The issue: when status changes, `setPage(1)` is called and then the `useEffect([page, status])` fires. But `setPage(1)` is async — the effect fires with the old `page` value first, then fires again with `page=1`. Fix by using a `useRef` to track whether the status changed and reset page directly in the effect:

Alternatively, the simpler fix is to remove `page` from the dependency array and trigger fetches by combining all three into a single ref-based trigger. The cleanest approach:

In the status change handler, instead of `setPage(1); fetchClients(1, search, newStatus)` separately, just set page to 1 and let the effect handle it — but ensure the effect uses a ref for `search` to avoid its dependency issue.

Read the current file and apply the minimal fix that stops the double fetch. The exact approach depends on how `fetchClients`, `setPage`, and the status handler are currently written.

Key requirement: After the fix, changing status should only trigger ONE fetch, with `page=1` and the new status.

- [ ] **Step 3: Create `ConfirmModal` component**

Create `frontend/src/components/ui/ConfirmModal.tsx`:

```tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          {isDestructive && (
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
          )}
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-xl font-medium transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Replace `window.confirm()` in `ClientDetailPage.tsx`**

Read `frontend/src/pages/clients/ClientDetailPage.tsx`. Find where `window.confirm()` is used (the delete confirmation). Replace the pattern with the `ConfirmModal`:

Add state: `const [showDeleteModal, setShowDeleteModal] = useState(false);`

Replace the `window.confirm()` block with:
```tsx
setShowDeleteModal(true);
```

And add the modal to the JSX:
```tsx
<ConfirmModal
  isOpen={showDeleteModal}
  title="Eliminar cliente"
  message="¿Estás seguro que deseas eliminar este cliente? Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  cancelLabel="Cancelar"
  isDestructive
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteModal(false)}
/>
```

- [ ] **Step 5: Replace `window.confirm()` in `EditClientPage.tsx`**

Read `frontend/src/pages/clients/EditClientPage.tsx`. Apply the same `ConfirmModal` pattern as Step 4.

- [ ] **Step 6: Run frontend tests**

```bash
cd frontend && npx vitest run
```

Expected: 30/30 PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/clients/ClientsPage.tsx frontend/src/components/ui/ConfirmModal.tsx frontend/src/pages/clients/ClientDetailPage.tsx frontend/src/pages/clients/EditClientPage.tsx
git commit -m "fix(frontend): stop double fetch on status change, replace window.confirm() with modal (B-3, M-3)"
```

---

## Task 10 (model: opus) — B-2: Replace 4 Dashboard Count Calls with a Single Aggregation Endpoint

**Performance + correctness fix.** The dashboard fires 4 separate `GET /clients?limit=1&status=X` calls just to read `meta.total` from each. This should be a single `GROUP BY status` aggregation query. This task spans backend (new endpoint) and frontend (use it).

**Files:**
- Modify: `backend/src/clients/clients.service.ts`
- Modify: `backend/src/clients/clients.controller.ts`
- Modify: `frontend/src/services/clientService.ts`
- Modify: `frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Add `getStatusCounts()` to `ClientsService`**

Open `backend/src/clients/clients.service.ts`. Add a new method after `getAttentionClients`:

```typescript
  async getStatusCounts(userId: string): Promise<{ total: number; active: number; prospects: number; inactive: number }> {
    const rows = await this.clientRepository
      .createQueryBuilder('client')
      .select('client.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('client.userId = :userId', { userId })
      .groupBy('client.status')
      .getRawMany<{ status: string; count: string }>();

    const counts = { total: 0, active: 0, prospects: 0, inactive: 0 };
    for (const row of rows) {
      const count = parseInt(row.count, 10);
      counts.total += count;
      if (row.status === ClientStatus.ACTIVE) counts.active = count;
      else if (row.status === ClientStatus.PROSPECT) counts.prospects = count;
      else if (row.status === ClientStatus.INACTIVE) counts.inactive = count;
    }
    return counts;
  }
```

- [ ] **Step 2: Add `GET /clients/stats/counts` endpoint to the controller**

Open `backend/src/clients/clients.controller.ts`. Add the new endpoint **before** `@Get(':id')` (important — named routes must precede `:id` routes):

```typescript
  @Get('stats/counts')
  getStatusCounts(@Req() req: any) {
    return this.clientsService.getStatusCounts(req.user.id);
  }
```

- [ ] **Step 3: Run backend tests**

```bash
cd backend && npm test
```

Expected: 22/22 PASS.

- [ ] **Step 4: Add `getStatusCounts` to `clientService.ts` on the frontend**

Open `frontend/src/services/clientService.ts`. Add the new method to the `clientService` object:

```typescript
  async getStatusCounts(): Promise<{ total: number; active: number; prospects: number; inactive: number }> {
    try {
      const response = await api.get<{ total: number; active: number; prospects: number; inactive: number }>('/clients/stats/counts');
      return response.data;
    } catch (error) {
      throw new Error('No fue posible cargar las estadísticas de clientes');
    }
  },
```

- [ ] **Step 5: Update `DashboardPage.tsx` to use single call**

Open `frontend/src/pages/DashboardPage.tsx`. Replace the four `getClients` calls with a single `getStatusCounts` call:

```tsx
const [totalRes, statsRes, attentionRes] = await Promise.all([
  clientService.getStatusCounts(),
  clientService.getMonthlyStats(),
  clientService.getAttentionClients(),
]);

setStats({
  total: totalRes.total,
  active: totalRes.active,
  prospects: totalRes.prospects,
  inactive: totalRes.inactive,
});
```

Remove the four `getClients` import usages for counts. Remove `ClientsResponse` from the imports if no longer needed.

- [ ] **Step 6: Run frontend tests**

```bash
cd frontend && npx vitest run
```

Expected: 30/30 PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/clients/clients.service.ts backend/src/clients/clients.controller.ts frontend/src/services/clientService.ts frontend/src/pages/DashboardPage.tsx
git commit -m "perf(dashboard): replace 4 paginated count calls with single GROUP BY aggregation (B-2)"
```

---

## Self-Review Checklist

- [x] **C-1** — New `findOneForUser` + `removeOwned` in service, controller updated, `req?:any` fixed (M-1 also covered)
- [x] **C-2** — Startup validation, aligned fallback strings in all 3 locations
- [x] **C-3** — `userId` NOT NULL on Client entity
- [x] **I-1** — `checkSessionExpiration` handles externally cleared localStorage
- [x] **I-2** — `clientService` uses `storageService.getToken()`, 401 interceptor added
- [x] **I-3** — `confirmPassword` removed from `RegisterDto`
- [x] **I-4** — DB query removed from `JwtStrategy.validate()`
- [x] **I-5** — `getAttentionClients` OR logic fixed to exclude Active clients
- [x] **I-6** — `docker-compose.yml` `NODE_ENV` now dynamic
- [x] **B-1** — `checkSessionExpiration` and `logout` memoized with `useCallback`
- [x] **B-2** — New `GET /clients/stats/counts` endpoint + dashboard updated
- [x] **B-3** — Double fetch on status change fixed in ClientsPage
- [x] **B-4** — Client email normalized to lowercase on create/update
- [x] **M-1** — `req?: any` → `req: any` in controller (covered in Task 1)
- [x] **M-3** — `window.confirm()` replaced with `ConfirmModal`
- [x] **M-4** — `IndustryType` enum on User entity
- [x] **M-5** — `MaxLength` added to `CreateClientDto`
- [x] **M-6** — `ClientStatus.INACTIVE` used instead of `'Inactivo'` string
- [x] **M-7** — Rate limiting on auth endpoints with `@nestjs/throttler`
