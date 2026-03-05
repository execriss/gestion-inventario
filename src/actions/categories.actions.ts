'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { categorySchema } from '@/lib/validations/category.schema'
import { type ActionResult } from '@/lib/utils'

export async function createCategory(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const parsed = categorySchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase.from('categories').insert({
      organization_id: auth.orgId,
      name:            parsed.data.name,
      color:           parsed.data.color,
      icon:            parsed.data.icon,
    })

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe una categoría con ese nombre' }
      }
      return { error: 'Error al crear la categoría' }
    }

    revalidatePath('/categories')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al crear la categoría' }
  }
}

export async function updateCategory(
  id: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const parsed = categorySchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase
      .from('categories')
      .update({
        name:  parsed.data.name,
        color: parsed.data.color,
        icon:  parsed.data.icon,
      })
      .eq('id', id)
      .eq('organization_id', auth.orgId)

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe una categoría con ese nombre' }
      }
      return { error: 'Error al actualizar la categoría' }
    }

    revalidatePath('/categories')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al actualizar la categoría' }
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('organization_id', auth.orgId)

    if (error) {
      if (error.code === '23503') {
        return { error: 'No se puede eliminar: hay productos asociados a esta categoría' }
      }
      return { error: 'Error al eliminar la categoría' }
    }

    revalidatePath('/categories')
    return { success: true }
  } catch {
    return { error: 'Error inesperado al eliminar la categoría' }
  }
}
