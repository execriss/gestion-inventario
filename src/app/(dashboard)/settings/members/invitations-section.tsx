'use client'

import { useTransition } from 'react'
import { Loader2, Link2, Trash2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { revokeInvitation } from '@/actions/invitations.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  operator: 'Operador',
  viewer: 'Observador',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30',
  operator: 'bg-neon-violet/15 text-neon-violet border-neon-violet/30',
  viewer: 'bg-muted text-muted-foreground border-border',
}

interface Invitation {
  id: string
  token: string
  role: string
  label: string | null
  expires_at: string
  max_uses: number
  use_count: number
}

interface InvitationsSectionProps {
  invitations: Invitation[]
}

function formatExpiration(date: string): string {
  const diff = new Date(date).getTime() - Date.now()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d restantes`
  if (hours > 0) return `${hours}h restantes`
  return 'Expira pronto'
}

export function InvitationsSection({ invitations }: InvitationsSectionProps) {
  const [isPending, startTransition] = useTransition()

  function handleRevoke(invitationId: string) {
    if (!confirm('Seguro que queres revocar esta invitacion?')) return
    startTransition(async () => {
      const result = await revokeInvitation(invitationId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Invitacion revocada')
      }
    })
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <Link2 className="size-5 text-neon-violet" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">
          Invitaciones activas
        </h2>
        <Badge variant="outline" className="ml-auto">
          {invitations.length}
        </Badge>
      </div>

      {invitations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay invitaciones activas.
        </p>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-background/30 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 border text-xs',
                      ROLE_COLORS[inv.role] ?? ROLE_COLORS.viewer
                    )}
                  >
                    {ROLE_LABELS[inv.role] ?? inv.role}
                  </Badge>
                  {inv.label && (
                    <span className="truncate text-sm text-muted-foreground">
                      {inv.label}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" aria-hidden="true" />
                  <span>{formatExpiration(inv.expires_at)}</span>
                  <span className="mx-1">-</span>
                  <span>
                    {inv.use_count}/{inv.max_uses === 0 ? 'ilimitado' : inv.max_uses}{' '}
                    usos
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleRevoke(inv.id)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2
                    className="mr-1.5 size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="mr-1.5 size-3.5" aria-hidden="true" />
                )}
                Revocar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
