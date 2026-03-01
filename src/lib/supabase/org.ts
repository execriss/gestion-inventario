import { type SupabaseClient } from '@supabase/supabase-js'
import { type Database, type UserRole } from '@/types/database.types'

type TypedClient = SupabaseClient<Database>

/**
 * Obtiene el organization_id del usuario autenticado.
 * Llama al RPC get_my_org_id() que está definido como SECURITY DEFINER STABLE.
 */
export async function getMyOrgId(supabase: TypedClient): Promise<string | null> {
  const { data } = await supabase.rpc('get_my_org_id')
  return data ?? null
}

/**
 * Obtiene el rol del usuario en su organización.
 */
export async function getMyOrgRole(supabase: TypedClient): Promise<UserRole | null> {
  const { data } = await supabase.rpc('get_my_org_role')
  return (data as UserRole) ?? null
}

/**
 * Verifica que el usuario tiene el rol mínimo requerido.
 * Jerarquía: admin > operator > viewer
 */
const ROLE_RANK: Record<UserRole, number> = { admin: 3, operator: 2, viewer: 1 }

export async function requireOrgRole(
  supabase: TypedClient,
  minRole: UserRole
): Promise<{ orgId: string; role: UserRole } | { error: string }> {
  const [orgId, role] = await Promise.all([
    getMyOrgId(supabase),
    getMyOrgRole(supabase),
  ])

  if (!orgId || !role) return { error: 'No pertenecés a ninguna organización' }
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) return { error: 'No tenés permisos para esta acción' }

  return { orgId, role }
}
