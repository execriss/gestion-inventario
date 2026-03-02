'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { sendUpgradeRequest } from '@/lib/email/resend'

const upgradeSchema = z.object({
  message: z.string().max(500).optional(),
})

export async function requestUpgrade(
  data: unknown
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'admin')
    if ('error' in auth) return auth

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const parsed = upgradeSchema.safeParse(data)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    // Obtener datos de la org + stats de uso en paralelo
    const [orgResult, profileResult, productCount, memberCount] = await Promise.all([
      supabase.from('organizations').select('name, plan').eq('id', auth.orgId).single(),
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)
        .eq('is_active', true),
      supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId),
    ])

    if (orgResult.data?.plan === 'pro') {
      return { error: 'Tu organizacion ya tiene el plan Pro.' }
    }

    await sendUpgradeRequest({
      orgName:         orgResult.data?.name ?? 'Organizacion desconocida',
      contactName:     profileResult.data?.full_name ?? 'Sin nombre',
      contactEmail:    user.email ?? '',
      currentProducts: productCount.count ?? 0,
      currentMembers:  memberCount.count ?? 0,
      message:         parsed.data.message,
    })

    return { success: true }
  } catch {
    return { error: 'Error al enviar la solicitud. Intenta de nuevo.' }
  }
}
