'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supplierSchema } from '@/lib/validations/supplier.schema'

type ActionResult = { success: true } | { error: string }

export async function createSupplier(data: unknown): Promise<ActionResult> {
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

    const parsed = supplierSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase.from('suppliers').insert({
      name: parsed.data.name,
      contact: parsed.data.contact || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    })

    if (error) {
      return { error: 'Error al crear el proveedor' }
    }

    revalidatePath('/suppliers')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al crear el proveedor' }
  }
}

export async function updateSupplier(
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

    const parsed = supplierSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase
      .from('suppliers')
      .update({
        name: parsed.data.name,
        contact: parsed.data.contact || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
      })
      .eq('id', id)

    if (error) {
      return { error: 'Error al actualizar el proveedor' }
    }

    revalidatePath('/suppliers')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al actualizar el proveedor' }
  }
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { data: role } = await supabase.rpc('get_user_role')
    if (role !== 'admin') {
      return { error: 'Solo administradores pueden eliminar proveedores' }
    }

    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      return { error: 'Error al eliminar el proveedor' }
    }

    revalidatePath('/suppliers')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al eliminar el proveedor' }
  }
}
