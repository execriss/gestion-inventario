import Link from 'next/link'
import { CheckCircle2, Crown, ArrowRight, Clock, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { getPayment, PLAN_DURATION_DAYS } from '@/lib/mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Activa el plan Pro para la org si el pago está aprobado.
 * Es idempotente: si el webhook ya lo activó, no hace nada.
 */
async function tryActivatePlan(
  paymentId: string,
): Promise<'activated' | 'already_pro' | 'pending' | 'error'> {
  try {
    const supabase = await createClient()
    const auth = await requireOrgRole(supabase, 'viewer')
    if ('error' in auth) return 'error'

    // Si el webhook llegó primero y ya activó el plan, no hacer nada
    const { data: org } = await supabase
      .from('organizations')
      .select('plan, plan_expires_at')
      .eq('id', auth.orgId)
      .single()

    const now = new Date()
    const expires = org?.plan_expires_at ? new Date(org.plan_expires_at) : null
    if (org?.plan === 'pro' && (!expires || expires > now)) {
      return 'already_pro'
    }

    // Verificar el pago directamente con la API de MP
    const payment = await getPayment(paymentId)

    if (payment.status === 'pending' || payment.status === 'in_process') {
      return 'pending'
    }

    if (payment.status !== 'approved') {
      return 'error'
    }

    // Validar que el external_reference corresponde a esta org
    const [orgIdFromRef] = (payment.external_reference ?? '').split(':')
    if (orgIdFromRef !== auth.orgId) {
      console.error('[success/page] external_reference mismatch', {
        orgIdFromRef,
        orgId: auth.orgId,
      })
      return 'error'
    }

    // Activar el plan
    const planExpiresAt = new Date()
    planExpiresAt.setDate(planExpiresAt.getDate() + PLAN_DURATION_DAYS)

    const adminClient = createAdminClient()
    const { error: dbError } = await adminClient
      .from('organizations')
      .update({ plan: 'pro', plan_expires_at: planExpiresAt.toISOString() })
      .eq('id', auth.orgId)

    if (dbError) {
      console.error('[success/page] DB update error:', dbError)
      return 'error'
    }

    console.log(`[success/page] Plan Pro activado para org ${auth.orgId}`)
    return 'activated'
  } catch (e) {
    console.error('[success/page] Error:', e)
    return 'error'
  }
}

export default async function UpgradeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  // MP envía payment_id y collection_id (mismo valor) en la redirección
  const paymentId = params.payment_id ?? params.collection_id

  const result = paymentId ? await tryActivatePlan(paymentId) : 'pending'

  const isSuccess = result === 'activated' || result === 'already_pro'
  const isPending = result === 'pending'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="glass-card w-full max-w-md rounded-2xl p-10 text-center space-y-6">
        {/* Ícono */}
        <div
          className={`mx-auto flex size-20 items-center justify-center rounded-full ${
            isSuccess
              ? 'bg-emerald-500/10'
              : isPending
                ? 'bg-amber-500/10'
                : 'bg-destructive/10'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2
              className="size-10 text-emerald-400"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          ) : isPending ? (
            <Clock
              className="size-10 text-amber-400"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="size-10 text-destructive"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Título */}
        <div className="space-y-2">
          {isSuccess ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">¡Plan Pro activado!</h1>
              <p className="text-muted-foreground text-sm">
                Tu organización ya tiene acceso a todas las funcionalidades del plan Pro.
              </p>
            </>
          ) : isPending ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Pago en proceso</h1>
              <p className="text-muted-foreground text-sm">
                Tu pago está siendo procesado. En cuanto se confirme, tu plan se activará
                automáticamente.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Algo salió mal</h1>
              <p className="text-muted-foreground text-sm">
                No pudimos verificar tu pago. Si el cargo se realizó,{' '}
                <Link
                  href="/settings/upgrade"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  recargá esta página
                </Link>{' '}
                en un momento.
              </p>
            </>
          )}
        </div>

        {/* Info card — solo si el plan quedó activo */}
        {isSuccess && (
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Crown className="size-4 text-cyan-400" aria-hidden="true" />
              <span className="font-medium text-cyan-400">Plan Pro activo por 31 días</span>
            </div>
            <p>
              Productos y miembros ilimitados, alertas por email y exportación CSV habilitados.
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold text-white transition-all hover:from-cyan-400 hover:to-violet-500"
          >
            Ir al dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          {!isSuccess && (
            <Link
              href="/settings/upgrade"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
            >
              Ver estado del plan
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
