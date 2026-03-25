# Pendientes

## Auth y usuarios

- [ ] **Verificación de email**: Actualmente desactivada en Supabase (Authentication → Providers → Email → "Confirm email"). Cuando la app escale o se quiera mayor seguridad, activarla y manejar el flujo correctamente: mostrar pantalla "Revisá tu email" después del registro en lugar de redirigir directo al dashboard.

## Moneda

- [ ] **Soporte multi-moneda**: La app actualmente usa pesos argentinos (ARS) de forma fija con `Intl.NumberFormat('es-AR', { currency: 'ARS' })`. Cuando se quiera soportar otras monedas, agregar campo `currency` en `organizations` y hacer que `formatCurrency` sea dinámico según la org.

## Reportes

- [ ] **Buscador en página de ayuda**: El buscador en `/ayuda` es solo visual (desactivado). Implementarlo con búsqueda real por anclas/secciones cuando haya más contenido.

## Funcionalidades futuras

- [ ] **Plan Pro**: La página de upgrade (`/settings/upgrade`) ya existe pero el flujo de pago no está implementado. Integrar Stripe u otro procesador.
- [ ] **Alertas por email**: La infraestructura con Resend ya está, pero las alertas automáticas de stock bajo por email están desactivadas por defecto (`email_alerts_enabled: false`). Activar y testear el flujo completo.
- [ ] **Exportación PDF**: El botón de exportar menciona PDF en la landing pero solo está implementado CSV.
