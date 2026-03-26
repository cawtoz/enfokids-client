# EnfoKids - Client

Aplicación web para gestión de actividades terapéuticas para niños. Permite a administradores, terapeutas, cuidadores y niños interactuar con planes de actividades y juegos educativos interactivos.

## Stack tecnológico

- **Framework**: Astro 5 (SSR)
- **UI**: React 19 + shadcn/ui (Radix UI)
- **Estilos**: Tailwind CSS 4
- **Lenguaje**: TypeScript (strict)
- **Formularios**: React Hook Form + Zod
- **Tablas**: TanStack React Table
- **HTTP**: Axios
- **Package manager**: Bun

---

## Estructura de carpetas

```
enfokids-client/
│
├── src/
│   │
│   ├── pages/                        # Rutas de la aplicación (Astro SSR)
│   │   ├── index.astro               # Landing / redirección según rol
│   │   ├── login.astro               # Página de inicio de sesión
│   │   ├── inicio.astro              # Dashboard admin/terapeuta
│   │   ├── inicio-cuidador.astro     # Dashboard cuidador
│   │   ├── inicio-nino.astro         # Dashboard niño
│   │   ├── ninos.astro               # CRUD de niños
│   │   ├── terapeutas.astro          # CRUD de terapeutas
│   │   ├── cuidadores.astro          # CRUD de cuidadores
│   │   ├── actividades.astro         # CRUD de actividades
│   │   ├── asignaciones.astro        # CRUD de asignaciones
│   │   ├── planes-actividades.astro  # CRUD de planes de actividad
│   │   │
│   │   ├── nino/                     # Vistas del niño
│   │   │   ├── [id].astro            # Perfil del niño
│   │   │   ├── [id]/actividades.astro# Actividades asignadas al niño
│   │   │   └── juego/
│   │   │       └── [assignmentId].astro  # Interfaz de juego
│   │   │
│   │   └── api/
│   │       └── [...path].ts          # Proxy API → backend (inyecta JWT desde cookies)
│   │
│   ├── layouts/                      # Plantillas de página
│   │   ├── BaseLayout.astro          # HTML base con seguridad
│   │   ├── AdminLayout.astro         # Layout del panel admin
│   │   ├── ChildLayout.astro         # Layout del panel niño
│   │   ├── AdminWrapper.tsx          # Sidebar + nav para admin (React)
│   │   └── ChildWrapper.tsx          # Wrapper de interfaz para niño (React)
│   │
│   ├── components/
│   │   │
│   │   ├── auth/
│   │   │   └── login-form.tsx        # Formulario de login
│   │   │
│   │   ├── crud/                     # Componentes CRUD por entidad
│   │   │   ├── table-crud.tsx        # Tabla genérica con acciones
│   │   │   ├── table-wrapper.tsx     # Contenedor de tabla con modal
│   │   │   ├── activity/             # Tabla y formulario de actividades
│   │   │   ├── activity-plan/        # Tabla, formulario y detalles de planes
│   │   │   ├── assignment/           # Tabla y formularios de asignaciones
│   │   │   ├── caregiver/            # Tabla y formulario de cuidadores
│   │   │   ├── child/                # Tabla, formulario y sheets del niño
│   │   │   ├── progress/             # Tabla y formulario de progreso
│   │   │   └── therapist/            # Tabla y formulario de terapeutas
│   │   │
│   │   ├── games/                    # Juegos interactivos
│   │   │   ├── MemoryFlipGame.tsx    # Juego de memoria con volteo de cartas
│   │   │   ├── MatchingPairsGame.tsx # Juego de emparejamiento
│   │   │   └── SortRushGame.tsx      # Juego de ordenamiento rápido
│   │   │
│   │   ├── pages/                    # Componentes React montados en páginas Astro
│   │   │   ├── AdminHome.astro       # Vista principal del admin
│   │   │   ├── DashboardHome.tsx     # Dashboard con estadísticas
│   │   │   ├── CaregiverHome.tsx     # Vista principal del cuidador
│   │   │   ├── ChildHome.tsx         # Vista principal del niño
│   │   │   ├── ChildActivitiesView.tsx # Lista de actividades del niño
│   │   │   └── GamePage.tsx          # Página contenedora del juego
│   │   │
│   │   ├── ui/                       # Componentes base de shadcn/ui
│   │   │   └── (40+ componentes: button, input, dialog, table, form, sheet...)
│   │   │
│   │   ├── app-sidebar.tsx           # Sidebar principal de la app
│   │   ├── nav-main.tsx              # Navegación principal
│   │   ├── nav-breadcrumbs.tsx       # Migas de pan
│   │   ├── nav-user.tsx              # Menú de usuario en sidebar
│   │   ├── team-switcher.tsx         # Selector de contexto/equipo
│   │   └── theme-toggle.tsx          # Botón de cambio de tema
│   │
│   ├── hooks/
│   │   ├── use-crud.ts               # Hook genérico para operaciones CRUD (estado, modales, URL params)
│   │   └── use-mobile.ts             # Detección de dispositivo móvil
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Cliente Axios (timeout, cookies, interceptores)
│   │   │   ├── authApi.ts            # Endpoints de autenticación
│   │   │   └── index.ts              # Exportaciones de la API
│   │   ├── auth.ts                   # Utilidades de auth (getCurrentUser, hasRole, isAdmin)
│   │   ├── generic-crud-service.ts   # Clase base CRUD reutilizable para todas las entidades
│   │   └── utils.ts                  # Utilidades generales (cn, etc.)
│   │
│   ├── types/                        # Interfaces y tipos TypeScript
│   │   ├── user.ts                   # Usuario, Terapeuta, Niño, Cuidador
│   │   ├── activity.ts               # Actividad
│   │   ├── activity-plan.ts          # Plan de actividades
│   │   ├── assignment.ts             # Asignación (con estado y frecuencia)
│   │   ├── plan-detail.ts            # Detalle de plan
│   │   └── progress.ts               # Progreso del niño
│   │
│   ├── styles/
│   │   └── global.css                # Estilos globales y variables CSS
│   │
│   └── middleware.ts                 # Autenticación y redirección por rol en cada request
│
├── public/                           # Archivos estáticos
│   ├── favicon.svg
│   └── music/                        # Audio para los juegos
│
├── astro.config.mjs                  # Configuración de Astro (SSR, React, Tailwind)
├── components.json                   # Configuración de shadcn/ui
├── tsconfig.json                     # Configuración TypeScript (alias @/*)
└── package.json                      # Dependencias y scripts
```

---

## Arquitectura general

### Flujo de autenticación y roles

```
Request → middleware.ts → Verifica JWT en cookie
                        ↓
          Redirige según rol: ADMIN / THERAPIST / CAREGIVER / CHILD
```

### Patrón CRUD genérico

```
GenericCRUDService<T>   →   useCRUD hook   →   Table + Form components
(lib/)                      (hooks/)            (components/crud/)
```

Todas las entidades (niños, terapeutas, actividades, etc.) usan el mismo servicio base y hook, variando solo el esquema de formulario y columnas de tabla.

### Proxy API

Todas las peticiones `/api/*` pasan por `src/pages/api/[...path].ts`, que inyecta el JWT desde la cookie de sesión y las reenvía al backend (Spring Boot en `localhost:8080`).

### Juegos como asignaciones

Cada juego está vinculado a una asignación. Al completarlo, se guarda el progreso automáticamente con puntuación en estrellas.

---

## Scripts disponibles

```bash
bun dev       # Inicia el servidor de desarrollo
bun build     # Genera el build de producción
bun preview   # Previsualiza el build
```
