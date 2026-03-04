'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SupplierForm } from './supplier-form'

export function NewSupplierButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="size-4" />
        Nuevo Proveedor
      </Button>
      <SupplierForm open={open} onOpenChange={setOpen} />
    </>
  )
}
