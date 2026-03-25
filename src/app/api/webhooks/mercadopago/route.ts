import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPayment, PLAN_DURATION_DAYS } from '@/lib/mercadopago'

// ── Validación de firma HMAC ─────────────────────────────────────────────────
// MercadoPago envía en cada webhook:
//   x-signature: ts=<timestamp>,v1=<hmac-sha256>
//   x-request-id: <uuid>
// El HMAC se calcula sobre "id=<paymentId>;request-id=<requestId>;ts=<timestamp>"
// usando MERCADOPAGO_WEBHOOK_SECRET como clave.

async function verifySignature(req: Request, paymentId: string): Promise<boolean> {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) {
    // Sin secreto configurado: solo advertir. Configurar en producción.
    console.warn('[webhook/mp] MERCADOPAGO_WEBHOOK_SECRET no configurado — validación omitida')
    return true
  }

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')

  if (!xSignature || !xRequestId) {
    console.error('[webhook/mp] Headers de firma ausentes')
    return false
  }

  // Extraer ts y v1 del header x-signature
  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // Construir el mensaje a firmar
  const message = `id=${paymentId};request-id=${xRequestId};ts=${ts}`

  // Calcular HMAC-SHA256
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const computed = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (computed !== v1) {
    console.error('[webhook/mp] Firma inválida')
    return false
  }

  return true
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  // Solo procesamos eventos de tipo "payment"
  if (!body || body.type !== 'payment') {
    return NextResponse.json({ ok: true })
  }

  const paymentId = String(body?.data?.id ?? '')
  if (!paymentId || !/^\d+$/.test(paymentId)) {
    return NextResponse.json({ error: 'Missing or invalid payment id' }, { status: 400 })
  }

  // Verificar firma antes de procesar
  const valid = await verifySignature(req, paymentId)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  let payment
  try {
    payment = await getPayment(paymentId)
  } catch (error) {
    console.error('[webhook/mp] Failed to fetch payment:', error)
    return NextResponse.json({ error: 'Could not fetch payment' }, { status: 500 })
  }

  // Solo procesar pagos aprobados
  if (payment.status !== 'approved') {
    return NextResponse.json({ ok: true })
  }

  const externalRef = payment.external_reference
  if (!externalRef) {
    return NextResponse.json({ error: 'Missing external_reference' }, { status: 400 })
  }

  // Formato esperado: "orgId:planId"
  const [orgId, planId] = externalRef.split(':')
  if (!orgId || !planId || planId !== 'pro') {
    console.error('[webhook/mp] Invalid external_reference:', externalRef)
    return NextResponse.json({ error: 'Invalid external_reference' }, { status: 400 })
  }

  // Calcular fecha de expiración (+31 días)
  const planExpiresAt = new Date()
  planExpiresAt.setDate(planExpiresAt.getDate() + PLAN_DURATION_DAYS)

  // Actualizar la organización con el plan Pro
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('organizations')
    .update({ plan: 'pro', plan_expires_at: planExpiresAt.toISOString() })
    .eq('id', orgId)

  if (error) {
    console.error('[webhook/mp] DB update error:', error)
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
  }

  console.log(`[webhook/mp] Plan Pro activado para org ${orgId} hasta ${planExpiresAt.toISOString()}`)
  return NextResponse.json({ ok: true })
}
