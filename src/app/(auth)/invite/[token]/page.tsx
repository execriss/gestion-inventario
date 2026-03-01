import { createClient } from '@/lib/supabase/server'
import { getInvitationByToken } from '@/actions/invitations.actions'
import { InviteInvalidState } from './invite-invalid-state'
import { InviteAcceptForm } from './invite-accept-form'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  operator: 'Operador',
  viewer: 'Observador',
}

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  const invitation = await getInvitationByToken(token)

  if (!invitation.valid) {
    return <InviteInvalidState reason={invitation.reason} />
  }

  // Check if user is already authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const roleLabel = ROLE_LABELS[invitation.role] ?? invitation.role

  return (
    <InviteAcceptForm
      token={token}
      orgName={invitation.orgName}
      roleLabel={roleLabel}
      isAuthenticated={!!user}
    />
  )
}
