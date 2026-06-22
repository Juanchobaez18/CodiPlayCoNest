# CodiPlayCo — Backend (NestJS)

API REST para la plataforma educativa CodiPlayCo. Construida con NestJS + TypeORM + PostgreSQL.

---

## Requisitos previos

- Node.js ≥ 18
- PostgreSQL corriendo localmente
- Archivo `.env` configurado (copiar desde `.env.example`)

---

## Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores reales:

| Variable | Descripción |
|----------|-------------|
| `POSTGRES_HOST` | Host de PostgreSQL (normalmente `localhost`) |
| `POSTGRES_PORT` | Puerto (por defecto `5432`) |
| `POSTGRES_DB` | Nombre de la base de datos |
| `POSTGRES_USER` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Duración del token en segundos (ej. `86400`) |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook de Stripe (`whsec_...`) |
| `FRONTEND_URL` | URL del frontend (ej. `http://localhost:4200`) |

### 3. Ejecutar migraciones

```bash
npm run migration:run:dev
```

### 4. Ejecutar el seed — OBLIGATORIO en instalación nueva

> **Este paso es obligatorio.** Sin él, el registro de estudiantes falla con error 400
> porque el rol `estudiante` no existe en la base de datos.

```bash
npm run seed
```

El seed crea:
- **Roles:** `admin`, `docente`, `estudiante` con sus módulos y permisos
- **Usuario administrador:** `admin@codiplay.co` / `admin123`

> Re-ejecutar el seed es seguro — es idempotente (no duplica datos existentes).

---

## Levantar el servidor

```bash
# Modo desarrollo (hot-reload)
npm run start:dev

# Modo producción
npm run start:prod
```

El servidor escucha en `http://localhost:3000`.  
Documentación Swagger disponible en `http://localhost:3000/docs`.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Servidor en modo watch |
| `npm run seed` | Carga roles, módulos y usuario admin |
| `npm run seed:content` | Carga contenido de ejemplo (cursos, lecciones) |
| `npm run migration:run:dev` | Ejecuta migraciones pendientes |
| `npm run migration:revert:dev` | Revierte la última migración |
| `npm run migration:generate` | Genera una nueva migración |
| `npm run build` | Compila a JavaScript |
| `npm run lint` | Lint con ESLint |

---

## Credenciales de prueba (después del seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | `admin@codiplay.co` | `admin123` |

Los docentes son creados desde el panel de administración.  
Los estudiantes se registran desde la plataforma en `/auth/register`.

---

## Estructura del proyecto

```
src/
├── auth/          Autenticación JWT, registro, guards
├── users/         Gestión de usuarios
├── roles/         Roles y permisos RBAC
├── docente/       Panel y entidades del docente (tareas, entregas)
├── estudiantes/   Perfil y progreso del estudiante
├── curso/         Cursos
├── modulos/       Módulos de un curso
├── lecciones/     Lecciones de un módulo
├── foros/         Foros de discusión
├── mensajes/      Mensajería docente ↔ estudiante
├── payments/      Integración con Stripe
├── admin/         Panel de administración
└── scripts/       Seed y utilidades
```
