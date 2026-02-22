import Link from 'next/link'
import { ArrowDownToLine, ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { MovementForm } from '@/components/movements/movement-form'
import { DEMO_MODE, DEMO_PRODUCTS, DEMO_SUPPLIERS } from '@/lib/demo'

type ProductOption = {
  id: string
  name: string
  sku: string | null
  current_stock: number
  units: { abbreviation: string } | null
  categories: { name: string; color: string } | null
}

type SupplierOption = {
  id: string
  name: string
}

export default async function IngresoPage() {
  let products: ProductOption[]
  let suppliers: SupplierOption[]

  if (DEMO_MODE) {
    products = DEMO_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      current_stock: p.current_stock,
      units: p.units ? { abbreviation: p.units.abbreviation } : null,
      categories: p.categories ? { name: p.categories.name, color: p.categories.color } : null,
    }))
    suppliers = DEMO_SUPPLIERS.map(s => ({ id: s.id, name: s.name }))
  } else {
    const supabase = await createClient()
    const [productsResult, suppliersResult] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, sku, current_stock, units(abbreviation), categories(name, color)')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('suppliers')
        .select('id, name')
        .eq('is_active', true)
        .order('name'),
    ])
    products = (productsResult.data ?? []) as unknown as ProductOption[]
    suppliers = (suppliersResult.data ?? []) as SupplierOption[]
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
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
          <ArrowDownToLine className="size-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registrar Ingreso</h1>
          <p className="text-sm text-muted-foreground">
            Agrega stock al inventario
          </p>
        </div>
      </div>

      <MovementForm type="ingreso" products={products} suppliers={suppliers} />
    </div>
  )
}
