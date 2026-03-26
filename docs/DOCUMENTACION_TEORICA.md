# Documentación Teórica - CRM Cloud MVP

## 1. Introducción
El proyecto **CRM Cloud MVP** es un sistema integral de gestión de relaciones con clientes, diseñado utilizando una arquitectura cliente-servidor robusta y moderna. Su objetivo principal es permitir a los usuarios (empresas y profesionales) registrarse, autenticarse y administrar el ciclo de vida completo de sus propios clientes (flujo CRUD), dentro de un entorno seguro y escalable.

## 2. Arquitectura del Sistema
La arquitectura adoptada se divide en tres capas principales operando dentro de contenedores orquestados mediante **Docker** y **Docker Compose**:
- **Capa de Presentación (Frontend)**: Una Single Page Application (SPA) dinámica construida con React que interactúa asíncronamente con el Backend a través de una API RESTful.
- **Capa de Lógica de Negocio (Backend)**: API servida mediante NestJS. Actúa como el centro neurálgico para todas las operaciones de procesamiento, validaciones seguras, control de autorizaciones y peticiones hacia la base de datos.
- **Capa de Persistencia (Base de Datos)**: Sistema gestor de base de datos relacional PostgreSQL. Garantiza la integridad referencial, el rigor de los modelos transaccionales y el aislamiento de datos (Data Tenancy).

## 3. Stack Tecnológico

### 3.1. Ecosistema Frontend
- **Librería Base**: React 18 con TypeScript para un tipado estático seguro durante el desarrollo.
- **Herramienta de Construcción**: Vite, proporcionando un entorno de servidor de desarrollo ultrarrápido (HMR) y construcciones de producción optimizadas.
- **Estilos y UI**: Tailwind CSS. Permite construir una interfaz coherente y modular directamente desde el marcado mediante utility-classes.
- **Enrutamiento**: React Router DOM para una navegación del lado del cliente impecable entre vistas protegidas y públicas.
- **Gestión de Formularios**: React Hook Form acoplado con **Zod** para proporcionar validaciones de esquemas declarativos de alta eficiencia y prevención de renderizados innecesarios.
- **Comunicaciones HTTP**: Axios con interceptores programados para la inyección automática de tokens en cabeceras.
- **Iconografía**: Lucide React.

### 3.2. Ecosistema Backend
- **Framework Core**: NestJS. Fomenta un patrón arquitectónico claro (Módulos, Controladores y Servicios), fuertemente influenciado en los principios SOLID.
- **Lenguaje**: TypeScript Strict Mode.
- **ORM (Mapeo Objeto-Relacional)**: TypeORM. Soporta el modelado orientado a objetos de entidades como `User` o `Client` para convertirlas y relacionarlas mediante el patrón "Data Mapper" en tablas de PostgreSQL.
- **Capa de Autenticación**: Autenticación sin estado (Stateless) construida alrededor del estándar JSON Web Tokens (JWT) y el middleware Passport.js.
- **Validaciones Rigurosas**: Empleo de decoradores de `class-validator` y `class-transformer` dentro de objetos DTO garantizando la sanidad de los payloads entrantes.

## 4. Patrones de Diseño Estructural y de Software

### 4.1. Lógica Backend (NestJS)
- **Inyección de Dependencias (DI)**: Promovido inherentemente por NestJS. Las dependencias requeridas (repositorios, otros servicios) son inyectadas en los constructores facilitando un menor acoplamiento e incrementando exponencialmente su testabilidad.
- **Patrón DTO (Data Transfer Object)**: Abstrae el tipo de dato subyacente de la Base de Datos (Entity) del formato de objeto recibido sobre la red (e.g. `LoginDto`, `RegisterDto`).
- **Authorization Guards**: Interceptores de ejecución (ej. `JwtAuthGuard`) que evalúan los metadatos de contexto de flujo para permitir o denegar el acceso a rutas protegidas basados en el token.

### 4.2. Lógica Frontend (React)
- **Custom Hooks**: Encapsulamiento de lógica y persistencia de UI como el `useAuth.ts` que centraliza la interacción con los estados de autenticación y Local Storage.
- **Higher-Order Components (HOC) y Wrappers**: Casos como `ProtectedRoute` o `PublicRoute` que interceptan el ciclo de vida del router y redirigen basándose en los privilegios de sesión antes de efectuar un renderizado.
- **Componentes Basados en Átomos**: Componentización de la UI básica como `InputField` y `Banner` para estandarizar la entrada y la salida de información visual en toda la aplicación.

## 5. Casos de Uso Core: Identidad y Sesión
El sistema implementa un robusto flujo de autenticación basada en JWT:
1. **Registro (Sign Up)**: El Frontend intercepta las entradas y Zod las valida. El backend verifica duplicidades, encripta irrevocablemente la contraseña usando **Bcrypt (10 salt rounds)** y persiste al nuevo usuario en la tabla.
2. **Autenticación (Sign In)**: Credenciales validadas comparando el hash de Bcrypt. Se expide un Bearer Token JWT con validez de 24 horas y firmado por un secreto de servidor.
3. **Mantenimiento y Expiración**: La aplicación cliente rastrea la información de la sesión inter-pestallas a través del `localStorage` (`crm_token`, `crm_timestamp`). Se validan rigurosamente por el cliente los tiempos de expiración y por el backend el secreto firmado durante las llamadas a rutas privadas.

## 6. Módulo de Gestión de Clientes (CRUD)
Se implementa una estructura de dominio integral para el ecosistema relacional de los "Clientes" de los usuarios administradores.
- **Aislamiento Multitenant (Básico)**: Todos los registros creados bajo la entidad de Cliente retienen una columna indicativa referencial asistiéndose de la Foreign Key que señala a su respectivo propietario, el "User". 
- **Flujo de Operación**:
  - **Create**: Controladores que exigen DTOs rellenables vía Formularios Frontend y persistidos con relación uno a muchos.
  - **Read**: Recuperación masiva (listado general) o granular (búsqueda).
  - **Update / Delete**: Mutaciones y eliminación de datos bajo rigor de autenticidad donde un usuario no puede manipular la fila de `Client` que pertenece a otro `User`.

## 7. Estrategias de Aseguramiento de Calidad (Testing)
El código de producción se rige por su correlación con suites completas de pruebas automatizadas:
- **Backend (Jest & Supertest)**: 
  - Pruebas unitarias de la lógica individual de Servicios (mockeando base de datos).
  - Pruebas E2E / de Integración que disparan llamadas HTTP virtuales para comprobar el flujo entero sobre Controladores.
- **Frontend (Vitest & Testing Library)**:
  - Pruebas orientadas al usuario (DOM-based).
  - Comprobación de que la interfaz de usuario cambie activamente con fallos forzados de Zod.
  - Assertions dependientes de los atríbutos `aria` u elementos persistentes, como se indica con el exigido id `field-{name}` de las cajas de texto.

## 8. Principios y Políticas de Seguridad Adoptadas
- Cifrado inquebrantable de credenciales previo a inserción en BBDD.
- Autenticación Stateless invulnerable a cross-site request forgery (CSRF) siempre que se configuren cabeceras apropiadamente junto a las lecturas desde WebStorage.
- Prevención de fugas de variables sensibles al mantener claves privadas (`JWT_SECRET`, Credenciales de BD) en variables de entorno estrictamente aisladas de control de versiones.
- Sanitización de entradas, desde emails truncados/normalizados en minúsculas hasta rechazo preventivo de datos sin contrato DTO válido.
