'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { productSchema } from '@/lib/validations/product.schema'
import { getEffectivePlan, PLAN_LIMITS } from '@/lib/plans'
import { type ActionResult } from '@/lib/utils'

function generateSku(): string {
  return `PRD-${Date.now().toString(36).toUpperCase()}`
}

export async function createProduct(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'operator')
    if ('error' in auth) return auth

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const parsed = productSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    // Verificar límite de productos según plan
    const [orgResult, productCount] = await Promise.all([
      supabase.from('organizations').select('plan, plan_expires_at').eq('id', auth.orgId).single(),
      supabase.from('products').select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId).eq('is_active', true),
    ])

    const effectivePlan = getEffectivePlan(
      orgResult.data?.plan ?? 'free',
      orgResult.data?.plan_expires_at,
    )
    const maxProducts = PLAN_LIMITS[effectivePlan].maxProducts

    if ((productCount.count ?? 0) >= maxProducts) {
      return {
        error: `Límite del plan Free: máximo ${maxProducts} productos activos. Actualizá a Pro desde Configuración → Plan & Upgrade.`,
      }
    }

    const sku = parsed.data.sku || generateSku()

    const { error } = await supabase.from('products').insert({
      organization_id: auth.orgId,
      name:            parsed.data.name,
      sku,
      barcode:         parsed.data.barcode || null,
      description:     parsed.data.description || null,
      category_id:     parsed.data.category_id,
      unit_id:         parsed.data.unit_id,
      min_stock:       parsed.data.min_stock,
      cost_price:      parsed.data.cost_price ?? null,
      sale_price:      parsed.data.sale_price ?? null,
      created_by:      user.id,
    })

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('barcode')) return { error: 'Ya existe un producto con ese código de barras' }
        return { error: 'Ya existe un producto con ese SKU' }
      }
      return { error: 'Error al crear el producto' }
    }

    revalidatePath('/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al crear el producto' }
  }
}

export async function updateProduct(
  id: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'operator')
    if ('error' in auth) return auth

    const parsed = productSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase
      .from('products')
      .update({
        name:        parsed.data.name,
        sku:         parsed.data.sku || null,
        barcode:     parsed.data.barcode || null,
        description: parsed.data.description || null,
        category_id: parsed.data.category_id,
        unit_id:     parsed.data.unit_id,
        min_stock:   parsed.data.min_stock,
        cost_price:  parsed.data.cost_price ?? null,
        sale_price:  parsed.data.sale_price ?? null,
      })
      .eq('id', id)
      .eq('organization_id', auth.orgId)

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('barcode')) return { error: 'Ya existe un producto con ese código de barras' }
        return { error: 'Ya existe un producto con ese SKU' }
      }
      return { error: 'Error al actualizar el producto' }
    }

    revalidatePath('/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al actualizar el producto' }
  }
}

export async function getProductByBarcode(barcode: string) {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'operator')
    if ('error' in auth) return null

    const { data } = await supabase
      .from('products')
      .select('id, name, sku, barcode, current_stock, units(abbreviation), categories(name, color)')
      .eq('organization_id', auth.orgId)
      .eq('is_active', true)
      .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
      .maybeSingle()

    return data ?? null
  } catch {
    return null
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
      .eq('organization_id', auth.orgId)

    if (error) {
      return { error: 'Error al eliminar el producto' }
    }

    revalidatePath('/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al eliminar el producto' }
  }
}
