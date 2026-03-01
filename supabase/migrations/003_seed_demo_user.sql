-- ============================================================
-- SEED: Datos demo para usuario guinazuexequiel.dev@gmail.com
-- Cubre los últimos 3 meses con actividad realista
-- Ejecutar en Supabase SQL Editor DESPUÉS de 002_multi_tenant.sql
-- ============================================================

DO $$
DECLARE
  -- IDs principales
  v_user_id UUID;
  v_org_id  UUID;

  -- Categorías
  v_cat_telas    UUID;
  v_cat_tintas   UUID;
  v_cat_hilos    UUID;
  v_cat_prendas  UUID;
  v_cat_insumos  UUID;
  v_cat_embalaje UUID;
  v_cat_acces    UUID;

  -- Unidades
  v_unit_m     UUID;
  v_unit_kg    UUID;
  v_unit_g     UUID;
  v_unit_l     UUID;
  v_unit_u     UUID;
  v_unit_doc   UUID;
  v_unit_rollo UUID;
  v_unit_cono  UUID;
  v_unit_caja  UUID;

  -- Proveedores
  v_sup_textil    UUID;
  v_sup_tintas    UUID;
  v_sup_hilos     UUID;
  v_sup_insumos   UUID;
  v_sup_embalaje  UUID;

  -- Productos
  v_p_jersey_blanco  UUID;
  v_p_jersey_negro   UUID;
  v_p_poplin_blanco  UUID;
  v_p_poplin_color   UUID;
  v_p_lycra          UUID;
  v_p_tinta_negra    UUID;
  v_p_tinta_blanca   UUID;
  v_p_tinta_roja     UUID;
  v_p_tinta_azul     UUID;
  v_p_tinta_verde    UUID;
  v_p_hilo_blanco    UUID;
  v_p_hilo_negro     UUID;
  v_p_hilo_color     UUID;
  v_p_remera_bl_s    UUID;
  v_p_remera_bl_m    UUID;
  v_p_remera_bl_l    UUID;
  v_p_remera_ne_m    UUID;
  v_p_buzo_bl_m      UUID;
  v_p_emulsion       UUID;
  v_p_revelador      UUID;
  v_p_marcos         UUID;
  v_p_etiquetas      UUID;
  v_p_bolsas         UUID;
  v_p_cajas          UUID;
  v_p_cinta          UUID;

  -- Helper para fechas (NOW() - N días)
  v_now TIMESTAMPTZ := NOW();

BEGIN

  -- ──────────────────────────────────────────────────────────
  -- 1. USUARIO Y ORGANIZACIÓN
  -- ──────────────────────────────────────────────────────────

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'guinazuexequiel.dev@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado: guinazuexequiel.dev@gmail.com';
  END IF;

  -- Verificar si ya tiene organización, si tiene salir
  IF EXISTS (
    SELECT 1 FROM public.organization_members WHERE user_id = v_user_id
  ) THEN
    RAISE NOTICE 'El usuario ya tiene una organización. Buscando org_id...';
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = v_user_id
    LIMIT 1;
  ELSE
    -- Crear organización (el trigger crea categorías y unidades default)
    INSERT INTO public.organizations (name, slug)
    VALUES ('Fábrica de Ropa y Estampados GE', 'fabrica-ge')
    RETURNING id INTO v_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_user_id, 'admin');

    RAISE NOTICE 'Organización creada: %', v_org_id;
  END IF;

  -- ──────────────────────────────────────────────────────────
  -- 2. CATEGORÍAS específicas para fábrica de ropa
  -- ──────────────────────────────────────────────────────────

  -- Usar las creadas por el trigger (Materia Prima → telas, Insumos → insumos, etc.)
  -- y agregar categorías más específicas

  SELECT id INTO v_cat_telas    FROM public.categories WHERE organization_id = v_org_id AND name = 'Materia Prima'        LIMIT 1;
  SELECT id INTO v_cat_prendas  FROM public.categories WHERE organization_id = v_org_id AND name = 'Productos Terminados' LIMIT 1;
  SELECT id INTO v_cat_insumos  FROM public.categories WHERE organization_id = v_org_id AND name = 'Insumos'              LIMIT 1;
  SELECT id INTO v_cat_embalaje FROM public.categories WHERE organization_id = v_org_id AND name = 'Embalaje'             LIMIT 1;

  -- Agregar categorías extra
  INSERT INTO public.categories (organization_id, name, color, icon) VALUES
    (v_org_id, 'Tintas y Pigmentos',  '#8b5cf6', 'droplets'),
    (v_org_id, 'Hilos y Agujas',      '#f59e0b', 'circle-dot'),
    (v_org_id, 'Accesorios',          '#6366f1', 'tag')
  ON CONFLICT (organization_id, name) DO NOTHING;

  SELECT id INTO v_cat_tintas FROM public.categories WHERE organization_id = v_org_id AND name = 'Tintas y Pigmentos' LIMIT 1;
  SELECT id INTO v_cat_hilos  FROM public.categories WHERE organization_id = v_org_id AND name = 'Hilos y Agujas'     LIMIT 1;
  SELECT id INTO v_cat_acces  FROM public.categories WHERE organization_id = v_org_id AND name = 'Accesorios'         LIMIT 1;

  -- ──────────────────────────────────────────────────────────
  -- 3. UNIDADES (las del trigger + extras)
  -- ──────────────────────────────────────────────────────────

  SELECT id INTO v_unit_m     FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'm'     LIMIT 1;
  SELECT id INTO v_unit_kg    FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'kg'    LIMIT 1;
  SELECT id INTO v_unit_g     FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'g'     LIMIT 1;
  SELECT id INTO v_unit_l     FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'L'     LIMIT 1;
  SELECT id INTO v_unit_u     FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'u'     LIMIT 1;
  SELECT id INTO v_unit_doc   FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'doc'   LIMIT 1;
  SELECT id INTO v_unit_rollo FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'rollo' LIMIT 1;
  SELECT id INTO v_unit_caja  FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'caja'  LIMIT 1;

  INSERT INTO public.units (organization_id, name, abbreviation)
  VALUES (v_org_id, 'Cono', 'cono')
  ON CONFLICT (organization_id, abbreviation) DO NOTHING;

  SELECT id INTO v_unit_cono FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'cono' LIMIT 1;

  -- ──────────────────────────────────────────────────────────
  -- 4. PROVEEDORES
  -- ──────────────────────────────────────────────────────────

  INSERT INTO public.suppliers (organization_id, name, contact, email, phone, address, notes) VALUES
    (v_org_id, 'Textiles del Norte S.A.',   'Carlos Mendez',    'ventas@texnorte.com.ar',     '0351-4444-5551', 'Av. Colón 1234, Córdoba',       'Principal proveedor de telas. Pago a 30 días.'),
    (v_org_id, 'Tintas Color Pro CABA',     'Ana García',       'info@colorpro.com.ar',        '011-2222-3334',  'Paraguay 850, CABA',            'Proveedor de tintas plastisol y al agua. Env. gratis +$50k.'),
    (v_org_id, 'Distribuidora Hilos Sur',   'Pedro Jiménez',    'pedidos@hilossur.com.ar',     '0341-6666-7771', 'Bv. Oroño 2100, Rosario',       'Hilos de costura todas las marcas. Descuento por volumen.'),
    (v_org_id, 'Insumos Serigrafía Total',  'Laura Vega',       'laura@serigrafiatlot.com.ar', '011-5555-8882',  'Nazca 3455, CABA',              'Emulsiones, reveladores, marcos, rasquetas.'),
    (v_org_id, 'Embalajes Rápidos',         'Martín López',     'ventas@embalajesrapidos.ar',  '0351-3333-9993', 'Ruta 9 km 12, Córdoba',         'Bolsas, cajas, cinta. Entrega en 48hs.');

  SELECT id INTO v_sup_textil   FROM public.suppliers WHERE organization_id = v_org_id AND name = 'Textiles del Norte S.A.'   LIMIT 1;
  SELECT id INTO v_sup_tintas   FROM public.suppliers WHERE organization_id = v_org_id AND name = 'Tintas Color Pro CABA'     LIMIT 1;
  SELECT id INTO v_sup_hilos    FROM public.suppliers WHERE organization_id = v_org_id AND name = 'Distribuidora Hilos Sur'   LIMIT 1;
  SELECT id INTO v_sup_insumos  FROM public.suppliers WHERE organization_id = v_org_id AND name = 'Insumos Serigrafía Total'  LIMIT 1;
  SELECT id INTO v_sup_embalaje FROM public.suppliers WHERE organization_id = v_org_id AND name = 'Embalajes Rápidos'         LIMIT 1;

  -- ──────────────────────────────────────────────────────────
  -- 5. PRODUCTOS
  -- ──────────────────────────────────────────────────────────

  INSERT INTO public.products (organization_id, name, sku, description, category_id, unit_id, min_stock, current_stock, cost_price, sale_price, created_by) VALUES
    -- TELAS
    (v_org_id, 'Tela Jersey Blanca 180gr',   'TJB-001', 'Jersey 100% algodón peinado 180gr/m²',     v_cat_telas,   v_unit_m,    50,  0, 850,  0, v_user_id),
    (v_org_id, 'Tela Jersey Negro 180gr',    'TJN-002', 'Jersey 100% algodón peinado 180gr/m²',     v_cat_telas,   v_unit_m,    30,  0, 850,  0, v_user_id),
    (v_org_id, 'Tela Poplin Blanco',         'TPB-003', 'Poplin 50/50 algodón/poliéster 110gr/m²',  v_cat_telas,   v_unit_m,    20,  0, 580,  0, v_user_id),
    (v_org_id, 'Tela Poplin Colores',        'TPC-004', 'Poplin surtido colores 110gr/m²',          v_cat_telas,   v_unit_m,    15,  0, 620,  0, v_user_id),
    (v_org_id, 'Tela Lycra Negra',           'TLN-005', 'Lycra 90/10 algodón/elastano 200gr/m²',    v_cat_telas,   v_unit_m,    10,  0, 1250, 0, v_user_id),
    -- TINTAS
    (v_org_id, 'Tinta Plastisol Negra 1kg',  'TPN-010', 'Tinta serigráfica plastisol negro estándar', v_cat_tintas, v_unit_kg,  5,  0, 2800, 0, v_user_id),
    (v_org_id, 'Tinta Plastisol Blanca 1kg', 'TPB-011', 'Tinta serigráfica plastisol blanco cubriente', v_cat_tintas, v_unit_kg, 5, 0, 3200, 0, v_user_id),
    (v_org_id, 'Tinta Plastisol Roja 1kg',   'TPR-012', 'Tinta serigráfica plastisol rojo brillante',  v_cat_tintas, v_unit_kg, 3, 0, 3400, 0, v_user_id),
    (v_org_id, 'Tinta Plastisol Azul 1kg',   'TPA-013', 'Tinta serigráfica plastisol azul marino',     v_cat_tintas, v_unit_kg, 3, 0, 3400, 0, v_user_id),
    (v_org_id, 'Tinta Plastisol Verde 1kg',  'TPV-014', 'Tinta serigráfica plastisol verde limón',     v_cat_tintas, v_unit_kg, 2, 0, 3400, 0, v_user_id),
    -- HILOS
    (v_org_id, 'Hilo Costura Blanco 40/2',   'HCB-020', 'Hilo poliéster blanco 5000m/cono',         v_cat_hilos,  v_unit_cono, 10, 0, 450,  0, v_user_id),
    (v_org_id, 'Hilo Costura Negro 40/2',    'HCN-021', 'Hilo poliéster negro 5000m/cono',          v_cat_hilos,  v_unit_cono, 10, 0, 450,  0, v_user_id),
    (v_org_id, 'Hilo Costura Colores',       'HCC-022', 'Hilo poliéster surtido colores 3000m/cono',v_cat_hilos,  v_unit_cono, 5,  0, 380,  0, v_user_id),
    -- PRENDAS TERMINADAS
    (v_org_id, 'Remera Blanca Talle S',      'RBS-030', 'Remera básica algodón peinado blanca S',   v_cat_prendas, v_unit_u,  20,  0, 1200, 2500, v_user_id),
    (v_org_id, 'Remera Blanca Talle M',      'RBM-031', 'Remera básica algodón peinado blanca M',   v_cat_prendas, v_unit_u,  30,  0, 1200, 2500, v_user_id),
    (v_org_id, 'Remera Blanca Talle L',      'RBL-032', 'Remera básica algodón peinado blanca L',   v_cat_prendas, v_unit_u,  25,  0, 1200, 2500, v_user_id),
    (v_org_id, 'Remera Negra Talle M',       'RNM-033', 'Remera básica algodón peinado negra M',    v_cat_prendas, v_unit_u,  20,  0, 1300, 2700, v_user_id),
    (v_org_id, 'Buzo Friza Blanco M',        'BFB-034', 'Buzo friza 380gr blanco talle M',          v_cat_prendas, v_unit_u,  10,  0, 3500, 7500, v_user_id),
    -- INSUMOS SERIGRAFÍA
    (v_org_id, 'Emulsión Fotográfica UV 1L', 'EFU-040', 'Emulsión dual cure para serigrafía',       v_cat_insumos, v_unit_l,   2,  0, 4800, 0, v_user_id),
    (v_org_id, 'Revelador Químico 1L',       'RQC-041', 'Revelador para emulsión fotográfica',      v_cat_insumos, v_unit_l,   2,  0, 1800, 0, v_user_id),
    (v_org_id, 'Marcos de Madera 50x60',     'MMD-042', 'Marco con malla 43T para serigrafía',      v_cat_insumos, v_unit_u,   5,  0, 2200, 0, v_user_id),
    -- ACCESORIOS / ETIQUETAS
    (v_org_id, 'Etiquetas Tejidas Marca',    'ETM-050', 'Etiquetas tejidas con logo de marca',      v_cat_acces,   v_unit_u,  200, 0, 35,   0, v_user_id),
    -- EMBALAJE
    (v_org_id, 'Bolsa Polietileno 30x40',    'BPE-060', 'Bolsa transparente c/cierre 30x40cm',      v_cat_embalaje, v_unit_u, 200, 0, 25,   0, v_user_id),
    (v_org_id, 'Caja Cartón 40x30x20',       'CCT-061', 'Caja reforzada para envío postal',         v_cat_embalaje, v_unit_u,  50, 0, 180,  0, v_user_id),
    (v_org_id, 'Cinta Precinto 50m',         'CPT-062', 'Cinta adhesiva transparente fuerte 50m',   v_cat_embalaje, v_unit_u,  20, 0, 350,  0, v_user_id)
  ;

  -- Cargar IDs de productos
  SELECT id INTO v_p_jersey_blanco  FROM public.products WHERE organization_id = v_org_id AND sku = 'TJB-001';
  SELECT id INTO v_p_jersey_negro   FROM public.products WHERE organization_id = v_org_id AND sku = 'TJN-002';
  SELECT id INTO v_p_poplin_blanco  FROM public.products WHERE organization_id = v_org_id AND sku = 'TPB-003';
  SELECT id INTO v_p_poplin_color   FROM public.products WHERE organization_id = v_org_id AND sku = 'TPC-004';
  SELECT id INTO v_p_lycra          FROM public.products WHERE organization_id = v_org_id AND sku = 'TLN-005';
  SELECT id INTO v_p_tinta_negra    FROM public.products WHERE organization_id = v_org_id AND sku = 'TPN-010';
  SELECT id INTO v_p_tinta_blanca   FROM public.products WHERE organization_id = v_org_id AND sku = 'TPB-011';
  SELECT id INTO v_p_tinta_roja     FROM public.products WHERE organization_id = v_org_id AND sku = 'TPR-012';
  SELECT id INTO v_p_tinta_azul     FROM public.products WHERE organization_id = v_org_id AND sku = 'TPA-013';
  SELECT id INTO v_p_tinta_verde    FROM public.products WHERE organization_id = v_org_id AND sku = 'TPV-014';
  SELECT id INTO v_p_hilo_blanco    FROM public.products WHERE organization_id = v_org_id AND sku = 'HCB-020';
  SELECT id INTO v_p_hilo_negro     FROM public.products WHERE organization_id = v_org_id AND sku = 'HCN-021';
  SELECT id INTO v_p_hilo_color     FROM public.products WHERE organization_id = v_org_id AND sku = 'HCC-022';
  SELECT id INTO v_p_remera_bl_s    FROM public.products WHERE organization_id = v_org_id AND sku = 'RBS-030';
  SELECT id INTO v_p_remera_bl_m    FROM public.products WHERE organization_id = v_org_id AND sku = 'RBM-031';
  SELECT id INTO v_p_remera_bl_l    FROM public.products WHERE organization_id = v_org_id AND sku = 'RBL-032';
  SELECT id INTO v_p_remera_ne_m    FROM public.products WHERE organization_id = v_org_id AND sku = 'RNM-033';
  SELECT id INTO v_p_buzo_bl_m      FROM public.products WHERE organization_id = v_org_id AND sku = 'BFB-034';
  SELECT id INTO v_p_emulsion       FROM public.products WHERE organization_id = v_org_id AND sku = 'EFU-040';
  SELECT id INTO v_p_revelador      FROM public.products WHERE organization_id = v_org_id AND sku = 'RQC-041';
  SELECT id INTO v_p_marcos         FROM public.products WHERE organization_id = v_org_id AND sku = 'MMD-042';
  SELECT id INTO v_p_etiquetas      FROM public.products WHERE organization_id = v_org_id AND sku = 'ETM-050';
  SELECT id INTO v_p_bolsas         FROM public.products WHERE organization_id = v_org_id AND sku = 'BPE-060';
  SELECT id INTO v_p_cajas          FROM public.products WHERE organization_id = v_org_id AND sku = 'CCT-061';
  SELECT id INTO v_p_cinta          FROM public.products WHERE organization_id = v_org_id AND sku = 'CPT-062';

  -- ──────────────────────────────────────────────────────────
  -- 6. MOVIMIENTOS — últimos 3 meses
  --    Los triggers actualizan current_stock automáticamente
  -- ──────────────────────────────────────────────────────────

  -- ===== MES 3 (hace ~90-61 días) =====

  -- Compras iniciales de stock
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_jersey_blanco, 200, 850,  v_sup_textil,   'FAC-001', v_user_id, v_now - INTERVAL '90 days'),
    (v_org_id, 'ingreso', v_p_jersey_negro,  100, 850,  v_sup_textil,   'FAC-001', v_user_id, v_now - INTERVAL '90 days'),
    (v_org_id, 'ingreso', v_p_poplin_blanco,  80, 580,  v_sup_textil,   'FAC-001', v_user_id, v_now - INTERVAL '89 days'),
    (v_org_id, 'ingreso', v_p_poplin_color,   60, 620,  v_sup_textil,   'FAC-001', v_user_id, v_now - INTERVAL '89 days'),
    (v_org_id, 'ingreso', v_p_lycra,          40, 1250, v_sup_textil,   'FAC-002', v_user_id, v_now - INTERVAL '88 days'),
    (v_org_id, 'ingreso', v_p_tinta_negra,    10, 2800, v_sup_tintas,   'FAC-010', v_user_id, v_now - INTERVAL '88 days'),
    (v_org_id, 'ingreso', v_p_tinta_blanca,   10, 3200, v_sup_tintas,   'FAC-010', v_user_id, v_now - INTERVAL '88 days'),
    (v_org_id, 'ingreso', v_p_tinta_roja,      5, 3400, v_sup_tintas,   'FAC-010', v_user_id, v_now - INTERVAL '88 days'),
    (v_org_id, 'ingreso', v_p_tinta_azul,      5, 3400, v_sup_tintas,   'FAC-010', v_user_id, v_now - INTERVAL '88 days'),
    (v_org_id, 'ingreso', v_p_tinta_verde,     3, 3400, v_sup_tintas,   'FAC-010', v_user_id, v_now - INTERVAL '87 days'),
    (v_org_id, 'ingreso', v_p_hilo_blanco,    30, 450,  v_sup_hilos,    'FAC-020', v_user_id, v_now - INTERVAL '87 days'),
    (v_org_id, 'ingreso', v_p_hilo_negro,     20, 450,  v_sup_hilos,    'FAC-020', v_user_id, v_now - INTERVAL '87 days'),
    (v_org_id, 'ingreso', v_p_hilo_color,     10, 380,  v_sup_hilos,    'FAC-020', v_user_id, v_now - INTERVAL '87 days'),
    (v_org_id, 'ingreso', v_p_emulsion,        5, 4800, v_sup_insumos,  'FAC-030', v_user_id, v_now - INTERVAL '86 days'),
    (v_org_id, 'ingreso', v_p_revelador,       5, 1800, v_sup_insumos,  'FAC-030', v_user_id, v_now - INTERVAL '86 days'),
    (v_org_id, 'ingreso', v_p_marcos,         10, 2200, v_sup_insumos,  'FAC-030', v_user_id, v_now - INTERVAL '86 days'),
    (v_org_id, 'ingreso', v_p_etiquetas,     500, 35,   NULL,           NULL,      v_user_id, v_now - INTERVAL '85 days'),
    (v_org_id, 'ingreso', v_p_bolsas,        500, 25,   v_sup_embalaje, 'FAC-040', v_user_id, v_now - INTERVAL '85 days'),
    (v_org_id, 'ingreso', v_p_cajas,         100, 180,  v_sup_embalaje, 'FAC-040', v_user_id, v_now - INTERVAL '85 days'),
    (v_org_id, 'ingreso', v_p_cinta,          30, 350,  v_sup_embalaje, 'FAC-040', v_user_id, v_now - INTERVAL '85 days');

  -- Producción semana 1 (mes 3)
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_jersey_blanco, 25, 0, NULL, 'OP-001', 'Producción lote remeras blancas S/M/L',  v_user_id, v_now - INTERVAL '84 days'),
    (v_org_id, 'egreso', v_p_jersey_negro,  15, 0, NULL, 'OP-001', 'Producción lote remeras negras M',       v_user_id, v_now - INTERVAL '84 days'),
    (v_org_id, 'egreso', v_p_hilo_blanco,    3, 0, NULL, 'OP-001', NULL,                                     v_user_id, v_now - INTERVAL '84 days'),
    (v_org_id, 'egreso', v_p_hilo_negro,     2, 0, NULL, 'OP-001', NULL,                                     v_user_id, v_now - INTERVAL '84 days'),
    (v_org_id, 'egreso', v_p_tinta_negra,    2, 0, NULL, 'OP-001', 'Estampado logos',                        v_user_id, v_now - INTERVAL '83 days'),
    (v_org_id, 'egreso', v_p_tinta_blanca,   1, 0, NULL, 'OP-001', 'Estampado logos',                        v_user_id, v_now - INTERVAL '83 days'),
    (v_org_id, 'egreso', v_p_emulsion,       1, 0, NULL, 'OP-001', 'Preparación marcos',                     v_user_id, v_now - INTERVAL '83 days'),
    (v_org_id, 'egreso', v_p_revelador,      1, 0, NULL, 'OP-001', NULL,                                     v_user_id, v_now - INTERVAL '83 days');

  -- Ingreso prendas terminadas lote 1
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_remera_bl_s,  30, 1200, NULL, 'PROD-001', 'Producción propia lote 1', v_user_id, v_now - INTERVAL '82 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_m,  50, 1200, NULL, 'PROD-001', 'Producción propia lote 1', v_user_id, v_now - INTERVAL '82 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_l,  35, 1200, NULL, 'PROD-001', 'Producción propia lote 1', v_user_id, v_now - INTERVAL '82 days'),
    (v_org_id, 'ingreso', v_p_remera_ne_m,  30, 1300, NULL, 'PROD-001', 'Producción propia lote 1', v_user_id, v_now - INTERVAL '82 days');

  -- Ventas semana 2 (mes 3)
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_remera_bl_s,  12, 2500, NULL, 'VTA-001', 'Venta cliente Deporte Total',   v_user_id, v_now - INTERVAL '80 days'),
    (v_org_id, 'egreso', v_p_remera_bl_m,  20, 2500, NULL, 'VTA-001', 'Venta cliente Deporte Total',   v_user_id, v_now - INTERVAL '80 days'),
    (v_org_id, 'egreso', v_p_remera_bl_l,  15, 2500, NULL, 'VTA-001', 'Venta cliente Deporte Total',   v_user_id, v_now - INTERVAL '80 days'),
    (v_org_id, 'egreso', v_p_remera_ne_m,  10, 2700, NULL, 'VTA-002', 'Venta local Sport&Fit',         v_user_id, v_now - INTERVAL '79 days'),
    (v_org_id, 'egreso', v_p_etiquetas,    75, 0,    NULL, 'VTA-001', 'Etiquetas prendas enviadas',     v_user_id, v_now - INTERVAL '80 days'),
    (v_org_id, 'egreso', v_p_bolsas,       57, 0,    NULL, 'VTA-001', 'Embalaje pedido',                v_user_id, v_now - INTERVAL '80 days'),
    (v_org_id, 'egreso', v_p_cajas,        10, 0,    NULL, 'VTA-001', 'Envío postal',                   v_user_id, v_now - INTERVAL '80 days');

  -- Semana 3 (mes 3) — compra reposición tintas + producción
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_tinta_negra,   5, 2800, v_sup_tintas, 'FAC-011', v_user_id, v_now - INTERVAL '75 days'),
    (v_org_id, 'ingreso', v_p_tinta_roja,    3, 3400, v_sup_tintas, 'FAC-011', v_user_id, v_now - INTERVAL '75 days'),
    (v_org_id, 'ingreso', v_p_jersey_blanco, 100, 870, v_sup_textil, 'FAC-003', v_user_id, v_now - INTERVAL '74 days'),
    (v_org_id, 'ingreso', v_p_lycra,          20, 1280, v_sup_textil, 'FAC-003', v_user_id, v_now - INTERVAL '74 days');

  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_jersey_blanco, 30, 0, NULL, 'OP-002', 'Producción lote buzos friza', v_user_id, v_now - INTERVAL '72 days'),
    (v_org_id, 'egreso', v_p_hilo_blanco,    4, 0, NULL, 'OP-002', NULL,                          v_user_id, v_now - INTERVAL '72 days'),
    (v_org_id, 'egreso', v_p_tinta_negra,    3, 0, NULL, 'OP-002', 'Logos estampados',            v_user_id, v_now - INTERVAL '71 days'),
    (v_org_id, 'egreso', v_p_tinta_blanca,   2, 0, NULL, 'OP-002', 'Logos estampados',            v_user_id, v_now - INTERVAL '71 days');

  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_buzo_bl_m,   20, 3500, NULL, 'PROD-002', 'Producción propia lote buzos', v_user_id, v_now - INTERVAL '70 days');

  -- Semana 4 (mes 3) — ventas + compras
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_remera_bl_m,  15, 2500, NULL, 'VTA-003', 'Venta remeras uniformes Club Atletismo', v_user_id, v_now - INTERVAL '68 days'),
    (v_org_id, 'egreso', v_p_buzo_bl_m,    8,  7500, NULL, 'VTA-003', 'Venta buzos uniformes Club Atletismo',   v_user_id, v_now - INTERVAL '68 days'),
    (v_org_id, 'egreso', v_p_remera_ne_m,  10, 2700, NULL, 'VTA-004', 'Venta directa cliente final',            v_user_id, v_now - INTERVAL '67 days'),
    (v_org_id, 'egreso', v_p_etiquetas,    48, 0,    NULL, 'VTA-003', 'Etiquetas lote uniformes',               v_user_id, v_now - INTERVAL '68 days'),
    (v_org_id, 'egreso', v_p_bolsas,       33, 0,    NULL, 'VTA-003', 'Embalaje pedido',                        v_user_id, v_now - INTERVAL '68 days'),
    (v_org_id, 'egreso', v_p_cinta,         2, 0,    NULL, 'VTA-003', NULL,                                     v_user_id, v_now - INTERVAL '68 days');

  -- ===== MES 2 (hace ~60-31 días) =====

  -- Reposición de stock mes 2
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_jersey_blanco, 150, 870,  v_sup_textil,   'FAC-004', v_user_id, v_now - INTERVAL '60 days'),
    (v_org_id, 'ingreso', v_p_jersey_negro,   80, 870,  v_sup_textil,   'FAC-004', v_user_id, v_now - INTERVAL '60 days'),
    (v_org_id, 'ingreso', v_p_poplin_blanco,  50, 590,  v_sup_textil,   'FAC-004', v_user_id, v_now - INTERVAL '59 days'),
    (v_org_id, 'ingreso', v_p_hilo_blanco,    20, 460,  v_sup_hilos,    'FAC-021', v_user_id, v_now - INTERVAL '58 days'),
    (v_org_id, 'ingreso', v_p_hilo_negro,     15, 460,  v_sup_hilos,    'FAC-021', v_user_id, v_now - INTERVAL '58 days'),
    (v_org_id, 'ingreso', v_p_tinta_negra,    8,  2900, v_sup_tintas,   'FAC-012', v_user_id, v_now - INTERVAL '57 days'),
    (v_org_id, 'ingreso', v_p_tinta_blanca,   6,  3300, v_sup_tintas,   'FAC-012', v_user_id, v_now - INTERVAL '57 days'),
    (v_org_id, 'ingreso', v_p_tinta_azul,     4,  3500, v_sup_tintas,   'FAC-012', v_user_id, v_now - INTERVAL '57 days'),
    (v_org_id, 'ingreso', v_p_emulsion,       3,  4900, v_sup_insumos,  'FAC-031', v_user_id, v_now - INTERVAL '56 days'),
    (v_org_id, 'ingreso', v_p_revelador,      3,  1900, v_sup_insumos,  'FAC-031', v_user_id, v_now - INTERVAL '56 days'),
    (v_org_id, 'ingreso', v_p_etiquetas,    300, 35,    NULL,           NULL,      v_user_id, v_now - INTERVAL '55 days'),
    (v_org_id, 'ingreso', v_p_bolsas,       400, 25,    v_sup_embalaje, 'FAC-041', v_user_id, v_now - INTERVAL '55 days'),
    (v_org_id, 'ingreso', v_p_cajas,         80, 185,   v_sup_embalaje, 'FAC-041', v_user_id, v_now - INTERVAL '55 days');

  -- Producción lote 3
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_jersey_blanco, 40, 0, NULL, 'OP-003', 'Producción remeras blancas', v_user_id, v_now - INTERVAL '53 days'),
    (v_org_id, 'egreso', v_p_jersey_negro,  20, 0, NULL, 'OP-003', 'Producción remeras negras',  v_user_id, v_now - INTERVAL '53 days'),
    (v_org_id, 'egreso', v_p_hilo_blanco,    5, 0, NULL, 'OP-003', NULL,                         v_user_id, v_now - INTERVAL '53 days'),
    (v_org_id, 'egreso', v_p_hilo_negro,     3, 0, NULL, 'OP-003', NULL,                         v_user_id, v_now - INTERVAL '53 days'),
    (v_org_id, 'egreso', v_p_tinta_negra,    4, 0, NULL, 'OP-003', 'Estampado',                  v_user_id, v_now - INTERVAL '52 days'),
    (v_org_id, 'egreso', v_p_tinta_blanca,   2, 0, NULL, 'OP-003', 'Estampado blanco cubriente', v_user_id, v_now - INTERVAL '52 days'),
    (v_org_id, 'egreso', v_p_tinta_azul,     2, 0, NULL, 'OP-003', 'Estampado diseño nuevo',     v_user_id, v_now - INTERVAL '52 days'),
    (v_org_id, 'egreso', v_p_emulsion,       1, 0, NULL, 'OP-003', 'Marco nuevo',                v_user_id, v_now - INTERVAL '51 days');

  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_remera_bl_s,  40, 1200, NULL, 'PROD-003', 'Producción propia lote 3', v_user_id, v_now - INTERVAL '50 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_m,  60, 1200, NULL, 'PROD-003', 'Producción propia lote 3', v_user_id, v_now - INTERVAL '50 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_l,  40, 1200, NULL, 'PROD-003', 'Producción propia lote 3', v_user_id, v_now - INTERVAL '50 days'),
    (v_org_id, 'ingreso', v_p_remera_ne_m,  30, 1300, NULL, 'PROD-003', 'Producción propia lote 3', v_user_id, v_now - INTERVAL '50 days');

  -- Ventas mes 2 — temporada alta
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_remera_bl_s,  20, 2500, NULL, 'VTA-005', 'Pedido mayorista La Higuera',       v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'egreso', v_p_remera_bl_m,  35, 2500, NULL, 'VTA-005', 'Pedido mayorista La Higuera',       v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'egreso', v_p_remera_bl_l,  25, 2500, NULL, 'VTA-005', 'Pedido mayorista La Higuera',       v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'egreso', v_p_remera_ne_m,  15, 2700, NULL, 'VTA-005', 'Pedido mayorista La Higuera',       v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'egreso', v_p_etiquetas,    95, 0,    NULL, 'VTA-005', 'Etiquetas lote',                    v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'egreso', v_p_bolsas,       95, 0,    NULL, 'VTA-005', 'Embalaje',                          v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'egreso', v_p_cajas,        15, 0,    NULL, 'VTA-005', 'Envío postal',                      v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'egreso', v_p_remera_bl_m,  10, 2600, NULL, 'VTA-006', 'Venta local Ropa Urbana',           v_user_id, v_now - INTERVAL '44 days'),
    (v_org_id, 'egreso', v_p_remera_ne_m,   8, 2800, NULL, 'VTA-006', 'Venta local Ropa Urbana',           v_user_id, v_now - INTERVAL '44 days'),
    (v_org_id, 'egreso', v_p_buzo_bl_m,    12, 7500, NULL, 'VTA-007', 'Pedido uniformes Colegio San José', v_user_id, v_now - INTERVAL '42 days'),
    (v_org_id, 'egreso', v_p_etiquetas,    30, 0,    NULL, 'VTA-007', 'Etiquetas',                         v_user_id, v_now - INTERVAL '42 days'),
    (v_org_id, 'egreso', v_p_bolsas,       30, 0,    NULL, 'VTA-007', 'Embalaje',                          v_user_id, v_now - INTERVAL '42 days'),
    (v_org_id, 'egreso', v_p_cajas,         5, 0,    NULL, 'VTA-007', 'Cajas envío',                       v_user_id, v_now - INTERVAL '42 days');

  -- Producción lote 4 (fin mes 2)
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_jersey_blanco, 35, 0, NULL, 'OP-004', 'Producción remeras blancas', v_user_id, v_now - INTERVAL '38 days'),
    (v_org_id, 'egreso', v_p_jersey_negro,  15, 0, NULL, 'OP-004', 'Producción remeras negras',  v_user_id, v_now - INTERVAL '38 days'),
    (v_org_id, 'egreso', v_p_hilo_blanco,    4, 0, NULL, 'OP-004', NULL,                         v_user_id, v_now - INTERVAL '38 days'),
    (v_org_id, 'egreso', v_p_hilo_negro,     2, 0, NULL, 'OP-004', NULL,                         v_user_id, v_now - INTERVAL '38 days'),
    (v_org_id, 'egreso', v_p_tinta_negra,    3, 0, NULL, 'OP-004', 'Estampado varios colores',   v_user_id, v_now - INTERVAL '37 days'),
    (v_org_id, 'egreso', v_p_tinta_roja,     2, 0, NULL, 'OP-004', NULL,                         v_user_id, v_now - INTERVAL '37 days');

  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_remera_bl_s,  35, 1200, NULL, 'PROD-004', 'Producción propia lote 4', v_user_id, v_now - INTERVAL '36 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_m,  45, 1200, NULL, 'PROD-004', 'Producción propia lote 4', v_user_id, v_now - INTERVAL '36 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_l,  30, 1200, NULL, 'PROD-004', 'Producción propia lote 4', v_user_id, v_now - INTERVAL '36 days'),
    (v_org_id, 'ingreso', v_p_remera_ne_m,  20, 1300, NULL, 'PROD-004', 'Producción propia lote 4', v_user_id, v_now - INTERVAL '36 days');

  -- ===== MES 1 (hace ~30-1 días) =====

  -- Reposición materiales
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_jersey_blanco, 120, 890,  v_sup_textil,   'FAC-005', v_user_id, v_now - INTERVAL '30 days'),
    (v_org_id, 'ingreso', v_p_jersey_negro,   60, 890,  v_sup_textil,   'FAC-005', v_user_id, v_now - INTERVAL '30 days'),
    (v_org_id, 'ingreso', v_p_lycra,          25, 1300, v_sup_textil,   'FAC-005', v_user_id, v_now - INTERVAL '29 days'),
    (v_org_id, 'ingreso', v_p_tinta_negra,    6,  2900, v_sup_tintas,   'FAC-013', v_user_id, v_now - INTERVAL '28 days'),
    (v_org_id, 'ingreso', v_p_tinta_blanca,   5,  3300, v_sup_tintas,   'FAC-013', v_user_id, v_now - INTERVAL '28 days'),
    (v_org_id, 'ingreso', v_p_tinta_roja,     3,  3500, v_sup_tintas,   'FAC-013', v_user_id, v_now - INTERVAL '28 days'),
    (v_org_id, 'ingreso', v_p_tinta_verde,    2,  3500, v_sup_tintas,   'FAC-013', v_user_id, v_now - INTERVAL '28 days'),
    (v_org_id, 'ingreso', v_p_hilo_blanco,   15,  470,  v_sup_hilos,    'FAC-022', v_user_id, v_now - INTERVAL '27 days'),
    (v_org_id, 'ingreso', v_p_hilo_negro,    10,  470,  v_sup_hilos,    'FAC-022', v_user_id, v_now - INTERVAL '27 days'),
    (v_org_id, 'ingreso', v_p_etiquetas,    400,  35,   NULL,           NULL,      v_user_id, v_now - INTERVAL '26 days'),
    (v_org_id, 'ingreso', v_p_bolsas,       500,  26,   v_sup_embalaje, 'FAC-042', v_user_id, v_now - INTERVAL '26 days'),
    (v_org_id, 'ingreso', v_p_cajas,         60, 190,   v_sup_embalaje, 'FAC-042', v_user_id, v_now - INTERVAL '26 days'),
    (v_org_id, 'ingreso', v_p_cinta,         20, 360,   v_sup_embalaje, 'FAC-042', v_user_id, v_now - INTERVAL '26 days'),
    (v_org_id, 'ingreso', v_p_marcos,         5, 2300,  v_sup_insumos,  'FAC-032', v_user_id, v_now - INTERVAL '25 days'),
    (v_org_id, 'ingreso', v_p_emulsion,       2, 4900,  v_sup_insumos,  'FAC-032', v_user_id, v_now - INTERVAL '25 days'),
    (v_org_id, 'ingreso', v_p_revelador,      2, 1900,  v_sup_insumos,  'FAC-032', v_user_id, v_now - INTERVAL '25 days');

  -- Ventas primera semana mes 1
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_remera_bl_s,  18, 2500, NULL, 'VTA-008', 'Venta mayorista Norte',   v_user_id, v_now - INTERVAL '24 days'),
    (v_org_id, 'egreso', v_p_remera_bl_m,  25, 2500, NULL, 'VTA-008', 'Venta mayorista Norte',   v_user_id, v_now - INTERVAL '24 days'),
    (v_org_id, 'egreso', v_p_remera_bl_l,  20, 2500, NULL, 'VTA-008', 'Venta mayorista Norte',   v_user_id, v_now - INTERVAL '24 days'),
    (v_org_id, 'egreso', v_p_remera_ne_m,  12, 2700, NULL, 'VTA-008', 'Venta mayorista Norte',   v_user_id, v_now - INTERVAL '24 days'),
    (v_org_id, 'egreso', v_p_etiquetas,    75, 0,    NULL, 'VTA-008', 'Etiquetas',               v_user_id, v_now - INTERVAL '24 days'),
    (v_org_id, 'egreso', v_p_bolsas,       75, 0,    NULL, 'VTA-008', 'Embalaje',                v_user_id, v_now - INTERVAL '24 days'),
    (v_org_id, 'egreso', v_p_cajas,        12, 0,    NULL, 'VTA-008', 'Envío',                   v_user_id, v_now - INTERVAL '24 days');

  -- Producción lote 5
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_jersey_blanco, 40, 0, NULL, 'OP-005', 'Lote remeras blancas',   v_user_id, v_now - INTERVAL '21 days'),
    (v_org_id, 'egreso', v_p_jersey_negro,  20, 0, NULL, 'OP-005', 'Lote remeras negras',    v_user_id, v_now - INTERVAL '21 days'),
    (v_org_id, 'egreso', v_p_hilo_blanco,    5, 0, NULL, 'OP-005', NULL,                     v_user_id, v_now - INTERVAL '21 days'),
    (v_org_id, 'egreso', v_p_hilo_negro,     3, 0, NULL, 'OP-005', NULL,                     v_user_id, v_now - INTERVAL '21 days'),
    (v_org_id, 'egreso', v_p_tinta_negra,    3, 0, NULL, 'OP-005', 'Estampado diseño colec', v_user_id, v_now - INTERVAL '20 days'),
    (v_org_id, 'egreso', v_p_tinta_blanca,   2, 0, NULL, 'OP-005', NULL,                     v_user_id, v_now - INTERVAL '20 days'),
    (v_org_id, 'egreso', v_p_tinta_verde,    1, 0, NULL, 'OP-005', NULL,                     v_user_id, v_now - INTERVAL '20 days'),
    (v_org_id, 'egreso', v_p_emulsion,       1, 0, NULL, 'OP-005', 'Marco estampado verde',  v_user_id, v_now - INTERVAL '19 days');

  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_remera_bl_s,  45, 1200, NULL, 'PROD-005', 'Producción propia lote 5', v_user_id, v_now - INTERVAL '18 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_m,  55, 1200, NULL, 'PROD-005', 'Producción propia lote 5', v_user_id, v_now - INTERVAL '18 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_l,  35, 1200, NULL, 'PROD-005', 'Producción propia lote 5', v_user_id, v_now - INTERVAL '18 days'),
    (v_org_id, 'ingreso', v_p_remera_ne_m,  25, 1300, NULL, 'PROD-005', 'Producción propia lote 5', v_user_id, v_now - INTERVAL '18 days'),
    (v_org_id, 'ingreso', v_p_buzo_bl_m,    20, 3500, NULL, 'PROD-005', 'Producción propia lote 5', v_user_id, v_now - INTERVAL '18 days');

  -- Ventas recientes
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_remera_bl_s,  15, 2600, NULL, 'VTA-009', 'Venta local + online', v_user_id, v_now - INTERVAL '14 days'),
    (v_org_id, 'egreso', v_p_remera_bl_m,  20, 2600, NULL, 'VTA-009', 'Venta local + online', v_user_id, v_now - INTERVAL '14 days'),
    (v_org_id, 'egreso', v_p_remera_bl_l,  12, 2600, NULL, 'VTA-009', 'Venta local + online', v_user_id, v_now - INTERVAL '14 days'),
    (v_org_id, 'egreso', v_p_remera_ne_m,   8, 2800, NULL, 'VTA-009', 'Venta local + online', v_user_id, v_now - INTERVAL '14 days'),
    (v_org_id, 'egreso', v_p_buzo_bl_m,    10, 7800, NULL, 'VTA-010', 'Venta buzos',          v_user_id, v_now - INTERVAL '10 days'),
    (v_org_id, 'egreso', v_p_etiquetas,    65, 0,    NULL, 'VTA-009', 'Etiquetas',            v_user_id, v_now - INTERVAL '14 days'),
    (v_org_id, 'egreso', v_p_bolsas,       65, 0,    NULL, 'VTA-009', 'Embalaje',             v_user_id, v_now - INTERVAL '14 days'),
    (v_org_id, 'egreso', v_p_cajas,        10, 0,    NULL, 'VTA-009', 'Envío postal',         v_user_id, v_now - INTERVAL '14 days');

  -- Producción lote 6 (muy reciente)
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_jersey_blanco, 35, 0, NULL, 'OP-006', 'Lote colección verano', v_user_id, v_now - INTERVAL '7 days'),
    (v_org_id, 'egreso', v_p_jersey_negro,  15, 0, NULL, 'OP-006', 'Lote colección verano', v_user_id, v_now - INTERVAL '7 days'),
    (v_org_id, 'egreso', v_p_lycra,         10, 0, NULL, 'OP-006', 'Short deportivo',       v_user_id, v_now - INTERVAL '7 days'),
    (v_org_id, 'egreso', v_p_hilo_blanco,    4, 0, NULL, 'OP-006', NULL,                    v_user_id, v_now - INTERVAL '7 days'),
    (v_org_id, 'egreso', v_p_tinta_negra,    2, 0, NULL, 'OP-006', 'Estampado',             v_user_id, v_now - INTERVAL '6 days'),
    (v_org_id, 'egreso', v_p_tinta_roja,     1, 0, NULL, 'OP-006', 'Estampado colección',   v_user_id, v_now - INTERVAL '6 days');

  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_remera_bl_s,  40, 1200, NULL, 'PROD-006', 'Producción propia lote 6', v_user_id, v_now - INTERVAL '5 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_m,  50, 1200, NULL, 'PROD-006', 'Producción propia lote 6', v_user_id, v_now - INTERVAL '5 days'),
    (v_org_id, 'ingreso', v_p_remera_bl_l,  35, 1200, NULL, 'PROD-006', 'Producción propia lote 6', v_user_id, v_now - INTERVAL '5 days'),
    (v_org_id, 'ingreso', v_p_remera_ne_m,  20, 1300, NULL, 'PROD-006', 'Producción propia lote 6', v_user_id, v_now - INTERVAL '5 days');

  -- Últimos pedidos (esta semana)
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_jersey_blanco,  80, 900, v_sup_textil, 'FAC-006', v_user_id, v_now - INTERVAL '3 days'),
    (v_org_id, 'ingreso', v_p_tinta_negra,     5, 3000, v_sup_tintas, 'FAC-014', v_user_id, v_now - INTERVAL '2 days'),
    (v_org_id, 'ingreso', v_p_tinta_blanca,    4, 3400, v_sup_tintas, 'FAC-014', v_user_id, v_now - INTERVAL '2 days'),
    (v_org_id, 'egreso',  v_p_remera_bl_m,    10, 2600, NULL, 'VTA-011', v_user_id, v_now - INTERVAL '1 day'),
    (v_org_id, 'egreso',  v_p_remera_bl_s,     8, 2600, NULL, 'VTA-011', v_user_id, v_now - INTERVAL '1 day'),
    (v_org_id, 'egreso',  v_p_buzo_bl_m,       5, 7800, NULL, 'VTA-012', v_user_id, v_now - INTERVAL '6 hours'),
    (v_org_id, 'egreso',  v_p_etiquetas,      23, 0, NULL, 'VTA-011', v_user_id, v_now - INTERVAL '1 day'),
    (v_org_id, 'egreso',  v_p_bolsas,         23, 0, NULL, 'VTA-011', v_user_id, v_now - INTERVAL '1 day');

  RAISE NOTICE '✅ Seed completado para organización %', v_org_id;
  RAISE NOTICE '   Productos: 25 | Proveedores: 5 | Movimientos: ~120';

END;
$$;
