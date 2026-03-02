import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '0.00'
  return n.toFixed(2)
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
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
      escapeCsvValue(formatNumber(p.cost_price as number | null)),
      escapeCsvValue(formatNumber(p.sale_price as number | null)),
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
}
