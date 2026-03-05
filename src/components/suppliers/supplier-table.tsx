'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import type { Supplier } from '@/types/database.types'
import { deleteSupplier } from '@/actions/suppliers.actions'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SupplierForm } from './supplier-form'

interface SupplierTableProps {
  suppliers: Supplier[]
}

export function SupplierTable({ suppliers }: SupplierTableProps) {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return

    setDeletingId(id)
    const result = await deleteSupplier(id)
    setDeletingId(null)

    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Proveedor eliminado')
    }
  }

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-muted/30">
                <TableCell className="max-w-[140px] sm:max-w-none font-medium truncate">{supplier.name}</TableCell>
                <TableCell className="max-w-[120px] sm:max-w-none text-muted-foreground truncate">
                  {supplier.contact || '—'}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {supplier.email || '—'}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {supplier.phone || '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingSupplier(supplier)}
                      >
                        <Pencil className="size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(supplier.id)}
                        disabled={deletingId === supplier.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        {deletingId === supplier.id
                          ? 'Eliminando...'
                          : 'Eliminar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {editingSupplier && (
        <SupplierForm
          supplier={editingSupplier}
          open={!!editingSupplier}
          onOpenChange={(open) => {
            if (!open) setEditingSupplier(null)
          }}
        />
      )}
    </>
  )
}
