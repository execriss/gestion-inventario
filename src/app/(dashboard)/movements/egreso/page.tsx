import Link from 'next/link'
import { ArrowLeft, ArrowUpFromLine } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { MovementForm } from '@/components/movements/movement-form'
import { DEMO_MODE, DEMO_PRODUCTS } from '@/lib/demo'

type ProductOption = {
  id: string
  name: string
  sku: string | null
  current_stock: number
  units: { abbreviation: string } | null
  categories: { name: string; color: string } | null
}

export default async function EgresoPage() {
  let products: ProductOption[]

  if (DEMO_MODE) {
    products = DEMO_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      current_stock: p.current_stock,
      units: p.units ? { abbreviation: p.units.abbreviation } : null,
      categories: p.categories ? { name: p.categories.name, color: p.categories.color } : null,
    }))
  } else {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('id, name, sku, current_stock, units(abbreviation), categories(name, color)')
      .eq('is_active', true)
      .order('name')
    products = (data ?? []) as unknown as ProductOption[]
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/movements">
            <ArrowLeft className="size-4" />
            Historial
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/15">
          <ArrowUpFromLine className="size-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registrar Egreso</h1>
          <p className="text-sm text-muted-foreground">
            Registra una salida de stock del inventario
          </p>
        </div>
      </div>

      <MovementForm type="egreso" products={products} />
    </div>
  )
}
