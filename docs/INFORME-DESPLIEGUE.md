# Informe de Despliegue a Producción
**Proyecto:** CRM Cloud MVP - Gestión de Clientes
**Fecha:** 13 de Mayo de 2026

## 1. Arquitectura de Producción

Se ha implementado una arquitectura moderna orientada a microservicios en la nube utilizando las siguientes plataformas:

*   **Base de Datos (Data Tier):** [Supabase](https://supabase.com) (PostgreSQL)
*   **Backend (API / Logic Tier):** [Render](https://render.com) (NestJS en contenedor Docker)
*   **Frontend (Presentation Tier):** [Vercel](https://vercel.com) (React + Vite)

Esta separación garantiza escalabilidad independiente, alta disponibilidad y un despliegue continuo estructurado.

---

## 2. Retos Técnicos y Soluciones Implementadas

### 2.1 Conflicto de Direccionamiento IPv6 (Error ENETUNREACH)
*   **El Problema:** La capa gratuita de Supabase actualmente provisiona las bases de datos exclusivamente en una red IPv6. Sin embargo, los contenedores estándar de Render en la capa gratuita enrutan su tráfico saliente mediante IPv4. Esto generó un error de desconexión `ENETUNREACH` al intentar conectar el backend con el host estándar `db.kfjmbowqwfwllfmmvrvt.supabase.co`.
*   **La Solución:** Se implementó el uso de **Supavisor** (Connection Pooler de Supabase). Esto proporciona un proxy intermediario que acepta conexiones IPv4. Se reemplazó el host directo por el host del pooler regional (`aws-1-us-east-2.pooler.supabase.com`) y se configuró el puerto a `6543` (Transaction Mode).

### 2.2 Error de Identificación de Tenant ("Tenant or user not found")
*   **El Problema:** Al utilizar el Pooler de Supabase, el servidor proxy maneja múltiples proyectos. Si la URL del pooler no apunta al sub-cluster exacto asignado (ej. `aws-0` vs `aws-1`), el inquilino (tenant) no es reconocido.
*   **La Solución:** Mediante la interfaz "ORM" del panel de Supabase se identificó la URI exacta para el proyecto (`aws-1-us-east-2.pooler.supabase.com`). Al alinear la variable `DB_HOST` en Render con este valor, el backend conectó instantáneamente.

### 2.3 Despliegue del Frontend en Arquitectura Monorepo
*   **El Problema:** Vercel detectó el repositorio como un monorepo e intentó compilar tanto el frontend como el backend (NestJS), pidiendo un archivo de configuración complejo (`vercel.json`).
*   **La Solución:** Se editó el *Root Directory* del proyecto en Vercel apuntando exclusivamente a la carpeta `./frontend`. Esto permitió que Vercel ignorara el backend (ya manejado por Render) y ejecutara el pipeline de construcción de React/Vite sin fricciones.

---

## 3. Configuración del Entorno (Variables)

Las siguientes configuraciones rigen el sistema en producción (se ocultan secretos críticos por seguridad):

### Backend (Render - Web Service)
*   **DB_HOST:** `aws-1-us-east-2.pooler.supabase.com`
*   **DB_PORT:** `6543`
*   **DB_USER:** `postgres.kfjmbowqwfwllfmmvrvt`
*   **DB_PASSWORD:** `********` *(Oculto)*
*   **DB_NAME:** `postgres`
*   **NODE_ENV:** `production`
*   **JWT_SECRET:** `crm_cloud_jwt_secret_produccion_2024`
*   **FRONTEND_URL:** `*` *(Se recomienda cambiar por la URL final de Vercel en el futuro por seguridad CORS)*

### Frontend (Vercel)
*   **VITE_API_URL:** `https://crm-cloud-mvp-gestion-de-clientes.onrender.com`

---

## 4. Conclusión

El sistema CRM se encuentra 100% operativo en la nube. Cualquier cambio empujado a la rama `main` en GitHub causará que Render actualice automáticamente el servidor API y Vercel actualice la interfaz de usuario en tiempo real.
