'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MovementFiltersProps {
  products: { id: string; name: string }[]
  suppliers: { id: string; name: string }[]
}

export function MovementFilters({ products, suppliers }: MovementFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') ?? ''
  const currentProductId = searchParams.get('product_id') ?? ''
  const currentSupplierId = searchParams.get('supplier_id') ?? ''
  const currentDateFrom = searchParams.get('date_from') ?? ''
  const currentDateTo = searchParams.get('date_to') ?? ''

  const hasActiveFilters =
    currentType !== '' ||
    currentProductId !== '' ||
    currentSupplierId !== '' ||
    currentDateFrom !== '' ||
    currentDateTo !== ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }

      // Reset to page 0 when filters change
      params.delete('page')

      const qs = params.toString()
      router.replace(`/movements${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [searchParams, router]
  )

  const clearAllFilters = useCallback(() => {
    router.replace('/movements', { scroll: false })
  }, [router])

  return (
    <div className="glass-card space-y-4 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="size-4" />
          Filtros
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Type filter */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select
            value={currentType || 'all'}
            onValueChange={(value) =>
              updateFilter('type', value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ingreso">
                <ArrowDownToLine className="size-3.5 text-emerald-400" />
                Ingreso
              </SelectItem>
              <SelectItem value="egreso">
                <ArrowUpFromLine className="size-3.5 text-red-400" />
                Egreso
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product filter */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Producto</Label>
          <Select
            value={currentProductId || 'all'}
            onValueChange={(value) =>
              updateFilter('product_id', value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Supplier filter */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Proveedor</Label>
          <Select
            value={currentSupplierId || 'all'}
            onValueChange={(value) =>
              updateFilter('supplier_id', value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proveedores</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date from */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Fecha desde</Label>
          <Input
            type="date"
            value={currentDateFrom}
            onChange={(e) => updateFilter('date_from', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Date to */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Fecha hasta</Label>
          <Input
            type="date"
            value={currentDateTo}
            onChange={(e) => updateFilter('date_to', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
