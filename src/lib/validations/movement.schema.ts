import { z } from 'zod'

export const movementSchema = z.object({
  type: z.enum(['ingreso', 'egreso']),
  product_id: z.string().uuid('Seleccioná un producto'),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
  unit_price: z.coerce.number().min(0).default(0),
  supplier_id: z.string().uuid().optional().or(z.literal('')),
  reference: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type MovementFormData = z.infer<typeof movementSchema>
