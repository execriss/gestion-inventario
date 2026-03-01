'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { movementSchema } from '@/lib/validations/movement.schema'

type ActionResult = { success: true } | { error: string }

export async function createMovement(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'operator')
    if ('error' in auth) return auth

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const parsed = movementSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase.from('inventory_movements').insert({
      organization_id: auth.orgId,
      type:            parsed.data.type,
      product_id:      parsed.data.product_id,
      quantity:        parsed.data.quantity,
      unit_price:      parsed.data.unit_price,
      supplier_id:     parsed.data.supplier_id || null,
      reference:       parsed.data.reference   || null,
      notes:           parsed.data.notes       || null,
      created_by:      user.id,
    })

    if (error) {
      if (error.message?.includes('Stock insuficiente')) {
        return { error: 'Stock insuficiente para realizar este egreso' }
      }
      return { error: 'Error al registrar el movimiento' }
    }

    revalidatePath('/movements')
    revalidatePath('/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al registrar el movimiento' }
  }
}
