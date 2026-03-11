-- ============================================================
-- Fix: agregar security_invoker = true a todas las vistas
-- Sin esto, las vistas corren con permisos del owner (postgres)
-- y bypassean el RLS, mostrando datos de todas las organizaciones.
-- ============================================================

DROP VIEW IF EXISTS public.low_stock_products;
DROP VIEW IF EXISTS public.today_movements_summary;
DROP VIEW IF EXISTS public.stock_by_category;

-- ── low_stock_products ──────────────────────────────────────
CREATE OR REPLACE VIEW public.low_stock_products
WITH (security_invoker = true)
AS
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

-- ── today_movements_summary ─────────────────────────────────
CREATE OR REPLACE VIEW public.today_movements_summary
WITH (security_invoker = true)
AS
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

-- ── stock_by_category ────────────────────────────────────────
CREATE OR REPLACE VIEW public.stock_by_category
WITH (security_invoker = true)
AS
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
