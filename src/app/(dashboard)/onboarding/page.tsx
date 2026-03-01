'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Building2, Loader2, LogOut } from 'lucide-react'
import { logoutAction } from '@/actions/auth.actions'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="glass-card w-full max-w-lg rounded-2xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-neon-amber/15">
          <Building2
            className="size-8 text-neon-amber"
            aria-hidden="true"
          />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-xl font-bold text-foreground">
          Tu cuenta no esta asociada a ningun negocio
        </h1>

        {/* Description */}
        <p className="mb-8 text-sm text-muted-foreground">
          Esto puede pasar si tu link de invitacion fue revocado. Contacta al
          administrador de tu equipo o crea un nuevo negocio.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            <Link href="/register">
              <Building2 className="mr-2 size-4" aria-hidden="true" />
              Crear un negocio nuevo
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            {isPending ? (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <LogOut className="mr-2 size-4" aria-hidden="true" />
            )}
            Cerrar sesion
          </Button>
        </div>
      </div>
    </div>
  )
}
