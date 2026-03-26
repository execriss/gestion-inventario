'use server'

import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { getEffectivePlan } from '@/lib/plans'
import { type ActionResult } from '@/lib/utils'

export type ApiKey = {
  id:           string
  key_prefix:   string
  label:        string | null
  last_used_at: string | null
  revoked_at:   string | null
  created_at:   string
}

export type CreateApiKeyResult =
  | { error: string }
  | { success: true; key: ApiKey; full_key: string }

export async function listApiKeys(): Promise<{ error: string } | { keys: ApiKey[] }> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, key_prefix, label, last_used_at, revoked_at, created_at')
      .eq('organization_id', auth.orgId)
      .order('created_at', { ascending: false })

    if (error) return { error: 'Error al cargar las API keys' }
    return { keys: data ?? [] }
  } catch {
    return { error: 'Error inesperado' }
  }
}

export async function createApiKey(label?: string): Promise<CreateApiKeyResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Solo plan Pro puede crear API keys
    const { data: org } = await supabase
      .from('organizations')
      .select('plan, plan_expires_at')
      .eq('id', auth.orgId)
      .single()

    const plan = getEffectivePlan(org?.plan ?? 'free', org?.plan_expires_at)
    if (plan !== 'pro') {
      return { error: 'Las API keys requieren Plan Pro. Actualizá tu plan desde Configuración → Plan.' }
    }

    // Limitar a 10 keys activas por organización
    const { count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', auth.orgId)
      .is('revoked_at', null)

    if ((count ?? 0) >= 10) {
      return { error: 'Límite alcanzado: máximo 10 API keys activas por organización' }
    }

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: auth.orgId,
        label:           label?.trim() || null,
        created_by:      user.id,
      })
      .select('id, api_key, key_prefix, label, last_used_at, revoked_at, created_at')
      .single()

    if (error || !data) return { error: 'Error al crear la API key' }

    const full_key = data.api_key

    return {
      success:  true,
      full_key,
      key: {
        id:           data.id,
        key_prefix:   data.key_prefix,
        label:        data.label,
        last_used_at: data.last_used_at,
        revoked_at:   data.revoked_at,
        created_at:   data.created_at,
      },
    }
  } catch {
    return { error: 'Error inesperado al crear la API key' }
  }
}

export async function revokeApiKey(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const { error } = await supabase
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', auth.orgId)
      .is('revoked_at', null)

    if (error) return { error: 'Error al revocar la API key' }
    return { success: true }
  } catch {
    return { error: 'Error inesperado al revocar la API key' }
  }
}
