import { z } from 'zod'

export const ICON_OPTIONS = [
  'layers',
  'droplets',
  'circle-dot',
  'shirt',
  'printer',
  'tag',
  'package',
  'box',
  'scissors',
  'palette',
] as const

export const categorySchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color hex inválido')
    .default('#06b6d4'),
  icon: z.enum(ICON_OPTIONS).default('package'),
})

export type CategoryFormData = z.infer<typeof categorySchema>
