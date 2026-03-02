import { Resend } from 'resend'
import { StockAlertEmail } from './templates/stock-alert'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface StockProduct {
  name: string
  sku: string | null
  current_stock: number
  min_stock: number
  unit: string
}

interface SendStockAlertParams {
  to: string[]
  orgName: string
  products: StockProduct[]
  appUrl: string
}

export async function sendStockAlert(params: SendStockAlertParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  if (params.to.length === 0) return

  const alertsUrl = `${params.appUrl}/alerts`

  await resend.emails.send({
    from: 'Inventario Pro <alertas@inventariopro.com>',
    to: params.to,
    subject: `\u26a0\ufe0f Alerta de stock: ${params.products.length} producto(s) bajo minimo \u2014 ${params.orgName}`,
    react: StockAlertEmail({
      orgName: params.orgName,
      products: params.products,
      alertsUrl,
    }),
  })
}
