<div align="center">

# 📦 Inventario Pro

**Sistema de gestion de inventario para fabrica de ropa y estampados**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/Licencia-MIT-yellow?style=for-the-badge)](./LICENSE)

<br />

Sistema completo para gestionar materias primas, productos terminados y movimientos de inventario en una fabrica textil. Incluye dashboard en tiempo real, reportes con graficas, control de roles y un modo demo para probar sin base de datos.

<br />

[Comenzar](#-setup-rapido) · [Caracteristicas](#-caracteristicas) · [Stack](#%EF%B8%8F-tech-stack) · [Demo](#-modo-demo)

</div>

---

## 📸 Capturas de pantalla

<div align="center">

| Dashboard Principal | Historial de Movimientos |
|:---:|:---:|
| ![Dashboard principal](./docs/screenshots/dashboard.png) | ![Historial de movimientos](./docs/screenshots/movimientos.png) |

| Formulario de Ingreso | Gestion de Productos |
|:---:|:---:|
| ![Formulario de ingreso](./docs/screenshots/formulario-ingreso.png) | ![Gestion de productos](./docs/screenshots/productos.png) |

| Reportes y Graficas | Login |
|:---:|:---:|
| ![Reportes y graficas](./docs/screenshots/reportes.png) | ![Login](./docs/screenshots/login.png) |

</div>

> 💡 Las capturas se agregan en `docs/screenshots/`. Usa nombres descriptivos como los indicados arriba.

---

## ✨ Caracteristicas

### 📊 Dashboard en tiempo real
- **KPIs instantaneos**: productos activos, movimientos del dia, alertas de stock bajo, valor total del inventario
- **Grafica de stock por categoria** con colores personalizados por categoria (Recharts BarChart)
- **Alertas de stock bajo**: listado de productos que cayeron por debajo del minimo configurado
- **Ultimos movimientos**: feed en vivo con los ingresos y egresos mas recientes

### 📦 Gestion completa (CRUD)
- **Productos**: nombre, SKU unico, descripcion, precio costo/venta, stock minimo, imagen, categoria y unidad
- **Categorias**: nombre, color e icono personalizables
- **Proveedores**: nombre, contacto, email, telefono, direccion, notas

### 🔄 Movimientos de inventario
- **Ingreso**: registro de entrada de materiales con proveedor, precio unitario y referencia
- **Egreso**: salida de materiales con validacion de stock disponible (no permite negativos)
- **Historial paginado**: filtros por tipo (ingreso/egreso), ordenado cronologicamente
- **Actualizacion automatica**: triggers PostgreSQL ajustan `current_stock` al registrar un movimiento

### 📈 Reportes
- **Timeline de movimientos**: grafica de los ultimos 30 dias con ingresos y egresos
- **Stock por categoria**: distribucion visual del inventario
- **Top 10 productos**: los productos con mayor stock o mayor valor

### 🔐 Autenticacion y roles
- Auth completa con **Supabase SSR** (login/logout, cookies httpOnly)
- Proteccion de rutas por **middleware** de Next.js
- Tres roles con **Row Level Security**:

| Permiso | Admin | Operador | Viewer |
|---------|:-----:|:--------:|:------:|
| Ver datos | ✅ | ✅ | ✅ |
| Crear/editar productos | ✅ | ✅ | ❌ |
| Registrar movimientos | ✅ | ✅ | ❌ |
| Eliminar registros | ✅ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |

### ⚡ Performance y UX
- `loading.tsx` en **todas las rutas** con skeletons instantaneos
- **Prefetch proactivo** de rutas para navegacion sin esperas
- **View Transitions CSS** para transiciones fluidas entre paginas
- Diseño **futurista oscuro**: glassmorphism, bordes con glow, acentos neon cyan/violet

### 🎭 Modo demo
- Funciona **sin Supabase**: datos realistas generados localmente
- Ideal para evaluar la app, hacer demos o desarrollar sin conexion

---

## 🛠️ Tech Stack

| Tecnologia | Version | Uso |
|------------|---------|-----|
| [Next.js](https://nextjs.org/) | 16.1 | Framework React con App Router, Server Actions, Middleware |
| [React](https://react.dev/) | 19.2 | Biblioteca de UI con Server/Client Components |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Tipado estatico estricto |
| [Supabase](https://supabase.com/) | 2.97 | Auth, PostgreSQL, Row Level Security |
| [@supabase/ssr](https://github.com/supabase/ssr) | 0.8 | Auth con cookies en Server Components |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utilidades CSS, tema oscuro, responsive |
| [shadcn/ui](https://ui.shadcn.com/) | 3.8 | Componentes accesibles (Radix UI + Tailwind) |
| [Recharts](https://recharts.org/) | 3.7 | Graficas interactivas (BarChart, PieChart, LineChart) |
| [Zod](https://zod.dev/) | 4.3 | Validacion de schemas en Server Actions |
| [React Hook Form](https://react-hook-form.com/) | 7.71 | Formularios con validacion integrada |
| [Lucide React](https://lucide.dev/) | 0.575 | Iconos SVG consistentes |
| [date-fns](https://date-fns.org/) | 4.1 | Formateo de fechas |
| [Sonner](https://sonner.emilkowal.dev/) | 2.0 | Notificaciones toast |

---

## 📁 Estructura del proyecto

```
05-gestion-inventario/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/             # Pagina de login con Supabase Auth
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/         # KPIs, graficas, alertas, ultimos movimientos
│   │   │   ├── products/          # CRUD de productos (listado, crear, editar)
│   │   │   ├── categories/        # CRUD de categorias
│   │   │   ├── suppliers/         # CRUD de proveedores
│   │   │   ├── movements/         # Historial + formularios ingreso/egreso
│   │   │   └── reports/           # Reportes con Recharts
│   │   ├── globals.css            # Estilos globales + tema Tailwind v4
│   │   ├── layout.tsx             # Layout raiz con fuentes y providers
│   │   └── page.tsx               # Redirect a /dashboard
│   ├── actions/                   # Server Actions (CRUD, auth, movimientos)
│   ├── components/                # Componentes reutilizables (UI, layout, charts)
│   ├── lib/                       # Supabase client, validaciones Zod, utilidades
│   ├── middleware.ts              # Proteccion de rutas + refresh de sesion
│   └── types/                     # Tipos TypeScript generados de la DB
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Schema completo: tablas, triggers, RLS, seeds
├── docs/
│   └── screenshots/               # Capturas de pantalla para el README
├── .env.local                     # Variables de entorno (no versionado)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🔑 Variables de entorno

Crea un archivo `.env.local` en la raiz del proyecto:

```env
# Modo demo: true para funcionar sin Supabase
NEXT_PUBLIC_DEMO_MODE=false

# Supabase - obtener de https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Solo necesaria para operaciones admin desde el server
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

| Variable | Requerida | Descripcion |
|----------|:---------:|-------------|
| `NEXT_PUBLIC_DEMO_MODE` | Si | `true` para modo demo sin DB, `false` para produccion |
| `NEXT_PUBLIC_SUPABASE_URL` | Solo prod | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Solo prod | Clave publica (anon) de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo prod | Clave privada para operaciones admin del server |

> ⚠️ **Nunca** compartas `SUPABASE_SERVICE_ROLE_KEY`. Esta clave tiene acceso total a la base de datos.

---

## 🚀 Setup rapido

### Requisitos previos

- **Node.js** 18 o superior ([descargar](https://nodejs.org/))
- **Cuenta en Supabase** gratuita ([crear cuenta](https://supabase.com/))

### Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/inventario-pro.git
cd inventario-pro

# 2. Instalar dependencias
npm install

# 3. Crear el proyecto en Supabase
#    Ir a https://supabase.com/dashboard → New Project

# 4. Ejecutar la migracion en Supabase
#    Ir a SQL Editor en el dashboard de Supabase
#    Copiar y pegar el contenido de supabase/migrations/001_initial_schema.sql
#    Hacer click en "Run"

# 5. Configurar variables de entorno
cp .env.local.example .env.local
#    Editar .env.local con las credenciales de tu proyecto Supabase
#    (URL y claves estan en Settings → API del dashboard)

# 6. Crear el primer usuario
#    Ir a Authentication → Users en el dashboard de Supabase
#    Click en "Add User" → completar email y password
#    (Se creara automaticamente un profile con rol "operator")
#    Para asignar rol admin: ir a Table Editor → profiles → editar el campo "role"

# 7. Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

### Modo rapido (sin Supabase)

Si solo queres probar la app sin configurar nada:

```bash
git clone https://github.com/tu-usuario/inventario-pro.git
cd inventario-pro
npm install

# Crear .env.local con una sola linea:
echo "NEXT_PUBLIC_DEMO_MODE=true" > .env.local

npm run dev
```

---

## 🗄️ Base de datos

### Schema

El schema completo esta en [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) e incluye:

**Tablas principales:**

| Tabla | Descripcion |
|-------|-------------|
| `profiles` | Extension de `auth.users` con nombre, avatar y rol |
| `units` | Unidades de medida (metro, kg, unidad, rollo, etc.) |
| `categories` | Categorias de productos con color e icono |
| `suppliers` | Proveedores con datos de contacto |
| `products` | Productos con SKU, precios, stock actual y minimo |
| `inventory_movements` | Registro inmutable de ingresos y egresos |

### Triggers automaticos

| Trigger | Tabla | Funcion |
|---------|-------|---------|
| `on_auth_user_created` | `auth.users` | Crea un `profile` automaticamente al registrar un usuario |
| `on_movement_created` | `inventory_movements` | Actualiza `current_stock` del producto segun el tipo de movimiento |
| `*_updated_at` | Todas | Actualiza el campo `updated_at` automaticamente |

> El trigger de stock valida que no se pueda egresar mas cantidad de la disponible, lanzando una excepcion PostgreSQL.

### Vistas del dashboard

| Vista | Descripcion |
|-------|-------------|
| `low_stock_products` | Productos cuyo stock actual esta por debajo del minimo |
| `today_movements_summary` | Resumen de movimientos del dia actual (cantidad, valor) |
| `stock_by_category` | Stock total y valor por categoria |

### Indices optimizados

- Busqueda full-text en nombre de productos (`gin` con diccionario `spanish`)
- Indice parcial para productos con stock bajo (`WHERE is_active = TRUE`)
- Indices en `created_at DESC` para consultas cronologicas rapidas
- Indices en foreign keys para JOINs eficientes

---

## 🔒 Roles y permisos

La seguridad se implementa a dos niveles:

### 1. Middleware de Next.js (`src/middleware.ts`)

- Verifica la sesion de Supabase en cada request
- Redirige a `/login` si no hay sesion activa
- Refresca el token automaticamente via cookies httpOnly

### 2. Row Level Security (PostgreSQL)

Cada tabla tiene politicas RLS que filtran los datos segun el rol del usuario:

```
admin     → acceso total (CRUD + eliminacion)
operator  → puede ver, crear y editar (no eliminar)
viewer    → solo lectura
```

La funcion `get_user_role()` obtiene el rol del usuario autenticado y se usa en todas las politicas RLS. Los movimientos de inventario son **inmutables**: solo se permite INSERT (no UPDATE ni DELETE), garantizando la integridad del historial.

---

## 🎭 Modo demo

Activar con `NEXT_PUBLIC_DEMO_MODE=true` en `.env.local`.

En este modo:
- No se requiere conexion a Supabase
- Se generan datos realistas de ejemplo (productos, categorias, proveedores, movimientos)
- Todas las funcionalidades de UI estan disponibles
- Los cambios solo persisten durante la sesion del navegador

Ideal para:
- 🧪 Evaluar la aplicacion antes de configurar la base de datos
- 📊 Presentaciones y demos
- 💻 Desarrollo de UI sin depender de servicios externos

---

## 📜 Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:3000` |
| `npm run build` | Genera el build de produccion |
| `npm run start` | Inicia el servidor de produccion |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios grandes, abri un issue primero para discutir la propuesta.

1. Fork del repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de los cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

---

## 📄 Licencia

Este proyecto esta bajo la licencia **MIT**. Ver el archivo [LICENSE](./LICENSE) para mas detalles.

---

<div align="center">

Hecho con ☕ y 🧉 en Argentina

</div>
