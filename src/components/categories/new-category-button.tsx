'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryForm } from './category-form'

export function NewCategoryButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Nueva Categoría
      </Button>
      <CategoryForm open={open} onOpenChange={setOpen} />
    </>
  )
}
