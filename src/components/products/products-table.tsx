'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Barcode, MoreHorizontal, Pencil, Search, Trash2, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
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

const BarcodeScanner = dynamic(
  () => import('@/components/barcode/barcode-scanner').then((m) => m.BarcodeScanner),
  { ssr: false }
)

interface ProductsTableProps {
  products: ProductWithRelations[]
  categories: Pick<Category, 'id' | 'name' | 'color'>[]
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = products
    .filter((p) => categoryFilter === 'all' || p.category_id === categoryFilter)
    .filter((p) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q) ||
        (p.barcode ?? '').toLowerCase().includes(q)
      )
    })

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
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o código de barras..."
            className="pl-9 pr-16"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
                <span className="sr-only">Limpiar búsqueda</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setScannerOpen(true)}
              className="text-muted-foreground hover:text-cyan-400"
            >
              <Barcode className="size-4" />
              <span className="sr-only">Escanear código</span>
            </Button>
          </div>
        </div>

        <BarcodeScanner
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScan={(code) => {
            setSearch(code)
            setScannerOpen(false)
            toast.success(`Buscando: ${code}`)
          }}
          title="Buscar por código de barras"
          description="Escaneá el código del producto para buscarlo en el inventario."
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
