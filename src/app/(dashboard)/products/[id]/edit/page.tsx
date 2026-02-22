import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/products/product-form'
import { DEMO_MODE, DEMO_CATEGORIES, DEMO_UNITS, DEMO_PRODUCTS } from '@/lib/demo'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params

  let product: Record<string, unknown>
  let categories: Array<{ id: string; name: string; color: string }>
  let units: typeof DEMO_UNITS

  if (DEMO_MODE) {
    const found = DEMO_PRODUCTS.find(p => p.id === id)
    if (!found) notFound()
    product = found as unknown as Record<string, unknown>
    categories = DEMO_CATEGORIES.map(c => ({ id: c.id, name: c.name, color: c.color }))
    units = DEMO_UNITS
  } else {
    const supabase = await createClient()
    const [productResult, categoriesResult, unitsResult] = await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('categories').select('id, name, color').order('name'),
      supabase.from('units').select('*').order('name'),
    ])

    if (!productResult.data) notFound()

    product = productResult.data as Record<string, unknown>
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
          <h1 className="text-2xl font-bold">Editar Producto</h1>
          <p className="text-sm text-muted-foreground">
            Modifica los datos de {product.name as string}.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ProductForm
          categories={categories}
          units={units}
          product={product as Parameters<typeof ProductForm>[0]['product']}
        />
      </div>
    </div>
  )
}
