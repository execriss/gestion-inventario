-- ============================================================
-- SCHEMA: Sistema de Gestión de Inventario
-- Fábrica de Ropa y Estampados
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- FUNCIÓN GLOBAL: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLA: profiles (extensión de auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'operator'
                   CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: crear profile automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- TABLA: units (Unidades de medida)
-- ============================================================
CREATE TABLE public.units (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: categories
-- ============================================================
CREATE TABLE public.categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL DEFAULT '#06b6d4',
  icon       TEXT NOT NULL DEFAULT 'package',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- TABLA: suppliers (Proveedores)
-- ============================================================
CREATE TABLE public.suppliers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  contact    TEXT,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  notes      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- TABLA: products
-- ============================================================
CREATE TABLE public.products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  sku           TEXT UNIQUE,
  description   TEXT,
  category_id   UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  unit_id       UUID NOT NULL REFERENCES public.units(id) ON DELETE RESTRICT,
  min_stock     NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0,
  cost_price    NUMERIC(12, 2) DEFAULT 0 CHECK (cost_price >= 0),
  sale_price    NUMERIC(12, 2) DEFAULT 0 CHECK (sale_price >= 0),
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category   ON public.products(category_id);
CREATE INDEX idx_products_sku        ON public.products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_low_stock  ON public.products(current_stock, min_stock) WHERE is_active = TRUE;
CREATE INDEX idx_products_name       ON public.products USING gin(to_tsvector('spanish', name));

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- TABLA: inventory_movements (inmutable — registro de auditoría)
-- ============================================================
CREATE TABLE public.inventory_movements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  total_price NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  reference   TEXT,
  notes       TEXT,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_product   ON public.inventory_movements(product_id);
CREATE INDEX idx_movements_type      ON public.inventory_movements(type);
CREATE INDEX idx_movements_created   ON public.inventory_movements(created_at DESC);
CREATE INDEX idx_movements_supplier  ON public.inventory_movements(supplier_id) WHERE supplier_id IS NOT NULL;
CREATE INDEX idx_movements_date_type ON public.inventory_movements(created_at, type);

-- ============================================================
-- TRIGGER: Actualizar current_stock automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
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
      RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, Cantidad solicitada: %',
        v_current_stock, NEW.quantity;
    END IF;
    UPDATE public.products
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_movement_created
  AFTER INSERT ON public.inventory_movements
  FOR EACH ROW EXECUTE PROCEDURE public.update_product_stock();

-- ============================================================
-- VISTAS para el dashboard
-- ============================================================

CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.current_stock,
  p.min_stock,
  p.image_url,
  c.name  AS category_name,
  c.color AS category_color,
  u.abbreviation AS unit_abbreviation,
  (p.min_stock - p.current_stock) AS stock_deficit
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
JOIN public.units u      ON p.unit_id = u.id
WHERE p.is_active = TRUE
  AND p.current_stock <= p.min_stock
ORDER BY stock_deficit DESC;

CREATE OR REPLACE VIEW public.today_movements_summary AS
SELECT
  type,
  COUNT(*)       AS total_movements,
  SUM(quantity)  AS total_quantity,
  SUM(total_price) AS total_value
FROM public.inventory_movements
WHERE created_at >= CURRENT_DATE
  AND created_at < CURRENT_DATE + INTERVAL '1 day'
GROUP BY type;

CREATE OR REPLACE VIEW public.stock_by_category AS
SELECT
  c.id          AS category_id,
  c.name        AS category_name,
  c.color,
  c.icon,
  COUNT(p.id)   AS product_count,
  COALESCE(SUM(p.current_stock), 0) AS total_stock,
  COALESCE(SUM(p.current_stock * p.cost_price), 0) AS total_value
FROM public.categories c
LEFT JOIN public.products p ON p.category_id = c.id AND p.is_active = TRUE
GROUP BY c.id, c.name, c.color, c.icon;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Helper: obtener rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR get_user_role() = 'admin');
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- CATEGORIES (todos ven, admin/operator modifican, solo admin borra)
CREATE POLICY "categories_select"  ON public.categories FOR SELECT  USING (auth.role() = 'authenticated');
CREATE POLICY "categories_insert"  ON public.categories FOR INSERT  WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "categories_update"  ON public.categories FOR UPDATE  USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "categories_delete"  ON public.categories FOR DELETE  USING (get_user_role() = 'admin');

-- UNITS
CREATE POLICY "units_select"  ON public.units FOR SELECT  USING (auth.role() = 'authenticated');
CREATE POLICY "units_manage"  ON public.units FOR ALL     USING (get_user_role() = 'admin');

-- SUPPLIERS
CREATE POLICY "suppliers_select"  ON public.suppliers FOR SELECT  USING (auth.role() = 'authenticated');
CREATE POLICY "suppliers_insert"  ON public.suppliers FOR INSERT  WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "suppliers_update"  ON public.suppliers FOR UPDATE  USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "suppliers_delete"  ON public.suppliers FOR DELETE  USING (get_user_role() = 'admin');

-- PRODUCTS
CREATE POLICY "products_select"  ON public.products FOR SELECT  USING (auth.role() = 'authenticated');
CREATE POLICY "products_insert"  ON public.products FOR INSERT  WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "products_update"  ON public.products FOR UPDATE  USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "products_delete"  ON public.products FOR DELETE  USING (get_user_role() = 'admin');

-- INVENTORY_MOVEMENTS (inmutables: INSERT únicamente)
CREATE POLICY "movements_select"  ON public.inventory_movements FOR SELECT  USING (auth.role() = 'authenticated');
CREATE POLICY "movements_insert"  ON public.inventory_movements FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'operator') AND created_by = auth.uid());

-- ============================================================
-- DATOS INICIALES (SEED)
-- ============================================================

INSERT INTO public.units (name, abbreviation) VALUES
  ('Metro',     'm'),
  ('Centímetro','cm'),
  ('Kilogramo', 'kg'),
  ('Gramo',     'g'),
  ('Litro',     'L'),
  ('Mililitro', 'mL'),
  ('Unidad',    'u'),
  ('Docena',    'doc'),
  ('Rollo',     'rollo'),
  ('Cono',      'cono');

INSERT INTO public.categories (name, color, icon) VALUES
  ('Telas',              '#06b6d4', 'layers'),
  ('Tintas',             '#8b5cf6', 'droplets'),
  ('Hilos',              '#f59e0b', 'circle-dot'),
  ('Prendas Terminadas', '#10b981', 'shirt'),
  ('Insumos Estampado',  '#ec4899', 'printer'),
  ('Accesorios',         '#6366f1', 'tag'),
  ('Embalaje',           '#94a3b8', 'package');
