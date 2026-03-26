import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { createPreference, MP_PLAN_CONFIG, type PaidPlanId } from '@/lib/mercadopago'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://inventario.exegestion.com'

const PAID_PLANS = new Set<PaidPlanId>(['pro'])

export async function POST(req: Request) {
  const supabase = await createClient()

  // Verificar autenticación y rol admin
  const auth = await requireOrgRole(supabase, 'admin')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 403 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const planId = body?.planId as PaidPlanId | undefined

  if (!planId || !PAID_PLANS.has(planId)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  // Verificar que no ya tenga el plan activo
  const { data: org } = await supabase
    .from('organizations')
    .select('plan, plan_expires_at, name')
    .eq('id', auth.orgId)
    .single()

  if (org?.plan === 'pro') {
    const expires = org.plan_expires_at ? new Date(org.plan_expires_at) : null
    if (!expires || expires > new Date()) {
      return NextResponse.json(
        { error: 'Tu organización ya tiene el plan Pro activo.' },
        { status: 400 },
      )
    }
  }

  const config = MP_PLAN_CONFIG[planId]

  // MP rechaza localhost como notification_url — solo incluirla en producción
  const isLocalhost = APP_URL.includes('localhost') || APP_URL.includes('127.0.0.1')

  try {
    const preference = await createPreference({
      items: [
        {
          title:       config.reason,
          quantity:    1,
          unit_price:  config.amount,
          currency_id: config.currencyId,
        },
      ],
      payer: { email: user.email! },
      back_urls: {
        success: `${APP_URL}/settings/upgrade/success?plan=${planId}`,
        failure: `${APP_URL}/settings/upgrade/failure`,
        pending: `${APP_URL}/settings/upgrade/success?plan=${planId}`,
      },
      external_reference: `${auth.orgId}:${planId}`,
      // auto_return y notification_url solo funcionan con URLs públicas
      ...(!isLocalhost && {
        auto_return:      'approved',
        notification_url: `${APP_URL}/api/webhooks/mercadopago`,
      }),
    })

    return NextResponse.json({ preferenceId: preference.id })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[subscribe] MercadoPago error:', msg)
    return NextResponse.json({ error: 'Error al conectar con Mercado Pago' }, { status: 500 })
  }
}
