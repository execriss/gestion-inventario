'use client'

import { useState } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { Loader2, Crown } from 'lucide-react'

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!)

interface PlanButtonProps {
  planId: 'pro'
}

export function PlanButton({ planId }: PlanButtonProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al procesar el pago')
        return
      }

      setPreferenceId(data.preferenceId)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (preferenceId) {
    return (
      <div className="w-full">
        <p className="text-xs text-muted-foreground text-center mb-3">
          Completá el pago de forma segura con Mercado Pago
        </p>
        <Wallet initialization={{ preferenceId }} />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold text-white transition-all hover:from-cyan-400 hover:to-violet-500 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Procesando...
          </>
        ) : (
          <>
            <Crown className="size-4" aria-hidden="true" />
            Suscribirme al Plan Pro — $12.990/mes
          </>
        )}
      </button>
      {error && (
        <p className="text-center text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
