// Cliente de Mercado Pago — solo server-side

const MP_API = 'https://api.mercadopago.com'

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

// ── Configuración de planes ──────────────────────────────────────

export const MP_PLAN_CONFIG = {
  pro: {
    reason:     'Plan Pro — Inventario Pro',
    amount:     12990,
    currencyId: 'ARS',
  },
} as const

export type PaidPlanId = keyof typeof MP_PLAN_CONFIG

/** Días que dura el plan Pro tras cada pago — usado en el webhook y la success page */
export const PLAN_DURATION_DAYS = 31

// ── API ──────────────────────────────────────────────────────────

export interface MPPreferenceBody {
  items: {
    title:      string
    quantity:   number
    unit_price: number
    currency_id: string
  }[]
  payer:              { email: string }
  back_urls:          { success: string; failure: string; pending: string }
  auto_return?:       string
  external_reference: string
  notification_url?:  string
}

export async function createPreference(
  body: MPPreferenceBody,
): Promise<{ id: string; init_point: string; sandbox_init_point: string }> {
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method:  'POST',
    headers: getHeaders(),
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[MP] createPreference error:', err)
    throw new Error(`MP preference create failed: ${res.status} ${err}`)
  }

  return res.json()
}

export async function getPayment(id: string) {
  const res = await fetch(`${MP_API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  })

  if (!res.ok) throw new Error(`MP payment fetch failed: ${res.status}`)

  return res.json() as Promise<{
    status:             string
    external_reference: string | null
  }>
}
