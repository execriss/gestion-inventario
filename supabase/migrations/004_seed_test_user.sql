-- ============================================================
-- SEED: Datos demo para usuario uexetest@gmail.com
-- Negocio: Distribuidora de Electrónica y Accesorios Tech
-- Cubre los últimos 6 meses con actividad realista
-- Incluye alertas de stock bajo, gráficos ricos y variedad
-- Ejecutar en Supabase SQL Editor DESPUÉS de 002_multi_tenant.sql
-- ============================================================

DO $$
DECLARE
  -- IDs principales
  v_user_id UUID;
  v_org_id  UUID;

  -- Categorías
  v_cat_celulares   UUID;
  v_cat_accesorios  UUID;
  v_cat_audio       UUID;
  v_cat_redes       UUID;
  v_cat_almacena    UUID;
  v_cat_gaming      UUID;
  v_cat_cables      UUID;
  v_cat_pilas       UUID;

  -- Unidades
  v_unit_u    UUID;
  v_unit_caja UUID;
  v_unit_pack UUID;
  v_unit_m    UUID;
  v_unit_par  UUID;

  -- Proveedores
  v_sup_tecno    UUID;
  v_sup_samsung  UUID;
  v_sup_import   UUID;
  v_sup_cables   UUID;
  v_sup_gaming   UUID;

  -- Productos
  v_p_iphone14      UUID;
  v_p_iphone13      UUID;
  v_p_samsung_a54   UUID;
  v_p_samsung_a34   UUID;
  v_p_moto_g84      UUID;
  v_p_funda_iph14   UUID;
  v_p_funda_sam     UUID;
  v_p_vidrio_iph14  UUID;
  v_p_vidrio_sam    UUID;
  v_p_auricular_bt  UUID;
  v_p_auricular_in  UUID;
  v_p_parlante_jbl  UUID;
  v_p_parlante_bt   UUID;
  v_p_router_tp     UUID;
  v_p_switch_8p     UUID;
  v_p_pen_32gb      UUID;
  v_p_pen_64gb      UUID;
  v_p_disco_1tb     UUID;
  v_p_disco_512     UUID;
  v_p_joystick_ps5  UUID;
  v_p_joystick_xbox UUID;
  v_p_headset_gam   UUID;
  v_p_cable_usbc    UUID;
  v_p_cable_light   UUID;
  v_p_cable_hdmi    UUID;
  v_p_cargador_65w  UUID;
  v_p_cargador_20w  UUID;
  v_p_powerbank     UUID;
  v_p_pilas_aa      UUID;
  v_p_pilas_aaa     UUID;

  v_now TIMESTAMPTZ := NOW();

BEGIN

  -- ──────────────────────────────────────────────────────────
  -- 1. USUARIO Y ORGANIZACIÓN
  -- ──────────────────────────────────────────────────────────

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'uexetest@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado: uexetest@gmail.com';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.organization_members WHERE user_id = v_user_id
  ) THEN
    RAISE NOTICE 'El usuario ya tiene una organización. Buscando org_id...';
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = v_user_id
    LIMIT 1;
  ELSE
    INSERT INTO public.organizations (name, slug)
    VALUES ('TechDistrib Argentina', 'techdistrib')
    RETURNING id INTO v_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_user_id, 'admin');

    RAISE NOTICE 'Organización creada: %', v_org_id;
  END IF;

  -- ──────────────────────────────────────────────────────────
  -- 2. CATEGORÍAS
  -- ──────────────────────────────────────────────────────────

  -- Usar las del trigger donde coincidan
  SELECT id INTO v_cat_accesorios FROM public.categories WHERE organization_id = v_org_id AND name = 'Accesorios' LIMIT 1;

  -- Insertar categorías específicas de electrónica
  INSERT INTO public.categories (organization_id, name, color, icon) VALUES
    (v_org_id, 'Celulares',         '#06b6d4', 'smartphone'),
    (v_org_id, 'Audio',             '#8b5cf6', 'headphones'),
    (v_org_id, 'Redes',             '#3b82f6', 'wifi'),
    (v_org_id, 'Almacenamiento',    '#f59e0b', 'hard-drive'),
    (v_org_id, 'Gaming',            '#ef4444', 'gamepad-2'),
    (v_org_id, 'Cables y Cargadores','#10b981', 'cable'),
    (v_org_id, 'Pilas y Baterías',  '#f97316', 'battery')
  ON CONFLICT (organization_id, name) DO NOTHING;

  -- Si no existe Accesorios (el trigger la llama diferente), crearla
  INSERT INTO public.categories (organization_id, name, color, icon)
  VALUES (v_org_id, 'Accesorios Tech', '#6366f1', 'package')
  ON CONFLICT (organization_id, name) DO NOTHING;

  SELECT id INTO v_cat_celulares  FROM public.categories WHERE organization_id = v_org_id AND name = 'Celulares'           LIMIT 1;
  SELECT id INTO v_cat_audio      FROM public.categories WHERE organization_id = v_org_id AND name = 'Audio'               LIMIT 1;
  SELECT id INTO v_cat_redes      FROM public.categories WHERE organization_id = v_org_id AND name = 'Redes'               LIMIT 1;
  SELECT id INTO v_cat_almacena   FROM public.categories WHERE organization_id = v_org_id AND name = 'Almacenamiento'      LIMIT 1;
  SELECT id INTO v_cat_gaming     FROM public.categories WHERE organization_id = v_org_id AND name = 'Gaming'              LIMIT 1;
  SELECT id INTO v_cat_cables     FROM public.categories WHERE organization_id = v_org_id AND name = 'Cables y Cargadores' LIMIT 1;
  SELECT id INTO v_cat_pilas      FROM public.categories WHERE organization_id = v_org_id AND name = 'Pilas y Baterías'   LIMIT 1;

  -- fallback: si Accesorios ya existía del trigger, usarla
  IF v_cat_accesorios IS NULL THEN
    SELECT id INTO v_cat_accesorios FROM public.categories WHERE organization_id = v_org_id AND name = 'Accesorios Tech' LIMIT 1;
  END IF;

  -- ──────────────────────────────────────────────────────────
  -- 3. UNIDADES
  -- ──────────────────────────────────────────────────────────

  SELECT id INTO v_unit_u    FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'u'    LIMIT 1;
  SELECT id INTO v_unit_caja FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'caja' LIMIT 1;
  SELECT id INTO v_unit_m    FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'm'    LIMIT 1;

  INSERT INTO public.units (organization_id, name, abbreviation)
  VALUES
    (v_org_id, 'Pack', 'pack'),
    (v_org_id, 'Par',  'par')
  ON CONFLICT (organization_id, abbreviation) DO NOTHING;

  SELECT id INTO v_unit_pack FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'pack' LIMIT 1;
  SELECT id INTO v_unit_par  FROM public.units WHERE organization_id = v_org_id AND abbreviation = 'par'  LIMIT 1;

  -- ──────────────────────────────────────────────────────────
  -- 4. PROVEEDORES
  -- ──────────────────────────────────────────────────────────

  INSERT INTO public.suppliers (organization_id, name, contact, email, phone, address, notes) VALUES
    (v_org_id, 'TecnoImport CABA',       'Roberto Silva',    'ventas@tecnoimport.com.ar',  '011-4444-1111', 'Av. Corrientes 2800, CABA',      'Principal distribuidor Apple y celulares premium. 30 días de pago.'),
    (v_org_id, 'Samsung Distribuidora',  'Valeria Romero',   'b2b@samsung-dist.com.ar',    '011-3333-2222', 'Panamericana km 40, GBA Norte',  'Distribuidor oficial Samsung. Descuento 5% por volumen.'),
    (v_org_id, 'ImportTech Mayorista',   'Diego Fernández',  'diego@importtech.com.ar',     '0351-555-3333', 'Av. Vélez Sársfield 800, Cba',   'Accesorios, cables, fundas genéricas. Precios competitivos.'),
    (v_org_id, 'CablesYA Distribución',  'Marcela Torres',   'marcela@cablesya.com.ar',     '011-6666-4444', 'Warnes 1200, CABA',              'Especialista en cables y cargadores. Entrega 24hs CABA.'),
    (v_org_id, 'Gaming Zone Wholesale',  'Lucas Pereyra',    'wholesale@gamingzone.com.ar', '011-7777-5555', 'Av. Santa Fe 3400, CABA',        'Periféricos gaming y consolas. Stock limitado de PS5.')
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_sup_tecno   FROM public.suppliers WHERE organization_id = v_org_id AND name = 'TecnoImport CABA'      LIMIT 1;
  SELECT id INTO v_sup_samsung FROM public.suppliers WHERE organization_id = v_org_id AND name = 'Samsung Distribuidora' LIMIT 1;
  SELECT id INTO v_sup_import  FROM public.suppliers WHERE organization_id = v_org_id AND name = 'ImportTech Mayorista'  LIMIT 1;
  SELECT id INTO v_sup_cables  FROM public.suppliers WHERE organization_id = v_org_id AND name = 'CablesYA Distribución' LIMIT 1;
  SELECT id INTO v_sup_gaming  FROM public.suppliers WHERE organization_id = v_org_id AND name = 'Gaming Zone Wholesale' LIMIT 1;

  -- ──────────────────────────────────────────────────────────
  -- 5. PRODUCTOS (30 productos)
  -- Algunos con min_stock alto para generar alertas
  -- ──────────────────────────────────────────────────────────

  INSERT INTO public.products (organization_id, name, sku, description, category_id, unit_id, min_stock, current_stock, cost_price, sale_price, created_by) VALUES
    -- CELULARES
    (v_org_id, 'iPhone 14 128GB Negro',       'CEL-001', 'Apple iPhone 14 128GB Black',                   v_cat_celulares,  v_unit_u,    5,  0, 850000, 1150000, v_user_id),
    (v_org_id, 'iPhone 13 128GB Medianoche',  'CEL-002', 'Apple iPhone 13 128GB Midnight',                v_cat_celulares,  v_unit_u,    5,  0, 650000,  890000, v_user_id),
    (v_org_id, 'Samsung Galaxy A54 256GB',    'CEL-003', 'Samsung Galaxy A54 5G 256GB',                   v_cat_celulares,  v_unit_u,    8,  0, 320000,  460000, v_user_id),
    (v_org_id, 'Samsung Galaxy A34 128GB',    'CEL-004', 'Samsung Galaxy A34 5G 128GB',                   v_cat_celulares,  v_unit_u,   10,  0, 210000,  310000, v_user_id),
    (v_org_id, 'Motorola Moto G84 256GB',     'CEL-005', 'Motorola Moto G84 5G 256GB',                    v_cat_celulares,  v_unit_u,   10,  0, 185000,  270000, v_user_id),
    -- ACCESORIOS
    (v_org_id, 'Funda Silicona iPhone 14',    'ACC-001', 'Funda de silicona premium para iPhone 14',      v_cat_accesorios, v_unit_u,   30,  0,   3500,    8500, v_user_id),
    (v_org_id, 'Funda Samsung A54/A34',       'ACC-002', 'Funda trasparente reforzada Samsung A5x',       v_cat_accesorios, v_unit_u,   30,  0,   2800,    6500, v_user_id),
    (v_org_id, 'Vidrio Templado iPhone 14',   'ACC-003', 'Protector vidrio templado 9H iPhone 14',        v_cat_accesorios, v_unit_u,   50,  0,   1200,    3500, v_user_id),
    (v_org_id, 'Vidrio Templado Samsung A54', 'ACC-004', 'Protector vidrio templado 9H Samsung A54',      v_cat_accesorios, v_unit_u,   50,  0,    900,    2800, v_user_id),
    -- AUDIO
    (v_org_id, 'Auricular Bluetooth JBL T520', 'AUD-001', 'JBL Tune 520BT On-ear inalámbrico',           v_cat_audio,      v_unit_u,   10,  0,  28000,   48000, v_user_id),
    (v_org_id, 'Auricular In-ear Samsung',    'AUD-002', 'Samsung Galaxy Buds2 Pro Graphite',             v_cat_audio,      v_unit_u,   10,  0,  42000,   72000, v_user_id),
    (v_org_id, 'Parlante JBL Go 3',           'AUD-003', 'JBL Go 3 Bluetooth portátil IPX67',             v_cat_audio,      v_unit_u,   15,  0,  18000,   32000, v_user_id),
    (v_org_id, 'Parlante Bluetooth 20W',      'AUD-004', 'Parlante BT genérico 20W resistente al agua',   v_cat_audio,      v_unit_u,   20,  0,  12000,   22000, v_user_id),
    -- REDES
    (v_org_id, 'Router TP-Link Archer AX23',  'RED-001', 'Router WiFi 6 AX1800 Dual Band',               v_cat_redes,      v_unit_u,    5,  0,  38000,   62000, v_user_id),
    (v_org_id, 'Switch 8 Puertos TP-Link',    'RED-002', 'Switch no administrable 8 puertos 1Gbps',       v_cat_redes,      v_unit_u,    8,  0,  12000,   20000, v_user_id),
    -- ALMACENAMIENTO
    (v_org_id, 'Pen Drive Kingston 32GB',     'ALM-001', 'Kingston DataTraveler USB 3.2 32GB',            v_cat_almacena,   v_unit_u,   20,  0,   3200,    6500, v_user_id),
    (v_org_id, 'Pen Drive Samsung 64GB',      'ALM-002', 'Samsung BAR Plus USB 3.2 64GB',                 v_cat_almacena,   v_unit_u,   20,  0,   5500,   10000, v_user_id),
    (v_org_id, 'Disco SSD Externo 1TB',       'ALM-003', 'WD Elements SSD Externo 1TB USB-C',             v_cat_almacena,   v_unit_u,    5,  0,  68000,  110000, v_user_id),
    (v_org_id, 'Disco SSD Externo 512GB',     'ALM-004', 'Samsung T7 Shield SSD 512GB',                   v_cat_almacena,   v_unit_u,    5,  0,  42000,   70000, v_user_id),
    -- GAMING
    (v_org_id, 'Joystick DualSense PS5',      'GAM-001', 'Control inalámbrico PlayStation 5 Midnight',   v_cat_gaming,     v_unit_u,    5,  0,  58000,   95000, v_user_id),
    (v_org_id, 'Control Xbox Series Negro',   'GAM-002', 'Control inalámbrico Xbox Series X/S Carbon',   v_cat_gaming,     v_unit_u,    5,  0,  52000,   85000, v_user_id),
    (v_org_id, 'Headset Gamer HyperX Cloud',  'GAM-003', 'HyperX Cloud II Wireless Gaming Headset',      v_cat_gaming,     v_unit_u,    5,  0,  72000,  120000, v_user_id),
    -- CABLES Y CARGADORES
    (v_org_id, 'Cable USB-C 1m',              'CAB-001', 'Cable USB-C a USB-C trenzado 100W 1m',          v_cat_cables,     v_unit_u,   50,  0,   1800,    4500, v_user_id),
    (v_org_id, 'Cable Lightning 1m Apple',    'CAB-002', 'Cable Lightning a USB-A original 1m',           v_cat_cables,     v_unit_u,   50,  0,   2500,    6000, v_user_id),
    (v_org_id, 'Cable HDMI 2.1 2m',           'CAB-003', 'Cable HDMI 2.1 4K@120Hz 2m',                   v_cat_cables,     v_unit_u,   30,  0,   3800,    8500, v_user_id),
    (v_org_id, 'Cargador USB-C 65W GaN',      'CAB-004', 'Cargador GaN 65W USB-C carga rápida',           v_cat_cables,     v_unit_u,   20,  0,   9500,   18000, v_user_id),
    (v_org_id, 'Cargador USB-C 20W',          'CAB-005', 'Cargador compacto 20W para iPhone/iPad',        v_cat_cables,     v_unit_u,   30,  0,   5500,   11000, v_user_id),
    (v_org_id, 'Powerbank 10000mAh',          'CAB-006', 'Powerbank 10000mAh 22.5W carga rápida',         v_cat_cables,     v_unit_u,   15,  0,  14000,   25000, v_user_id),
    -- PILAS
    (v_org_id, 'Pilas AA Duracell x4',        'PIL-001', 'Pack 4 pilas AA Duracell Optimum',              v_cat_pilas,      v_unit_pack, 30, 0,   1800,    3800, v_user_id),
    (v_org_id, 'Pilas AAA Duracell x4',       'PIL-002', 'Pack 4 pilas AAA Duracell Optimum',             v_cat_pilas,      v_unit_pack, 30, 0,   1600,    3400, v_user_id)
  ;

  -- Cargar IDs de productos
  SELECT id INTO v_p_iphone14      FROM public.products WHERE organization_id = v_org_id AND sku = 'CEL-001';
  SELECT id INTO v_p_iphone13      FROM public.products WHERE organization_id = v_org_id AND sku = 'CEL-002';
  SELECT id INTO v_p_samsung_a54   FROM public.products WHERE organization_id = v_org_id AND sku = 'CEL-003';
  SELECT id INTO v_p_samsung_a34   FROM public.products WHERE organization_id = v_org_id AND sku = 'CEL-004';
  SELECT id INTO v_p_moto_g84      FROM public.products WHERE organization_id = v_org_id AND sku = 'CEL-005';
  SELECT id INTO v_p_funda_iph14   FROM public.products WHERE organization_id = v_org_id AND sku = 'ACC-001';
  SELECT id INTO v_p_funda_sam     FROM public.products WHERE organization_id = v_org_id AND sku = 'ACC-002';
  SELECT id INTO v_p_vidrio_iph14  FROM public.products WHERE organization_id = v_org_id AND sku = 'ACC-003';
  SELECT id INTO v_p_vidrio_sam    FROM public.products WHERE organization_id = v_org_id AND sku = 'ACC-004';
  SELECT id INTO v_p_auricular_bt  FROM public.products WHERE organization_id = v_org_id AND sku = 'AUD-001';
  SELECT id INTO v_p_auricular_in  FROM public.products WHERE organization_id = v_org_id AND sku = 'AUD-002';
  SELECT id INTO v_p_parlante_jbl  FROM public.products WHERE organization_id = v_org_id AND sku = 'AUD-003';
  SELECT id INTO v_p_parlante_bt   FROM public.products WHERE organization_id = v_org_id AND sku = 'AUD-004';
  SELECT id INTO v_p_router_tp     FROM public.products WHERE organization_id = v_org_id AND sku = 'RED-001';
  SELECT id INTO v_p_switch_8p     FROM public.products WHERE organization_id = v_org_id AND sku = 'RED-002';
  SELECT id INTO v_p_pen_32gb      FROM public.products WHERE organization_id = v_org_id AND sku = 'ALM-001';
  SELECT id INTO v_p_pen_64gb      FROM public.products WHERE organization_id = v_org_id AND sku = 'ALM-002';
  SELECT id INTO v_p_disco_1tb     FROM public.products WHERE organization_id = v_org_id AND sku = 'ALM-003';
  SELECT id INTO v_p_disco_512     FROM public.products WHERE organization_id = v_org_id AND sku = 'ALM-004';
  SELECT id INTO v_p_joystick_ps5  FROM public.products WHERE organization_id = v_org_id AND sku = 'GAM-001';
  SELECT id INTO v_p_joystick_xbox FROM public.products WHERE organization_id = v_org_id AND sku = 'GAM-002';
  SELECT id INTO v_p_headset_gam   FROM public.products WHERE organization_id = v_org_id AND sku = 'GAM-003';
  SELECT id INTO v_p_cable_usbc    FROM public.products WHERE organization_id = v_org_id AND sku = 'CAB-001';
  SELECT id INTO v_p_cable_light   FROM public.products WHERE organization_id = v_org_id AND sku = 'CAB-002';
  SELECT id INTO v_p_cable_hdmi    FROM public.products WHERE organization_id = v_org_id AND sku = 'CAB-003';
  SELECT id INTO v_p_cargador_65w  FROM public.products WHERE organization_id = v_org_id AND sku = 'CAB-004';
  SELECT id INTO v_p_cargador_20w  FROM public.products WHERE organization_id = v_org_id AND sku = 'CAB-005';
  SELECT id INTO v_p_powerbank     FROM public.products WHERE organization_id = v_org_id AND sku = 'CAB-006';
  SELECT id INTO v_p_pilas_aa      FROM public.products WHERE organization_id = v_org_id AND sku = 'PIL-001';
  SELECT id INTO v_p_pilas_aaa     FROM public.products WHERE organization_id = v_org_id AND sku = 'PIL-002';

  -- ──────────────────────────────────────────────────────────
  -- 6. MOVIMIENTOS — 6 meses de historia
  -- ──────────────────────────────────────────────────────────

  -- ===== MES 6 (hace ~180-151 días) — Apertura del negocio =====

  -- Stock inicial masivo
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_iphone14,      15, 850000, v_sup_tecno,   'FAC-001', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '180 days'),
    (v_org_id, 'ingreso', v_p_iphone13,      20, 650000, v_sup_tecno,   'FAC-001', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '180 days'),
    (v_org_id, 'ingreso', v_p_samsung_a54,   25, 320000, v_sup_samsung, 'FAC-002', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '179 days'),
    (v_org_id, 'ingreso', v_p_samsung_a34,   30, 210000, v_sup_samsung, 'FAC-002', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '179 days'),
    (v_org_id, 'ingreso', v_p_moto_g84,      25, 185000, v_sup_import,  'FAC-003', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '178 days'),
    (v_org_id, 'ingreso', v_p_funda_iph14,  100,   3500, v_sup_import,  'FAC-003', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '178 days'),
    (v_org_id, 'ingreso', v_p_funda_sam,    100,   2800, v_sup_import,  'FAC-003', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '178 days'),
    (v_org_id, 'ingreso', v_p_vidrio_iph14, 200,   1200, v_sup_import,  'FAC-003', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '177 days'),
    (v_org_id, 'ingreso', v_p_vidrio_sam,   200,    900, v_sup_import,  'FAC-003', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '177 days'),
    (v_org_id, 'ingreso', v_p_auricular_bt,  30,  28000, v_sup_tecno,   'FAC-004', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '176 days'),
    (v_org_id, 'ingreso', v_p_auricular_in,  20,  42000, v_sup_samsung, 'FAC-005', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '176 days'),
    (v_org_id, 'ingreso', v_p_parlante_jbl,  40,  18000, v_sup_tecno,   'FAC-004', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '175 days'),
    (v_org_id, 'ingreso', v_p_parlante_bt,   50,  12000, v_sup_import,  'FAC-003', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '175 days'),
    (v_org_id, 'ingreso', v_p_router_tp,     15,  38000, v_sup_import,  'FAC-006', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '174 days'),
    (v_org_id, 'ingreso', v_p_switch_8p,     20,  12000, v_sup_import,  'FAC-006', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '174 days'),
    (v_org_id, 'ingreso', v_p_pen_32gb,      80,   3200, v_sup_import,  'FAC-007', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '173 days'),
    (v_org_id, 'ingreso', v_p_pen_64gb,      60,   5500, v_sup_import,  'FAC-007', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '173 days'),
    (v_org_id, 'ingreso', v_p_disco_1tb,     10,  68000, v_sup_tecno,   'FAC-008', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '172 days'),
    (v_org_id, 'ingreso', v_p_disco_512,     12,  42000, v_sup_tecno,   'FAC-008', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '172 days'),
    (v_org_id, 'ingreso', v_p_joystick_ps5,  10,  58000, v_sup_gaming,  'FAC-009', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '171 days'),
    (v_org_id, 'ingreso', v_p_joystick_xbox, 10,  52000, v_sup_gaming,  'FAC-009', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '171 days'),
    (v_org_id, 'ingreso', v_p_headset_gam,    8,  72000, v_sup_gaming,  'FAC-009', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '170 days'),
    (v_org_id, 'ingreso', v_p_cable_usbc,   150,   1800, v_sup_cables,  'FAC-010', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '170 days'),
    (v_org_id, 'ingreso', v_p_cable_light,  120,   2500, v_sup_cables,  'FAC-010', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '170 days'),
    (v_org_id, 'ingreso', v_p_cable_hdmi,    80,   3800, v_sup_cables,  'FAC-010', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '169 days'),
    (v_org_id, 'ingreso', v_p_cargador_65w,  40,   9500, v_sup_cables,  'FAC-010', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '169 days'),
    (v_org_id, 'ingreso', v_p_cargador_20w,  60,   5500, v_sup_cables,  'FAC-010', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '168 days'),
    (v_org_id, 'ingreso', v_p_powerbank,     30,  14000, v_sup_cables,  'FAC-010', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '168 days'),
    (v_org_id, 'ingreso', v_p_pilas_aa,     100,   1800, v_sup_import,  'FAC-011', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '167 days'),
    (v_org_id, 'ingreso', v_p_pilas_aaa,    100,   1600, v_sup_import,  'FAC-011', 'Stock inicial apertura',  v_user_id, v_now - INTERVAL '167 days');

  -- Ventas primer mes — demanda moderada
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_iphone14,      3, 1150000, NULL, 'VTA-001', 'Venta local',                v_user_id, v_now - INTERVAL '165 days'),
    (v_org_id, 'egreso', v_p_iphone13,      4,  890000, NULL, 'VTA-001', 'Venta local',                v_user_id, v_now - INTERVAL '165 days'),
    (v_org_id, 'egreso', v_p_samsung_a54,   5,  460000, NULL, 'VTA-002', 'Mayorista Digital Express', v_user_id, v_now - INTERVAL '162 days'),
    (v_org_id, 'egreso', v_p_samsung_a34,   8,  310000, NULL, 'VTA-002', 'Mayorista Digital Express', v_user_id, v_now - INTERVAL '162 days'),
    (v_org_id, 'egreso', v_p_moto_g84,      6,  270000, NULL, 'VTA-003', 'Venta online MercadoLibre', v_user_id, v_now - INTERVAL '160 days'),
    (v_org_id, 'egreso', v_p_funda_iph14,  15,    8500, NULL, 'VTA-001', NULL,                         v_user_id, v_now - INTERVAL '165 days'),
    (v_org_id, 'egreso', v_p_vidrio_iph14, 25,    3500, NULL, 'VTA-001', NULL,                         v_user_id, v_now - INTERVAL '165 days'),
    (v_org_id, 'egreso', v_p_funda_sam,    10,    6500, NULL, 'VTA-002', NULL,                         v_user_id, v_now - INTERVAL '162 days'),
    (v_org_id, 'egreso', v_p_vidrio_sam,   18,    2800, NULL, 'VTA-002', NULL,                         v_user_id, v_now - INTERVAL '162 days'),
    (v_org_id, 'egreso', v_p_auricular_bt,  5,   48000, NULL, 'VTA-003', NULL,                         v_user_id, v_now - INTERVAL '160 days'),
    (v_org_id, 'egreso', v_p_parlante_jbl,  8,   32000, NULL, 'VTA-003', NULL,                         v_user_id, v_now - INTERVAL '160 days'),
    (v_org_id, 'egreso', v_p_cable_usbc,   30,    4500, NULL, 'VTA-003', NULL,                         v_user_id, v_now - INTERVAL '159 days'),
    (v_org_id, 'egreso', v_p_cable_light,  20,    6000, NULL, 'VTA-003', NULL,                         v_user_id, v_now - INTERVAL '159 days'),
    (v_org_id, 'egreso', v_p_cargador_20w, 12,   11000, NULL, 'VTA-003', NULL,                         v_user_id, v_now - INTERVAL '158 days'),
    (v_org_id, 'egreso', v_p_pilas_aa,     20,    3800, NULL, 'VTA-004', 'Venta kiosco La Esquina',   v_user_id, v_now - INTERVAL '157 days'),
    (v_org_id, 'egreso', v_p_pen_32gb,     15,    6500, NULL, 'VTA-004', NULL,                         v_user_id, v_now - INTERVAL '156 days');

  -- ===== MES 5 (hace ~150-121 días) =====

  -- Reposición mes 5
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_iphone14,     10, 860000, v_sup_tecno,   'FAC-012', v_user_id, v_now - INTERVAL '150 days'),
    (v_org_id, 'ingreso', v_p_iphone13,     15, 660000, v_sup_tecno,   'FAC-012', v_user_id, v_now - INTERVAL '150 days'),
    (v_org_id, 'ingreso', v_p_samsung_a54,  20, 325000, v_sup_samsung, 'FAC-013', v_user_id, v_now - INTERVAL '148 days'),
    (v_org_id, 'ingreso', v_p_samsung_a34,  25, 215000, v_sup_samsung, 'FAC-013', v_user_id, v_now - INTERVAL '148 days'),
    (v_org_id, 'ingreso', v_p_funda_iph14,  80,   3600, v_sup_import,  'FAC-014', v_user_id, v_now - INTERVAL '146 days'),
    (v_org_id, 'ingreso', v_p_vidrio_iph14,150,   1250, v_sup_import,  'FAC-014', v_user_id, v_now - INTERVAL '146 days'),
    (v_org_id, 'ingreso', v_p_cable_usbc,  100,   1850, v_sup_cables,  'FAC-015', v_user_id, v_now - INTERVAL '144 days'),
    (v_org_id, 'ingreso', v_p_cargador_65w,  30,  9800, v_sup_cables,  'FAC-015', v_user_id, v_now - INTERVAL '144 days'),
    (v_org_id, 'ingreso', v_p_cargador_20w,  50,  5600, v_sup_cables,  'FAC-015', v_user_id, v_now - INTERVAL '144 days'),
    (v_org_id, 'ingreso', v_p_joystick_ps5,   8, 59000, v_sup_gaming,  'FAC-016', v_user_id, v_now - INTERVAL '142 days'),
    (v_org_id, 'ingreso', v_p_pilas_aa,      80,  1800, v_sup_import,  'FAC-017', v_user_id, v_now - INTERVAL '140 days'),
    (v_org_id, 'ingreso', v_p_pilas_aaa,     80,  1600, v_sup_import,  'FAC-017', v_user_id, v_now - INTERVAL '140 days');

  -- Ventas mes 5 — pico de ventas
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_iphone14,      6, 1150000, NULL, 'VTA-010', 'Reventa TechStore Norte',   v_user_id, v_now - INTERVAL '145 days'),
    (v_org_id, 'egreso', v_p_iphone13,      8,  890000, NULL, 'VTA-010', 'Reventa TechStore Norte',   v_user_id, v_now - INTERVAL '145 days'),
    (v_org_id, 'egreso', v_p_samsung_a54,  10,  460000, NULL, 'VTA-011', 'Pedido mayorista CelPhone', v_user_id, v_now - INTERVAL '142 days'),
    (v_org_id, 'egreso', v_p_samsung_a34,  12,  310000, NULL, 'VTA-011', 'Pedido mayorista CelPhone', v_user_id, v_now - INTERVAL '142 days'),
    (v_org_id, 'egreso', v_p_moto_g84,      8,  270000, NULL, 'VTA-012', 'Venta online ML',           v_user_id, v_now - INTERVAL '140 days'),
    (v_org_id, 'egreso', v_p_funda_iph14,  25,    8500, NULL, 'VTA-010', NULL,                         v_user_id, v_now - INTERVAL '145 days'),
    (v_org_id, 'egreso', v_p_vidrio_iph14, 40,    3500, NULL, 'VTA-010', NULL,                         v_user_id, v_now - INTERVAL '144 days'),
    (v_org_id, 'egreso', v_p_auricular_bt,  8,   48000, NULL, 'VTA-011', NULL,                         v_user_id, v_now - INTERVAL '141 days'),
    (v_org_id, 'egreso', v_p_auricular_in,  5,   72000, NULL, 'VTA-011', NULL,                         v_user_id, v_now - INTERVAL '141 days'),
    (v_org_id, 'egreso', v_p_parlante_jbl, 12,   32000, NULL, 'VTA-012', NULL,                         v_user_id, v_now - INTERVAL '139 days'),
    (v_org_id, 'egreso', v_p_joystick_ps5,  5,   95000, NULL, 'VTA-013', 'Pedido Gaming Club',         v_user_id, v_now - INTERVAL '137 days'),
    (v_org_id, 'egreso', v_p_joystick_xbox, 4,   85000, NULL, 'VTA-013', 'Pedido Gaming Club',         v_user_id, v_now - INTERVAL '137 days'),
    (v_org_id, 'egreso', v_p_headset_gam,   3,  120000, NULL, 'VTA-013', NULL,                         v_user_id, v_now - INTERVAL '136 days'),
    (v_org_id, 'egreso', v_p_cable_usbc,   40,    4500, NULL, 'VTA-014', NULL,                         v_user_id, v_now - INTERVAL '134 days'),
    (v_org_id, 'egreso', v_p_cable_light,  30,    6000, NULL, 'VTA-014', NULL,                         v_user_id, v_now - INTERVAL '134 days'),
    (v_org_id, 'egreso', v_p_cable_hdmi,   15,    8500, NULL, 'VTA-014', NULL,                         v_user_id, v_now - INTERVAL '133 days'),
    (v_org_id, 'egreso', v_p_cargador_65w, 10,   18000, NULL, 'VTA-014', NULL,                         v_user_id, v_now - INTERVAL '133 days'),
    (v_org_id, 'egreso', v_p_cargador_20w, 18,   11000, NULL, 'VTA-014', NULL,                         v_user_id, v_now - INTERVAL '132 days'),
    (v_org_id, 'egreso', v_p_powerbank,     8,   25000, NULL, 'VTA-015', NULL,                         v_user_id, v_now - INTERVAL '131 days'),
    (v_org_id, 'egreso', v_p_pen_32gb,     25,    6500, NULL, 'VTA-015', NULL,                         v_user_id, v_now - INTERVAL '130 days'),
    (v_org_id, 'egreso', v_p_pen_64gb,     15,   10000, NULL, 'VTA-015', NULL,                         v_user_id, v_now - INTERVAL '130 days'),
    (v_org_id, 'egreso', v_p_disco_1tb,     3,  110000, NULL, 'VTA-016', 'Empresa MediosNet',          v_user_id, v_now - INTERVAL '128 days'),
    (v_org_id, 'egreso', v_p_pilas_aa,     35,    3800, NULL, 'VTA-017', NULL,                         v_user_id, v_now - INTERVAL '126 days'),
    (v_org_id, 'egreso', v_p_pilas_aaa,    30,    3400, NULL, 'VTA-017', NULL,                         v_user_id, v_now - INTERVAL '126 days');

  -- ===== MES 4 (hace ~120-91 días) =====

  -- Reposición mes 4
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_iphone14,     12, 870000, v_sup_tecno,   'FAC-020', v_user_id, v_now - INTERVAL '120 days'),
    (v_org_id, 'ingreso', v_p_samsung_a54,  20, 330000, v_sup_samsung, 'FAC-021', v_user_id, v_now - INTERVAL '118 days'),
    (v_org_id, 'ingreso', v_p_samsung_a34,  25, 218000, v_sup_samsung, 'FAC-021', v_user_id, v_now - INTERVAL '118 days'),
    (v_org_id, 'ingreso', v_p_moto_g84,     20, 188000, v_sup_import,  'FAC-022', v_user_id, v_now - INTERVAL '116 days'),
    (v_org_id, 'ingreso', v_p_funda_iph14,  80,   3600, v_sup_import,  'FAC-022', v_user_id, v_now - INTERVAL '115 days'),
    (v_org_id, 'ingreso', v_p_funda_sam,    80,   2900, v_sup_import,  'FAC-022', v_user_id, v_now - INTERVAL '115 days'),
    (v_org_id, 'ingreso', v_p_vidrio_iph14,120,   1250, v_sup_import,  'FAC-022', v_user_id, v_now - INTERVAL '114 days'),
    (v_org_id, 'ingreso', v_p_auricular_bt,  20, 28500, v_sup_tecno,   'FAC-023', v_user_id, v_now - INTERVAL '113 days'),
    (v_org_id, 'ingreso', v_p_parlante_jbl,  30, 18500, v_sup_tecno,   'FAC-023', v_user_id, v_now - INTERVAL '112 days'),
    (v_org_id, 'ingreso', v_p_cable_usbc,    80,  1900, v_sup_cables,  'FAC-024', v_user_id, v_now - INTERVAL '111 days'),
    (v_org_id, 'ingreso', v_p_cargador_20w,  50,  5700, v_sup_cables,  'FAC-024', v_user_id, v_now - INTERVAL '110 days'),
    (v_org_id, 'ingreso', v_p_pilas_aa,      60,  1850, v_sup_import,  'FAC-025', v_user_id, v_now - INTERVAL '108 days'),
    (v_org_id, 'ingreso', v_p_pen_32gb,      60,  3300, v_sup_import,  'FAC-025', v_user_id, v_now - INTERVAL '107 days'),
    (v_org_id, 'ingreso', v_p_powerbank,     25, 14500, v_sup_cables,  'FAC-026', v_user_id, v_now - INTERVAL '105 days');

  -- Ventas mes 4
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_iphone14,      5, 1180000, NULL, 'VTA-020', 'Venta directa',              v_user_id, v_now - INTERVAL '115 days'),
    (v_org_id, 'egreso', v_p_iphone13,      6,  900000, NULL, 'VTA-020', NULL,                          v_user_id, v_now - INTERVAL '114 days'),
    (v_org_id, 'egreso', v_p_samsung_a54,   8,  465000, NULL, 'VTA-021', 'Reventa Sur Digital',        v_user_id, v_now - INTERVAL '112 days'),
    (v_org_id, 'egreso', v_p_samsung_a34,  10,  315000, NULL, 'VTA-021', 'Reventa Sur Digital',        v_user_id, v_now - INTERVAL '112 days'),
    (v_org_id, 'egreso', v_p_moto_g84,      7,  275000, NULL, 'VTA-022', NULL,                          v_user_id, v_now - INTERVAL '110 days'),
    (v_org_id, 'egreso', v_p_funda_iph14,  30,    8500, NULL, 'VTA-020', NULL,                          v_user_id, v_now - INTERVAL '115 days'),
    (v_org_id, 'egreso', v_p_vidrio_iph14, 45,    3500, NULL, 'VTA-021', NULL,                          v_user_id, v_now - INTERVAL '112 days'),
    (v_org_id, 'egreso', v_p_funda_sam,    25,    6500, NULL, 'VTA-021', NULL,                          v_user_id, v_now - INTERVAL '111 days'),
    (v_org_id, 'egreso', v_p_auricular_bt, 10,   48000, NULL, 'VTA-022', NULL,                          v_user_id, v_now - INTERVAL '109 days'),
    (v_org_id, 'egreso', v_p_parlante_jbl, 12,   32000, NULL, 'VTA-022', NULL,                          v_user_id, v_now - INTERVAL '108 days'),
    (v_org_id, 'egreso', v_p_parlante_bt,  15,   22000, NULL, 'VTA-023', NULL,                          v_user_id, v_now - INTERVAL '106 days'),
    (v_org_id, 'egreso', v_p_joystick_ps5,  4,   98000, NULL, 'VTA-024', NULL,                          v_user_id, v_now - INTERVAL '104 days'),
    (v_org_id, 'egreso', v_p_joystick_xbox, 3,   87000, NULL, 'VTA-024', NULL,                          v_user_id, v_now - INTERVAL '104 days'),
    (v_org_id, 'egreso', v_p_cable_usbc,   35,    4500, NULL, 'VTA-025', NULL,                          v_user_id, v_now - INTERVAL '102 days'),
    (v_org_id, 'egreso', v_p_cable_light,  25,    6000, NULL, 'VTA-025', NULL,                          v_user_id, v_now - INTERVAL '102 days'),
    (v_org_id, 'egreso', v_p_cargador_20w, 20,   11000, NULL, 'VTA-025', NULL,                          v_user_id, v_now - INTERVAL '100 days'),
    (v_org_id, 'egreso', v_p_powerbank,    10,   25000, NULL, 'VTA-026', NULL,                          v_user_id, v_now - INTERVAL '98 days'),
    (v_org_id, 'egreso', v_p_pen_32gb,     20,    6500, NULL, 'VTA-026', NULL,                          v_user_id, v_now - INTERVAL '97 days'),
    (v_org_id, 'egreso', v_p_pen_64gb,     12,   10000, NULL, 'VTA-026', NULL,                          v_user_id, v_now - INTERVAL '96 days'),
    (v_org_id, 'egreso', v_p_disco_512,     3,   72000, NULL, 'VTA-027', NULL,                          v_user_id, v_now - INTERVAL '94 days'),
    (v_org_id, 'egreso', v_p_pilas_aa,     30,    3800, NULL, 'VTA-028', NULL,                          v_user_id, v_now - INTERVAL '93 days'),
    (v_org_id, 'egreso', v_p_router_tp,     4,   62000, NULL, 'VTA-029', 'Empresa OficinaMax',          v_user_id, v_now - INTERVAL '92 days');

  -- ===== MES 3 (hace ~90-61 días) — Mes fuerte =====

  -- Reposición mes 3
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_iphone14,     15, 875000, v_sup_tecno,   'FAC-030', v_user_id, v_now - INTERVAL '90 days'),
    (v_org_id, 'ingreso', v_p_iphone13,     20, 665000, v_sup_tecno,   'FAC-030', v_user_id, v_now - INTERVAL '90 days'),
    (v_org_id, 'ingreso', v_p_samsung_a54,  25, 332000, v_sup_samsung, 'FAC-031', v_user_id, v_now - INTERVAL '88 days'),
    (v_org_id, 'ingreso', v_p_samsung_a34,  30, 220000, v_sup_samsung, 'FAC-031', v_user_id, v_now - INTERVAL '88 days'),
    (v_org_id, 'ingreso', v_p_moto_g84,     25, 190000, v_sup_import,  'FAC-032', v_user_id, v_now - INTERVAL '86 days'),
    (v_org_id, 'ingreso', v_p_funda_iph14, 100,   3700, v_sup_import,  'FAC-032', v_user_id, v_now - INTERVAL '85 days'),
    (v_org_id, 'ingreso', v_p_vidrio_iph14,150,   1300, v_sup_import,  'FAC-032', v_user_id, v_now - INTERVAL '85 days'),
    (v_org_id, 'ingreso', v_p_vidrio_sam,  100,    950, v_sup_import,  'FAC-032', v_user_id, v_now - INTERVAL '84 days'),
    (v_org_id, 'ingreso', v_p_auricular_bt,  25, 29000, v_sup_tecno,   'FAC-033', v_user_id, v_now - INTERVAL '83 days'),
    (v_org_id, 'ingreso', v_p_auricular_in,  15, 43000, v_sup_samsung, 'FAC-034', v_user_id, v_now - INTERVAL '82 days'),
    (v_org_id, 'ingreso', v_p_cable_usbc,  100,   1900, v_sup_cables,  'FAC-035', v_user_id, v_now - INTERVAL '81 days'),
    (v_org_id, 'ingreso', v_p_cable_light,  80,   2600, v_sup_cables,  'FAC-035', v_user_id, v_now - INTERVAL '80 days'),
    (v_org_id, 'ingreso', v_p_cargador_65w, 30,  9800, v_sup_cables,  'FAC-035', v_user_id, v_now - INTERVAL '79 days'),
    (v_org_id, 'ingreso', v_p_joystick_ps5,  8, 60000, v_sup_gaming,  'FAC-036', v_user_id, v_now - INTERVAL '78 days'),
    (v_org_id, 'ingreso', v_p_headset_gam,   6, 74000, v_sup_gaming,  'FAC-036', v_user_id, v_now - INTERVAL '77 days'),
    (v_org_id, 'ingreso', v_p_pen_32gb,     60,  3300, v_sup_import,  'FAC-037', v_user_id, v_now - INTERVAL '76 days'),
    (v_org_id, 'ingreso', v_p_pen_64gb,     50,  5600, v_sup_import,  'FAC-037', v_user_id, v_now - INTERVAL '75 days'),
    (v_org_id, 'ingreso', v_p_disco_1tb,    10, 70000, v_sup_tecno,   'FAC-038', v_user_id, v_now - INTERVAL '74 days'),
    (v_org_id, 'ingreso', v_p_pilas_aa,     80,  1850, v_sup_import,  'FAC-039', v_user_id, v_now - INTERVAL '72 days'),
    (v_org_id, 'ingreso', v_p_pilas_aaa,    80,  1650, v_sup_import,  'FAC-039', v_user_id, v_now - INTERVAL '72 days');

  -- Ventas mes 3 — pico fuerte
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_iphone14,      8, 1200000, NULL, 'VTA-030', 'Reventa TechStore Norte',    v_user_id, v_now - INTERVAL '85 days'),
    (v_org_id, 'egreso', v_p_iphone13,     10,  920000, NULL, 'VTA-030', 'Reventa TechStore Norte',    v_user_id, v_now - INTERVAL '84 days'),
    (v_org_id, 'egreso', v_p_samsung_a54,  12,  470000, NULL, 'VTA-031', 'Pedido mayorista RioCell',   v_user_id, v_now - INTERVAL '82 days'),
    (v_org_id, 'egreso', v_p_samsung_a34,  15,  320000, NULL, 'VTA-031', 'Pedido mayorista RioCell',   v_user_id, v_now - INTERVAL '82 days'),
    (v_org_id, 'egreso', v_p_moto_g84,     10,  280000, NULL, 'VTA-032', NULL,                          v_user_id, v_now - INTERVAL '80 days'),
    (v_org_id, 'egreso', v_p_funda_iph14,  40,    8700, NULL, 'VTA-030', NULL,                          v_user_id, v_now - INTERVAL '85 days'),
    (v_org_id, 'egreso', v_p_vidrio_iph14, 60,    3500, NULL, 'VTA-031', NULL,                          v_user_id, v_now - INTERVAL '82 days'),
    (v_org_id, 'egreso', v_p_vidrio_sam,   40,    2800, NULL, 'VTA-031', NULL,                          v_user_id, v_now - INTERVAL '81 days'),
    (v_org_id, 'egreso', v_p_auricular_bt, 12,   49000, NULL, 'VTA-032', NULL,                          v_user_id, v_now - INTERVAL '79 days'),
    (v_org_id, 'egreso', v_p_auricular_in,  7,   73000, NULL, 'VTA-032', NULL,                          v_user_id, v_now - INTERVAL '78 days'),
    (v_org_id, 'egreso', v_p_parlante_jbl, 15,   33000, NULL, 'VTA-033', NULL,                          v_user_id, v_now - INTERVAL '77 days'),
    (v_org_id, 'egreso', v_p_parlante_bt,  20,   22000, NULL, 'VTA-033', NULL,                          v_user_id, v_now - INTERVAL '76 days'),
    (v_org_id, 'egreso', v_p_joystick_ps5,  6,   98000, NULL, 'VTA-034', 'GamersBA Mayorista',          v_user_id, v_now - INTERVAL '75 days'),
    (v_org_id, 'egreso', v_p_joystick_xbox, 5,   87000, NULL, 'VTA-034', NULL,                          v_user_id, v_now - INTERVAL '74 days'),
    (v_org_id, 'egreso', v_p_headset_gam,   3,  122000, NULL, 'VTA-034', NULL,                          v_user_id, v_now - INTERVAL '73 days'),
    (v_org_id, 'egreso', v_p_cable_usbc,   45,    4500, NULL, 'VTA-035', NULL,                          v_user_id, v_now - INTERVAL '72 days'),
    (v_org_id, 'egreso', v_p_cable_light,  35,    6000, NULL, 'VTA-035', NULL,                          v_user_id, v_now - INTERVAL '71 days'),
    (v_org_id, 'egreso', v_p_cable_hdmi,   20,    8500, NULL, 'VTA-035', NULL,                          v_user_id, v_now - INTERVAL '70 days'),
    (v_org_id, 'egreso', v_p_cargador_65w, 15,   18500, NULL, 'VTA-036', NULL,                          v_user_id, v_now - INTERVAL '69 days'),
    (v_org_id, 'egreso', v_p_cargador_20w, 22,   11000, NULL, 'VTA-036', NULL,                          v_user_id, v_now - INTERVAL '68 days'),
    (v_org_id, 'egreso', v_p_powerbank,    12,   25500, NULL, 'VTA-037', NULL,                          v_user_id, v_now - INTERVAL '67 days'),
    (v_org_id, 'egreso', v_p_pen_32gb,     30,    6500, NULL, 'VTA-037', NULL,                          v_user_id, v_now - INTERVAL '66 days'),
    (v_org_id, 'egreso', v_p_pen_64gb,     20,   10000, NULL, 'VTA-037', NULL,                          v_user_id, v_now - INTERVAL '65 days'),
    (v_org_id, 'egreso', v_p_disco_1tb,     4,  112000, NULL, 'VTA-038', 'Empresa CreativaNet',         v_user_id, v_now - INTERVAL '64 days'),
    (v_org_id, 'egreso', v_p_disco_512,     4,   72000, NULL, 'VTA-038', NULL,                          v_user_id, v_now - INTERVAL '63 days'),
    (v_org_id, 'egreso', v_p_pilas_aa,     40,    3800, NULL, 'VTA-039', NULL,                          v_user_id, v_now - INTERVAL '62 days'),
    (v_org_id, 'egreso', v_p_router_tp,     3,   64000, NULL, 'VTA-040', 'Pyme MediaGroup',             v_user_id, v_now - INTERVAL '61 days');

  -- ===== MES 2 (hace ~60-31 días) =====

  -- Reposición mes 2
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_iphone14,     12, 880000, v_sup_tecno,   'FAC-040', v_user_id, v_now - INTERVAL '60 days'),
    (v_org_id, 'ingreso', v_p_iphone13,     15, 670000, v_sup_tecno,   'FAC-040', v_user_id, v_now - INTERVAL '59 days'),
    (v_org_id, 'ingreso', v_p_samsung_a54,  20, 335000, v_sup_samsung, 'FAC-041', v_user_id, v_now - INTERVAL '58 days'),
    (v_org_id, 'ingreso', v_p_samsung_a34,  25, 222000, v_sup_samsung, 'FAC-041', v_user_id, v_now - INTERVAL '57 days'),
    (v_org_id, 'ingreso', v_p_funda_iph14,  80,   3800, v_sup_import,  'FAC-042', v_user_id, v_now - INTERVAL '56 days'),
    (v_org_id, 'ingreso', v_p_vidrio_iph14,100,   1300, v_sup_import,  'FAC-042', v_user_id, v_now - INTERVAL '55 days'),
    (v_org_id, 'ingreso', v_p_cable_usbc,   80,   1950, v_sup_cables,  'FAC-043', v_user_id, v_now - INTERVAL '54 days'),
    (v_org_id, 'ingreso', v_p_cargador_20w, 50,   5800, v_sup_cables,  'FAC-043', v_user_id, v_now - INTERVAL '53 days'),
    (v_org_id, 'ingreso', v_p_cargador_65w, 25,  10000, v_sup_cables,  'FAC-043', v_user_id, v_now - INTERVAL '52 days'),
    (v_org_id, 'ingreso', v_p_joystick_ps5,  6, 61000, v_sup_gaming,  'FAC-044', v_user_id, v_now - INTERVAL '50 days'),
    (v_org_id, 'ingreso', v_p_pilas_aa,     60,   1900, v_sup_import,  'FAC-045', v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'ingreso', v_p_pilas_aaa,    60,   1700, v_sup_import,  'FAC-045', v_user_id, v_now - INTERVAL '47 days'),
    (v_org_id, 'ingreso', v_p_pen_32gb,     50,   3400, v_sup_import,  'FAC-046', v_user_id, v_now - INTERVAL '46 days');

  -- Ventas mes 2
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_iphone14,      7, 1220000, NULL, 'VTA-050', NULL,                          v_user_id, v_now - INTERVAL '55 days'),
    (v_org_id, 'egreso', v_p_iphone13,      8,  930000, NULL, 'VTA-050', NULL,                          v_user_id, v_now - INTERVAL '54 days'),
    (v_org_id, 'egreso', v_p_samsung_a54,  10,  475000, NULL, 'VTA-051', 'Pedido mayorista CelSur',    v_user_id, v_now - INTERVAL '52 days'),
    (v_org_id, 'egreso', v_p_samsung_a34,  12,  325000, NULL, 'VTA-051', 'Pedido mayorista CelSur',    v_user_id, v_now - INTERVAL '52 days'),
    (v_org_id, 'egreso', v_p_moto_g84,      8,  285000, NULL, 'VTA-052', NULL,                          v_user_id, v_now - INTERVAL '50 days'),
    (v_org_id, 'egreso', v_p_funda_iph14,  35,    8700, NULL, 'VTA-050', NULL,                          v_user_id, v_now - INTERVAL '55 days'),
    (v_org_id, 'egreso', v_p_vidrio_iph14, 50,    3500, NULL, 'VTA-051', NULL,                          v_user_id, v_now - INTERVAL '52 days'),
    (v_org_id, 'egreso', v_p_auricular_bt, 10,   50000, NULL, 'VTA-053', NULL,                          v_user_id, v_now - INTERVAL '48 days'),
    (v_org_id, 'egreso', v_p_auricular_in,  6,   74000, NULL, 'VTA-053', NULL,                          v_user_id, v_now - INTERVAL '47 days'),
    (v_org_id, 'egreso', v_p_parlante_jbl, 14,   33000, NULL, 'VTA-054', NULL,                          v_user_id, v_now - INTERVAL '46 days'),
    (v_org_id, 'egreso', v_p_joystick_ps5,  4,  100000, NULL, 'VTA-055', NULL,                          v_user_id, v_now - INTERVAL '44 days'),
    (v_org_id, 'egreso', v_p_joystick_xbox, 4,   88000, NULL, 'VTA-055', NULL,                          v_user_id, v_now - INTERVAL '43 days'),
    (v_org_id, 'egreso', v_p_cable_usbc,   40,    4500, NULL, 'VTA-056', NULL,                          v_user_id, v_now - INTERVAL '42 days'),
    (v_org_id, 'egreso', v_p_cable_light,  30,    6000, NULL, 'VTA-056', NULL,                          v_user_id, v_now - INTERVAL '41 days'),
    (v_org_id, 'egreso', v_p_cargador_65w, 15,   18500, NULL, 'VTA-057', NULL,                          v_user_id, v_now - INTERVAL '40 days'),
    (v_org_id, 'egreso', v_p_cargador_20w, 20,   11000, NULL, 'VTA-057', NULL,                          v_user_id, v_now - INTERVAL '39 days'),
    (v_org_id, 'egreso', v_p_powerbank,    10,   26000, NULL, 'VTA-058', NULL,                          v_user_id, v_now - INTERVAL '38 days'),
    (v_org_id, 'egreso', v_p_pen_32gb,     25,    6500, NULL, 'VTA-058', NULL,                          v_user_id, v_now - INTERVAL '37 days'),
    (v_org_id, 'egreso', v_p_pen_64gb,     15,   10500, NULL, 'VTA-058', NULL,                          v_user_id, v_now - INTERVAL '36 days'),
    (v_org_id, 'egreso', v_p_disco_1tb,     3,  115000, NULL, 'VTA-059', NULL,                          v_user_id, v_now - INTERVAL '34 days'),
    (v_org_id, 'egreso', v_p_pilas_aa,     35,    3800, NULL, 'VTA-060', NULL,                          v_user_id, v_now - INTERVAL '33 days'),
    (v_org_id, 'egreso', v_p_pilas_aaa,    30,    3500, NULL, 'VTA-060', NULL,                          v_user_id, v_now - INTERVAL '32 days'),
    (v_org_id, 'egreso', v_p_switch_8p,     4,   21000, NULL, 'VTA-061', 'Empresa LogistiCor',          v_user_id, v_now - INTERVAL '31 days');

  -- ===== MES 1 (hace ~30-8 días) =====

  -- Reposición parcial (algunos productos NO se reponen → generarán alertas)
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, created_by, created_at) VALUES
    (v_org_id, 'ingreso', v_p_iphone14,     10, 890000, v_sup_tecno,   'FAC-050', v_user_id, v_now - INTERVAL '30 days'),
    (v_org_id, 'ingreso', v_p_samsung_a54,  15, 338000, v_sup_samsung, 'FAC-051', v_user_id, v_now - INTERVAL '28 days'),
    (v_org_id, 'ingreso', v_p_samsung_a34,  18, 225000, v_sup_samsung, 'FAC-051', v_user_id, v_now - INTERVAL '28 days'),
    (v_org_id, 'ingreso', v_p_funda_iph14,  60,   3900, v_sup_import,  'FAC-052', v_user_id, v_now - INTERVAL '26 days'),
    (v_org_id, 'ingreso', v_p_vidrio_iph14, 80,   1350, v_sup_import,  'FAC-052', v_user_id, v_now - INTERVAL '25 days'),
    (v_org_id, 'ingreso', v_p_cable_usbc,   60,   1950, v_sup_cables,  'FAC-053', v_user_id, v_now - INTERVAL '24 days'),
    (v_org_id, 'ingreso', v_p_cable_light,  50,   2650, v_sup_cables,  'FAC-053', v_user_id, v_now - INTERVAL '23 days'),
    (v_org_id, 'ingreso', v_p_cargador_20w, 40,   5900, v_sup_cables,  'FAC-053', v_user_id, v_now - INTERVAL '22 days'),
    (v_org_id, 'ingreso', v_p_pilas_aa,     50,   1900, v_sup_import,  'FAC-054', v_user_id, v_now - INTERVAL '20 days'),
    (v_org_id, 'ingreso', v_p_pilas_aaa,    50,   1700, v_sup_import,  'FAC-054', v_user_id, v_now - INTERVAL '19 days');
    -- OJO: NO se repone iPhone13, Moto G84, Joysticks, Headset, Disco1TB, Powerbank, Pen64GB
    -- → esos quedarán con stock bajo o en 0 generando alertas

  -- Ventas mes 1 (últimas 4 semanas)
  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    (v_org_id, 'egreso', v_p_iphone14,      5, 1250000, NULL, 'VTA-070', 'Venta directa + ML',         v_user_id, v_now - INTERVAL '25 days'),
    (v_org_id, 'egreso', v_p_iphone13,      4,  950000, NULL, 'VTA-070', NULL,                          v_user_id, v_now - INTERVAL '24 days'),
    (v_org_id, 'egreso', v_p_samsung_a54,   8,  480000, NULL, 'VTA-071', 'Pedido mayorista Norte',     v_user_id, v_now - INTERVAL '22 days'),
    (v_org_id, 'egreso', v_p_samsung_a34,  10,  330000, NULL, 'VTA-071', NULL,                          v_user_id, v_now - INTERVAL '21 days'),
    (v_org_id, 'egreso', v_p_moto_g84,      5,  290000, NULL, 'VTA-072', NULL,                          v_user_id, v_now - INTERVAL '20 days'),
    (v_org_id, 'egreso', v_p_funda_iph14,  25,    8800, NULL, 'VTA-070', NULL,                          v_user_id, v_now - INTERVAL '25 days'),
    (v_org_id, 'egreso', v_p_vidrio_iph14, 40,    3600, NULL, 'VTA-071', NULL,                          v_user_id, v_now - INTERVAL '22 days'),
    (v_org_id, 'egreso', v_p_auricular_bt,  8,   51000, NULL, 'VTA-073', NULL,                          v_user_id, v_now - INTERVAL '18 days'),
    (v_org_id, 'egreso', v_p_auricular_in,  5,   76000, NULL, 'VTA-073', NULL,                          v_user_id, v_now - INTERVAL '17 days'),
    (v_org_id, 'egreso', v_p_parlante_jbl, 10,   34000, NULL, 'VTA-074', NULL,                          v_user_id, v_now - INTERVAL '16 days'),
    (v_org_id, 'egreso', v_p_parlante_bt,  12,   22500, NULL, 'VTA-074', NULL,                          v_user_id, v_now - INTERVAL '15 days'),
    (v_org_id, 'egreso', v_p_joystick_ps5,  3,  102000, NULL, 'VTA-075', NULL,                          v_user_id, v_now - INTERVAL '14 days'),
    (v_org_id, 'egreso', v_p_joystick_xbox, 2,   90000, NULL, 'VTA-075', NULL,                          v_user_id, v_now - INTERVAL '13 days'),
    (v_org_id, 'egreso', v_p_cable_usbc,   35,    4600, NULL, 'VTA-076', NULL,                          v_user_id, v_now - INTERVAL '12 days'),
    (v_org_id, 'egreso', v_p_cable_light,  25,    6200, NULL, 'VTA-076', NULL,                          v_user_id, v_now - INTERVAL '11 days'),
    (v_org_id, 'egreso', v_p_cable_hdmi,   12,    8800, NULL, 'VTA-076', NULL,                          v_user_id, v_now - INTERVAL '10 days'),
    (v_org_id, 'egreso', v_p_cargador_65w, 12,   19000, NULL, 'VTA-077', NULL,                          v_user_id, v_now - INTERVAL '9 days'),
    (v_org_id, 'egreso', v_p_cargador_20w, 18,   11500, NULL, 'VTA-077', NULL,                          v_user_id, v_now - INTERVAL '8 days'),
    (v_org_id, 'egreso', v_p_powerbank,     8,   26500, NULL, 'VTA-078', NULL,                          v_user_id, v_now - INTERVAL '7 days'),
    (v_org_id, 'egreso', v_p_pen_32gb,     20,    6800, NULL, 'VTA-078', NULL,                          v_user_id, v_now - INTERVAL '6 days'),
    (v_org_id, 'egreso', v_p_pilas_aa,     30,    3900, NULL, 'VTA-079', NULL,                          v_user_id, v_now - INTERVAL '5 days'),
    (v_org_id, 'egreso', v_p_pilas_aaa,    28,    3600, NULL, 'VTA-079', NULL,                          v_user_id, v_now - INTERVAL '4 days'),
    (v_org_id, 'egreso', v_p_router_tp,     2,   65000, NULL, 'VTA-080', 'Empresa StartupDev',          v_user_id, v_now - INTERVAL '3 days'),
    (v_org_id, 'egreso', v_p_switch_8p,     3,   21500, NULL, 'VTA-080', NULL,                          v_user_id, v_now - INTERVAL '2 days');

  -- ===== ÚLTIMOS DÍAS (esta semana) =====

  INSERT INTO public.inventory_movements (organization_id, type, product_id, quantity, unit_price, supplier_id, reference, notes, created_by, created_at) VALUES
    -- Reposición urgente de iPhone 14 (muy vendido)
    (v_org_id, 'ingreso', v_p_iphone14,      8, 895000, v_sup_tecno,  'FAC-055', 'Reposición urgente',  v_user_id, v_now - INTERVAL '2 days'),
    -- Reposición de cables y accesorios
    (v_org_id, 'ingreso', v_p_cable_usbc,   50,   2000, v_sup_cables, 'FAC-056', NULL,                  v_user_id, v_now - INTERVAL '1 day'),
    (v_org_id, 'ingreso', v_p_cargador_20w, 30,   6000, v_sup_cables, 'FAC-056', NULL,                  v_user_id, v_now - INTERVAL '1 day'),
    -- Ventas del día
    (v_org_id, 'egreso',  v_p_iphone14,      2, 1280000, NULL, 'VTA-090', 'Venta mostrador',            v_user_id, v_now - INTERVAL '12 hours'),
    (v_org_id, 'egreso',  v_p_samsung_a54,   3,  490000, NULL, 'VTA-091', 'Venta online',               v_user_id, v_now - INTERVAL '6 hours'),
    (v_org_id, 'egreso',  v_p_funda_iph14,   5,    9000, NULL, 'VTA-090', NULL,                          v_user_id, v_now - INTERVAL '12 hours'),
    (v_org_id, 'egreso',  v_p_cable_usbc,   10,    4600, NULL, 'VTA-091', NULL,                          v_user_id, v_now - INTERVAL '5 hours'),
    (v_org_id, 'egreso',  v_p_pilas_aa,     10,    3900, NULL, 'VTA-092', NULL,                          v_user_id, v_now - INTERVAL '3 hours');

  RAISE NOTICE '✅ Seed completado para organización %', v_org_id;
  RAISE NOTICE '   Productos: 30 | Proveedores: 5 | Movimientos: ~200';
  RAISE NOTICE '   Alertas de stock bajo esperadas: iPhone13, MotoG84, Joystick PS5, Xbox, Headset, Disco 1TB, Powerbank, Pen 64GB, Disco 512GB';

END;
$$;
