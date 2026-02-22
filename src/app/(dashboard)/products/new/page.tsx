import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/products/product-form'
import { DEMO_MODE, DEMO_CATEGORIES, DEMO_UNITS } from '@/lib/demo'

export default async function NewProductPage() {
  let categories: Array<{ id: string; name: string; color: string }>
  let units: typeof DEMO_UNITS

  if (DEMO_MODE) {
    categories = DEMO_CATEGORIES.map(c => ({ id: c.id, name: c.name, color: c.color }))
    units = DEMO_UNITS
  } else {
    const supabase = await createClient()
    const [categoriesResult, unitsResult] = await Promise.all([
      supabase.from('categories').select('id, name, color').order('name'),
      supabase.from('units').select('*').order('name'),
    ])
    categories = categoriesResult.data ?? []
    units = (unitsResult.data ?? []) as typeof DEMO_UNITS
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Volver a productos</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Producto</h1>
          <p className="text-sm text-muted-foreground">
            Completa los datos para registrar un nuevo producto en el inventario.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ProductForm categories={categories} units={units} />
      </div>
    </div>
  )
}
