# 🔌 Instrucciones para Conectar a la Base de Datos

## ✅ Estado: Base de datos funcionando correctamente

---

## 🔑 Credenciales

```
Host:       localhost
Puerto:     5432
Usuario:    postgres
Contraseña: postgres
Base datos: crm_cloud
```

**URL de conexión completa:**

```
postgresql://postgres:postgres@localhost:5432/crm_cloud
```

---

## 📋 Pasos para conectar desde tu IDE

### Si usas **IntelliJ IDEA / DataGrip / PyCharm / WebStorm**:

1. **BORRA** cualquier conexión existente a `crm_cloud`
2. Ve a: **Database → + → Data Source → PostgreSQL**
3. **ESCRIBE** manualmente (NO copies):
   - **Host:** `localhost`
   - **Port:** `5432`
   - **User:** `postgres` (escríbelo letra por letra)
   - **Password:** `postgres` (escríbelo letra por letra)
   - **Database:** `crm_cloud`
4. Haz clic en **Test Connection**
5. Si pide descargar drivers, haz clic en **Download**
6. Haz clic en **OK**

---

### Si usas **VS Code** con extensión de PostgreSQL:

1. Instala la extensión: "PostgreSQL" de Chris Kolkman
2. Haz clic en el icono de PostgreSQL en la barra lateral
3. Haz clic en el botón **+** para nueva conexión
4. Ingresa paso por paso:
   - **Hostname:** `localhost`
   - **User:** `postgres`
   - **Password:** `postgres`
   - **Port:** `5432`
   - **Standard Connection** (TLS: No)
   - **Database:** `crm_cloud`
5. Dale un nombre a la conexión: "CRM Cloud Local"

---

### Si usas **DBeaver**:

1. **BORRA** cualquier conexión existente
2. Nueva Conexión → **PostgreSQL**
3. En la pestaña **Main**:
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Database:** `crm_cloud`
   - **Username:** `postgres`
   - **Password:** `postgres`
   - Marca: **Save password**
4. Haz clic en **Test Connection**
5. Si pide drivers, haz clic en **Download**
6. Haz clic en **Finish**

---

### Si usas **pgAdmin**:

1. Clic derecho en **Servers** → **Register → Server**
2. Pestaña **General**:
   - **Name:** CRM Cloud Local
3. Pestaña **Connection**:
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Maintenance database:** `crm_cloud`
   - **Username:** `postgres`
   - **Password:** `postgres`
   - Marca: **Save password**
4. Haz clic en **Save**

---

## ⚠️ Problemas Comunes

### Error: "authentication failed"

- **Causa:** Credenciales con caracteres invisibles o espacios
- **Solución:** ESCRIBE las credenciales manualmente, no las copies

### Error: "Connection refused"

- **Causa:** Docker no está corriendo
- **Solución:** Ejecuta `docker compose ps` para verificar

### Error: "FATAL: database does not exist"

- **Causa:** Intentando conectar a una base de datos diferente
- **Solución:** Usa exactamente `crm_cloud` como nombre de base de datos

---

## 🔍 Verificar que PostgreSQL está corriendo

Ejecuta este comando:

```powershell
.\test-db-connection.ps1
```

Deberías ver:

```
✅ Contenedor: FUNCIONA
✅ Puerto 5432: ABIERTO
```

---

## 📞 Comandos Útiles

**IMPORTANTE:** Todos los comandos deben ejecutarse desde la carpeta del proyecto:

```powershell
cd 'C:\Users\Daniel\OneDrive - UPB\Desktop\UPB\Semestre 7\TIC2\crm-cloud\CRM-Cloud-MVP-Gestion-de-Clientes'
```

```bash
# Ver si los contenedores están corriendo
docker compose ps

# Ver logs de PostgreSQL
docker compose logs db

# Reiniciar PostgreSQL
docker compose restart db

# Reiniciar todos los servicios
docker compose restart

# Conectarse desde terminal
docker exec -it -e PGPASSWORD=postgres crm_postgres psql -U postgres -d crm_cloud

# Detener todos los servicios
docker compose down

# Levantar todos los servicios
docker compose up -d
```

---

## ✅ ¿Cómo saber si funcionó?

Una vez conectado deberías ver:

- Base de datos: `crm_cloud`
- Esquema: `public`
- Tablas: `user` (una vez que registres usuarios)
