import type { OrgPlan } from '@/types/database.types'

// ── Definición de planes ──────────────────────────────────────────

export const PLAN_LIMITS = {
  free: {
    maxProducts: 50,
    maxMembers:  3,
    emailAlerts: false,
    csvExport:   false,
  },
  pro: {
    maxProducts: Infinity,
    maxMembers:  Infinity,
    emailAlerts: true,
    csvExport:   true,
  },
} as const satisfies Record<OrgPlan, {
  maxProducts: number
  maxMembers:  number
  emailAlerts: boolean
  csvExport:   boolean
}>

export type PlanFeature = keyof typeof PLAN_LIMITS.free

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Devuelve el plan efectivo teniendo en cuenta la expiración.
 * Si el plan Pro expiró, retorna 'free'.
 */
export function getEffectivePlan(
  plan: OrgPlan,
  planExpiresAt: string | null | undefined,
): OrgPlan {
  if (plan === 'pro' && planExpiresAt && new Date() > new Date(planExpiresAt)) {
    return 'free'
  }
  return plan
}

/** Retorna true si el plan tiene acceso a la feature dada. */
export function canUseFeature(
  plan: OrgPlan,
  planExpiresAt: string | null | undefined,
  feature: PlanFeature,
): boolean {
  const effective = getEffectivePlan(plan, planExpiresAt)
  return PLAN_LIMITS[effective][feature] as boolean
}

/** Retorna los límites del plan efectivo. */
export function getPlanLimits(
  plan: OrgPlan,
  planExpiresAt: string | null | undefined,
) {
  const effective = getEffectivePlan(plan, planExpiresAt)
  return PLAN_LIMITS[effective]
}
