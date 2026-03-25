import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function UpgradeFailurePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="glass-card w-full max-w-md rounded-2xl p-10 text-center space-y-6">
        {/* Ícono */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <XCircle
            className="size-10 text-destructive"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            El pago no se completó
          </h1>
          <p className="text-muted-foreground">
            No se realizó ningún cargo. Podés intentarlo de nuevo cuando quieras.
          </p>
        </div>

        {/* Causas posibles */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-left space-y-1.5">
          <p className="font-medium text-foreground mb-2">Posibles causas:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Fondos insuficientes en la cuenta o tarjeta</li>
            <li>• El banco rechazó la transacción</li>
            <li>• La sesión de pago expiró</li>
            <li>• Cancelaste el proceso manualmente</li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/settings/upgrade"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold text-white transition-all hover:from-cyan-400 hover:to-violet-500"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Intentar de nuevo
          </Link>

          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
