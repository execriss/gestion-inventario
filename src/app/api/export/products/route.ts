import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { canUseFeature } from '@/lib/plans'
import { escapeCsvValue, formatNumberFixed } from '@/lib/utils'

export async function GET() {
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

    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories(name), units(name)')
      .eq('is_active', true)
      .order('name')
      .limit(5000)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const headers = [
      'Nombre',
      'SKU',
      'Descripcion',
      'Categoria',
      'Unidad',
      'Stock Actual',
      'Stock Minimo',
      'Precio Costo',
      'Precio Venta',
    ]

    const rows = (products ?? []).map((p: Record<string, unknown>) => {
      const categories = p.categories as { name: string } | null
      const units = p.units as { name: string } | null

      return [
        escapeCsvValue(p.name as string),
        escapeCsvValue(p.sku as string | null),
        escapeCsvValue(p.description as string | null),
        escapeCsvValue(categories?.name),
        escapeCsvValue(units?.name),
        escapeCsvValue(p.current_stock as number),
        escapeCsvValue(p.min_stock as number),
        escapeCsvValue(formatNumberFixed(p.cost_price as number | null)),
        escapeCsvValue(formatNumberFixed(p.sale_price as number | null)),
      ].join(',')
    })

    const csv = '\ufeff' + headers.join(',') + '\n' + rows.join('\n')
    const today = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="productos-${today}.csv"`,
      },
    })
  } catch (error) {
    console.error('[export/products] Error:', error)
    return NextResponse.json({ error: 'Error al generar el archivo' }, { status: 500 })
  }
}
