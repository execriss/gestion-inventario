import Link from 'next/link'
import { Suspense } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import type { MovementWithRelations } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { MovementTable } from '@/components/movements/movement-table'
import { MovementFilters } from '@/components/movements/movement-filters'
import { ExportCsvButton } from '@/components/movements/export-csv-button'
import {
  DEMO_MODE,
  DEMO_RECENT_MOVEMENTS,
  DEMO_PRODUCTS,
  DEMO_SUPPLIERS,
} from '@/lib/demo'

const PAGE_SIZE = 20

interface SearchParams {
  page?: string
  type?: string
  product_id?: string
  supplier_id?: string
  date_from?: string
  date_to?: string
}

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const {
    page: pageParam,
    type: typeFilter,
    product_id: productIdFilter,
    supplier_id: supplierIdFilter,
    date_from: dateFromFilter,
    date_to: dateToFilter,
  } = await searchParams
  const page = Number(pageParam) || 0

  let movements: MovementWithRelations[]
  let total: number
  let productsList: { id: string; name: string }[] = []
  let suppliersList: { id: string; name: string }[] = []

  if (DEMO_MODE) {
    // Filter demo movements in memory
    let filtered = [...DEMO_RECENT_MOVEMENTS]

    if (typeFilter === 'ingreso' || typeFilter === 'egreso') {
      filtered = filtered.filter((m) => m.type === typeFilter)
    }

    if (dateFromFilter) {
      const from = new Date(dateFromFilter + 'T00:00:00')
      filtered = filtered.filter((m) => new Date(m.created_at) >= from)
    }

    if (dateToFilter) {
      const to = new Date(dateToFilter + 'T23:59:59')
      filtered = filtered.filter((m) => new Date(m.created_at) <= to)
    }

    movements = filtered as unknown as MovementWithRelations[]
    total = filtered.length

    productsList = DEMO_PRODUCTS.map((p) => ({ id: p.id, name: p.name }))
    suppliersList = DEMO_SUPPLIERS.map((s) => ({ id: s.id, name: s.name }))
  } else {
    const supabase = await createClient()

    // Fetch movements, products, and suppliers in parallel
    const [movementsResult, productsResult, suppliersResult] =
      await Promise.all([
        (() => {
          let query = supabase
            .from('inventory_movements')
            .select(
              '*, products(name, sku), suppliers(name), profiles(full_name)',
              { count: 'exact' }
            )
            .order('created_at', { ascending: false })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

          if (typeFilter === 'ingreso' || typeFilter === 'egreso') {
            query = query.eq('type', typeFilter)
          }

          if (productIdFilter) {
            query = query.eq('product_id', productIdFilter)
          }

          if (supplierIdFilter) {
            query = query.eq('supplier_id', supplierIdFilter)
          }

          if (dateFromFilter) {
            query = query.gte('created_at', dateFromFilter + 'T00:00:00')
          }

          if (dateToFilter) {
            query = query.lte('created_at', dateToFilter + 'T23:59:59')
          }

          return query
        })(),
        supabase
          .from('products')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('suppliers')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
      ])

    movements = (movementsResult.data ?? []) as unknown as MovementWithRelations[]
    total = movementsResult.count ?? 0
    productsList = productsResult.data ?? []
    suppliersList = suppliersResult.data ?? []
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Build export URL with active filters
  const exportParams = new URLSearchParams()
  if (typeFilter === 'ingreso' || typeFilter === 'egreso') {
    exportParams.set('type', typeFilter)
  }
  if (productIdFilter) exportParams.set('product_id', productIdFilter)
  if (supplierIdFilter) exportParams.set('supplier_id', supplierIdFilter)
  if (dateFromFilter) exportParams.set('date_from', dateFromFilter)
  if (dateToFilter) exportParams.set('date_to', dateToFilter)
  const exportQs = exportParams.toString()
  const csvExportHref = `/api/export/movements${exportQs ? `?${exportQs}` : ''}`

  function paginationHref(targetPage: number) {
    const params = new URLSearchParams()
    if (typeFilter === 'ingreso' || typeFilter === 'egreso') {
      params.set('type', typeFilter)
    }
    if (productIdFilter) params.set('product_id', productIdFilter)
    if (supplierIdFilter) params.set('supplier_id', supplierIdFilter)
    if (dateFromFilter) params.set('date_from', dateFromFilter)
    if (dateToFilter) params.set('date_to', dateToFilter)
    if (targetPage > 0) params.set('page', String(targetPage))
    const qs = params.toString()
    return `/movements${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-neon-cyan/15">
            <History className="size-5 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Historial de Movimientos
            </h1>
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'movimiento' : 'movimientos'} registrados
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportCsvButton href={csvExportHref} />
          <Button asChild variant="default" className="bg-emerald-600 hover:bg-emerald-500">
            <Link href="/movements/ingreso">
              <ArrowDownToLine className="size-4" />
              Nuevo Ingreso
            </Link>
          </Button>
          <Button asChild variant="destructive">
            <Link href="/movements/egreso">
              <ArrowUpFromLine className="size-4" />
              Nuevo Egreso
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <MovementFilters
          products={productsList}
          suppliers={suppliersList}
        />
      </Suspense>

      {/* Table */}
      <MovementTable movements={movements} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 0 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={paginationHref(page - 1)}>
                  <ChevronLeft className="size-4" />
                  Anterior
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
            )}

            {page < totalPages - 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={paginationHref(page + 1)}>
                  Siguiente
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
