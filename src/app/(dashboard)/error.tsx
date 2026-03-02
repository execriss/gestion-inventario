'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass-card mx-auto max-w-md rounded-2xl p-10 text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/15">
          <AlertTriangle
            className="size-8 text-destructive"
            aria-hidden="true"
          />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-foreground">
          Algo salió mal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocurrió un error inesperado al cargar esta sección. Podés intentar
          de nuevo o volver al dashboard.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground/60">
            Código: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Intentar de nuevo
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
