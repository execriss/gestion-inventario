# AGENTS.md — Inventario Pro

Guia para agentes de IA (y desarrolladores) que trabajan en este proyecto. Lee esto antes de tocar codigo.

## Que es

Sistema de gestion de inventario para fabrica de ropa y estampados. Multi-tenant, con auth, dashboard en tiempo real, movimientos de stock, reportes, plan Pro (MercadoPago), API REST publica y escaneo de codigos de barras. Deployado en Cloudflare Workers via OpenNext.

**URL produccion:** https://inventario.exegestion.com
**API REST publica:** https://inventario-api.exegestion.com
**Repo:** https://github.com/execriss/gestion-inventario (branch `main`)

## Stack

- **Next.js 16.1.6** (App Router, Server Actions, Middleware) — pinneado exacto, NO subir de version sin leer la seccion de deploy
- **React 19.2.3** + **TypeScript 5**
- **Supabase** (Auth SSR + PostgreSQL + RLS) — multi-tenant con `organizations`
- **Tailwind CSS 4** + **shadcn/ui 3.8** (Radix UI)
- **OpenNext Cloudflare 1.17.1** + **wrangler 4.69.0** — pinneados exactos, NO subir (ver seccion deploy)
- **MercadoPago SDK** (plan Pro), **Resend** (email), **Recharts** (charts), **ZXing** (barcodes)
- **Zod 4** + **React Hook Form 7** (validacion)

## Estructura

```
src/
├── app/
│   ├── (auth)/login/, /register          # paginas publicas de auth
│   ├── (dashboard)/                      # rutas protegidas (requieren sesion)
│   │   ├── dashboard/  products/  categories/  suppliers/
│   │   ├── movements/  movements/ingreso  movements/egreso
│   │   ├── reports/  alerts/  onboarding/
│   │   └── settings/  (profile, organization, members, api, upgrade)
│   ├── api/
│   │   ├── health/                       # healthcheck publico
│   │   ├── export/{movements,products}/  # export CSV (auth)
│   │   ├── subscribe/                    # newsletter
│   │   └── webhooks/mercadopago/         # webhook MP (publico)
│   ├── ayuda/                            # pagina de ayuda publica
│   └── layout.tsx, page.tsx, middleware via src/middleware.ts
├── actions/                              # Server Actions (CRUD, auth, mp, orgs, invitations, api-keys)
├── components/                           # UI + layout + charts (shadcn)
├── lib/
│   ├── supabase/                         # clients server/browser/admin
│   ├── email/  validations/  demo.ts
│   ├── mercadopago.ts  plans.ts  utils.ts
├── middleware.ts                         # protege rutas + refresh sesion Supabase
└── types/                                # tipos generados de Supabase

api-worker/                               # Worker separado: API REST publica (plan Pro)
├── src/index.js                          # usa SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
└── wrangler.toml                         # name: inventario-api, ruta: inventario-api.exegestion.com

supabase/migrations/                      # 001-008: schema, multi-tenant, seed, storage, views, email_alerts, plan, api_keys, barcode
scripts/keepalive.js                      # Playwright: login + navega /products (evita pausa Supabase)
.github/workflows/
├── deploy.yml                            # deploy automatico a Cloudflare desde Ubuntu
└── keepalive.yml                         # cron semanal anti-pausa Supabase
```

## Comandos

```bash
npm run dev       # desarrollo en localhost:3000
npm run lint      # ESLint
npm run build     # build de Next (no el de OpenNext)

# Cloudflare (ver seccion Deploy antes de correr estos):
npm run clean     # borra .next, .open-next, .wrangler (artefactos stale)
npm run preview   # clean + build OpenNext + preview local (wrangler dev)
npm run deploy    # clean + build OpenNext + wrangler deploy  ⚠️ NO USAR desde Windows
```

**No hay tests automatizados.** El lint es `npm run lint`. Verificacion manual: `curl https://inventario.exegestion.com/api/health`.

## Variables de entorno

Locales (`.env.local`): `NEXT_PUBLIC_DEMO_MODE`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAIL`, `MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`.

En produccion (Cloudflare Worker `inventario-pro`): mismas, configuradas como **secrets** via `npx wrangler secret put NOMBRE`. Ademas `NEXT_PUBLIC_DEMO_MODE=false` como var plain en `wrangler.jsonc`. Hay una extra `SUPABASE_URL` (sin prefijo) que usa el api-worker.

El **api-worker** usa `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (secrets propios, ver `api-worker/wrangler.toml`).

## Deploy — LEER ESTO ANTES DE TOCAR DEPS O DEPLOYAR

### Regla critica: NUNCA subir wrangler ni @opennextjs/cloudflare de version

El toolchain esta pinneado exacto por una razon:

- `wrangler: 4.69.0` + `@cloudflare/unenv-preset: 2.14.0` → **funciona** (es el de produccion v44)
- `wrangler >= 4.75` trae `@cloudflare/unenv-preset >= 2.15` → **rompe el runtime** con `TypeError: components.ComponentMod.handler is not a function` en TODAS las rutas

Un `npm install` con caret (`^4.69.0`) puede bumpear wrangler silenciosamente y romper produccion. **Si `package.json` o `package-lock.json` aparecen modificados sin commitear, revisar el diff antes de deployar.** Los caret de wrangler/opennext ya fueron cambiados a versiones pinneadas exactas para evitar drift.

### Deployar SIEMPRE via GitHub Actions (Ubuntu)

**No deployar desde Windows con `npm run deploy` o `wrangler deploy`.** Hay un bug de wrangler 4.69 en Windows: el path `resvg.wasm?module` (el `?` es invalido en filenames de Windows) hace que el deploy falle con `ENOENT`. En Linux (Ubuntu del CI) esto no pasa.

**Proceso de deploy correcto:**
1. Commitear y pushear a `main`
2. El workflow `.github/workflows/deploy.yml` se dispara solo: `npm ci` (lockfile exacto) → `clean` → `opennextjs-cloudflare build` → `wrangler deploy`
3. Seguir en la tab Actions de GitHub o con `gh run watch`

Requiere el secret `CLOUDFLARE_API_TOKEN` configurado en el repo (ya hecho). Si hay que deployar manual, usar `gh workflow run deploy.yml`.

### Rollback de emergencia

Si produccion cae despues de un deploy:
```bash
npx wrangler rollback <version-id> --name inventario-pro -y
```
Listar versiones: `npx wrangler versions list` o via API. La v44 (`b88ddac4-db45-45a0-9a70-da32aeeda0bb`, 12 May 2026) es la ultima estable conocida pre-incidente.

### Verificar despues de un deploy

```bash
curl.exe -sS -o NUL -w "%{http_code}" https://inventario.exegestion.com/login
curl.exe -sS -o NUL -w "%{http_code}" https://inventario.exegestion.com/api/health
```
Ambas deben dar 200. Si dan 500, capturar el error con `npx wrangler tail inventario-pro --format json` mientras se hace un request.

## Incidente historico (25 Jun 2026) — NO REPETIR

**Sintoma:** 500 Internal Server Error en todas las rutas de produccion despues de un deploy manual desde Windows.

**Causa raiz:** Un `npm install` sin commitear bumpéo `wrangler` 4.69→4.90, que trajo `@cloudflare/unenv-preset` 2.14→2.16. La version 2.16 de unenv-preset rompe como se cargan los modulos de componentes de Next.js al re-bundlear el worker: `TypeError: components.ComponentMod.handler is not a function`. Afectaba a todas las rutas (no al codigo de la app).

**Diagnostico:**
- `wrangler tail inventario-pro --format json` mostro el error exacto
- Comparar bindings/versions entre la v44 (buena) y v49 (rota) via API de Cloudflare: identicos → el problema era el bundle, no config
- `git diff package-lock.json` revelo el bump de unenv-preset 2.14→2.16

**Fix aplicado:**
1. Rollback inmediato a v44 con `wrangler rollback` → produccion restaurada
2. Revert `package.json`/`package-lock.json` al estado commiteado + `npm ci`
3. Creado workflow `deploy.yml` que deploya desde Ubuntu (evita bug de Windows)
4. Pinneo exacto de versiones + script `clean` para evitar builds corruptos

**Lecciones:**
- Nunca deployar desde Windows con este toolchain
- Siempre `npm ci` (no `npm install`) antes de build para respetar el lockfile
- Commitear `package.json` y `package-lock.json` juntos; revisar diffs de deps antes de deployar
- Capturar errores de runtime con `wrangler tail`, no solo mirar el status code

## Convenciones

- **Server Actions** en `src/actions/*.actions.ts` — un archivo por dominio (products, movements, auth, etc.)
- **Validacion** con Zod en `src/lib/validations/` — schemas compartidos entre cliente y server
- **Supabase:** 3 clients en `src/lib/supabase/` — browser, server (cookies), admin (service role, solo server)
- **Rutas publicas** definidas en `src/middleware.ts`: `/`, `/login`, `/register`, `/invite/*`, `/ayuda`, `/api/health`, `/api/webhooks/*`. El resto requiere sesion.
- **Roles:** admin / operator / viewer — aplicados via RLS en Postgres, no solo en UI
- **Movimientos** son inmutables (solo INSERT, no UPDATE/DELETE) — garantiza integridad del historial
- **Multi-tenant:** todo scoped por `organization_id` con RLS
- **No usar emojis** en codigo a menos que se pida explicitamente
- **No agregar comentarios** salvo que se pidan

## Migraciones Supabase

Estan en `supabase/migrations/` (001-008). Se aplican manualmente via SQL Editor del dashboard de Supabase, no hay CLI de Supabase configurado. Si se agrega una migracion nueva, numerarla con el siguiente numero libre y documentarla aca:

- `001_initial_schema` — tablas base, triggers, RLS, seeds
- `002_multi_tenant` — organizations, memberships, scoping por org
- `003_seed_demo_user` / `004_seed_test_user` — usuarios de prueba
- `004_storage_setup` — buckets de Storage
- `005_fix_views_security_invoker` / `005_org_email_alerts` — vistas y alertas
- `006_plan_expires_at` — expiracion de plan
- `007_api_keys` — API keys para el api-worker (plan Pro)
- `008_barcode` — escaneo de codigos de barras

## Keep-alive Supabase

Supabase pausa proyectos free por inactividad. El workflow `.github/workflows/keepalive.yml` corre los lunes 20:00 ART (cron `0 23 * * 1`), hace login con Playwright y navega a `/products` para mantenerlo activo. Si falla, revisar `scripts/keepalive.js` y las credenciales de demo.
