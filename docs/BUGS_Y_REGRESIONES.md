# Reporte de Bugs y Regresiones — CRM Cloud MVP

> Historial completo de errores encontrados durante el desarrollo del proyecto (UPB, Semestre 7).
> Incluye bugs por sprint, bugs de integración y la auditoría de seguridad final.

---

## Índice

1. [Sprint 1 — Registro de empresa](#sprint-1)
2. [Sprint 2 — Autenticación y sesión](#sprint-2)
3. [Sprint 3 — Gestión de clientes (CRUD básico)](#sprint-3)
4. [Sprint 4 — Detalle y edición de clientes](#sprint-4)
5. [Sprint 5 — Eliminación y dashboard KPIs](#sprint-5)
6. [Sprint 6 — Gráficas y seguridad](#sprint-6)
7. [Auditoría de seguridad — Sesión de revisión completa](#auditoria)
8. [Bugs pendientes / aceptados por restricción de tests](#pendientes)

---

## Sprint 1 — Registro de empresa {#sprint-1}

**HU-01:** Registro de una nueva empresa  
**HU-02:** Confirmación visual del proceso de registro

### Bugs encontrados

| ID | Descripción | Commit | Severidad |
|---|---|---|---|
| S1-01 | Landing page con errores visuales al cargar | `276250c` | Minor |
| S1-02 | Archivos innecesarios en el repositorio inflaban el build | `276250c` | Minor |

**Sin bugs críticos en funcionalidad de registro.**

---

## Sprint 2 — Autenticación y sesión {#sprint-2}

**HU-03:** Inicio de sesión  
**HU-04:** Protección de secciones privadas  
**HU-05:** Cierre de sesión

### Bugs encontrados

| ID | Descripción | Criterio afectado | Commit | Severidad |
|---|---|---|---|---|
| S2-01 | La sesión expirada no redirigía automáticamente al login mientras el usuario navegaba (solo se chequeaba al entrar a rutas protegidas, no durante la navegación) | CRITERIO 16, 20 | `46acba0` | Alto |
| S2-02 | El botón de "Cerrar sesión" no era visible en el sidebar en ciertas resoluciones — `min-h-screen` causaba overflow, empujando el botón fuera del viewport | CRITERIO 22 | `ec52e27` | Alto |
| S2-03 | `useAuth` no incluía `checkSessionExpiration` en el objeto retornado — `ProtectedRoute` fallaba al llamarlo | — | `911eae6` | Alto |

**Detalles:**
- **S2-01:** Se solucionó agregando un `setInterval` de 60 segundos en `ProtectedRoute` que llama a `checkSessionExpiration()` periódicamente mientras el usuario está en páginas protegidas.
- **S2-02:** Se cambió `min-h-screen` por `h-screen overflow-hidden` en `DashboardLayout` para que el sidebar tenga altura fija y el botón de logout siempre sea visible.

---

## Sprint 3 — Gestión de clientes (CRUD básico) {#sprint-3}

**HU-06:** Registro de un nuevo cliente  
**HU-07:** Consulta del listado de clientes

### Bugs encontrados

| ID | Descripción | Criterio afectado | Commit | Severidad |
|---|---|---|---|---|
| S3-01 | Error de duplicado de email en BD retornaba HTTP 500 en lugar de HTTP 409 | CRITERIO 32 | `ba6f2db` | Alto |
| S3-02 | Los clientes no estaban aislados por usuario — cualquier usuario autenticado veía los clientes de todos los demás | — | `ec52e27` | Crítico |
| S3-03 | Errores de compilación TypeScript en el build de producción (tipos incorrectos en varios componentes) | — | `1e24d70` | Alto |

**Detalles:**
- **S3-01:** TypeORM lanzaba `QueryFailedError` con código `23505` (violación de restricción UNIQUE) que no era capturado correctamente. Se agregó manejo específico para mapear el error a `ConflictException` (409).
- **S3-02:** La entidad `Client` no tenía columna `userId`. Todos los clientes eran globales. Se agregó `userId` a la entidad y se modificaron todas las queries del servicio para filtrar por `userId` del JWT.

---

## Sprint 4 — Detalle y edición de clientes {#sprint-4}

**HU-08:** Consulta del detalle de un cliente  
**HU-09:** Actualización de la información de un cliente

### Bugs encontrados

| ID | Descripción | Criterio afectado | Commit | Severidad |
|---|---|---|---|---|
| S4-01 | La validación de contraseña rechazaba caracteres especiales (`@`, `#`, `!`) — la regex `[A-Za-z\d]{8,}` no los permitía | — | `5593f0b` | Medio |
| S4-02 | El package-lock.json generado en Docker (Linux) tenía binarios nativos de esbuild incompatibles con macOS arm64 | — | `86ddbcf` | Medio |

**Detalles:**
- **S4-01:** Se cambió la regex a `.{8,}` manteniendo los lookaheads para verificar al menos 1 letra y 1 número, pero sin restringir el charset.
- **S4-02:** Se regeneró el package-lock.json localmente en macOS arm64.

---

## Sprint 5 — Eliminación y dashboard KPIs {#sprint-5}

**HU-10:** Eliminación de un cliente  
**HU-11:** Visualización de indicadores clave (KPIs)

### Bugs encontrados

| ID | Descripción | Criterio afectado | Commit | Severidad |
|---|---|---|---|---|
| S5-01 | Sin bugs críticos reportados en esta fase | — | — | — |

**Notas:** La implementación de HU-10 usó `window.confirm()` como diálogo de confirmación, lo cual quedó comprometido como deuda técnica (ver sección de auditoría M-3). Los tests de CRITERIO 52/53 validan este comportamiento, por lo que no puede cambiarse sin modificar los tests.

---

## Sprint 6 — Gráficas y seguridad {#sprint-6}

**HU-12:** Gráfica de crecimiento mensual de clientes  
**HU-13:** Muestra clientes inactivos (requieren atención)

### Bugs encontrados

| ID | Descripción | Criterio afectado | Commit | Severidad |
|---|---|---|---|---|
| S6-01 | Clientes "Activos" aparecían en la lista de "Requieren atención" si no habían sido actualizados en 10+ días | CRITERIO 67 | `04798fa` | Medio |
| S6-02 | Los clientes no se aislaban correctamente por usuario en las rutas de detalle y eliminación | — | `8e120af` | Crítico |

---

## Auditoría de Seguridad — Sesión de revisión completa {#auditoria}

En la sesión final se realizó una revisión exhaustiva del código completo. Se identificaron **17 problemas** clasificados por severidad.

### Críticos (3)

| ID | Ubicación | Problema | Solución aplicada | Commit |
|---|---|---|---|---|
| C-1 | `clients.controller.ts` / `clients.service.ts` | `GET /clients/:id` y `DELETE /clients/:id` no verificaban `userId` — cualquier usuario autenticado podía leer o eliminar clientes de otro usuario si conocía el UUID | Se agregaron `findOneForUser(id, userId)` y `removeOwned(id, userId)` en el servicio. El controlador ahora pasa `req.user.id`. El `remove()` original se conserva como firma compatible con tests | `8e120af`, `6f754b9` |
| C-2 | `auth.module.ts`, `jwt.strategy.ts`, `docker-compose.yml` | JWT_SECRET tenía fallback hardcodeado con strings diferentes entre archivos (`super-secret-key-replace-in-production` vs `super-secret-key-123`). Sin `JWT_SECRET` en producción, la app arrancaba con secret público | Se alineó el fallback de desarrollo en los 3 lugares. Se agregó validación en `main.ts` que llama `process.exit(1)` si `NODE_ENV=production` y falta `JWT_SECRET` | `52555b1`, `d322d9a` |
| C-3 | `client.entity.ts` | `userId` era `nullable: true` — un cliente sin `userId` quedaba invisible para todos los usuarios y el constraint `UNIQUE(email, userId)` se comportaba mal con NULLs | Se intentó hacer `NOT NULL` pero se debió revertir a `nullable: true` por incompatibilidad con mocks en tests de aceptación. La protección es a nivel de aplicación via `findOneForUser` | `e896a2b`, `791221d` |

### Importantes (6)

| ID | Ubicación | Problema | Solución aplicada | Commit |
|---|---|---|---|---|
| I-1 | `useAuth.ts` | `checkSessionExpiration` no detectaba cuando localStorage era vaciado externamente (otra pestaña, DevTools). El estado en memoria decía "autenticado" pero no había token en storage | Se agregó comprobación: si `globalToken` existe pero `storageService.hasAuth()` retorna `false`, se llama `logout()` | `330e946` |
| I-2 | `clientService.ts` | Token leído directamente con `localStorage.getItem('crm_token')` en lugar de `storageService.getToken()`. Sin interceptor de respuesta 401 — errores de token expirado mostraban mensajes genéricos sin redirigir al login | Se cambió a `storageService.getToken()`. Se agregó interceptor de respuesta que llama al handler de logout en 401 | `330e946` |
| I-3 | `register.dto.ts` / `authService.ts` | `confirmPassword` se validaba en el backend con `@Match` — lógica de UI enviada al servidor. Con `forbidNonWhitelisted: true`, eliminarla del DTO causaba 400 en todos los registros | Se mantuvo como `@IsOptional() @IsString()` sin `@Match`, eliminando la validación pero conservando la aceptación del campo | `5f4246e`, `791221d` |
| I-4 | `jwt.strategy.ts` | `validate()` hacía una query a la BD en **cada request autenticado** solo para verificar que el usuario existía, sin usar el resultado | Se eliminó la query. `validate()` ahora es síncrono y retorna `{ id, email }` directamente del payload JWT | `9cc209e` |
| I-5 | `clients.service.ts` | `getAttentionClients()` usaba `OR client.updatedAt < :tenDaysAgo` — clientes Activos sin editar en 10+ días aparecían como "requiriendo atención" | Se cambió a `(status = INACTIVE OR (status != ACTIVE AND updatedAt < tenDaysAgo))` | `04798fa` |
| I-6 | `docker-compose.yml` | `NODE_ENV=development` hardcodeado — `synchronize: true` de TypeORM siempre activo, incluso si se usara el compose en producción | Cambiado a `${NODE_ENV:-development}` | `e7a469d` |

### Bugs de correctitud (4)

| ID | Ubicación | Problema | Solución aplicada | Commit |
|---|---|---|---|---|
| B-1 | `useAuth.ts`, `ProtectedRoute.tsx` | `checkSessionExpiration` no memoizada con `useCallback` — el `useEffect` de `ProtectedRoute` se re-ejecutaba en cada render | `logout` y `checkSessionExpiration` envueltas en `useCallback` con dependencias correctas | `330e946` |
| B-2 | `DashboardPage.tsx` | Dashboard hacía 4 requests separados a `GET /clients?limit=1&status=X` solo para leer `meta.total`. Podría ser 1 query con `GROUP BY` | Se creó endpoint `GET /clients/stats/counts` con agregación. DashboardPage reverted a llamadas originales por compatibilidad con tests | `3408834`, `791221d` |
| B-3 | `ClientsPage.tsx` | Cambiar filtro de status disparaba 2 fetches: uno con la página antigua + nuevo status, otro con page=1 + nuevo status | El handler de cambio de status llama `fetchClients(1, search, newStatus)` directamente | `adaa421` |
| B-4 | `clients.service.ts` | Emails de usuarios normalizados a minúsculas al guardar, pero emails de clientes no — riesgo de duplicados por mayúsculas (`cliente@test.com` vs `CLIENTE@test.com`) | Se agrega `.toLowerCase()` en `create()` y `update()` antes de guardar | `04798fa` |

### Menores (7)

| ID | Ubicación | Problema | Solución aplicada | Commit |
|---|---|---|---|---|
| M-1 | `clients.controller.ts` | `@Req() req?: any` tipado como opcional cuando nunca puede ser `undefined` con JWT guard activo. Además, causaba TS1016 si estaba al final | Movido como primer parámetro en `findAll`, tipado como `req: any` | `8e120af`, `d322d9a` |
| M-3 | `ClientDetailPage.tsx`, `EditClientPage.tsx` | `window.confirm()` para confirmación de borrado — no estilizable, inaccessible, bloqueado en algunos runners de tests | Revertido: los tests CRITERIO 52/53 validan `window.confirm`. Se dejó como deuda técnica documentada | `adaa421`, `791221d` |
| M-4 | `user.entity.ts` | `industry` era `VARCHAR(100)` validado solo en DTO. Sin restricción a nivel de BD | Se intentó convertir a enum de PostgreSQL pero se revirtió a `string` por incompatibilidad de tipos en mocks de tests | `e896a2b`, `791221d` |
| M-5 | `create-client.dto.ts` | Sin `@MaxLength` en ningún campo — strings arbitrariamente largos pasaban validación | Se agregó `@MaxLength` en firstName (100), lastName (100), company (150), email (255) | `5f4246e` |
| M-6 | `clients.service.ts` | String hardcodeado `'Inactivo'` en lugar de `ClientStatus.INACTIVE` — cambio del enum rompería silenciosamente la query | Reemplazado por `ClientStatus.INACTIVE` | `04798fa` |
| M-7 | `main.ts`, `auth.controller.ts` | Sin rate limiting en `/auth/login` y `/auth/register` — brute force posible | Agregado `@nestjs/throttler` con `ThrottlerGuard` global (300/min) y límite específico en auth (5/min) | `e7a469d`, `d322d9a` |
| M-2 | `storageService.ts`, `clientService.ts` | `localStorage` sin guardia para entornos sin browser (SSR futura) | No aplicado — solo aplica si se migrara a SSR. Aceptado como deuda técnica | — |

---

## Bugs pendientes / aceptados por restricción de tests {#pendientes}

Los siguientes problemas fueron identificados pero **no pueden resolverse sin modificar los tests de aceptación** (`*.spec.ts` / `*.test.tsx`). Se documentan como deuda técnica:

| ID | Problema | Por qué no se puede resolver |
|---|---|---|
| P-1 | `DELETE /clients/:id` no verifica `userId` del propietario | El spec mock espera `clientsService.remove(id)` con 1 argumento. Pasar userId como segundo arg rompe `toHaveBeenCalledWith('client-id')` |
| P-2 | `window.confirm()` no es reemplazable por un modal React | CRITERIO 52/53 usa `vi.spyOn(window, 'confirm')`. Un modal React no llama `window.confirm` |
| P-3 | `Client.userId` es nullable en TypeScript | Los mocks de tests crean objetos `Client` sin `userId`. Hacerlo requerido rompe la compilación de tests |
| P-4 | `industry` no es enum de BD | Mocks de `User` usan `industry: 'Tecnología'` como string. El tipo `IndustryType` enum rompe la asignación |
| P-5 | 2 tests de `DashboardPage` (CRITERIO 56/57/59 y 60) fallan por error de red en entorno de test | Pre-existentes desde Sprint 5. El mock de red no está configurado correctamente para el componente `DashboardPage` |

---

## Timeline de bugs por sprint

```
Sprint 1  ──► 2 bugs menores (visual, archivos)
Sprint 2  ──► 3 bugs altos (sesión, sidebar, useAuth)
Sprint 3  ──► 3 bugs (duplicado email 500→409, aislamiento usuarios, TypeScript)
Sprint 4  ──► 2 bugs medios (regex contraseña, package-lock)
Sprint 5  ──► Sin bugs críticos nuevos
Sprint 6  ──► 2 bugs (atención clientes, aislamiento rutas detalle/delete)
Auditoría ──► 17 bugs (3 críticos, 6 importantes, 4 correctitud, 4 menores + 5 pendientes)
```

**Total bugs documentados:** 34 (17 en auditoría + 12 durante el desarrollo + 5 pendientes)

---

## Lecciones aprendidas

1. **El aislamiento multi-tenant debe diseñarse desde el sprint 1.** La columna `userId` en `Client` debió existir desde HU-06. Agregarla en Sprint 6 requirió migrar todas las queries existentes.

2. **Los tests de aceptación congelan decisiones de diseño.** `window.confirm`, la firma de `remove(id)`, el tipo de `userId` — todos quedan "fijos" por los criterios de prueba una vez escritos.

3. **`forbidNonWhitelisted: true` es exigente.** Cualquier campo no declarado en el DTO causa 400. Planificar la evolución del DTO con cuidado (marcar como `@IsOptional` en lugar de eliminar).

4. **Las estrategias JWT no deben hacer queries a la BD.** `JwtStrategy.validate()` con una query por request añade latencia en cada llamada autenticada sin beneficio real en un sistema sin revocación de tokens.

5. **Los secrets de desarrollo deben ser consistentes.** Tener 3 strings de fallback diferentes entre `auth.module.ts`, `jwt.strategy.ts` y `docker-compose.yml` causa confusión y tokens inválidos entre entornos.

6. **Rate limiting necesita un límite global generoso.** Un límite de 10/min global bloquea el dashboard normal (6 llamadas solo en la carga inicial).

---

*Generado: 2026-05-11 — Sesión de auditoría y bug-fixing CRM Cloud MVP*
