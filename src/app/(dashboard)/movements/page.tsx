import Link from 'next/link'
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
import { DEMO_MODE, DEMO_RECENT_MOVEMENTS } from '@/lib/demo'

const PAGE_SIZE = 20

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>
}) {
  const { page: pageParam, type: typeFilter } = await searchParams
  const page = Number(pageParam) || 0

  let movements: MovementWithRelations[]
  let total: number

  if (DEMO_MODE) {
    const filtered =
      typeFilter === 'ingreso' || typeFilter === 'egreso'
        ? DEMO_RECENT_MOVEMENTS.filter(m => m.type === typeFilter)
        : DEMO_RECENT_MOVEMENTS
    movements = filtered as unknown as MovementWithRelations[]
    total = filtered.length
  } else {
    const supabase = await createClient()

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

    const { data, count } = await query
    movements = (data ?? []) as unknown as MovementWithRelations[]
    total = count ?? 0
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function filterHref(filter?: string) {
    const params = new URLSearchParams()
    if (filter) params.set('type', filter)
    const qs = params.toString()
    return `/movements${qs ? `?${qs}` : ''}`
  }

  function paginationHref(targetPage: number) {
    const params = new URLSearchParams()
    if (typeFilter === 'ingreso' || typeFilter === 'egreso') {
      params.set('type', typeFilter)
    }
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

        <div className="flex items-center gap-2">
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

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Link href={filterHref()}>
          <Button
            variant={!typeFilter ? 'default' : 'outline'}
            size="sm"
          >
            Todos
          </Button>
        </Link>
        <Link href={filterHref('ingreso')}>
          <Button
            variant={typeFilter === 'ingreso' ? 'default' : 'outline'}
            size="sm"
            className={
              typeFilter === 'ingreso'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : ''
            }
          >
            <ArrowDownToLine className="size-3.5" />
            Ingresos
          </Button>
        </Link>
        <Link href={filterHref('egreso')}>
          <Button
            variant={typeFilter === 'egreso' ? 'default' : 'outline'}
            size="sm"
            className={
              typeFilter === 'egreso'
                ? 'bg-destructive hover:bg-destructive/90'
                : ''
            }
          >
            <ArrowUpFromLine className="size-3.5" />
            Egresos
          </Button>
        </Link>
      </div>

      {/* Table */}
      <MovementTable movements={movements} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {page + 1} de {totalPages}
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
