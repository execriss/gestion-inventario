'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import type { Category, ProductWithRelations } from '@/types/database.types'
import { deleteProduct } from '@/actions/products.actions'
import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StockBadge } from './stock-badge'

interface ProductsTableProps {
  products: ProductWithRelations[]
  categories: Pick<Category, 'id' | 'name' | 'color'>[]
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered =
    categoryFilter === 'all'
      ? products
      : products.filter((p) => p.category_id === categoryFilter)

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    setDeletingId(id)
    const result = await deleteProduct(id)
    setDeletingId(null)

    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Producto eliminado')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="hidden sm:table-cell">SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Unidad</TableHead>
              <TableHead className="text-right">Stock Actual</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Stock Mín.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell text-right">Precio Costo</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30">
                  <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                    {product.sku ?? '—'}
                  </TableCell>
                  <TableCell className="max-w-[140px] sm:max-w-none">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium truncate">{product.name}</span>
                      <Badge
                        variant="outline"
                        className="w-fit text-xs"
                        style={{
                          borderColor: product.categories.color,
                          color: product.categories.color,
                        }}
                      >
                        {product.categories.name}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {product.units.abbreviation}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {product.current_stock}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right text-muted-foreground tabular-nums">
                    {product.min_stock}
                  </TableCell>
                  <TableCell>
                    <StockBadge
                      currentStock={product.current_stock}
                      minStock={product.min_stock}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums">
                    {product.cost_price != null
                      ? formatCurrency(product.cost_price)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${product.id}/edit`}>
                            <Pencil className="size-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          {deletingId === product.id
                            ? 'Eliminando...'
                            : 'Eliminar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}
