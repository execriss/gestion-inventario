import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  sku: z.string().max(50).optional().or(z.literal('')),
  barcode: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  category_id: z.string().uuid('Seleccioná una categoría'),
  unit_id: z.string().uuid('Seleccioná una unidad'),
  min_stock: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  cost_price: z.coerce.number().min(0).optional(),
  sale_price: z.coerce.number().min(0).optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
