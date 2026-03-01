'use client'

import Link from 'next/link'
import { AlertCircle, Clock, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const REASON_CONFIG: Record<
  string,
  { icon: typeof AlertCircle; title: string; description: string }
> = {
  not_found: {
    icon: AlertCircle,
    title: 'Invitacion no encontrada',
    description:
      'Este link de invitacion no existe o fue revocado por el administrador.',
  },
  expired: {
    icon: Clock,
    title: 'Invitacion expirada',
    description:
      'Este link de invitacion ya expiro. Pedi al administrador que genere uno nuevo.',
  },
  used: {
    icon: UserCheck,
    title: 'Invitacion ya utilizada',
    description:
      'Este link de invitacion ya fue utilizado. Si necesitas acceso, contacta al administrador.',
  },
}

interface InviteInvalidStateProps {
  reason: string
}

export function InviteInvalidState({ reason }: InviteInvalidStateProps) {
  const config = REASON_CONFIG[reason] ?? REASON_CONFIG.not_found
  const Icon = config.icon

  return (
    <div
      className={cn(
        'glass-card relative z-10 w-full max-w-md rounded-2xl p-8',
        'transition-shadow duration-300'
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/15">
          <Icon className="size-8 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{config.title}</h1>
        <p className="text-sm text-muted-foreground">{config.description}</p>
        <Button asChild className="mt-4 w-full" variant="outline">
          <Link href="/login">Ir al inicio de sesion</Link>
        </Button>
      </div>
    </div>
  )
}
