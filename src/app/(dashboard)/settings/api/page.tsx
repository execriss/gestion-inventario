import { listApiKeys } from '@/actions/api-keys.actions'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { getEffectivePlan } from '@/lib/plans'
import { ApiKeysPanel } from './api-keys-panel'

export const metadata = { title: 'API — Configuración' }

export default async function ApiSettingsPage() {
  const supabase = await createClient()
  const auth = await requireOrgRole(supabase, 'admin')

  if ('error' in auth) {
    return <ApiKeysPanel initialKeys={[]} isPro={false} isAdmin={false} />
  }

  const [keysResult, { data: org }] = await Promise.all([
    listApiKeys(),
    supabase
      .from('organizations')
      .select('plan, plan_expires_at')
      .eq('id', auth.orgId)
      .single(),
  ])

  const isPro =
    getEffectivePlan(org?.plan ?? 'free', org?.plan_expires_at) === 'pro'
  const keys = 'keys' in keysResult ? keysResult.keys : []

  return <ApiKeysPanel initialKeys={keys} isPro={isPro} isAdmin={true} />
}
