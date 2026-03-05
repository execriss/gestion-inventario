'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { History } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface MovementTableProps {
  movements: Array<{
    id: string
    type: 'ingreso' | 'egreso'
    quantity: number
    unit_price: number
    total_price: number
    reference: string | null
    notes: string | null
    created_at: string
    products: { name: string; sku: string | null } | null
    suppliers: { name: string } | null
    profiles: { full_name: string | null } | null
  }>
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)

export function MovementTable({ movements }: MovementTableProps) {
  if (movements.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-xl py-16">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <History className="size-7 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No hay movimientos registrados</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Los movimientos de inventario aparecen aqui una vez registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="hidden md:table-cell text-right">Precio Unit.</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Total</TableHead>
              <TableHead className="hidden lg:table-cell">Proveedor</TableHead>
              <TableHead className="hidden lg:table-cell">Referencia</TableHead>
              <TableHead className="hidden md:table-cell">Usuario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id} className="hover:bg-muted/30">
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {format(new Date(movement.created_at), 'dd/MM/yy HH:mm', {
                    locale: es,
                  })}
                </TableCell>

                <TableCell>
                  {movement.type === 'ingreso' ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">
                      Ingreso
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/15 text-red-400 hover:bg-red-500/25">
                      Egreso
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {movement.products?.name ?? 'Producto eliminado'}
                    </span>
                    {movement.products?.sku && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {movement.products.sku}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {movement.quantity.toLocaleString('es-AR')}
                </TableCell>

                <TableCell className="hidden md:table-cell text-right tabular-nums">
                  {formatCurrency(movement.unit_price)}
                </TableCell>

                <TableCell className="hidden sm:table-cell text-right font-medium tabular-nums">
                  {formatCurrency(movement.total_price)}
                </TableCell>

                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {movement.suppliers?.name ?? '—'}
                </TableCell>

                <TableCell className="hidden lg:table-cell max-w-[150px] truncate text-muted-foreground">
                  {movement.reference ?? '—'}
                </TableCell>

                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {movement.profiles?.full_name ?? 'Sistema'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
