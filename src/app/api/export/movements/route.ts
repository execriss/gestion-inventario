import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '0.00'
  return n.toFixed(2)
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const typeFilter = searchParams.get('type')
  const productIdFilter = searchParams.get('product_id')
  const supplierIdFilter = searchParams.get('supplier_id')
  const dateFromFilter = searchParams.get('date_from')
  const dateToFilter = searchParams.get('date_to')

  let query = supabase
    .from('inventory_movements')
    .select('*, products(name, sku), suppliers(name), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5000)

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

  const { data: movements, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const headers = [
    'Fecha',
    'Tipo',
    'Producto',
    'SKU',
    'Cantidad',
    'Precio Unitario',
    'Total',
    'Proveedor',
    'Referencia',
    'Usuario',
  ]

  const rows = (movements ?? []).map((m: Record<string, unknown>) => {
    const products = m.products as { name: string; sku: string | null } | null
    const suppliers = m.suppliers as { name: string } | null
    const profiles = m.profiles as { full_name: string | null } | null

    return [
      escapeCsvValue(formatDate(m.created_at as string)),
      escapeCsvValue(m.type === 'ingreso' ? 'Ingreso' : 'Egreso'),
      escapeCsvValue(products?.name),
      escapeCsvValue(products?.sku),
      escapeCsvValue(m.quantity as number),
      escapeCsvValue(formatNumber(m.unit_price as number)),
      escapeCsvValue(formatNumber(m.total_price as number)),
      escapeCsvValue(suppliers?.name),
      escapeCsvValue(m.reference as string | null),
      escapeCsvValue(profiles?.full_name),
    ].join(',')
  })

  const csv = '\ufeff' + headers.join(',') + '\n' + rows.join('\n')

  const today = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="movimientos-${today}.csv"`,
    },
  })
}
