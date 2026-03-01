'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { type UserRole } from '@/types/database.types'

type ActionResult = { success: true } | { error: string }

const createInvSchema = z.object({
  role:     z.enum(['admin', 'operator', 'viewer']),
  label:    z.string().max(100).optional(),
  max_uses: z.number().int().min(1).max(100).default(1),
})

/**
 * Crea un link de invitación copiable.
 * Retorna la URL completa para que el admin la comparta.
 */
export async function createInvitation(data: unknown): Promise<
  { error: string } | { success: true; url: string; token: string }
> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const parsed = createInvSchema.safeParse(data)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const { data: inv, error } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: auth.orgId,
        role:            parsed.data.role,
        label:           parsed.data.label || null,
        invited_by:      user.id,
        max_uses:        parsed.data.max_uses,
      })
      .select('token')
      .single()

    if (error || !inv) return { error: 'Error al crear la invitación' }

    // Construir URL absoluta usando el header host
    const headersList = await headers()
    const host   = headersList.get('host') ?? 'localhost:3000'
    const proto  = host.startsWith('localhost') ? 'http' : 'https'
    const url    = `${proto}://${host}/invite/${inv.token}`

    revalidatePath('/settings/members')
    return { success: true, url, token: inv.token }
  } catch {
    return { error: 'Error inesperado al crear la invitación' }
  }
}

/**
 * Revoca (elimina) un link de invitación activo.
 */
export async function revokeInvitation(invitationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const { error } = await supabase
      .from('organization_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('organization_id', auth.orgId)

    if (error) return { error: 'Error al revocar la invitación' }

    revalidatePath('/settings/members')
    return { success: true }
  } catch {
    return { error: 'Error inesperado' }
  }
}

/**
 * Lista las invitaciones activas de la organización (no usadas).
 */
export async function getActiveInvitations() {
  const supabase = await createClient()
  const auth = await requireOrgRole(supabase, 'admin')
  if ('error' in auth) return []

  const { data } = await supabase
    .from('organization_invitations')
    .select('id, organization_id, role, token, label, invited_by, expires_at, max_uses, use_count, created_at')
    .eq('organization_id', auth.orgId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return data ?? []
}

/**
 * Obtiene información pública de una invitación por token.
 * Usado en la página /invite/[token] para mostrar a qué org invita.
 * No requiere autenticación — usa el admin client.
 */
export async function getInvitationByToken(token: string): Promise<{
  valid: true
  orgName: string
  role: UserRole
  invitedByName: string | null
} | { valid: false; reason: string }> {
  // Import inline para no contaminar el módulo con admin si no es necesario
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('organization_invitations')
    .select('role, expires_at, max_uses, use_count, organizations(name)')
    .eq('token', token)
    .single()

  if (error || !data) return { valid: false, reason: 'not_found' }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, reason: 'expired' }
  }

  if (data.max_uses > 0 && data.use_count >= data.max_uses) {
    return { valid: false, reason: 'used' }
  }

  return {
    valid:    true,
    orgName:  (data.organizations as { name: string } | null)?.name ?? '',
    role:     data.role as UserRole,
    invitedByName: null,  // no se expone por privacidad del creador
  }
}
