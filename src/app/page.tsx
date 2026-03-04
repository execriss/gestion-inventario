import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Box,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Users,
  Bell,
  Download,
  UserPlus,
  TrendingUp,
  Check,
  Building2,
  Activity,
  FileBarChart,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LandingNavbar } from '@/components/landing/navbar'

export const metadata: Metadata = {
  title: 'Inventario Pro — Sistema de gestión de inventario',
  description: 'Controlá tu stock con precisión. Sistema SaaS multi-empresa con alertas de stock, reportes y exportación. Gratis para empezar.',
  openGraph: {
    title: 'Inventario Pro — Sistema de gestión de inventario',
    description: 'Controlá tu stock con precisión. Sistema SaaS multi-empresa con alertas de stock, reportes y exportación.',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inventario Pro',
    description: 'Controlá tu stock con precisión. Sistema SaaS multi-empresa.',
  },
  alternates: {
    canonical: '/',
  },
}

/* ================================================================
   FEATURES DATA
   ================================================================ */
const FEATURES = [
  {
    icon: Package,
    title: 'Gestión de Productos',
    description:
      'SKU, precios de compra y venta, categorías y unidades de medida. Todo organizado y accesible.',
  },
  {
    icons: [ArrowDownToLine, ArrowUpFromLine],
    title: 'Movimientos de Stock',
    description:
      'Registra ingresos y egresos con auditoría completa. Cada movimiento queda trazado con fecha, usuario y motivo.',
  },
  {
    icon: BarChart3,
    title: 'Reportes Avanzados',
    description:
      'Análisis de los últimos 30 días con gráficas interactivas. Visualiza tendencias y toma mejores decisiones.',
  },
  {
    icon: Users,
    title: 'Multi-empresa',
    description:
      'Cada organización tiene su espacio aislado con roles de acceso. Administra multiples negocios desde una cuenta.',
  },
  {
    icon: Bell,
    title: 'Alertas de Stock',
    description:
      'Notificaciones automáticas cuando el stock baja del mínimo configurado. Nunca te quedes sin mercadería.',
  },
  {
    icon: Download,
    title: 'Exportación',
    description:
      'Descarga tus datos en CSV o PDF cuando quieras. Reportes listos para compartir o archivar.',
  },
] as const

const STEPS = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Registra tu empresa',
    description:
      'Crea tu cuenta y configura tu organización en minutos. Sin tarjeta de crédito.',
  },
  {
    icon: Package,
    number: '02',
    title: 'Carga tus productos',
    description:
      'Definí categorías, unidades y productos con sus precios de compra y venta.',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Gestiona el stock',
    description:
      'Registra movimientos y monitorea alertas en tiempo real desde el dashboard.',
  },
] as const

const FREE_FEATURES = [
  'Hasta 100 productos',
  '1 organización',
  '3 usuarios',
  'Exportación CSV',
  'Alertas basicas',
]


/* ================================================================
   PAGE
   ================================================================ */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <LandingNavbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="grid-bg relative flex min-h-[100svh] items-center justify-center px-4 pt-16">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 40%, oklch(0.73 0.19 196 / 8%) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge
            variant="outline"
            className="mb-6 border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-wide text-primary"
          >
            <Sparkles className="size-3" aria-hidden="true" />
            Sistema de gestión multi-empresa
          </Badge>

          {/* Headline */}
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Controla tu inventario{' '}
            <span className="neon-text-cyan">con precisión</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            La plataforma que centraliza productos, movimientos y reportes en
            un solo lugar. Diseñada para negocios que necesitan trazabilidad
            completa y control en tiempo real.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="h-12 bg-gradient-to-r from-cyan-500 to-blue-600 px-8 text-base font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              <Link href="/register">
                Empezar gratis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/login">Ver demo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-8">
            {[
              { icon: Building2, label: 'Multi-empresa' },
              { icon: Activity, label: 'Tiempo real' },
              { icon: FileBarChart, label: 'Reportes' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon
                    className="size-5 text-primary"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section id="caracteristicas" className="relative px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Todo lo que necesitas
            </h2>
            <p className="mt-4 text-muted-foreground">
              Herramientas completas para gestionar tu inventario de principio a
              fin, sin complicaciones.
            </p>
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="glass-card group rounded-xl p-6 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06]"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  {'icons' in feature ? (
                    <div className="flex -space-x-1">
                      {feature.icons.map((Icon, i) => (
                        <Icon
                          key={i}
                          className="size-4 text-primary"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  ) : (
                    <feature.icon
                      className="size-5 text-primary"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section id="como-funciona" className="relative px-4 py-24 sm:py-32">
        {/* Subtle background shift */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 40% at 50% 50%, oklch(0.67 0.22 285 / 4%) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              En 3 pasos estas operando
            </h2>
            <p className="mt-4 text-muted-foreground">
              Configura tu negocio y empieza a gestionar inventario en minutos.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
            {/* Connector line (desktop only) */}
            <div
              className="pointer-events-none absolute left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] top-[44px] hidden h-px md:block"
              aria-hidden="true"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, oklch(0.73 0.19 196 / 30%) 20%, oklch(0.73 0.19 196 / 30%) 80%, transparent 100%)',
              }}
            />

            {STEPS.map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                {/* Number + icon */}
                <div className="relative mb-5">
                  <div className="flex size-[88px] items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                    <step.icon
                      className="size-8 text-primary"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                  {/* Step number */}
                  <span className="neon-text-cyan absolute -right-3 -top-3 flex size-8 items-center justify-center rounded-full border border-primary/30 bg-background text-xs font-bold">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────── */}
      <section id="precios" className="relative px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          {/* Section header */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Planes simples y transparentes
            </h2>
            <p className="mt-4 text-muted-foreground">
              Empieza gratis y escala cuando lo necesites. Sin sorpresas.
            </p>
          </div>

          {/* Pricing card */}
          <div className="mx-auto max-w-sm">
            {/* FREE */}
            <div className="glass-card neon-glow-cyan flex flex-col rounded-2xl border-primary/30 p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Gratuito
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    $0
                  </span>
                  <span className="text-sm text-muted-foreground">/ mes</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Para negocios que están empezando a organizar su inventario.
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {FREE_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check
                      className="size-4 shrink-0 text-primary"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                asChild
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                <Link href="/register">Empezar gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────── */}
      <section className="relative px-4 py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 50%, oklch(0.67 0.22 285 / 6%) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Listo para tomar el control de tu inventario?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Únete a los negocios que ya gestionan su stock de forma
            inteligente.
          </p>

          <Button
            size="lg"
            asChild
            className="mt-8 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 px-10 text-base font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            <Link href="/register">
              Crear cuenta gratis
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            Sin tarjeta de credito. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
          {/* Logo + description */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2">
              <Box className="size-5 text-primary" strokeWidth={1.5} />
              <span className="neon-text-cyan text-sm font-bold tracking-wider">
                INVENTARIO PRO
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Gestión de inventario simple, potente y en tiempo real.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6" aria-label="Footer">
            <a
              href="#caracteristicas"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Características
            </a>
            <a
              href="#precios"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Precios
            </a>
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Registrarse
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/[0.04] pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 Inventario Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
