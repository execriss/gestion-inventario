-- ============================================================
-- MIGRACIÓN 002: Schema Multi-Tenant
-- SaaS — cada negocio tiene su propia organización
-- Aplicar en Supabase SQL Editor (borra y recrea todo)
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CLEANUP: eliminar schema anterior (fresh start)
-- ============================================================
DROP TRIGGER IF EXISTS on_movement_created      ON public.inventory_movements;
DROP TRIGGER IF EXISTS on_auth_user_created     ON auth.users;
DROP TRIGGER IF EXISTS profiles_updated_at      ON public.profiles;
DROP TRIGGER IF EXISTS products_updated_at      ON public.products;
DROP TRIGGER IF EXISTS categories_updated_at    ON public.categories;
DROP TRIGGER IF EXISTS suppliers_updated_at     ON public.suppliers;

DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.products            CASCADE;
DROP TABLE IF EXISTS public.suppliers           CASCADE;
DROP TABLE IF EXISTS public.categories          CASCADE;
DROP TABLE IF EXISTS public.units               CASCADE;
DROP TABLE IF EXISTS public.profiles            CASCADE;

DROP FUNCTION IF EXISTS public.update_product_stock()  CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()       CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role()         CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at()     CASCADE;

DROP VIEW IF EXISTS public.low_stock_products;
DROP VIEW IF EXISTS public.today_movements_summary;
DROP VIEW IF EXISTS public.stock_by_category;

-- ============================================================
-- FUNCIÓN GLOBAL: updated_at automático
-- search_path vacío para evitar inyección de esquema
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLA: profiles (sin rol — el rol vive en organization_members)
-- ============================================================
CREATE TABLE public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT,
  avatar_url        TEXT,
  is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: crear profile automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLA: organizations (cada negocio registrado)
-- ============================================================
CREATE TABLE public.organizations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  logo_url   TEXT,
  plan       TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TABLA: organization_members (usuarios por organización con rol)
-- ============================================================
CREATE TABLE public.organization_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'operator'
                       CHECK (role IN ('admin', 'operator', 'viewer')),
  invited_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Índices en FK (best practice: siempre indexar columnas FK)
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org  ON public.organization_members(organization_id);

-- ============================================================
-- TABLA: organization_invitations (links de invitación copiables)
-- ============================================================
CREATE TABLE public.organization_invitations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'operator'
                       CHECK (role IN ('admin', 'operator', 'viewer')),
  token           TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  label           TEXT,                     -- ej: "Para operador turno tarde"
  invited_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at         TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  max_uses        INTEGER NOT NULL DEFAULT 1,   -- 1 = uso único
  use_count       INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON public.organization_invitations(token);
CREATE INDEX idx_invitations_org   ON public.organization_invitations(organization_id);

-- ============================================================
-- FUNCIONES HELPER para RLS
-- Patrón: (SELECT fn()) — se evalúa una vez por query, no por fila
-- ============================================================

-- Obtener el organization_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = (SELECT auth.uid())
  ORDER BY joined_at ASC
  LIMIT 1;
$$;

-- Obtener el rol del usuario en su organización
CREATE OR REPLACE FUNCTION public.get_my_org_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role
  FROM public.organization_members
  WHERE user_id         = (SELECT auth.uid())
    AND organization_id = public.get_my_org_id();
$$;

-- ============================================================
-- TABLA: units (unidades de medida — por organización)
-- ============================================================
CREATE TABLE public.units (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  abbreviation    TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name),
  UNIQUE(organization_id, abbreviation)
);

CREATE INDEX idx_units_org ON public.units(organization_id);

-- ============================================================
-- TABLA: categories (por organización)
-- ============================================================
CREATE TABLE public.categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  color           TEXT NOT NULL DEFAULT '#06b6d4',
  icon            TEXT NOT NULL DEFAULT 'package',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_categories_org ON public.categories(organization_id);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TABLA: suppliers (por organización)
-- ============================================================
CREATE TABLE public.suppliers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  contact         TEXT,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suppliers_org ON public.suppliers(organization_id);

CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TABLA: products (por organización)
-- ============================================================
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sku             TEXT,
  description     TEXT,
  category_id     UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  unit_id         UUID NOT NULL REFERENCES public.units(id)       ON DELETE RESTRICT,
  min_stock       NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  current_stock   NUMERIC(12, 3) NOT NULL DEFAULT 0,
  cost_price      NUMERIC(12, 2) DEFAULT 0 CHECK (cost_price >= 0),
  sale_price      NUMERIC(12, 2) DEFAULT 0 CHECK (sale_price >= 0),
  image_url       TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_org       ON public.products(organization_id);
CREATE INDEX idx_products_category  ON public.products(category_id);
CREATE INDEX idx_products_unit      ON public.products(unit_id);
-- SKU único por organización (partial index para permitir NULL)
CREATE UNIQUE INDEX idx_products_sku ON public.products(organization_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_low_stock  ON public.products(current_stock, min_stock) WHERE is_active = TRUE;
CREATE INDEX idx_products_name       ON public.products USING gin(to_tsvector('spanish', name));

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TABLA: inventory_movements (inmutable — registro de auditoría)
-- ============================================================
CREATE TABLE public.inventory_movements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
  product_id      UUID NOT NULL REFERENCES public.products(id)    ON DELETE RESTRICT,
  quantity        NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  total_price     NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  supplier_id     UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  reference       TEXT,
  notes           TEXT,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_org       ON public.inventory_movements(organization_id);
CREATE INDEX idx_movements_product   ON public.inventory_movements(product_id);
CREATE INDEX idx_movements_type      ON public.inventory_movements(type);
CREATE INDEX idx_movements_created   ON public.inventory_movements(created_at DESC);
CREATE INDEX idx_movements_supplier  ON public.inventory_movements(supplier_id) WHERE supplier_id IS NOT NULL;
-- Índice compuesto para dashboard y reportes
CREATE INDEX idx_movements_org_date_type ON public.inventory_movements(organization_id, created_at DESC, type);

-- ============================================================
-- TRIGGER: actualizar current_stock automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_stock NUMERIC;
BEGIN
  SELECT current_stock INTO v_current_stock
  FROM public.products
  WHERE id = NEW.product_id;

  IF NEW.type = 'ingreso' THEN
    UPDATE public.products
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.product_id;

  ELSIF NEW.type = 'egreso' THEN
    IF v_current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Stock insuficiente. Actual: %, Solicitado: %',
        v_current_stock, NEW.quantity;
    END IF;
    UPDATE public.products
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_movement_created
  AFTER INSERT ON public.inventory_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- ============================================================
-- TRIGGER: crear datos default al crear una organización
-- Unidades y categorías genéricas para cualquier tipo de negocio
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Unidades de medida comunes
  INSERT INTO public.units (organization_id, name, abbreviation) VALUES
    (NEW.id, 'Unidad',      'u'),
    (NEW.id, 'Kilogramo',   'kg'),
    (NEW.id, 'Gramo',       'g'),
    (NEW.id, 'Litro',       'L'),
    (NEW.id, 'Mililitro',   'mL'),
    (NEW.id, 'Metro',       'm'),
    (NEW.id, 'Centímetro',  'cm'),
    (NEW.id, 'Docena',      'doc'),
    (NEW.id, 'Caja',        'caja'),
    (NEW.id, 'Rollo',       'rollo');

  -- Categorías genéricas (aplicables a cualquier negocio)
  INSERT INTO public.categories (organization_id, name, color, icon) VALUES
    (NEW.id, 'Materia Prima',        '#06b6d4', 'layers'),
    (NEW.id, 'Productos Terminados', '#10b981', 'package-check'),
    (NEW.id, 'Insumos',              '#8b5cf6', 'box'),
    (NEW.id, 'Herramientas',         '#f59e0b', 'wrench'),
    (NEW.id, 'Embalaje',             '#94a3b8', 'package');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();

-- ============================================================
-- VISTAS para el dashboard
-- RLS en tablas subyacentes filtra automáticamente por org
-- ============================================================
CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.current_stock,
  p.min_stock,
  p.image_url,
  p.organization_id,
  c.name          AS category_name,
  c.color         AS category_color,
  u.abbreviation  AS unit_abbreviation,
  (p.min_stock - p.current_stock) AS stock_deficit
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
JOIN public.units u       ON p.unit_id = u.id
WHERE p.is_active = TRUE
  AND p.current_stock <= p.min_stock
ORDER BY stock_deficit DESC;

CREATE OR REPLACE VIEW public.today_movements_summary AS
SELECT
  organization_id,
  type,
  COUNT(*)         AS total_movements,
  SUM(quantity)    AS total_quantity,
  SUM(total_price) AS total_value
FROM public.inventory_movements
WHERE created_at >= CURRENT_DATE
  AND created_at <  CURRENT_DATE + INTERVAL '1 day'
GROUP BY organization_id, type;

CREATE OR REPLACE VIEW public.stock_by_category AS
SELECT
  c.organization_id,
  c.id            AS category_id,
  c.name          AS category_name,
  c.color,
  c.icon,
  COUNT(p.id)                                       AS product_count,
  COALESCE(SUM(p.current_stock), 0)                 AS total_stock,
  COALESCE(SUM(p.current_stock * p.cost_price), 0)  AS total_value
FROM public.categories c
LEFT JOIN public.products p ON p.category_id = c.id AND p.is_active = TRUE
GROUP BY c.organization_id, c.id, c.name, c.color, c.icon;

-- ============================================================
-- ROW LEVEL SECURITY
-- Patrón: (SELECT fn()) — llamada cacheada por query, no por fila
-- ============================================================
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements   ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──────────────────────────────────────────────────
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ── ORGANIZATIONS ─────────────────────────────────────────────
CREATE POLICY "orgs_select_member"
  ON public.organizations FOR SELECT
  USING (id = (SELECT public.get_my_org_id()));

CREATE POLICY "orgs_update_admin"
  ON public.organizations FOR UPDATE
  USING (
    id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

-- ── ORGANIZATION_MEMBERS ──────────────────────────────────────
CREATE POLICY "members_select"
  ON public.organization_members FOR SELECT
  USING (organization_id = (SELECT public.get_my_org_id()));

CREATE POLICY "members_insert_admin"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

CREATE POLICY "members_update_admin"
  ON public.organization_members FOR UPDATE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

CREATE POLICY "members_delete_admin"
  ON public.organization_members FOR DELETE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
    AND user_id != (SELECT auth.uid())  -- no puede eliminarse a sí mismo
  );

-- ── ORGANIZATION_INVITATIONS ──────────────────────────────────
CREATE POLICY "invitations_select_member"
  ON public.organization_invitations FOR SELECT
  USING (organization_id = (SELECT public.get_my_org_id()));

CREATE POLICY "invitations_insert_admin"
  ON public.organization_invitations FOR INSERT
  WITH CHECK (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

CREATE POLICY "invitations_update_admin"
  ON public.organization_invitations FOR UPDATE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

CREATE POLICY "invitations_delete_admin"
  ON public.organization_invitations FOR DELETE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

-- ── UNITS ─────────────────────────────────────────────────────
CREATE POLICY "units_select"
  ON public.units FOR SELECT
  USING (organization_id = (SELECT public.get_my_org_id()));

CREATE POLICY "units_insert_admin"
  ON public.units FOR INSERT
  WITH CHECK (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

CREATE POLICY "units_update_admin"
  ON public.units FOR UPDATE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

CREATE POLICY "units_delete_admin"
  ON public.units FOR DELETE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

-- ── CATEGORIES ────────────────────────────────────────────────
CREATE POLICY "categories_select"
  ON public.categories FOR SELECT
  USING (organization_id = (SELECT public.get_my_org_id()));

CREATE POLICY "categories_insert"
  ON public.categories FOR INSERT
  WITH CHECK (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) IN ('admin', 'operator')
  );

CREATE POLICY "categories_update"
  ON public.categories FOR UPDATE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) IN ('admin', 'operator')
  );

CREATE POLICY "categories_delete"
  ON public.categories FOR DELETE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

-- ── SUPPLIERS ─────────────────────────────────────────────────
CREATE POLICY "suppliers_select"
  ON public.suppliers FOR SELECT
  USING (organization_id = (SELECT public.get_my_org_id()));

CREATE POLICY "suppliers_insert"
  ON public.suppliers FOR INSERT
  WITH CHECK (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) IN ('admin', 'operator')
  );

CREATE POLICY "suppliers_update"
  ON public.suppliers FOR UPDATE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) IN ('admin', 'operator')
  );

CREATE POLICY "suppliers_delete"
  ON public.suppliers FOR DELETE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

-- ── PRODUCTS ──────────────────────────────────────────────────
CREATE POLICY "products_select"
  ON public.products FOR SELECT
  USING (organization_id = (SELECT public.get_my_org_id()));

CREATE POLICY "products_insert"
  ON public.products FOR INSERT
  WITH CHECK (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) IN ('admin', 'operator')
  );

CREATE POLICY "products_update"
  ON public.products FOR UPDATE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) IN ('admin', 'operator')
  );

CREATE POLICY "products_delete"
  ON public.products FOR DELETE
  USING (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) = 'admin'
  );

-- ── INVENTORY_MOVEMENTS (inmutables — solo INSERT y SELECT) ───
CREATE POLICY "movements_select"
  ON public.inventory_movements FOR SELECT
  USING (organization_id = (SELECT public.get_my_org_id()));

CREATE POLICY "movements_insert"
  ON public.inventory_movements FOR INSERT
  WITH CHECK (
    organization_id = (SELECT public.get_my_org_id())
    AND (SELECT public.get_my_org_role()) IN ('admin', 'operator')
    AND created_by = (SELECT auth.uid())
  );
