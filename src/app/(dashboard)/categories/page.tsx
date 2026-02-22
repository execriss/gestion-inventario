import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'
import { CategoryCard } from '@/components/categories/category-card'
import { NewCategoryButton } from '@/components/categories/new-category-button'
import { DEMO_MODE, DEMO_CATEGORIES } from '@/lib/demo'

type CategoryWithProducts = Category & { products: { id: string }[] }

export default async function CategoriesPage() {
  let list: CategoryWithProducts[]

  if (DEMO_MODE) {
    list = DEMO_CATEGORIES.map(c => ({ ...c, products: [] as { id: string }[] }))
  } else {
    const supabase = await createClient()
    const { data: categories } = await supabase
      .from('categories')
      .select('*, products(id)')
      .order('name')
    list = (categories ?? []) as unknown as CategoryWithProducts[]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Categorías</h1>
          <Badge variant="secondary">{list.length}</Badge>
        </div>
        <NewCategoryButton />
      </div>

      {list.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            No hay categorías creadas todavía.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Creá la primera usando el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}
