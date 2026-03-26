-- ============================================================
-- MIGRACIÓN 007: API Keys para acceso externo (Plan Pro)
-- ============================================================

-- ============================================================
-- TABLA: api_keys (keys de acceso externo por organización)
-- ============================================================
CREATE TABLE public.api_keys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID    NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  api_key         TEXT    NOT NULL UNIQUE DEFAULT 'ivk_' || encode(gen_random_bytes(24), 'hex'),
  key_prefix      TEXT    NOT NULL DEFAULT '',   -- primeros 16 chars, para mostrar en UI
  label           TEXT,                          -- nombre descriptivo (ej: "Integración ERP")
  created_by      UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_used_at    TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,                   -- NULL = activa, timestamp = revocada
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org  ON public.api_keys(organization_id);
CREATE INDEX idx_api_keys_key  ON public.api_keys(api_key) WHERE revoked_at IS NULL;

-- Trigger: rellenar key_prefix automáticamente
CREATE OR REPLACE FUNCTION public.set_api_key_prefix()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.key_prefix := LEFT(NEW.api_key, 16);
  RETURN NEW;
END;
$$;

CREATE TRIGGER api_keys_set_prefix
  BEFORE INSERT ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_api_key_prefix();

-- ============================================================
-- RLS: solo admin de la organización puede gestionar sus keys
-- ============================================================
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Leer: admin y operator ven las keys de su org (sin ver api_key completa — la app la oculta)
CREATE POLICY "org members can view api keys"
  ON public.api_keys FOR SELECT
  USING (organization_id = (SELECT public.get_my_org_id()));

-- Crear: solo admin puede generar keys
CREATE POLICY "admin can create api keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

-- Actualizar (revocar): solo admin puede revocar
CREATE POLICY "admin can revoke api keys"
  ON public.api_keys FOR UPDATE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );
