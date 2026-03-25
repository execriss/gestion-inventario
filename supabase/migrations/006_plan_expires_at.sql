-- ============================================================
-- MIGRACIÓN 006: Agregar plan_expires_at a organizations
-- Permite controlar la vigencia del plan Pro por fecha.
-- Aplicar en Supabase SQL Editor (es aditiva, no destruye datos)
-- ============================================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ DEFAULT NULL;

-- Índice para consultas de expiración (usado en getEffectivePlan)
CREATE INDEX IF NOT EXISTS idx_organizations_plan_expires_at
  ON public.organizations (plan_expires_at)
  WHERE plan_expires_at IS NOT NULL;

-- Comentario descriptivo
COMMENT ON COLUMN public.organizations.plan_expires_at IS
  'Fecha de expiración del plan Pro. NULL = sin fecha límite (solo aplica si plan = pro).';
