import { CheckCircle2, Package, Users, Crown, Zap, Mail, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { getMyOrganization } from '@/actions/organizations.actions'
import { PLAN_LIMITS, getEffectivePlan } from '@/lib/plans'
import { PlanButton } from '@/components/plan-button'

export default async function UpgradePage() {
  const [org, supabase] = await Promise.all([
    getMyOrganization(),
    createClient(),
  ])

  if (!org) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-muted-foreground">
          No se pudo cargar la organización. Verificá que tengas permisos.
        </p>
      </div>
    )
  }

  const auth = await requireOrgRole(supabase, 'viewer')
  if ('error' in auth) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-muted-foreground">{auth.error}</p>
      </div>
    )
  }

  const effectivePlan = getEffectivePlan(org.plan, org.plan_expires_at)
  const isPro = effectivePlan === 'pro'
  const isAdmin = auth.role === 'admin'

  // Obtener stats de uso solo si es Free
  let productCount = 0
  let memberCount = 0

  if (!isPro) {
    const [products, members] = await Promise.all([
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)
        .eq('is_active', true),
      supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId),
    ])

    productCount = products.count ?? 0
    memberCount  = members.count  ?? 0
  }

  return (
    <div className="space-y-6">
      {/* Banner de plan actual */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Plan actual</h2>
              <p className="text-sm text-muted-foreground">{org.name}</p>
            </div>
          </div>
          <Badge
            className={
              isPro
                ? 'bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-1 text-sm font-semibold text-white'
                : 'px-4 py-1 text-sm font-medium'
            }
          >
            {isPro ? 'Plan Pro' : 'Plan Free'}
          </Badge>
        </div>

        {/* Fecha de expiración si es Pro */}
        {isPro && org.plan_expires_at && (
          <p className="mt-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
            Tu plan Pro renueva el{' '}
            <span className="font-medium text-foreground">
              {new Date(org.plan_expires_at).toLocaleDateString('es-AR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </p>
        )}
      </div>

      {isPro ? (
        /* Ya es Pro */
        <div className="glass-card rounded-xl p-8 text-center space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-8 text-emerald-500" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Tu organización tiene el plan Pro</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Productos y miembros ilimitados, alertas de stock por email, exportación CSV y más.
            </p>
          </div>

          {/* Features activas */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-sm text-left">
            {[
              { icon: Package, label: 'Productos ilimitados' },
              { icon: Users,   label: 'Miembros ilimitados' },
              { icon: Mail,    label: 'Alertas por email' },
              { icon: Download, label: 'Exportación CSV' },
              { icon: Zap,     label: 'Reportes avanzados' },
              { icon: Crown,   label: 'Soporte prioritario' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Stats de uso */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Productos activos */}
            <div className="glass-card rounded-xl p-6">
              <div className="mb-3 flex items-center gap-2">
                <Package className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm font-medium">Productos activos</span>
              </div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold">{productCount}</span>
                <span className="text-sm text-muted-foreground">/ {PLAN_LIMITS.free.maxProducts}</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={productCount}
                aria-valuemin={0}
                aria-valuemax={PLAN_LIMITS.free.maxProducts}
                aria-label={`${productCount} de ${PLAN_LIMITS.free.maxProducts} productos activos`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min((productCount / PLAN_LIMITS.free.maxProducts) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {productCount >= PLAN_LIMITS.free.maxProducts
                  ? 'Alcanzaste el límite del plan Free'
                  : `${PLAN_LIMITS.free.maxProducts - productCount} productos disponibles`}
              </p>
            </div>

            {/* Miembros del equipo */}
            <div className="glass-card rounded-xl p-6">
              <div className="mb-3 flex items-center gap-2">
                <Users className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm font-medium">Miembros del equipo</span>
              </div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold">{memberCount}</span>
                <span className="text-sm text-muted-foreground">/ {PLAN_LIMITS.free.maxMembers}</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={memberCount}
                aria-valuemin={0}
                aria-valuemax={PLAN_LIMITS.free.maxMembers}
                aria-label={`${memberCount} de ${PLAN_LIMITS.free.maxMembers} miembros`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${Math.min((memberCount / PLAN_LIMITS.free.maxMembers) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {memberCount >= PLAN_LIMITS.free.maxMembers
                  ? 'Alcanzaste el límite del plan Free'
                  : `${PLAN_LIMITS.free.maxMembers - memberCount} lugar${PLAN_LIMITS.free.maxMembers - memberCount !== 1 ? 'es' : ''} disponible${PLAN_LIMITS.free.maxMembers - memberCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Card de upgrade */}
          <div className="glass-card rounded-xl p-6 border border-cyan-400/10 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="size-4 text-cyan-400" aria-hidden="true" />
                  <span className="font-semibold text-cyan-400">Plan Pro</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Todo lo que necesitás para hacer crecer tu negocio sin límites.
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold">$12.990</p>
                <p className="text-xs text-muted-foreground">ARS / mes</p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
              {[
                { icon: Package,  label: 'Productos ilimitados' },
                { icon: Users,    label: 'Miembros ilimitados' },
                { icon: Mail,     label: 'Alertas de stock por email' },
                { icon: Download, label: 'Exportación de reportes en CSV' },
                { icon: Zap,      label: 'Reportes avanzados' },
                { icon: Crown,    label: 'Soporte prioritario' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>

            {/* Botón de pago o mensaje para no-admins */}
            {isAdmin ? (
              <PlanButton planId="pro" />
            ) : (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Solo los <span className="font-medium text-foreground">administradores</span> pueden
                  gestionar el plan. Pedile al admin de tu organización que active el Plan Pro.
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Pago seguro con Mercado Pago. El plan se activa automáticamente tras la confirmación.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
