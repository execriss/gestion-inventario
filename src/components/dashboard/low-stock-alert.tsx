import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LowStockAlertProps {
  products: Array<{
    id: string
    name: string
    sku: string | null
    current_stock: number
    min_stock: number
    category_name: string
    category_color: string
    unit_abbreviation: string
    stock_deficit: number
  }>
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
        <h2 className="text-base font-semibold">Alertas de Stock</h2>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2
            className="h-10 w-10 text-emerald-400 mb-3"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-emerald-400">
            Todo el stock esta al dia
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ningun producto bajo el minimo
          </p>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {products.map((product) => {
            const percentage = product.min_stock === 0
              ? 100
              : Math.min(
                  Math.round((product.current_stock / product.min_stock) * 100),
                  100
                )
            const barColor =
              percentage < 50
                ? 'bg-red-500'
                : percentage < 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'

            return (
              <li
                key={product.id}
                className="rounded-lg border border-border/50 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">
                        {product.sku}
                      </p>
                    )}
                  </div>
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

                {/* Barra de progreso */}
                <div className="space-y-1">
                  <div
                    className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                    role="progressbar"
                    aria-valuenow={product.current_stock}
                    aria-valuemin={0}
                    aria-valuemax={product.min_stock}
                    aria-label={`Stock de ${product.name}: ${product.current_stock} de ${product.min_stock} ${product.unit_abbreviation}`}
                  >
                    <div
                      className={cn('h-full rounded-full transition-all', barColor)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {product.current_stock} / {product.min_stock}{' '}
                    {product.unit_abbreviation}
                    <span className="text-muted-foreground/60 ml-1">
                      (faltan {product.stock_deficit})
                    </span>
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
