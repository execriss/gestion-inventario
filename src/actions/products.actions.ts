'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations/product.schema'

type ActionResult = { success: true } | { error: string }

function generateSku(): string {
  return `PRD-${Date.now().toString(36).toUpperCase()}`
}

export async function createProduct(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { data: role } = await supabase.rpc('get_user_role')
    if (!role || !['admin', 'operator'].includes(role)) {
      return { error: 'No tenés permisos para esta acción' }
    }

    const parsed = productSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const sku = parsed.data.sku || generateSku()

    const { error } = await supabase.from('products').insert({
      name: parsed.data.name,
      sku,
      description: parsed.data.description || null,
      category_id: parsed.data.category_id,
      unit_id: parsed.data.unit_id,
      min_stock: parsed.data.min_stock,
      cost_price: parsed.data.cost_price ?? null,
      sale_price: parsed.data.sale_price ?? null,
      created_by: user.id,
    })

    if (error) {
      if (error.code === '23505') {
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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { data: role } = await supabase.rpc('get_user_role')
    if (!role || !['admin', 'operator'].includes(role)) {
      return { error: 'No tenés permisos para esta acción' }
    }

    const parsed = productSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: parsed.data.name,
        sku: parsed.data.sku || null,
        description: parsed.data.description || null,
        category_id: parsed.data.category_id,
        unit_id: parsed.data.unit_id,
        min_stock: parsed.data.min_stock,
        cost_price: parsed.data.cost_price ?? null,
        sale_price: parsed.data.sale_price ?? null,
      })
      .eq('id', id)

    if (error) {
      if (error.code === '23505') {
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

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { data: role } = await supabase.rpc('get_user_role')
    if (role !== 'admin') {
      return { error: 'Solo administradores pueden eliminar productos' }
    }

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)

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
