import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Package,
  ArrowDownUp,
  Tags,
  Truck,
  Bell,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Wrench,
  HeartPulse,
  ShoppingBag,
  UtensilsCrossed,
  Building2,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingNavbar } from '@/components/landing/navbar'

export const metadata: Metadata = {
  title: 'Centro de Ayuda',
  description:
    'Guía completa de uso de Inventario Pro. Aprende a gestionar productos, movimientos, alertas y reportes.',
}

const QUICK_LINKS = [
  { icon: Package, label: 'Productos', href: '#productos' },
  { icon: ArrowDownUp, label: 'Movimientos', href: '#movimientos' },
  { icon: Tags, label: 'Categorías', href: '#categorias' },
  { icon: Truck, label: 'Proveedores', href: '#proveedores' },
  { icon: Bell, label: 'Alertas', href: '#alertas' },
  { icon: BarChart3, label: 'Reportes', href: '#reportes' },
] as const

const USE_CASES: {
  icon: LucideIcon
  title: string
  bullets: string[]
}[] = [
  {
    icon: Wrench,
    title: 'Ferretería / Repuestos',
    bullets: [
      'Organizá tornillos, herramientas y materiales por categoría',
      'Controlá stock mínimo para no quedarte sin repuestos clave',
      'Registrá proveedores y trazá cada ingreso',
    ],
  },
  {
    icon: HeartPulse,
    title: 'Farmacia / Salud',
    bullets: [
      'Gestioná medicamentos con SKU y precios actualizados',
      'Alertas automáticas cuando un producto está por agotarse',
      'Exportá movimientos para auditorías',
    ],
  },
  {
    icon: ShoppingBag,
    title: 'Indumentaria / Ropa',
    bullets: [
      'Categorizá por tipo de prenda, talle o temporada',
      'Controlá ingresos y egresos por proveedor',
      'Visualizá qué categorías tienen más stock en reportes',
    ],
  },
  {
    icon: Truck,
    title: 'Distribuidora',
    bullets: [
      'Registrá grandes volúmenes de ingreso con referencia de remito',
      'Asociá cada movimiento a un proveedor para trazabilidad',
      'Exportá datos a CSV para integrar con otros sistemas',
    ],
  },
  {
    icon: UtensilsCrossed,
    title: 'Restaurante / Gastronomía',
    bullets: [
      'Controlá insumos perecederos con alertas de stock bajo',
      'Registrá egresos diarios para medir consumo real',
      'Reportes de movimientos para optimizar compras semanales',
    ],
  },
  {
    icon: Building2,
    title: 'Cualquier negocio',
    bullets: [
      'Sistema flexible que se adapta a tu rubro',
      'Multi-usuario con roles para tu equipo',
      'Dashboard con métricas en tiempo real',
    ],
  },
]

const FAQ = [
  {
    question: '¿Es gratis?',
    answer:
      'Sí, el plan gratuito incluye hasta 100 productos, 3 usuarios y 1 organización. Podés usar todas las funciones principales sin costo.',
  },
  {
    question: '¿Puedo invitar a mi equipo?',
    answer:
      'Sí, desde Configuración > Miembros podés generar links de invitación con un rol asignado. Cada miembro accede con su propia cuenta.',
  },
  {
    question: '¿Cómo exporto mis datos?',
    answer:
      'Desde la sección Movimientos o Productos, usá el botón "Exportar CSV". El archivo se descarga directamente a tu dispositivo.',
  },
  {
    question: '¿Los datos son seguros?',
    answer:
      'Sí, cada organización tiene sus datos completamente aislados con Row Level Security en Supabase. Ningún usuario puede ver datos de otra organización.',
  },
  {
    question: '¿Puedo manejar múltiples negocios?',
    answer:
      'Sí, cada cuenta puede pertenecer a múltiples organizaciones. Podés cambiar entre ellas desde el menú principal.',
  },
  {
    question: '¿Qué pasa si el stock llega a cero?',
    answer:
      'El sistema genera una alerta automática visible en el panel de Alertas. También se muestra en el dashboard como notificación prioritaria.',
  },
]

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <Lightbulb
        className="mt-0.5 size-5 shrink-0 text-primary"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-sm leading-relaxed text-primary/90">{children}</p>
    </div>
  )
}

function SectionDoc({
  id,
  icon: Icon,
  title,
  description,
  steps,
  tip,
}: {
  id: string
  icon: LucideIcon
  title: string
  description: string
  steps: string[]
  tip: string
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="glass-card rounded-xl p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon
              className="size-5 text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>

        <p className="mb-4 leading-relaxed text-muted-foreground">
          {description}
        </p>

        <ol className="space-y-2 pl-1">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="neon-text-cyan mt-px flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-xs font-bold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <Tip>{tip}</Tip>
      </div>
    </section>
  )
}

export default function AyudaPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <LandingNavbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="grid-bg relative flex min-h-[50svh] items-center justify-center px-4 pt-16">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 40%, oklch(0.73 0.19 196 / 8%) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Centro de <span className="neon-text-cyan">Ayuda</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Todo lo que necesitas saber para aprovechar Inventario Pro al
            maximo. Guias rapidas, documentacion y respuestas a tus dudas.
          </p>
        </div>
      </section>

      {/* ── GUIAS RAPIDAS ────────────────────────────── */}
      <section className="relative px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Guias rapidas
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="glass-card group flex flex-col items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:border-primary/20 hover:bg-white/[0.06]"
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <link.icon
                    className="size-5 text-primary"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTACION DETALLADA ──────────────────── */}
      <section className="relative px-4 py-16 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 40% at 50% 30%, oklch(0.67 0.22 285 / 4%) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Documentacion detallada
          </h2>

          <div className="space-y-6">
            <SectionDoc
              id="productos"
              icon={Package}
              title="Productos"
              description="Gestioná tu catálogo completo de productos con toda la información que necesitas: SKU, precios de compra y venta, stock mínimo, imagen, categoría y unidad de medida."
              steps={[
                'Ingresá a la sección "Productos" desde el menú lateral.',
                'Hacé clic en "Nuevo producto" para abrir el formulario.',
                'Completá los datos: nombre, SKU, precio de costo, precio de venta y stock mínimo.',
                'Seleccioná una categoría y unidad de medida (se crean automáticamente al registrar tu organización).',
                'Opcionalmente, subí una imagen del producto.',
                'Guardá el producto. Ya aparece en tu inventario.',
              ]}
              tip="Configurar el stock mínimo activa alertas automáticas cuando el stock baja de ese valor. No lo dejes en cero."
            />

            <SectionDoc
              id="movimientos"
              icon={ArrowDownUp}
              title="Movimientos de Stock"
              description="Registrá cada entrada y salida de mercadería con trazabilidad completa. Cada movimiento queda asociado a un producto, cantidad, precio unitario, proveedor, referencia y el usuario que lo registró."
              steps={[
                'Ingresá a "Movimientos" desde el menú lateral.',
                'Hacé clic en "Nuevo movimiento".',
                'Seleccioná el tipo: Ingreso (entrada de stock) o Egreso (salida de stock).',
                'Elegí el producto, la cantidad y opcionalmente el precio unitario.',
                'Para ingresos, podés asociar un proveedor y un número de referencia (remito, factura, etc.).',
                'Confirmá el movimiento. El stock del producto se actualiza automáticamente.',
              ]}
              tip="Podés exportar todos los movimientos a CSV desde el botón de exportación en la parte superior de la tabla."
            />

            <SectionDoc
              id="categorias"
              icon={Tags}
              title="Categorias"
              description="Organizá tus productos en categorías para facilitar la búsqueda, el filtrado y la visualización en reportes. Cada categoría tiene nombre, color e ícono personalizables."
              steps={[
                'Ingresá a "Categorías" desde el menú lateral.',
                'Hacé clic en "Nueva categoría".',
                'Elegí un nombre descriptivo (ej: "Herramientas", "Electrónica", "Alimentos").',
                'Seleccioná un color y un ícono para identificarla visualmente.',
                'Guardá la categoría. Ya podés asignarla a productos.',
              ]}
              tip="Las categorías se usan en los reportes para agrupar el stock. Cuanto mejor organizadas estén, más útiles serán tus gráficos."
            />

            <SectionDoc
              id="proveedores"
              icon={Truck}
              title="Proveedores"
              description="Registrá tus proveedores con sus datos de contacto para asociarlos a los movimientos de ingreso y mantener trazabilidad de dónde viene cada producto."
              steps={[
                'Ingresá a "Proveedores" desde el menú lateral.',
                'Hacé clic en "Nuevo proveedor".',
                'Completá el nombre, teléfono, email y dirección del proveedor.',
                'Guardá el proveedor. Ya podés seleccionarlo al registrar ingresos de stock.',
              ]}
              tip="Asociar proveedores a cada ingreso te permite saber exactamente de dónde vino cada lote de productos."
            />

            <SectionDoc
              id="alertas"
              icon={Bell}
              title="Alertas de Stock"
              description="El sistema monitorea automáticamente el stock de todos tus productos. Cuando el stock actual es igual o menor al stock mínimo configurado, se genera una alerta visible en el panel dedicado."
              steps={[
                'Configurá el stock mínimo en cada producto (sección Productos > editar).',
                'El sistema compara automáticamente el stock actual vs. el mínimo.',
                'Cuando un producto cae por debajo, aparece en el panel de "Alertas".',
                'Las alertas se ordenan por prioridad según el déficit de stock.',
                'Registrá un ingreso del producto para resolver la alerta.',
              ]}
              tip="Configurá el stock mínimo en cada producto para que el sistema te avise antes de quedarte sin mercadería."
            />

            <SectionDoc
              id="reportes"
              icon={BarChart3}
              title="Reportes"
              description="Visualizá el estado de tu inventario con gráficos interactivos. Analizá movimientos de los últimos 30 días, stock por categoría y stock individual de cada producto."
              steps={[
                'Ingresá a "Reportes" desde el menú lateral.',
                'Revisá el gráfico de movimientos: compará ingresos vs. egresos de los últimos 30 días.',
                'Consultá el stock por categoría: un gráfico de barras ordenado de mayor a menor.',
                'Usá el gráfico de productos para ver el stock individual con filtro multi-select.',
                'Hacé clic en las leyendas de los gráficos para mostrar u ocultar series.',
              ]}
              tip="Podés filtrar qué productos ver en el gráfico de productos para enfocarte en los que más te importan."
            />
          </div>
        </div>
      </section>

      {/* ── CASOS DE USO ─────────────────────────────── */}
      <section className="relative px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ideal para tu negocio
            </h2>
            <p className="mt-3 text-muted-foreground">
              Inventario Pro se adapta a cualquier rubro que necesite control de
              stock.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((useCase) => (
              <article
                key={useCase.title}
                className="glass-card group rounded-xl p-6 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <useCase.icon
                      className="size-5 text-primary"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {useCase.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {useCase.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50" aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="relative px-4 py-16 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 40% at 50% 50%, oklch(0.73 0.19 196 / 4%) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Preguntas frecuentes
          </h2>

          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.question}
                className="glass-card group rounded-xl transition-all duration-200 hover:border-primary/20 [&[open]]:border-primary/20 [&[open]]:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-sm font-medium text-foreground marker:[content:''] [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────── */}
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
            ¿Listo para empezar?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Crea tu cuenta en segundos y empeza a controlar tu inventario hoy.
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
            ¿Ya tenes cuenta?{' '}
            <Link
              href="/login"
              className="text-primary transition-colors hover:text-primary/80"
            >
              Iniciar sesion
            </Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link href="/" className="flex items-center gap-2">
              <span className="neon-text-cyan text-sm font-bold tracking-wider">
                INVENTARIO PRO
              </span>
            </Link>
            <p className="text-xs text-muted-foreground">
              Gestion de inventario simple, potente y en tiempo real.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6" aria-label="Footer">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Inicio
            </Link>
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

        <div className="mx-auto mt-8 max-w-6xl border-t border-white/[0.04] pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Inventario Pro. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
