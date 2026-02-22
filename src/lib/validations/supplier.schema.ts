import { z } from 'zod'

export const supplierSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  contact: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type SupplierFormData = z.infer<typeof supplierSchema>
