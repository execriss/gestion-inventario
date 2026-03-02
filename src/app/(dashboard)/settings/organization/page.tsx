import { getMyOrganization } from '@/actions/organizations.actions'
import { createClient } from '@/lib/supabase/server'
import { getMyOrgId } from '@/lib/supabase/org'
import { OrganizationForm } from './organization-form'

export default async function OrganizationPage() {
  const [org, supabase] = await Promise.all([
    getMyOrganization(),
    createClient(),
  ])

  if (!org) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-muted-foreground">
          No se pudo cargar la organizacion. Verifica que tengas permisos.
        </p>
      </div>
    )
  }

  const orgId = await getMyOrgId(supabase)

  return (
    <OrganizationForm
      defaultName={org.name}
      defaultLogoUrl={org.logo_url ?? ''}
      defaultEmailAlertsEnabled={org.email_alerts_enabled}
      orgId={orgId!}
    />
  )
}
