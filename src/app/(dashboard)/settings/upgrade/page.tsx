import { CheckCircle2, Package, Users, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/supabase/org'
import { getMyOrganization } from '@/actions/organizations.actions'
import { UpgradeForm } from './upgrade-form'

export default async function UpgradePage() {
  const [org, supabase] = await Promise.all([
    getMyOrganization(),
    createClient(),
  ])

  if (!org) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-muted-foreground">
          No se pudo cargar la organizacion. Verifica que tengas permisos.
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

  const isPro = org.plan === 'pro'

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
    memberCount = members.count ?? 0
  }

  // Obtener datos del usuario para el formulario
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      {/* Banner de plan actual */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Crown
                className="size-5 text-primary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Plan actual
              </h2>
              <p className="text-sm text-muted-foreground">{org.name}</p>
            </div>
          </div>
          <Badge
            variant={isPro ? 'default' : 'secondary'}
            className={
              isPro
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1 text-sm font-semibold text-white'
                : 'px-4 py-1 text-sm font-medium'
            }
          >
            {isPro ? 'Plan Pro' : 'Plan Free'}
          </Badge>
        </div>
      </div>

      {isPro ? (
        /* Ya es Pro */
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2
              className="size-8 text-emerald-500"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Tu organizacion ya tiene el plan Pro
          </h3>
          <p className="mt-2 text-muted-foreground">
            Disfruta de productos ilimitados, miembros ilimitados y todas las
            funcionalidades premium. Gracias por confiar en nosotros.
          </p>
        </div>
      ) : (
        <>
          {/* Stats de uso */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Productos activos */}
            <div className="glass-card rounded-xl p-6">
              <div className="mb-3 flex items-center gap-2">
                <Package
                  className="size-4 text-primary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-foreground">
                  Productos activos
                </span>
              </div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {productCount}
                </span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={productCount}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${productCount} de 100 productos activos`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min((productCount / 100) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {productCount >= 100
                  ? 'Alcanzaste el limite del plan Free'
                  : `${100 - productCount} productos disponibles`}
              </p>
            </div>

            {/* Miembros del equipo */}
            <div className="glass-card rounded-xl p-6">
              <div className="mb-3 flex items-center gap-2">
                <Users
                  className="size-4 text-primary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-foreground">
                  Miembros del equipo
                </span>
              </div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {memberCount}
                </span>
                <span className="text-sm text-muted-foreground">/ 3</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={memberCount}
                aria-valuemin={0}
                aria-valuemax={3}
                aria-label={`${memberCount} de 3 miembros del equipo`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${Math.min((memberCount / 3) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {memberCount >= 3
                  ? 'Alcanzaste el limite del plan Free'
                  : `${3 - memberCount} lugar${3 - memberCount !== 1 ? 'es' : ''} disponible${3 - memberCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Formulario de upgrade (solo admins) */}
          <UpgradeForm
            contactName={profile?.full_name ?? 'Sin nombre'}
            contactEmail={user?.email ?? ''}
            orgName={org.name}
            isAdmin={auth.role === 'admin'}
          />
        </>
      )}
    </div>
  )
}
