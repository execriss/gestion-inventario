'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/supabase/org'
import { type UserRole } from '@/types/database.types'

type ActionResult = { success: true } | { error: string }

const orgSchema = z.object({
  name:                 z.string().min(2).max(100),
  logo_url:             z.url().optional().or(z.literal('')),
  email_alerts_enabled: z.boolean().optional(),
})

// ── Organización ───────────────────────────────────────────────

export async function updateOrganization(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const parsed = orgSchema.safeParse(data)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const { error } = await supabase
      .from('organizations')
      .update({
        name:                 parsed.data.name,
        logo_url:             parsed.data.logo_url || null,
        email_alerts_enabled: parsed.data.email_alerts_enabled,
      })
      .eq('id', auth.orgId)

    if (error) return { error: 'Error al actualizar la organización' }

    revalidatePath('/settings')
    return { success: true }
  } catch {
    return { error: 'Error inesperado' }
  }
}

// ── Miembros ───────────────────────────────────────────────────

export async function updateMemberRole(
  memberId: string,
  role: UserRole
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    if (!['admin', 'operator', 'viewer'].includes(role)) {
      return { error: 'Rol inválido' }
    }

    const { error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId)
      .eq('organization_id', auth.orgId)

    if (error) return { error: 'Error al actualizar el rol' }

    revalidatePath('/settings/members')
    return { success: true }
  } catch {
    return { error: 'Error inesperado' }
  }
}

export async function removeMember(memberId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)
      .eq('organization_id', auth.orgId)

    if (error) {
      if (error.code === '42501') {
        return { error: 'No podés eliminarte a vos mismo del equipo' }
      }
      return { error: 'Error al eliminar el miembro' }
    }

    revalidatePath('/settings/members')
    return { success: true }
  } catch {
    return { error: 'Error inesperado' }
  }
}

// ── Perfil del usuario ─────────────────────────────────────────

const profileSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(80),
})

export async function updateProfile(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const parsed = profileSchema.safeParse(data)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: parsed.data.full_name })
      .eq('id', user.id)

    if (error) return { error: 'Error al actualizar el perfil' }

    // Actualizar también en Auth metadata
    await supabase.auth.updateUser({
      data: { full_name: parsed.data.full_name },
    })

    revalidatePath('/settings/profile')
    return { success: true }
  } catch {
    return { error: 'Error inesperado' }
  }
}

const passwordSchema = z
  .object({
    password:        z.string().min(8, 'Mínimo 8 caracteres'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path:    ['confirm_password'],
  })

export async function updatePassword(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const parsed = passwordSchema.safeParse(data)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) return { error: 'Error al actualizar la contraseña' }

    return { success: true }
  } catch {
    return { error: 'Error inesperado' }
  }
}

// ── Obtener datos del equipo (para el panel de miembros) ───────

export async function getOrgMembers() {
  const supabase = await createClient()
  const auth = await requireOrgRole(supabase, 'viewer')
  if ('error' in auth) return { error: auth.error, members: [] }

  const { data, error } = await supabase
    .from('organization_members')
    .select('*, profiles(full_name, avatar_url)')
    .eq('organization_id', auth.orgId)
    .order('joined_at', { ascending: true })

  if (error) return { error: 'Error al cargar el equipo', members: [] }
  return { members: data ?? [], error: null }
}

// ── Obtener organización actual ────────────────────────────────

export async function getMyOrganization() {
  const supabase = await createClient()
  const auth = await requireOrgRole(supabase, 'viewer')
  if ('error' in auth) return null

  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', auth.orgId)
    .single()

  return data ?? null
}

// ── Aceptar invitación (service_role porque el usuario puede no ser miembro aún) ──

const acceptSchema = z.object({
  token:     z.string().min(1),
  full_name: z.string().min(2).max(80).optional(),
  email:     z.email().optional(),
  password:  z.string().min(8).optional(),
})

/**
 * Acepta una invitación por token.
 * Si el usuario ya está autenticado, lo agrega directamente.
 * Si no, primero crea la cuenta y luego lo agrega.
 */
export async function acceptInvitation(
  data: unknown
): Promise<{ error: string } | { success: true; orgName: string }> {
  const parsed = acceptSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { token, full_name, email, password } = parsed.data
  const admin = createAdminClient()

  // 1. Validar token (service_role para leer sin RLS)
  const { data: invitation, error: invError } = await admin
    .from('organization_invitations')
    .select('*, organizations(name)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (invError || !invitation) {
    return { error: 'El link de invitación no es válido o ya expiró.' }
  }

  if (invitation.max_uses > 0 && invitation.use_count >= invitation.max_uses) {
    return { error: 'Este link de invitación ya fue utilizado.' }
  }

  // 2. Obtener o crear el usuario
  let userId: string

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (currentUser) {
    userId = currentUser.id
  } else {
    // Registro nuevo
    if (!email || !password || !full_name) {
      return { error: 'Se requiere nombre, email y contraseña para unirse.' }
    }

    // Usar admin.createUser para bypasear confirmación de email
    // (el link de invitación ya actúa como verificación)
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true,
    })

    if (createError || !createData.user) {
      const msg = createError?.message?.toLowerCase() ?? ''
      if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('already been registered')) {
        return { error: 'Ya existe una cuenta con ese email. Iniciá sesión primero.' }
      }
      return { error: 'Error al crear la cuenta.' }
    }

    userId = createData.user.id

    // Auto-login para que el redirect a /dashboard funcione
    await supabase.auth.signInWithPassword({ email, password })
  }

  // 3. Agregar como miembro (service_role, sin RLS)
  const { error: memberError } = await admin
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id:         userId,
      role:            invitation.role,
      invited_by:      invitation.invited_by,
    })

  if (memberError) {
    if (memberError.code === '23505') {
      return { error: 'Ya sos miembro de esta organización.' }
    }
    return { error: 'Error al unirte a la organización.' }
  }

  // 4. Marcar invitación como usada
  await admin
    .from('organization_invitations')
    .update({
      used_by:   userId,
      used_at:   new Date().toISOString(),
      use_count: invitation.use_count + 1,
    })
    .eq('id', invitation.id)

  const orgName = (invitation.organizations as { name: string } | null)?.name ?? ''
  return { success: true, orgName }
}
