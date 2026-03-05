'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/supabase/org'
import { movementSchema } from '@/lib/validations/movement.schema'
import { sendStockAlert } from '@/lib/email/resend'
import { type ActionResult } from '@/lib/utils'

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

    // Fire-and-forget: verificar stock bajo y enviar alerta por email
    if (parsed.data.type === 'egreso') {
      checkAndSendStockAlert(
        supabase,
        auth.orgId,
        parsed.data.product_id
      ).catch(() => {
        // Silently ignore email errors — the movement was already recorded
      })
    }

    revalidatePath('/movements')
    revalidatePath('/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al registrar el movimiento' }
  }
}

// ── Stock alert helper (fire-and-forget) ──────────────────────────

async function checkAndSendStockAlert(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  productId: string
) {
  // 1. Consultar el producto actualizado
  const { data: product } = await supabase
    .from('products')
    .select('name, sku, current_stock, min_stock, units(abbreviation)')
    .eq('id', productId)
    .single()

  if (!product) return
  if (product.current_stock >= product.min_stock) return

  // 2. Verificar si la org tiene alertas habilitadas
  const { data: org } = await supabase
    .from('organizations')
    .select('name, email_alerts_enabled')
    .eq('id', orgId)
    .single()

  if (!org || !org.email_alerts_enabled) return

  // 3. Obtener los user_ids de los admins de la org
  const { data: admins } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', orgId)
    .eq('role', 'admin')

  if (!admins || admins.length === 0) return

  // 4. Obtener emails de cada admin via service_role
  const adminClient = createAdminClient()
  const adminEmails: string[] = []

  for (const admin of admins) {
    try {
      const { data } = await adminClient.auth.admin.getUserById(admin.user_id)
      if (data?.user?.email) {
        adminEmails.push(data.user.email)
      }
    } catch {
      // Skip this admin if we can't get their email
    }
  }

  if (adminEmails.length === 0) return

  // 5. Enviar la alerta
  const unit = (product.units as { abbreviation: string } | null)?.abbreviation ?? ''

  await sendStockAlert({
    to: adminEmails,
    orgName: org.name,
    products: [
      {
        name: product.name,
        sku: product.sku,
        current_stock: product.current_stock,
        min_stock: product.min_stock,
        unit,
      },
    ],
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  })
}
