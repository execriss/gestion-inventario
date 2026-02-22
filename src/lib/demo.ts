/**
 * MODO DEMO — Ver la UI sin Supabase
 * Activar: añadir NEXT_PUBLIC_DEMO_MODE=true en .env.local
 */

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export const DEMO_USER = {
  email: 'demo@inventariopro.com',
  fullName: 'Admin Demo',
  avatarUrl: null,
  role: 'admin' as const,
}

// ---- Categorías ----
export const DEMO_CATEGORIES = [
  { id: 'cat-1', name: 'Telas',              color: '#06b6d4', icon: 'layers',     created_at: '', updated_at: '' },
  { id: 'cat-2', name: 'Tintas',             color: '#8b5cf6', icon: 'droplets',   created_at: '', updated_at: '' },
  { id: 'cat-3', name: 'Hilos',              color: '#f59e0b', icon: 'circle-dot', created_at: '', updated_at: '' },
  { id: 'cat-4', name: 'Prendas Terminadas', color: '#10b981', icon: 'shirt',      created_at: '', updated_at: '' },
  { id: 'cat-5', name: 'Insumos Estampado',  color: '#ec4899', icon: 'printer',    created_at: '', updated_at: '' },
  { id: 'cat-6', name: 'Accesorios',         color: '#6366f1', icon: 'tag',        created_at: '', updated_at: '' },
  { id: 'cat-7', name: 'Embalaje',           color: '#94a3b8', icon: 'package',    created_at: '', updated_at: '' },
]

// ---- Unidades ----
export const DEMO_UNITS = [
  { id: 'u-1', name: 'Metro',     abbreviation: 'm',     created_at: '' },
  { id: 'u-2', name: 'Kilogramo', abbreviation: 'kg',    created_at: '' },
  { id: 'u-3', name: 'Litro',     abbreviation: 'L',     created_at: '' },
  { id: 'u-4', name: 'Unidad',    abbreviation: 'u',     created_at: '' },
  { id: 'u-5', name: 'Rollo',     abbreviation: 'rollo', created_at: '' },
  { id: 'u-6', name: 'Cono',      abbreviation: 'cono',  created_at: '' },
]

// ---- Proveedores ----
export const DEMO_SUPPLIERS = [
  { id: 'sup-1', name: 'Textiles del Norte S.A.',  contact: 'Carlos Mendez',  email: 'ventas@texnorte.com',   phone: '0351-4444-555', address: 'Córdoba', notes: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'sup-2', name: 'Tintas Color Pro',          contact: 'Ana García',     email: 'info@colorpro.com',     phone: '011-2222-333',  address: 'CABA',    notes: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'sup-3', name: 'Distribuidora Hilos Sur',   contact: 'Pedro Jiménez',  email: 'pedidos@hilossur.com',  phone: '0341-6666-777', address: 'Rosario', notes: null, is_active: true, created_at: '', updated_at: '' },
]

// ---- Productos ----
export const DEMO_PRODUCTS = [
  { id: 'p-1', name: 'Tela Jersey Blanca',     sku: 'TJB-001', description: 'Jersey 100% algodón 180gr', category_id: 'cat-1', unit_id: 'u-1', min_stock: 50,  current_stock: 125, cost_price: 850,  sale_price: 1100, image_url: null, is_active: true, created_by: null, created_at: '', updated_at: '', categories: { name: 'Telas', color: '#06b6d4', icon: 'layers' }, units: { name: 'Metro', abbreviation: 'm' } },
  { id: 'p-2', name: 'Tela Poplin Negro',       sku: 'TPN-002', description: 'Poplin liviano 110gr',      category_id: 'cat-1', unit_id: 'u-1', min_stock: 30,  current_stock: 18,  cost_price: 620,  sale_price: 900,  image_url: null, is_active: true, created_by: null, created_at: '', updated_at: '', categories: { name: 'Telas', color: '#06b6d4', icon: 'layers' }, units: { name: 'Metro', abbreviation: 'm' } },
  { id: 'p-3', name: 'Tinta Serigráfica Roja',  sku: 'TSR-003', description: 'Tinta plastisol roja',      category_id: 'cat-2', unit_id: 'u-2', min_stock: 5,   current_stock: 12,  cost_price: 3200, sale_price: 4500, image_url: null, is_active: true, created_by: null, created_at: '', updated_at: '', categories: { name: 'Tintas', color: '#8b5cf6', icon: 'droplets' }, units: { name: 'Kilogramo', abbreviation: 'kg' } },
  { id: 'p-4', name: 'Tinta Serigráfica Negra', sku: 'TSN-004', description: 'Tinta plastisol negra',     category_id: 'cat-2', unit_id: 'u-2', min_stock: 5,   current_stock: 0,   cost_price: 2800, sale_price: 4000, image_url: null, is_active: true, created_by: null, created_at: '', updated_at: '', categories: { name: 'Tintas', color: '#8b5cf6', icon: 'droplets' }, units: { name: 'Kilogramo', abbreviation: 'kg' } },
  { id: 'p-5', name: 'Hilo Blanco 40/2',        sku: 'HB-005',  description: 'Hilo costura blanco',       category_id: 'cat-3', unit_id: 'u-6', min_stock: 10,  current_stock: 24,  cost_price: 450,  sale_price: 700,  image_url: null, is_active: true, created_by: null, created_at: '', updated_at: '', categories: { name: 'Hilos', color: '#f59e0b', icon: 'circle-dot' }, units: { name: 'Cono', abbreviation: 'cono' } },
  { id: 'p-6', name: 'Remera Blanca M',         sku: 'RBM-006', description: 'Remera básica talle M',     category_id: 'cat-4', unit_id: 'u-4', min_stock: 20,  current_stock: 45,  cost_price: 1200, sale_price: 2500, image_url: null, is_active: true, created_by: null, created_at: '', updated_at: '', categories: { name: 'Prendas Terminadas', color: '#10b981', icon: 'shirt' }, units: { name: 'Unidad', abbreviation: 'u' } },
  { id: 'p-7', name: 'Remera Negra L',          sku: 'RNL-007', description: 'Remera básica talle L',     category_id: 'cat-4', unit_id: 'u-4', min_stock: 20,  current_stock: 8,   cost_price: 1200, sale_price: 2500, image_url: null, is_active: true, created_by: null, created_at: '', updated_at: '', categories: { name: 'Prendas Terminadas', color: '#10b981', icon: 'shirt' }, units: { name: 'Unidad', abbreviation: 'u' } },
  { id: 'p-8', name: 'Emulsión UV Fotográfica',  sku: 'EUV-008', description: 'Emulsión para marcos',     category_id: 'cat-5', unit_id: 'u-3', min_stock: 2,   current_stock: 5,   cost_price: 4500, sale_price: 7000, image_url: null, is_active: true, created_by: null, created_at: '', updated_at: '', categories: { name: 'Insumos Estampado', color: '#ec4899', icon: 'printer' }, units: { name: 'Litro', abbreviation: 'L' } },
]

// ---- Productos con stock bajo ----
export const DEMO_LOW_STOCK = [
  { id: 'p-2', name: 'Tela Poplin Negro',        sku: 'TPN-002', current_stock: 18,  min_stock: 30,  image_url: null, category_name: 'Telas',              category_color: '#06b6d4', unit_abbreviation: 'm',  stock_deficit: 12 },
  { id: 'p-4', name: 'Tinta Serigráfica Negra',  sku: 'TSN-004', current_stock: 0,   min_stock: 5,   image_url: null, category_name: 'Tintas',             category_color: '#8b5cf6', unit_abbreviation: 'kg', stock_deficit: 5  },
  { id: 'p-7', name: 'Remera Negra L',           sku: 'RNL-007', current_stock: 8,   min_stock: 20,  image_url: null, category_name: 'Prendas Terminadas', category_color: '#10b981', unit_abbreviation: 'u',  stock_deficit: 12 },
]

// ---- Stock por categoría (para gráfica) ----
export const DEMO_STOCK_BY_CATEGORY = [
  { category_id: 'cat-1', category_name: 'Telas',              color: '#06b6d4', icon: 'layers',     product_count: 2, total_stock: 143,  total_value: 146950 },
  { category_id: 'cat-2', category_name: 'Tintas',             color: '#8b5cf6', icon: 'droplets',   product_count: 2, total_stock: 12,   total_value: 38400  },
  { category_id: 'cat-3', category_name: 'Hilos',              color: '#f59e0b', icon: 'circle-dot', product_count: 1, total_stock: 24,   total_value: 10800  },
  { category_id: 'cat-4', category_name: 'Prendas Terminadas', color: '#10b981', icon: 'shirt',      product_count: 2, total_stock: 53,   total_value: 63600  },
  { category_id: 'cat-5', category_name: 'Insumos Estampado',  color: '#ec4899', icon: 'printer',    product_count: 1, total_stock: 5,    total_value: 22500  },
]

// ---- Resumen movimientos del día ----
export const DEMO_TODAY_SUMMARY = [
  { type: 'ingreso' as const, total_movements: 3, total_quantity: 85,  total_value: 142000 },
  { type: 'egreso'  as const, total_movements: 5, total_quantity: 12,  total_value:  38500 },
]

// ---- Últimos movimientos ----
const now = new Date()
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString()

export const DEMO_RECENT_MOVEMENTS = [
  { id: 'm-1', type: 'ingreso' as const, quantity: 50,  unit_price: 850,  total_price: 42500, supplier_id: 'sup-1', reference: 'FAC-00123', notes: null, created_by: null, created_at: h(0.5),  products: { name: 'Tela Jersey Blanca',    sku: 'TJB-001' }, suppliers: { name: 'Textiles del Norte S.A.' }, profiles: { full_name: 'Admin Demo' } },
  { id: 'm-2', type: 'egreso'  as const, quantity: 5,   unit_price: 0,    total_price: 0,     supplier_id: null,    reference: 'OP-0456',  notes: 'Para producción', created_by: null, created_at: h(1),    products: { name: 'Tinta Serigráfica Roja', sku: 'TSR-003' }, suppliers: null,                                  profiles: { full_name: 'Admin Demo' } },
  { id: 'm-3', type: 'ingreso' as const, quantity: 8,   unit_price: 3200, total_price: 25600, supplier_id: 'sup-2', reference: 'FAC-00456', notes: null, created_by: null, created_at: h(2),    products: { name: 'Tinta Serigráfica Roja', sku: 'TSR-003' }, suppliers: { name: 'Tintas Color Pro' },            profiles: { full_name: 'Admin Demo' } },
  { id: 'm-4', type: 'egreso'  as const, quantity: 10,  unit_price: 0,    total_price: 0,     supplier_id: null,    reference: 'OP-0455',  notes: null, created_by: null, created_at: h(3),    products: { name: 'Remera Blanca M',        sku: 'RBM-006' }, suppliers: null,                                  profiles: { full_name: 'Admin Demo' } },
  { id: 'm-5', type: 'ingreso' as const, quantity: 100, unit_price: 620,  total_price: 62000, supplier_id: 'sup-1', reference: 'FAC-00122', notes: null, created_by: null, created_at: h(5),    products: { name: 'Tela Poplin Negro',      sku: 'TPN-002' }, suppliers: { name: 'Textiles del Norte S.A.' }, profiles: { full_name: 'Admin Demo' } },
  { id: 'm-6', type: 'egreso'  as const, quantity: 2,   unit_price: 0,    total_price: 0,     supplier_id: null,    reference: 'OP-0454',  notes: null, created_by: null, created_at: h(8),    products: { name: 'Hilo Blanco 40/2',       sku: 'HB-005'  }, suppliers: null,                                  profiles: { full_name: 'Admin Demo' } },
  { id: 'm-7', type: 'ingreso' as const, quantity: 30,  unit_price: 1200, total_price: 36000, supplier_id: null,    reference: null,       notes: null, created_by: null, created_at: h(24),   products: { name: 'Remera Negra L',         sku: 'RNL-007' }, suppliers: null,                                  profiles: { full_name: 'Admin Demo' } },
  { id: 'm-8', type: 'egreso'  as const, quantity: 1,   unit_price: 0,    total_price: 0,     supplier_id: null,    reference: 'OP-0453',  notes: null, created_by: null, created_at: h(30),   products: { name: 'Emulsión UV Fotográfica', sku: 'EUV-008' }, suppliers: null,                                 profiles: { full_name: 'Admin Demo' } },
]

// ---- Movimientos para reportes (últimos 30 días) ----
export const DEMO_MOVEMENTS_30D = Array.from({ length: 60 }, (_, i) => {
  const daysAgo = Math.floor(i / 2)
  const isIngreso = i % 3 !== 0
  return {
    type: (isIngreso ? 'ingreso' : 'egreso') as 'ingreso' | 'egreso',
    quantity: Math.floor(Math.random() * 20) + 1,
    total_price: Math.floor(Math.random() * 50000) + 5000,
    created_at: new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 43200000).toISOString(),
  }
})
