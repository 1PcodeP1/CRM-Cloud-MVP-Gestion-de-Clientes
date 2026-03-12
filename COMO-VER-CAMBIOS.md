# 🚀 Guía Rápida: Ver los Cambios del Sprint 2

## 1️⃣ Asegúrate que todos los servicios estén corriendo

```powershell
cd 'C:\Users\Daniel\OneDrive - UPB\Desktop\UPB\Semestre 7\TIC2\crm-cloud\CRM-Cloud-MVP-Gestion-de-Clientes'
docker compose ps
```

Deberías ver 3 contenedores "Up":

- ✅ crm_backend
- ✅ crm_frontend
- ✅ crm_postgres

---

## 2️⃣ Abre el navegador en modo incógnito

**¿Por qué?** Para evitar problemas de caché.

**Chrome/Edge:** `Ctrl + Shift + N`
**Firefox:** `Ctrl + Shift + P`

---

## 3️⃣ Accede a la aplicación

### Opción A: Registrar una cuenta nueva

1. Ve a: http://localhost:5173/register
2. Llena el formulario de registro
3. Haz clic en "Crear cuenta"
4. Serás redirigido a login con mensaje de éxito
5. Inicia sesión con tus credenciales

### Opción B: Iniciar sesión (si ya tienes cuenta)

1. Ve a: http://localhost:5173/login
2. Ingresa tu correo y contraseña
3. Haz clic en "Iniciar sesión"
4. Serás redirigido al Dashboard

---

## 4️⃣ ¿Qué deberías ver?

### En el Login (http://localhost:5173/login)

- Formulario con correo y contraseña
- Link "¿Olvidaste tu contraseña?" (al hacer clic muestra mensaje próximamente)
- Botón "Iniciar sesión"

### En el Dashboard (después de login)

- **Sidebar izquierdo oscuro** con:
  - Logo "CRM Cloud"
  - Menú: Dashboard (activo) y Clientes
  - Tu nombre y correo al fondo
  - Botón rojo "Cerrar sesión"
- **Contenido principal**:
  - Topbar con "Panel de gestión" y notificaciones
  - 4 tarjetas KPI grandes con estadísticas
  - Mensaje de bienvenida

---

## 5️⃣ Probar funcionalidades del Sprint 2

### ✅ HU-03: Inicio de sesión

- Intenta login con credenciales incorrectas → Ver mensaje de error
- Ingresa email sin @ → Ver validación de formato
- Login exitoso → Redirección automática a dashboard

### ✅ HU-04: Protección de rutas

- Sin iniciar sesión, ve a: http://localhost:5173/dashboard
- Deberías ser redirigido a login con mensaje de error

### ✅ HU-05: Cierre de sesión

- En el dashboard, haz clic en "Cerrar sesión" en el sidebar
- Verás mensaje verde: "Has cerrado sesión correctamente"
- Presiona el botón atrás del navegador
- Deberías seguir en login (no volver al dashboard)

---

## 🐛 Si no ves los cambios

### 1. Limpia caché del navegador

**Chrome/Edge:**

- `Ctrl + Shift + Delete`
- Selecciona "Imágenes y archivos en caché"
- Haz clic en "Borrar datos"

**O usa modo incógnito:** `Ctrl + Shift + N`

### 2. Fuerza recarga en el navegador

- `Ctrl + Shift + R` (Windows)
- `Ctrl + F5` (alternativa)

### 3. Reinicia el frontend

```powershell
cd 'C:\Users\Daniel\OneDrive - UPB\Desktop\UPB\Semestre 7\TIC2\crm-cloud\CRM-Cloud-MVP-Gestion-de-Clientes'
docker compose restart frontend
```

### 4. Verifica que no hay errores

```powershell
docker compose logs frontend --tail 30
```

Deberías ver: `VITE v5.4.21  ready in XXX ms`

### 5. Si siguen sin verse los cambios

Detén y vuelve a levantar todo:

```powershell
docker compose down
docker compose up -d
```

Espera 1-2 minutos y vuelve a http://localhost:5173

---

## 📸 Capturas de pantalla de referencia

### Login Page

```
┌─────────────────────────────────────┐
│         [CRM Cloud Logo]            │
│                                     │
│     Bienvenido de nuevo            │
│                                     │
│  Email: [________________]         │
│  Contraseña: [__________] 👁️      │
│  ¿Olvidaste tu contraseña?         │
│                                     │
│  [   Iniciar sesión   ]            │
│                                     │
│  ¿No tienes cuenta? Regístrate     │
└─────────────────────────────────────┘
```

### Dashboard

```
┌───────┬──────────────────────────────────┐
│ Logo  │  Panel de gestión         🔔    │
│       ├──────────────────────────────────┤
│ Nav:  │  Bienvenido al CRM Cloud         │
│  📊   │                                  │
│  👥   │  [KPI] [KPI] [KPI] [KPI]        │
│       │                                  │
│ User  │  Próximamente...                 │
│ 🚪    │                                  │
└───────┴──────────────────────────────────┘
```

---

## 🎯 Flujo completo a probar

1. 🌐 Abre http://localhost:5173 (Landing page)
2. 🔐 Clic en "Iniciar sesión"
3. ✍️ Ingresa credenciales (o registra cuenta nueva)
4. 📊 Verás el Dashboard con KPIs
5. 👀 Observa el sidebar con tu nombre
6. 🚪 Clic en "Cerrar sesión"
7. ✅ Verás mensaje verde de confirmación
8. ⬅️ Presiona botón atrás → sigues en login

---

## 💡 URLs importantes

- Landing: http://localhost:5173/
- Login: http://localhost:5173/login
- Register: http://localhost:5173/register
- Dashboard: http://localhost:5173/dashboard (requiere login)

---

## 📞 ¿Sigues sin ver los cambios?

Comparte:

1. Captura de pantalla de lo que ves en http://localhost:5173/login
2. Output de: `docker compose ps`
3. Output de: `docker compose logs frontend --tail 20`

¡Y te ayudo a diagnosticar el problema!
