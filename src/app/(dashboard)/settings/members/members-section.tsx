'use client'

import { useTransition } from 'react'
import { Loader2, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { updateMemberRole, removeMember } from '@/actions/organizations.actions'
import { type UserRole } from '@/types/database.types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface Member {
  id: string
  user_id: string
  role: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface MembersSectionProps {
  members: Member[]
}

export function MembersSection({ members }: MembersSectionProps) {
  const [isPending, startTransition] = useTransition()

  function handleRoleChange(memberId: string, newRole: UserRole) {
    startTransition(async () => {
      const result = await updateMemberRole(memberId, newRole)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Rol actualizado')
      }
    })
  }

  function handleRemove(memberId: string, name: string) {
    if (!confirm(`Seguro que queres eliminar a ${name} del equipo?`)) return
    startTransition(async () => {
      const result = await removeMember(memberId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Miembro eliminado')
      }
    })
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <Users className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">
          Miembros actuales
        </h2>
        <Badge variant="outline" className="ml-auto">
          {members.length}
        </Badge>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay miembros en esta organizacion.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const name = member.profiles?.full_name ?? 'Sin nombre'
            const avatarUrl = member.profiles?.avatar_url ?? null
            const role = member.role as UserRole

            return (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-background/30 px-4 py-3"
              >
                <Avatar className="size-9 shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                  <AvatarFallback className="bg-primary/20 text-xs text-primary">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {name}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 border text-xs',
                    ROLE_COLORS[role] ?? ROLE_COLORS.viewer
                  )}
                >
                  {ROLE_LABELS[role] ?? role}
                </Badge>

                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Select
                    defaultValue={role}
                    onValueChange={(value) =>
                      handleRoleChange(member.id, value as UserRole)
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full sm:w-32" aria-label="Cambiar rol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="operator">Operador</SelectItem>
                      <SelectItem value="viewer">Observador</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(member.id, name)}
                    disabled={isPending}
                    aria-label={`Eliminar a ${name}`}
                  >
                    {isPending ? (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
