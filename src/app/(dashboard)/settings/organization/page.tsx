import { getMyOrganization } from '@/actions/organizations.actions'
import { OrganizationForm } from './organization-form'

export default async function OrganizationPage() {
  const org = await getMyOrganization()

  if (!org) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-muted-foreground">
          No se pudo cargar la organizacion. Verifica que tengas permisos.
        </p>
      </div>
    )
  }

  return (
    <OrganizationForm
      defaultName={org.name}
      defaultLogoUrl={org.logo_url ?? ''}
    />
  )
}
