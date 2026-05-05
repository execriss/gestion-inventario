'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Barcode, Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

import type { Category, Product, Unit } from '@/types/database.types'
import {
  productSchema,
  type ProductFormData,
} from '@/lib/validations/product.schema'
import { createProduct, updateProduct } from '@/actions/products.actions'
import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

const BarcodeScanner = dynamic(
  () =>
    import('@/components/barcode/barcode-scanner').then((m) => m.BarcodeScanner),
  { ssr: false }
)

interface ProductFormProps {
  categories: Pick<Category, 'id' | 'name' | 'color'>[]
  units: Unit[]
  product?: Product
}

export function ProductForm({ categories, units, product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [unitOpen, setUnitOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const isEditing = !!product

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      barcode: product?.barcode ?? '',
      description: product?.description ?? '',
      category_id: product?.category_id ?? '',
      unit_id: product?.unit_id ?? '',
      min_stock: product?.min_stock ?? 0,
      cost_price: product?.cost_price ?? undefined,
      sale_price: product?.sale_price ?? undefined,
    },
  })

  async function onSubmit(data: ProductFormData) {
    setLoading(true)

    const result = isEditing
      ? await updateProduct(product.id, data)
      : await createProduct(data)

    setLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? 'Producto actualizado' : 'Producto creado')
    router.push('/products')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Información general</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Resma A4 75gr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Auto-generado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de barras</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Escaneá o ingresá manualmente"
                        className="pr-10 font-mono"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setScannerOpen(true)}
                        aria-label="Escanear código de barras"
                        className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-cyan-500/15 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40"
                      >
                        <Barcode className="size-4" aria-hidden />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripcion</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripcion opcional del producto..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <BarcodeScanner
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScan={(code) =>
            form.setValue('barcode', code, { shouldDirty: true, shouldValidate: true })
          }
          title="Escanear código de barras"
          description="Apuntá la cámara al código de barras del producto."
        />

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Clasificacion</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Categoria *</FormLabel>
                  <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={categoryOpen}
                          className={cn(
                            'w-full justify-between font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? categories.find((c) => c.id === field.value)?.name
                            : 'Selecciona una categoria'}
                          <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar categoria..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron categorias.
                          </CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.name}
                                onSelect={() => {
                                  field.onChange(category.id)
                                  setCategoryOpen(false)
                                }}
                              >
                                <span
                                  className="size-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                                <Check
                                  className={cn(
                                    'ml-auto size-4',
                                    field.value === category.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Unidad *</FormLabel>
                  <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={unitOpen}
                          className={cn(
                            'w-full justify-between font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? (() => {
                                const unit = units.find(
                                  (u) => u.id === field.value
                                )
                                return unit
                                  ? `${unit.name} (${unit.abbreviation})`
                                  : 'Selecciona una unidad'
                              })()
                            : 'Selecciona una unidad'}
                          <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar unidad..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron unidades.
                          </CommandEmpty>
                          <CommandGroup>
                            {units.map((unit) => (
                              <CommandItem
                                key={unit.id}
                                value={unit.name}
                                onSelect={() => {
                                  field.onChange(unit.id)
                                  setUnitOpen(false)
                                }}
                              >
                                {unit.name}
                                <span className="text-muted-foreground ml-1">
                                  ({unit.abbreviation})
                                </span>
                                <Check
                                  className={cn(
                                    'ml-auto size-4',
                                    field.value === unit.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Stock y precios</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="min_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Minimo *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Costo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Venta</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/products')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? 'Guardando...'
              : isEditing
                ? 'Guardar Cambios'
                : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
