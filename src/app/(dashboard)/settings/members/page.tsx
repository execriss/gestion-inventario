import { getOrgMembers } from '@/actions/organizations.actions'
import { getActiveInvitations } from '@/actions/invitations.actions'
import { MembersSection } from './members-section'
import { InvitationsSection } from './invitations-section'
import { CreateInvitationForm } from './create-invitation-form'

export default async function MembersPage() {
  const [membersResult, invitations] = await Promise.all([
    getOrgMembers(),
    getActiveInvitations(),
  ])

  return (
    <div className="space-y-6">
      <MembersSection members={membersResult.members} />
      <InvitationsSection invitations={invitations} />
      <CreateInvitationForm />
    </div>
  )
}
