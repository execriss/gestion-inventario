import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Section,
  Row,
  Column,
} from '@react-email/components'

interface UpgradeRequestEmailProps {
  orgName: string
  contactName: string
  contactEmail: string
  currentProducts: number
  currentMembers: number
  message?: string
}

export function UpgradeRequestEmail({
  orgName,
  contactName,
  contactEmail,
  currentProducts,
  currentMembers,
  message,
}: UpgradeRequestEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Solicitud de upgrade a Pro</Heading>
          <Text style={paragraph}>
            <strong>{contactName}</strong> de la organizacion{' '}
            <strong>{orgName}</strong> quiere pasar al plan Pro.
          </Text>

          <Hr style={hr} />

          {/* Contact info */}
          <Text style={label}>Datos de contacto</Text>
          <Section style={infoBox}>
            <Row>
              <Column style={infoLabel}>Nombre</Column>
              <Column style={infoValue}>{contactName}</Column>
            </Row>
            <Row>
              <Column style={infoLabel}>Email</Column>
              <Column style={infoValue}>{contactEmail}</Column>
            </Row>
            <Row>
              <Column style={infoLabel}>Organizacion</Column>
              <Column style={infoValue}>{orgName}</Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Usage stats */}
          <Text style={label}>Uso actual (Plan Free)</Text>
          <Section style={infoBox}>
            <Row>
              <Column style={infoLabel}>Productos activos</Column>
              <Column style={infoValue}>
                {currentProducts} / 100
              </Column>
            </Row>
            <Row>
              <Column style={infoLabel}>Miembros del equipo</Column>
              <Column style={infoValue}>
                {currentMembers} / 3
              </Column>
            </Row>
          </Section>

          {/* Optional message */}
          {message && (
            <>
              <Hr style={hr} />
              <Text style={label}>Mensaje del usuario</Text>
              <Section style={messageBox}>
                <Text style={messageText}>{message}</Text>
              </Section>
            </>
          )}

          <Hr style={hr} />

          {/* Instructions */}
          <Section style={instructionBox}>
            <Heading as="h3" style={instructionHeading}>
              Para activar el plan Pro
            </Heading>
            <Text style={instructionText}>
              1. Ir a Supabase → Table Editor → <strong>organizations</strong>
            </Text>
            <Text style={instructionText}>
              2. Buscar la organizacion <strong>{orgName}</strong>
            </Text>
            <Text style={instructionText}>
              3. Cambiar el campo <strong>plan</strong> de{' '}
              <code style={code}>free</code> a <code style={code}>pro</code>
            </Text>
            <Text style={instructionText}>
              4. Responder a este email confirmandole al cliente
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            Este email fue generado automaticamente por Inventario Pro.
            Podes responder directamente a este mensaje para contactar a{' '}
            <strong>{contactName}</strong> ({contactEmail}).
          </Text>
        </Container>
      </Body>
    </Html>
  )
}


// -- Styles ------------------------------------------------------------------

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

const label: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const infoBox: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '12px 16px',
}

const infoLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '6px 0',
  width: '50%',
}

const infoValue: React.CSSProperties = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 600,
  padding: '6px 0',
  width: '50%',
}

const messageBox: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '6px',
  padding: '12px 16px',
}

const messageText: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
  fontStyle: 'italic' as const,
}

const instructionBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '6px',
  padding: '16px 20px',
}

const instructionHeading: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: 700,
  margin: '0 0 12px',
}

const instructionText: React.CSSProperties = {
  color: '#1e3a5f',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 4px',
}

const code: React.CSSProperties = {
  backgroundColor: '#e0e7ff',
  borderRadius: '3px',
  color: '#3730a3',
  fontFamily: 'monospace',
  fontSize: '13px',
  padding: '2px 6px',
}

const footer: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
}
