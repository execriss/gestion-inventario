'use client'

import { useTransition } from 'react'
import { Loader2, Send, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { requestUpgrade } from '@/actions/upgrade.actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface UpgradeFormProps {
  contactName: string
  contactEmail: string
  orgName: string
  isAdmin: boolean
}

export function UpgradeForm({
  contactName,
  contactEmail,
  orgName,
  isAdmin,
}: UpgradeFormProps) {
  const [isPending, startTransition] = useTransition()

  if (!isAdmin) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Lock className="size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm">
            Solo los administradores de la organizacion pueden solicitar el
            upgrade a Pro. Contacta a un admin de tu equipo.
          </p>
        </div>
      </div>
    )
  }

  function handleSubmit(formData: FormData) {
    const message = formData.get('message') as string
    startTransition(async () => {
      const result = await requestUpgrade({
        message: message || undefined,
      })
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Solicitud enviada. Te contactaremos a la brevedad.')
      }
    })
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          Solicitar upgrade a Pro
        </h2>
        <p className="text-sm text-muted-foreground">
          Envia una solicitud y te contactaremos para activar el plan Pro en tu
          organizacion.
        </p>
      </div>

      {/* Datos del solicitante (read-only) */}
      <div className="mb-6 space-y-3 rounded-lg bg-muted/50 p-4">
        <div className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Nombre
          </span>
          <span className="text-sm text-foreground">{contactName}</span>
        </div>
        <div className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Email
          </span>
          <span className="text-sm text-foreground">{contactEmail}</span>
        </div>
        <div className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Organizacion
          </span>
          <span className="text-sm text-foreground">{orgName}</span>
        </div>
      </div>

      {/* Form */}
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="upgrade-message">
            Algun comentario adicional?{' '}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="upgrade-message"
            name="message"
            placeholder="Contanos por que necesitas el plan Pro, cuantos productos manejas, etc."
            maxLength={500}
            rows={4}
            disabled={isPending}
            className="resize-none"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            {isPending ? (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Send className="mr-2 size-4" aria-hidden="true" />
            )}
            Enviar solicitud de upgrade
          </Button>
        </div>
      </form>
    </div>
  )
}
