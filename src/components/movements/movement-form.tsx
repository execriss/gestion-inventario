'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { movementSchema, type MovementFormData } from '@/lib/validations/movement.schema'
import { createMovement } from '@/actions/movements.actions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

type ProductOption = {
  id: string
  name: string
  sku: string | null
  current_stock: number
  units: { abbreviation: string } | null
  categories: { name: string; color: string } | null
}

interface MovementFormProps {
  type: 'ingreso' | 'egreso'
  products: ProductOption[]
  suppliers?: { id: string; name: string }[]
}

import { formatCurrencyDecimals as formatCurrency } from '@/lib/utils'

export function MovementForm({ type, products, suppliers = [] }: MovementFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const isIngreso = type === 'ingreso'

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema) as Resolver<MovementFormData>,
    defaultValues: {
      type,
      product_id: '',
      quantity: undefined,
      unit_price: undefined,
      supplier_id: '',
      reference: '',
      notes: '',
    },
  })

  const selectedProductId = useWatch({ control: form.control, name: 'product_id' })
  const watchedQuantity = useWatch({ control: form.control, name: 'quantity' })
  const watchedUnitPrice = useWatch({ control: form.control, name: 'unit_price' })

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const calculatedTotal =
    typeof watchedQuantity === 'number' && typeof watchedUnitPrice === 'number'
      ? watchedQuantity * watchedUnitPrice
      : 0

  function onSubmit(data: MovementFormData) {
    // Client-side stock validation for egresos
    if (type === 'egreso' && selectedProduct) {
      if (data.quantity > selectedProduct.current_stock) {
        form.setError('quantity', {
          message: `Stock insuficiente. Disponible: ${selectedProduct.current_stock}`,
        })
        return
      }
    }

    startTransition(async () => {
      const result = await createMovement(data)

      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Movimiento registrado exitosamente')
        router.push('/movements')
      }
    })
  }

  return (
    <div className="glass-card rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-lg',
            isIngreso
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-red-500/15 text-red-400'
          )}
        >
          {isIngreso ? (
            <ArrowDownToLine className="size-5" />
          ) : (
            <ArrowUpFromLine className="size-5" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {isIngreso ? 'Registrar Ingreso' : 'Registrar Egreso'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isIngreso
              ? 'Agregá stock de un producto al inventario'
              : 'Registrá una salida de stock del inventario'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Producto — Combobox */}
          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Producto</FormLabel>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className={cn(
                          'w-full justify-between font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {selectedProduct ? (
                          <span className="flex items-center gap-2 truncate">
                            {selectedProduct.categories && (
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: selectedProduct.categories.color }}
                              />
                            )}
                            {selectedProduct.name}
                          </span>
                        ) : (
                          'Selecciona un producto...'
                        )}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nombre o SKU..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron productos.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={`${product.name} ${product.sku ?? ''}`}
                              onSelect={() => {
                                form.setValue('product_id', product.id, {
                                  shouldValidate: true,
                                })
                                setComboboxOpen(false)
                              }}
                            >
                              <div className="flex flex-1 items-center gap-2">
                                {product.categories && (
                                  <span
                                    className="size-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: product.categories.color }}
                                  />
                                )}
                                <div className="flex flex-col">
                                  <span className="text-sm">{product.name}</span>
                                  {product.sku && (
                                    <span className="font-mono text-xs text-muted-foreground">
                                      {product.sku}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  'size-4',
                                  product.id === field.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Stock info */}
                {selectedProduct && (
                  <p
                    className={cn(
                      'text-sm',
                      !isIngreso && selectedProduct.current_stock === 0
                        ? 'text-red-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    {!isIngreso && selectedProduct.current_stock === 0
                      ? 'Sin stock disponible'
                      : `Stock disponible: ${selectedProduct.current_stock} ${selectedProduct.units?.abbreviation ?? 'u.'}`}
                  </p>
                )}

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cantidad y Precio unitario — en grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Cantidad */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val === '' ? undefined : Number(val))
                      }}
                    />
                  </FormControl>
                  {!isIngreso && selectedProduct && (
                    <FormDescription>
                      Disponible: {selectedProduct.current_stock}{' '}
                      {selectedProduct.units?.abbreviation ?? 'u.'}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precio unitario */}
            <FormField
              control={form.control}
              name="unit_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio unitario</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? undefined : Number(val))
                        }}
                      />
                    </div>
                  </FormControl>
                  {calculatedTotal > 0 && (
                    <FormDescription className="font-medium text-foreground">
                      Total: {formatCurrency(calculatedTotal)}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Proveedor — solo para ingresos */}
          {isIngreso && suppliers.length > 0 && (
            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Proveedor{' '}
                    <span className="font-normal text-muted-foreground">(opcional)</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Referencia */}
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Referencia{' '}
                  <span className="font-normal text-muted-foreground">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="N. de factura, remito, orden de compra..."
                    maxLength={100}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notas */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Notas{' '}
                  <span className="font-normal text-muted-foreground">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales..."
                    maxLength={500}
                    rows={3}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                'w-full sm:w-auto sm:min-w-[180px]',
                isIngreso
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-destructive text-white hover:bg-destructive/90'
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  {isIngreso ? (
                    <ArrowDownToLine className="size-4" />
                  ) : (
                    <ArrowUpFromLine className="size-4" />
                  )}
                  {isIngreso ? 'Registrar Ingreso' : 'Registrar Egreso'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/movements')}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
