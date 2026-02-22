'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import type { Category } from '@/types/database.types'
import {
  categorySchema,
  ICON_OPTIONS,
  type CategoryFormData,
} from '@/lib/validations/category.schema'
import { createCategory, updateCategory } from '@/actions/categories.actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const ICON_LABELS: Record<string, string> = {
  layers: 'Capas',
  droplets: 'Gotas',
  'circle-dot': 'Circulo',
  shirt: 'Ropa',
  printer: 'Impresora',
  tag: 'Etiqueta',
  package: 'Paquete',
  box: 'Caja',
  scissors: 'Tijeras',
  palette: 'Paleta',
}

interface CategoryFormProps {
  category?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryForm({
  category,
  open,
  onOpenChange,
}: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!category

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as never,
    defaultValues: {
      name: category?.name ?? '',
      color: category?.color ?? '#06b6d4',
      icon: (category?.icon as CategoryFormData['icon']) ?? 'package',
    },
  })

  async function onSubmit(data: CategoryFormData) {
    setLoading(true)

    const result = isEditing
      ? await updateCategory(category.id, data)
      : await createCategory(data)

    setLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? 'Categoría actualizada' : 'Categoría creada')
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modificá los datos de la categoría.'
              : 'Completá los datos para crear una nueva categoría.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Electrónica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input type="color" className="h-9 w-14 p-1" {...field} />
                      </FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="#06b6d4"
                        className="flex-1"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícono</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccioná un ícono" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ICON_OPTIONS.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {ICON_LABELS[icon] ?? icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Guardando...'
                  : isEditing
                    ? 'Guardar cambios'
                    : 'Crear categoría'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
