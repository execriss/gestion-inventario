import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Link,
  Section,
  Row,
  Column,
} from '@react-email/components'

interface StockAlertProduct {
  name: string
  sku: string | null
  current_stock: number
  min_stock: number
  unit: string
}

interface StockAlertEmailProps {
  orgName: string
  products: StockAlertProduct[]
  alertsUrl: string
}

export function StockAlertEmail({
  orgName,
  products,
  alertsUrl,
}: StockAlertEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Alerta de stock bajo</Heading>
          <Text style={paragraph}>
            Se detectaron <strong>{products.length}</strong> producto(s) con
            stock por debajo del minimo en <strong>{orgName}</strong>.
          </Text>

          <Hr style={hr} />

          {/* Table header */}
          <Section style={tableHeader}>
            <Row>
              <Column style={{ ...headerCell, width: '40%' }}>Producto</Column>
              <Column style={{ ...headerCell, width: '20%' }}>SKU</Column>
              <Column style={{ ...headerCell, width: '20%' }}>Actual</Column>
              <Column style={{ ...headerCell, width: '20%' }}>Minimo</Column>
            </Row>
          </Section>

          {/* Table rows */}
          {products.map((product, index) => (
            <Section
              key={index}
              style={index % 2 === 0 ? tableRowEven : tableRowOdd}
            >
              <Row>
                <Column style={{ ...cell, width: '40%' }}>
                  {product.name}
                </Column>
                <Column style={{ ...cell, width: '20%', color: '#6b7280' }}>
                  {product.sku || '-'}
                </Column>
                <Column
                  style={{ ...cell, width: '20%', color: '#dc2626', fontWeight: 'bold' }}
                >
                  {product.current_stock} {product.unit}
                </Column>
                <Column style={{ ...cell, width: '20%' }}>
                  {product.min_stock} {product.unit}
                </Column>
              </Row>
            </Section>
          ))}

          <Hr style={hr} />

          {/* CTA Button */}
          <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <Link href={alertsUrl} style={button}>
              Ver alertas de stock
            </Link>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            Este email fue enviado automaticamente por Inventario Pro para{' '}
            <strong>{orgName}</strong>. Podes desactivar estas notificaciones
            desde la configuracion de tu organizacion.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default StockAlertEmail

// ── Styles ────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '32px',
  maxWidth: '600px',
}

const heading: React.CSSProperties = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 700,
  margin: '0 0 16px',
}

const paragraph: React.CSSProperties = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const tableHeader: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  borderRadius: '4px 4px 0 0',
  padding: '0',
}

const headerCell: React.CSSProperties = {
  color: '#374151',
  fontSize: '12px',
  fontWeight: 600,
  padding: '10px 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const tableRowEven: React.CSSProperties = {
  backgroundColor: '#ffffff',
}

const tableRowOdd: React.CSSProperties = {
  backgroundColor: '#f9fafb',
}

const cell: React.CSSProperties = {
  color: '#111827',
  fontSize: '14px',
  padding: '10px 12px',
}

const button: React.CSSProperties = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 600,
  padding: '12px 32px',
  textDecoration: 'none',
}

const footer: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
}
