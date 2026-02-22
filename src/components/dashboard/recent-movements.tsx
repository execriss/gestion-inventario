import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowDownToLine, ArrowUpFromLine, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface RecentMovementsProps {
  movements: Array<{
    id: string
    type: 'ingreso' | 'egreso'
    quantity: number
    total_price: number
    created_at: string
    products: { name: string; sku: string | null } | null
    profiles: { full_name: string | null } | null
  }>
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

export function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Ultimos Movimientos</h2>
        <Link
          href="/movements"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todo
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {movements.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay movimientos registrados
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiempo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cant.</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(movement.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </TableCell>
                <TableCell>
                  {movement.type === 'ingreso' ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                      <ArrowDownToLine className="h-3 w-3 mr-1" aria-hidden="true" />
                      Ingreso
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">
                      <ArrowUpFromLine className="h-3 w-3 mr-1" aria-hidden="true" />
                      Egreso
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">
                      {movement.products?.name ?? 'Producto eliminado'}
                    </p>
                    {movement.products?.sku && (
                      <p className="text-xs text-muted-foreground">
                        {movement.products.sku}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">
                  {movement.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(movement.total_price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
