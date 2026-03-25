import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Info, Pencil, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DEMO_MODE, DEMO_LOW_STOCK } from '@/lib/demo'
import type { LowStockProduct } from '@/types/database.types'

export default async function AlertsPage() {
  let allProducts: LowStockProduct[] = []

  if (DEMO_MODE) {
    allProducts = DEMO_LOW_STOCK as LowStockProduct[]
  } else {
    const supabase = await createClient()
    const { data } = await supabase
      .from('low_stock_products')
      .select('*')
      .order('current_stock')

    allProducts = data ?? []
  }

  const critical = allProducts.filter((p) => p.current_stock === 0)
  const low = allProducts.filter((p) => p.current_stock > 0)

  const hasCritical = critical.length > 0
  const hasLow = low.length > 0
  const hasAlerts = hasCritical || hasLow

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-lg p-2">
            <ShieldAlert className="size-5 text-cyan-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Alertas de stock
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitoreo en tiempo real de productos que necesitan reposición
            </p>
          </div>
        </div>

        {hasAlerts && (
          <div className="flex items-center gap-2">
            {hasCritical && (
              <Badge className="bg-destructive/15 text-destructive border border-destructive/30 text-xs hover:bg-destructive/25">
                {critical.length} {critical.length === 1 ? 'crítico' : 'críticos'}
              </Badge>
            )}
            {hasLow && (
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-400/30 text-xs hover:bg-amber-500/25">
                {low.length} con stock bajo
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Banner informativo */}
      <div className="glass-card rounded-xl p-4 flex items-start gap-3 border border-cyan-400/10">
        <Info className="size-4 text-cyan-400 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Las alertas se generan automáticamente cuando el stock actual de un producto
          cae por debajo del <span className="text-foreground font-medium">mínimo configurado</span>.
          Editá el producto para ajustar el stock o modificar el umbral.
        </p>
      </div>

      {!hasAlerts ? (
        <div className="glass-card rounded-xl p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-400/10 rounded-full p-3 mb-5">
              <CheckCircle2
                className="size-8 text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <p className="text-lg font-semibold text-cyan-400">
              Todo el stock está al día
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
              Ningún producto se encuentra por debajo del mínimo configurado.
              Seguí monitoreando para mantener tu inventario saludable.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stock Crítico */}
          <section aria-labelledby="critical-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-0.5 rounded-full bg-destructive" aria-hidden="true" />
              <h2
                id="critical-heading"
                className="text-lg font-semibold"
              >
                Stock crítico
              </h2>
              <Badge variant="destructive" className="text-xs">
                {critical.length}
              </Badge>
            </div>

            {hasCritical ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {critical.map((product) => (
                  <AlertCard
                    key={product.id}
                    product={product}
                    variant="critical"
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay productos con stock en cero
                </p>
              </div>
            )}
          </section>

          {/* Stock Bajo */}
          <section aria-labelledby="low-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-0.5 rounded-full bg-amber-500" aria-hidden="true" />
              <h2
                id="low-heading"
                className="text-lg font-semibold"
              >
                Stock bajo
              </h2>
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-400/30 text-xs hover:bg-amber-500/25">
                {low.length}
              </Badge>
            </div>

            {hasLow ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {low.map((product) => (
                  <AlertCard
                    key={product.id}
                    product={product}
                    variant="low"
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay productos con stock bajo
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function AlertCard({
  product,
  variant,
}: {
  product: LowStockProduct
  variant: 'critical' | 'low'
}) {
  const isCritical = variant === 'critical'
  const percentage = product.min_stock > 0
    ? Math.min(Math.round((product.current_stock / product.min_stock) * 100), 100)
    : 0

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-5 space-y-4 border border-l-2',
        isCritical
          ? 'border-destructive/30 border-l-destructive'
          : 'border-amber-400/30 border-l-amber-500'
      )}
    >
      {/* Producto info */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{product.name}</p>
          {product.sku && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {product.sku}
            </p>
          )}
        </div>

        {/* Category badge */}
        <span
          className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${product.category_color}20`,
            color: product.category_color,
            borderColor: `${product.category_color}40`,
            borderWidth: '1px',
          }}
        >
          {product.category_name}
        </span>
      </div>

      {/* Stock info */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Stock actual</span>
          <span
            className={cn(
              'font-bold tabular-nums',
              isCritical ? 'text-destructive' : 'text-amber-400'
            )}
          >
            {product.current_stock} {product.unit_abbreviation}
          </span>
        </div>

        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Stock mínimo</span>
          <span className="font-medium tabular-nums text-foreground">
            {product.min_stock} {product.unit_abbreviation}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={product.current_stock}
          aria-valuemin={0}
          aria-valuemax={product.min_stock}
          aria-label={`Stock de ${product.name}: ${product.current_stock} de ${product.min_stock} ${product.unit_abbreviation}`}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isCritical ? 'bg-destructive' : 'bg-amber-500'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Faltan{' '}
          <span
            className={cn(
              'font-medium',
              isCritical ? 'text-destructive' : 'text-amber-400'
            )}
          >
            {product.stock_deficit} {product.unit_abbreviation}
          </span>{' '}
          para alcanzar el mínimo
        </p>
      </div>

      {/* Action */}
      <Link
        href={`/products/${product.id}/edit`}
        className={cn(
          'flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isCritical
            ? 'bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/30'
            : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-400/30'
        )}
      >
        <Pencil className="size-3.5" aria-hidden="true" />
        Editar producto
      </Link>
    </div>
  )
}
