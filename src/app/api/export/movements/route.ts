import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { canUseFeature } from '@/lib/plans'
import { escapeCsvValue, formatNumberFixed } from '@/lib/utils'

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const auth = await requireOrgRole(supabase, 'viewer')
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    // Verificar que el plan incluye exportación CSV
    const { data: org } = await supabase
      .from('organizations')
      .select('plan, plan_expires_at')
      .eq('id', auth.orgId)
      .single()

    if (!org || !canUseFeature(org.plan, org.plan_expires_at, 'csvExport')) {
      return NextResponse.json(
        { error: 'La exportación CSV está disponible en el plan Pro.' },
        { status: 403 },
      )
    }

    const { searchParams } = request.nextUrl
    const typeFilter       = searchParams.get('type')
    const productIdFilter  = searchParams.get('product_id')
    const supplierIdFilter = searchParams.get('supplier_id')
    const dateFromFilter   = searchParams.get('date_from')
    const dateToFilter     = searchParams.get('date_to')

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
      const products  = m.products  as { name: string; sku: string | null } | null
      const suppliers = m.suppliers as { name: string } | null
      const profiles  = m.profiles  as { full_name: string | null } | null

      return [
        escapeCsvValue(formatDate(m.created_at as string)),
        escapeCsvValue(m.type === 'ingreso' ? 'Ingreso' : 'Egreso'),
        escapeCsvValue(products?.name),
        escapeCsvValue(products?.sku),
        escapeCsvValue(m.quantity as number),
        escapeCsvValue(formatNumberFixed(m.unit_price as number)),
        escapeCsvValue(formatNumberFixed(m.total_price as number)),
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
  } catch (error) {
    console.error('[export/movements] Error:', error)
    return NextResponse.json({ error: 'Error al generar el archivo' }, { status: 500 })
  }
}
