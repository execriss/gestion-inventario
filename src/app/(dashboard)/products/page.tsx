import Link from 'next/link'
import { Plus } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import type { ProductWithRelations } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductsTable } from '@/components/products/products-table'
import { DEMO_MODE, DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/demo'

export default async function ProductsPage() {
  let products: ProductWithRelations[]
  let categories: Array<{ id: string; name: string; color: string }>

  if (DEMO_MODE) {
    products = DEMO_PRODUCTS as unknown as ProductWithRelations[]
    categories = DEMO_CATEGORIES.map(c => ({ id: c.id, name: c.name, color: c.color }))
  } else {
    const supabase = await createClient()
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from('products')
        .select('*, categories(name, color, icon), units(name, abbreviation)')
        .eq('is_active', true)
        .order('name'),
      supabase.from('categories').select('id, name, color').order('name'),
    ])
    products = (productsResult.data ?? []) as unknown as ProductWithRelations[]
    categories = categoriesResult.data ?? []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Productos</h1>
          <Badge variant="secondary">{products.length}</Badge>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="size-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      {products.length === 0 && categories.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            No hay productos registrados todavía.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Creá el primero usando el botón de arriba.
          </p>
        </div>
      ) : (
        <ProductsTable products={products} categories={categories} />
      )}
    </div>
  )
}
