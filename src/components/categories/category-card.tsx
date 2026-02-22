'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
  Droplets,
  CircleDot,
  Shirt,
  Printer,
  Tag,
  Package,
  Box,
  Scissors,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import type { Category } from '@/types/database.types'
import { deleteCategory } from '@/actions/categories.actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CategoryForm } from './category-form'

const ICON_MAP: Record<string, LucideIcon> = {
  layers: Layers,
  droplets: Droplets,
  'circle-dot': CircleDot,
  shirt: Shirt,
  printer: Printer,
  tag: Tag,
  package: Package,
  box: Box,
  scissors: Scissors,
  palette: Palette,
}

interface CategoryCardProps {
  category: Category & { products: { id: string }[] }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const IconComponent = ICON_MAP[category.icon] ?? Package
  const productCount = category.products?.length ?? 0

  async function handleDelete() {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    setDeleting(true)
    const result = await deleteCategory(category.id)
    setDeleting(false)

    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Categoría eliminada')
    }
  }

  return (
    <>
      <div
        className="glass-card rounded-xl p-4 relative overflow-hidden"
        style={{ borderLeft: `3px solid ${category.color}` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <IconComponent
                className="size-5"
                style={{ color: category.color }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {productCount} {productCount === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-xs text-muted-foreground">{category.color}</span>
        </div>
      </div>

      <CategoryForm
        category={category}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
