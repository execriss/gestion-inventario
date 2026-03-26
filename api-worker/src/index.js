/**
 * Inventario Pro — REST API
 * Base URL: https://inventario-api.exegestion.com
 * Auth:     Authorization: Bearer <api-key>
 * Requiere: Plan Pro activo
 */

import { createClient } from '@supabase/supabase-js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const ok  = (data, meta)  => json(meta ? { data, meta } : { data });
const err = (msg, status) => json({ error: msg }, status);

function paginate(url) {
  const p     = url.searchParams;
  const limit = Math.min(Number(p.get('limit') ?? 50), 200);
  const page  = Math.max(Number(p.get('page')  ?? 1), 1);
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;
  return { limit, page, from, to };
}

// ─── Auth + plan check ────────────────────────────────────────────────────────

const cache = new Map();

async function authenticate(request, supabase) {
  const header = request.headers.get('Authorization') ?? '';
  const key    = header.replace(/^Bearer\s+/i, '').trim();
  if (!key) return null;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < 5 * 60_000) return hit.session;

  // Buscar la key y la org en una sola query
  const { data } = await supabase
    .from('api_keys')
    .select('organization_id, revoked_at, organizations(plan, plan_expires_at)')
    .eq('api_key', key)
    .is('revoked_at', null)
    .single();

  if (!data) return null;

  const org         = data.organizations;
  const expiresAt   = org.plan_expires_at ? new Date(org.plan_expires_at) : null;
  const isPro       = org.plan === 'pro' && (!expiresAt || expiresAt > new Date());
  const session     = { orgId: data.organization_id, isPro };

  cache.set(key, { session, ts: Date.now() });

  // Actualizar last_used_at en background (fire-and-forget)
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() })
    .eq('api_key', key).then(() => {}).catch(() => {});

  return session;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const path   = url.pathname.replace(/\/$/, '') || '/';
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (method === 'GET' && path === '/') return docs();

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const session = await authenticate(request, supabase);
    if (!session) return err('Unauthorized: incluí tu API key en el header Authorization: Bearer <key>', 401);
    if (!session.isPro) return err('Plan Pro requerido: actualizá tu plan en inventario.exegestion.com', 403);

    const { orgId } = session;

    // ── Products ───────────────────────────────────────────────────────────────
    if (path === '/products') {
      if (method === 'GET')  return listProducts(url, orgId, supabase);
      if (method === 'POST') return createProduct(request, orgId, supabase);
    }
    const prodMatch = path.match(/^\/products\/([^/]+)$/);
    if (prodMatch) {
      const id = prodMatch[1];
      if (method === 'GET')    return getProduct(id, orgId, supabase);
      if (method === 'PATCH')  return updateProduct(id, request, orgId, supabase);
      if (method === 'DELETE') return deleteProduct(id, orgId, supabase);
    }

    // ── Categories ────────────────────────────────────────────────────────────
    if (path === '/categories') {
      if (method === 'GET')  return listCategories(orgId, supabase);
      if (method === 'POST') return createCategory(request, orgId, supabase);
    }
    const catMatch = path.match(/^\/categories\/([^/]+)$/);
    if (catMatch) {
      const id = catMatch[1];
      if (method === 'GET')    return getCategory(id, orgId, supabase);
      if (method === 'PATCH')  return updateCategory(id, request, orgId, supabase);
      if (method === 'DELETE') return deleteCategory(id, orgId, supabase);
    }

    // ── Suppliers ────────────────────────────────────────────────────────────
    if (path === '/suppliers') {
      if (method === 'GET')  return listSuppliers(url, orgId, supabase);
      if (method === 'POST') return createSupplier(request, orgId, supabase);
    }
    const supMatch = path.match(/^\/suppliers\/([^/]+)$/);
    if (supMatch) {
      const id = supMatch[1];
      if (method === 'GET')    return getSupplier(id, orgId, supabase);
      if (method === 'PATCH')  return updateSupplier(id, request, orgId, supabase);
      if (method === 'DELETE') return deleteSupplier(id, orgId, supabase);
    }

    // ── Movements (append-only — registro de auditoría) ───────────────────────
    if (path === '/movements') {
      if (method === 'GET')  return listMovements(url, orgId, supabase);
      if (method === 'POST') return createMovement(request, orgId, supabase);
    }
    const movMatch = path.match(/^\/movements\/([^/]+)$/);
    if (movMatch && method === 'GET') return getMovement(movMatch[1], orgId, supabase);

    // ── Units (solo lectura) ───────────────────────────────────────────────────
    if (path === '/units' && method === 'GET') return listUnits(orgId, supabase);

    // ── Summary ────────────────────────────────────────────────────────────────
    if (method === 'GET' && path === '/summary')           return summary(orgId, supabase);
    if (method === 'GET' && path === '/summary/low-stock') return summaryLowStock(url, orgId, supabase);

    return err('Ruta no encontrada', 404);
  },
};

// ─── Handlers: Products ───────────────────────────────────────────────────────

async function listProducts(url, orgId, supabase) {
  const p              = url.searchParams;
  const { from, to, limit, page } = paginate(url);

  let q = supabase
    .from('products')
    .select('*, categories(id, name, color, icon), units(id, name, abbreviation)', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('name');

  const active = p.get('active');
  if (active !== null) q = q.eq('is_active', active !== 'false');
  else                 q = q.eq('is_active', true);

  if (p.get('category_id')) q = q.eq('category_id', p.get('category_id'));
  if (p.get('search'))      q = q.ilike('name', `%${p.get('search')}%`);
  if (p.get('low_stock') === 'true') {
    // PostgREST no soporta comparación columna-vs-columna; usamos la vista
    const { data: ids } = await supabase
      .from('low_stock_products')
      .select('id')
      .eq('organization_id', orgId);
    q = q.in('id', (ids ?? []).map(r => r.id));
  }
  if (p.get('sku'))         q = q.eq('sku', p.get('sku'));

  q = q.range(from, to);

  const { data, error, count } = await q;
  if (error) return err(error.message, 500);
  return ok(data.map(toProduct), { total: count, page, limit, pages: Math.ceil(count / limit) });
}

async function getProduct(id, orgId, supabase) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, color, icon), units(id, name, abbreviation)')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (error || !data) return err('Producto no encontrado', 404);
  return ok(toProduct(data));
}

async function createProduct(request, orgId, supabase) {
  let body;
  try { body = await request.json(); } catch { return err('JSON inválido', 400); }

  const { name, sku, description, category_id, unit_id, min_stock = 0, cost_price, sale_price } = body;
  if (!name)        return err('"name" es requerido', 400);
  if (!category_id) return err('"category_id" es requerido', 400);
  if (!unit_id)     return err('"unit_id" es requerido', 400);

  const { data, error } = await supabase
    .from('products')
    .insert({
      organization_id: orgId,
      name,
      sku:         sku         || null,
      description: description || null,
      category_id,
      unit_id,
      min_stock:   Number(min_stock),
      cost_price:  cost_price != null ? Number(cost_price) : null,
      sale_price:  sale_price != null ? Number(sale_price) : null,
    })
    .select('*, categories(id, name, color, icon), units(id, name, abbreviation)')
    .single();

  if (error) {
    if (error.code === '23505') return err('Ya existe un producto con ese SKU', 409);
    return err(error.message, 500);
  }
  return ok(toProduct(data));
}

async function updateProduct(id, request, orgId, supabase) {
  let body;
  try { body = await request.json(); } catch { return err('JSON inválido', 400); }

  const allowed = ['name', 'sku', 'description', 'category_id', 'unit_id', 'min_stock', 'cost_price', 'sale_price', 'is_active'];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  if (Object.keys(updates).length === 0) return err('No hay campos válidos para actualizar', 400);

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId)
    .select('*, categories(id, name, color, icon), units(id, name, abbreviation)')
    .single();

  if (error) {
    if (error.code === '23505') return err('Ya existe un producto con ese SKU', 409);
    if (!data) return err('Producto no encontrado', 404);
    return err(error.message, 500);
  }
  if (!data) return err('Producto no encontrado', 404);
  return ok(toProduct(data));
}

async function deleteProduct(id, orgId, supabase) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)
    .eq('organization_id', orgId)
    .select('id')
    .single();

  if (error || !data) return err('Producto no encontrado', 404);
  return ok({ deleted: id });
}

// ─── Handlers: Categories ─────────────────────────────────────────────────────

async function listCategories(orgId, supabase) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('organization_id', orgId)
    .order('name');

  if (error) return err(error.message, 500);
  return ok(data.map(toCategory));
}

async function getCategory(id, orgId, supabase) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (error || !data) return err('Categoría no encontrada', 404);
  return ok(toCategory(data));
}

async function createCategory(request, orgId, supabase) {
  let body;
  try { body = await request.json(); } catch { return err('JSON inválido', 400); }

  const { name, color = '#06b6d4', icon = 'package' } = body;
  if (!name) return err('"name" es requerido', 400);

  const { data, error } = await supabase
    .from('categories')
    .insert({ organization_id: orgId, name, color, icon })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return err('Ya existe una categoría con ese nombre', 409);
    return err(error.message, 500);
  }
  return ok(toCategory(data));
}

async function updateCategory(id, request, orgId, supabase) {
  let body;
  try { body = await request.json(); } catch { return err('JSON inválido', 400); }

  const allowed = ['name', 'color', 'icon'];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  if (Object.keys(updates).length === 0) return err('No hay campos válidos para actualizar', 400);

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return err('Ya existe una categoría con ese nombre', 409);
    return err(error.message, 500);
  }
  if (!data) return err('Categoría no encontrada', 404);
  return ok(toCategory(data));
}

async function deleteCategory(id, orgId, supabase) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) {
    if (error.code === '23503') return err('No se puede eliminar: hay productos asociados a esta categoría', 409);
    return err(error.message, 500);
  }
  return ok({ deleted: id });
}

// ─── Handlers: Suppliers ──────────────────────────────────────────────────────

async function listSuppliers(url, orgId, supabase) {
  const { from, to, limit, page } = paginate(url);
  const p = url.searchParams;

  let q = supabase
    .from('suppliers')
    .select('*', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('name');

  const active = p.get('active');
  if (active !== null) q = q.eq('is_active', active !== 'false');
  else                 q = q.eq('is_active', true);

  if (p.get('search')) q = q.ilike('name', `%${p.get('search')}%`);

  q = q.range(from, to);

  const { data, error, count } = await q;
  if (error) return err(error.message, 500);
  return ok(data.map(toSupplier), { total: count, page, limit, pages: Math.ceil(count / limit) });
}

async function getSupplier(id, orgId, supabase) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (error || !data) return err('Proveedor no encontrado', 404);
  return ok(toSupplier(data));
}

async function createSupplier(request, orgId, supabase) {
  let body;
  try { body = await request.json(); } catch { return err('JSON inválido', 400); }

  const { name, contact, email, phone, address, notes } = body;
  if (!name) return err('"name" es requerido', 400);

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      organization_id: orgId,
      name,
      contact: contact || null,
      email:   email   || null,
      phone:   phone   || null,
      address: address || null,
      notes:   notes   || null,
    })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(toSupplier(data));
}

async function updateSupplier(id, request, orgId, supabase) {
  let body;
  try { body = await request.json(); } catch { return err('JSON inválido', 400); }

  const allowed = ['name', 'contact', 'email', 'phone', 'address', 'notes', 'is_active'];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  if (Object.keys(updates).length === 0) return err('No hay campos válidos para actualizar', 400);

  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId)
    .select()
    .single();

  if (error) return err(error.message, 500);
  if (!data)  return err('Proveedor no encontrado', 404);
  return ok(toSupplier(data));
}

async function deleteSupplier(id, orgId, supabase) {
  const { data, error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', id)
    .eq('organization_id', orgId)
    .select('id')
    .single();

  if (error || !data) return err('Proveedor no encontrado', 404);
  return ok({ deleted: id });
}

// ─── Handlers: Movements ──────────────────────────────────────────────────────

async function listMovements(url, orgId, supabase) {
  const { from, to, limit, page } = paginate(url);
  const p = url.searchParams;

  let q = supabase
    .from('inventory_movements')
    .select(
      '*, products(id, name, sku), suppliers(id, name)',
      { count: 'exact' }
    )
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (p.get('type'))       q = q.eq('type', p.get('type'));
  if (p.get('product_id')) q = q.eq('product_id', p.get('product_id'));
  if (p.get('supplier_id')) q = q.eq('supplier_id', p.get('supplier_id'));
  if (p.get('from'))       q = q.gte('created_at', p.get('from'));
  if (p.get('to'))         q = q.lte('created_at', p.get('to') + 'T23:59:59Z');

  q = q.range(from, to);

  const { data, error, count } = await q;
  if (error) return err(error.message, 500);
  return ok(data.map(toMovement), { total: count, page, limit, pages: Math.ceil(count / limit) });
}

async function getMovement(id, orgId, supabase) {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*, products(id, name, sku), suppliers(id, name)')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (error || !data) return err('Movimiento no encontrado', 404);
  return ok(toMovement(data));
}

async function createMovement(request, orgId, supabase) {
  let body;
  try { body = await request.json(); } catch { return err('JSON inválido', 400); }

  const { type, product_id, quantity, unit_price = 0, supplier_id, reference, notes } = body;
  if (!type)       return err('"type" es requerido: "ingreso" o "egreso"', 400);
  if (!['ingreso', 'egreso'].includes(type)) return err('"type" debe ser "ingreso" o "egreso"', 400);
  if (!product_id) return err('"product_id" es requerido', 400);
  if (!quantity || Number(quantity) <= 0) return err('"quantity" debe ser mayor a 0', 400);

  const { data, error } = await supabase
    .from('inventory_movements')
    .insert({
      organization_id: orgId,
      type,
      product_id,
      quantity:    Number(quantity),
      unit_price:  Number(unit_price),
      supplier_id: supplier_id || null,
      reference:   reference   || null,
      notes:       notes       || null,
    })
    .select('*, products(id, name, sku), suppliers(id, name)')
    .single();

  if (error) {
    if (error.message?.includes('Stock insuficiente')) {
      return err('Stock insuficiente para realizar este egreso', 422);
    }
    return err(error.message, 500);
  }
  return ok(toMovement(data));
}

// ─── Handlers: Units ──────────────────────────────────────────────────────────

async function listUnits(orgId, supabase) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('organization_id', orgId)
    .order('name');

  if (error) return err(error.message, 500);
  return ok(data.map(toUnit));
}

// ─── Handlers: Summary ────────────────────────────────────────────────────────

async function summary(orgId, supabase) {
  const [
    { count: totalProducts },
    { count: lowStockCount },
    { count: totalSuppliers },
    { count: totalCategories },
    { data: recentMovements },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId).eq('is_active', true),
    supabase.from('low_stock_products').select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    supabase.from('suppliers').select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId).eq('is_active', true),
    supabase.from('categories').select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    supabase.from('inventory_movements')
      .select('*, products(id, name, sku)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return ok({
    products:    { total: totalProducts,    low_stock: lowStockCount },
    suppliers:   { total: totalSuppliers },
    categories:  { total: totalCategories },
    recent_movements: (recentMovements ?? []).map(toMovement),
  });
}

async function summaryLowStock(url, orgId, supabase) {
  const { from, to, limit, page } = paginate(url);

  // Obtener IDs de productos con stock bajo desde la vista
  const { data: lowIds, error: viewErr } = await supabase
    .from('low_stock_products')
    .select('id')
    .eq('organization_id', orgId);

  if (viewErr) return err(viewErr.message, 500);

  const ids = (lowIds ?? []).map(r => r.id);
  if (ids.length === 0) return ok([], { total: 0, page, limit, pages: 0 });

  const { data, error, count } = await supabase
    .from('products')
    .select('*, categories(id, name, color, icon), units(id, name, abbreviation)', { count: 'exact' })
    .in('id', ids)
    .order('current_stock')
    .range(from, to);

  if (error) return err(error.message, 500);
  return ok(data.map(toProduct), { total: count, page, limit, pages: Math.ceil(count / limit) });
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toProduct(r) {
  return {
    id:            r.id,
    name:          r.name,
    sku:           r.sku,
    description:   r.description,
    category:      r.categories ?? null,
    unit:          r.units      ?? null,
    current_stock: Number(r.current_stock),
    min_stock:     Number(r.min_stock),
    cost_price:    r.cost_price != null ? Number(r.cost_price) : null,
    sale_price:    r.sale_price != null ? Number(r.sale_price) : null,
    image_url:     r.image_url,
    is_active:     r.is_active,
    created_at:    r.created_at,
    updated_at:    r.updated_at,
  };
}

function toCategory(r) {
  return {
    id:         r.id,
    name:       r.name,
    color:      r.color,
    icon:       r.icon,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function toSupplier(r) {
  return {
    id:         r.id,
    name:       r.name,
    contact:    r.contact,
    email:      r.email,
    phone:      r.phone,
    address:    r.address,
    notes:      r.notes,
    is_active:  r.is_active,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function toMovement(r) {
  return {
    id:          r.id,
    type:        r.type,
    product:     r.products    ?? null,
    supplier:    r.suppliers   ?? null,
    quantity:    Number(r.quantity),
    unit_price:  Number(r.unit_price),
    total_price: Number(r.total_price),
    reference:   r.reference,
    notes:       r.notes,
    created_at:  r.created_at,
  };
}

function toUnit(r) {
  return {
    id:           r.id,
    name:         r.name,
    abbreviation: r.abbreviation,
    created_at:   r.created_at,
  };
}

// ─── Docs ─────────────────────────────────────────────────────────────────────

function docs() {
  const html = /* html */`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventario Pro — API</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #080b10; --bg2: #0d1117; --bg3: #141c24;
      --border: #1e2a38; --cyan: #06b6d4; --cyan-dim: rgba(6,182,212,0.12);
      --violet: #8b5cf6; --violet-dim: rgba(139,92,246,0.12);
      --fg: #e2e8f0; --muted: #64748b; --red: #f87171; --amber: #fbbf24; --green: #4ade80;
      --code: #7dd3fc;
    }
    body { background: var(--bg); color: var(--fg); font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.6; padding: 48px 24px; }
    .wrap { max-width: 820px; margin: 0 auto; }
    h1 { font-size: 30px; font-weight: 700; background: linear-gradient(135deg, var(--cyan), var(--violet)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 6px; letter-spacing: -0.03em; }
    .subtitle { color: var(--muted); margin-bottom: 40px; font-size: 15px; }
    h2 { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--cyan); margin: 44px 0 14px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    h3 { font-size: 15px; font-weight: 600; color: var(--fg); margin: 24px 0 8px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; font-family: monospace; }
    .GET    { background: rgba(74,222,128,0.12);  color: var(--green);  border: 1px solid rgba(74,222,128,0.25); }
    .POST   { background: var(--cyan-dim);         color: var(--cyan);   border: 1px solid rgba(6,182,212,0.25); }
    .PATCH  { background: var(--violet-dim);       color: var(--violet); border: 1px solid rgba(139,92,246,0.25); }
    .DELETE { background: rgba(248,113,113,0.1);  color: var(--red);    border: 1px solid rgba(248,113,113,0.25); }
    .endpoint { font-family: 'Fira Code', monospace; font-size: 14px; color: var(--fg); }
    p { color: var(--muted); margin-bottom: 10px; font-size: 13px; }
    code { background: var(--bg3); border: 1px solid var(--border); border-radius: 5px; padding: 1px 7px; font-family: 'Fira Code', monospace; font-size: 12px; color: var(--code); }
    pre { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; overflow-x: auto; margin: 10px 0 20px; }
    pre code { background: none; border: none; padding: 0; font-size: 13px; color: var(--fg); }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 20px; }
    th { text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; border-bottom: 1px solid var(--border); }
    td { padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: top; }
    td:first-child { font-family: monospace; color: var(--code); white-space: nowrap; }
    td em { color: var(--cyan); font-style: normal; font-size: 11px; }
    .note { background: var(--cyan-dim); border: 1px solid rgba(6,182,212,0.25); border-radius: 8px; padding: 10px 16px; margin: 12px 0 20px; font-size: 12px; color: var(--fg); }
    .tag-pro { background: linear-gradient(135deg, var(--cyan-dim), var(--violet-dim)); border: 1px solid rgba(139,92,246,0.3); border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 700; color: var(--violet); }
    a { color: var(--cyan); }
    .toc { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
    .toc a { background: var(--bg3); border: 1px solid var(--border); border-radius: 6px; padding: 4px 12px; font-size: 12px; color: var(--muted); text-decoration: none; transition: all 0.15s; }
    .toc a:hover { border-color: var(--cyan); color: var(--cyan); }
    .resp-label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    hr { border: none; border-top: 1px solid var(--border); margin: 40px 0; }
  </style>
</head>
<body>
<div class="wrap">
  <h1>Inventario Pro API</h1>
  <p class="subtitle">REST API para integrar tu inventario con sistemas externos &nbsp;<span class="tag-pro">Solo Plan Pro</span></p>

  <div class="toc">
    <a href="#auth">Autenticación</a>
    <a href="#pagination">Paginación</a>
    <a href="#products">Productos</a>
    <a href="#categories">Categorías</a>
    <a href="#suppliers">Proveedores</a>
    <a href="#movements">Movimientos</a>
    <a href="#units">Unidades</a>
    <a href="#summary">Resumen</a>
  </div>

  <!-- AUTH -->
  <h2 id="auth">Autenticación</h2>
  <p>Todas las rutas (excepto esta página) requieren una API key en el header:</p>
  <pre><code>Authorization: Bearer &lt;tu-api-key&gt;</code></pre>
  <p>Generá tu key desde <strong>Configuración → API</strong> en <a href="https://inventario.exegestion.com/settings/api">inventario.exegestion.com</a>.</p>

  <h2>Base URL</h2>
  <pre><code>https://inventario-api.exegestion.com</code></pre>

  <h2>Respuestas</h2>
  <p>Éxito: <code>{ "data": ... }</code> — Éxito con paginación: <code>{ "data": [...], "meta": { "total", "page", "limit", "pages" } }</code> — Error: <code>{ "error": "mensaje" }</code></p>

  <!-- PAGINATION -->
  <h2 id="pagination">Paginación</h2>
  <p>Los endpoints de lista aceptan:</p>
  <table>
    <tr><th>Param</th><th>Default</th><th>Máximo</th><th>Descripción</th></tr>
    <tr><td>limit</td><td>50</td><td>200</td><td>Resultados por página</td></tr>
    <tr><td>page</td><td>1</td><td>—</td><td>Número de página</td></tr>
  </table>

  <!-- PRODUCTS -->
  <h2 id="products">Productos</h2>

  <h3><span class="badge GET">GET</span> <span class="endpoint">/products</span></h3>
  <p>Lista productos activos. Filtros opcionales:</p>
  <table>
    <tr><th>Param</th><th>Tipo</th><th>Descripción</th></tr>
    <tr><td>search</td><td>string</td><td>Búsqueda parcial por nombre</td></tr>
    <tr><td>category_id</td><td>uuid</td><td>Filtrar por categoría</td></tr>
    <tr><td>sku</td><td>string</td><td>Búsqueda exacta por SKU</td></tr>
    <tr><td>low_stock</td><td>boolean</td><td><code>true</code> → solo productos con stock ≤ mínimo</td></tr>
    <tr><td>active</td><td>boolean</td><td>Default <code>true</code>. Pasar <code>false</code> para ver inactivos</td></tr>
  </table>

  <h3><span class="badge GET">GET</span> <span class="endpoint">/products/:id</span></h3>
  <p>Detalle de un producto.</p>

  <h3><span class="badge POST">POST</span> <span class="endpoint">/products</span></h3>
  <pre><code>{
  "name":        "Laptop Dell XPS",   // requerido
  "category_id": "uuid",              // requerido
  "unit_id":     "uuid",              // requerido
  "sku":         "LAP-001",           // opcional
  "description": "...",              // opcional
  "min_stock":   5,                   // opcional (default: 0)
  "cost_price":  800.00,              // opcional
  "sale_price":  1200.00              // opcional
}</code></pre>

  <h3><span class="badge PATCH">PATCH</span> <span class="endpoint">/products/:id</span></h3>
  <p>Actualiza cualquier campo. Solo enviá los que querés cambiar.</p>
  <p>Para reactivar un producto: <code>{ "is_active": true }</code></p>

  <h3><span class="badge DELETE">DELETE</span> <span class="endpoint">/products/:id</span></h3>
  <p>Baja lógica (marca <code>is_active: false</code>). Los movimientos históricos se conservan.</p>

  <div class="note">⚠️ Para modificar el stock usá <strong>POST /movements</strong>. El stock es calculado automáticamente desde los movimientos de ingreso/egreso.</div>

  <!-- CATEGORIES -->
  <h2 id="categories">Categorías</h2>

  <h3><span class="badge GET">GET</span> <span class="endpoint">/categories</span></h3>
  <h3><span class="badge GET">GET</span> <span class="endpoint">/categories/:id</span></h3>
  <h3><span class="badge POST">POST</span> <span class="endpoint">/categories</span></h3>
  <pre><code>{
  "name":  "Electrónica",    // requerido
  "color": "#06b6d4",        // opcional (hex, default: cyan)
  "icon":  "monitor"         // opcional (nombre de ícono Lucide)
}</code></pre>
  <h3><span class="badge PATCH">PATCH</span> <span class="endpoint">/categories/:id</span></h3>
  <h3><span class="badge DELETE">DELETE</span> <span class="endpoint">/categories/:id</span></h3>
  <p>Falla con 409 si hay productos asociados.</p>

  <!-- SUPPLIERS -->
  <h2 id="suppliers">Proveedores</h2>

  <h3><span class="badge GET">GET</span> <span class="endpoint">/suppliers</span></h3>
  <p>Acepta <code>search</code> y <code>active</code> como filtros.</p>
  <h3><span class="badge GET">GET</span> <span class="endpoint">/suppliers/:id</span></h3>
  <h3><span class="badge POST">POST</span> <span class="endpoint">/suppliers</span></h3>
  <pre><code>{
  "name":    "TechDistrib S.A.",   // requerido
  "contact": "Juan Pérez",         // opcional
  "email":   "ventas@tech.com",    // opcional
  "phone":   "+54 11 1234-5678",   // opcional
  "address": "Av. Corrientes 1234",// opcional
  "notes":   "..."                 // opcional
}</code></pre>
  <h3><span class="badge PATCH">PATCH</span> <span class="endpoint">/suppliers/:id</span></h3>
  <h3><span class="badge DELETE">DELETE</span> <span class="endpoint">/suppliers/:id</span></h3>
  <p>Baja lógica (<code>is_active: false</code>).</p>

  <!-- MOVEMENTS -->
  <h2 id="movements">Movimientos de inventario</h2>
  <p>Los movimientos son inmutables (registro de auditoría). No se pueden editar ni eliminar.</p>

  <h3><span class="badge GET">GET</span> <span class="endpoint">/movements</span></h3>
  <table>
    <tr><th>Param</th><th>Tipo</th><th>Descripción</th></tr>
    <tr><td>type</td><td>string</td><td><code>ingreso</code> o <code>egreso</code></td></tr>
    <tr><td>product_id</td><td>uuid</td><td>Filtrar por producto</td></tr>
    <tr><td>supplier_id</td><td>uuid</td><td>Filtrar por proveedor</td></tr>
    <tr><td>from</td><td>date</td><td>Desde fecha <code>YYYY-MM-DD</code></td></tr>
    <tr><td>to</td><td>date</td><td>Hasta fecha <code>YYYY-MM-DD</code></td></tr>
  </table>

  <h3><span class="badge GET">GET</span> <span class="endpoint">/movements/:id</span></h3>

  <h3><span class="badge POST">POST</span> <span class="endpoint">/movements</span></h3>
  <pre><code>{
  "type":        "ingreso",     // requerido: "ingreso" | "egreso"
  "product_id":  "uuid",        // requerido
  "quantity":    10,             // requerido (> 0)
  "unit_price":  850.00,         // opcional (default: 0)
  "supplier_id": "uuid",         // opcional
  "reference":   "OC-2026-001", // opcional
  "notes":       "..."          // opcional
}</code></pre>
  <div class="note">Un <code>egreso</code> con cantidad mayor al stock disponible devuelve <strong>422 Stock insuficiente</strong>. El stock se actualiza automáticamente vía trigger de base de datos.</div>

  <!-- UNITS -->
  <h2 id="units">Unidades de medida</h2>
  <h3><span class="badge GET">GET</span> <span class="endpoint">/units</span></h3>
  <p>Lista todas las unidades de medida de la organización. Solo lectura.</p>

  <!-- SUMMARY -->
  <h2 id="summary">Resumen</h2>

  <h3><span class="badge GET">GET</span> <span class="endpoint">/summary</span></h3>
  <pre><code>{
  "data": {
    "products":   { "total": 120, "low_stock": 5 },
    "suppliers":  { "total": 18 },
    "categories": { "total": 7 },
    "recent_movements": [...]
  }
}</code></pre>

  <h3><span class="badge GET">GET</span> <span class="endpoint">/summary/low-stock</span></h3>
  <p>Lista paginada de productos con stock igual o menor al mínimo configurado. Útil para alertas de reposición.</p>

  <hr>

  <h2>Ejemplo rápido</h2>
  <pre><code>curl https://inventario-api.exegestion.com/summary \\
  -H "Authorization: Bearer ivk_..."</code></pre>

  <pre><code>curl -X POST https://inventario-api.exegestion.com/movements \\
  -H "Authorization: Bearer ivk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"type":"ingreso","product_id":"...","quantity":50,"unit_price":12.5}'</code></pre>

  <pre><code>curl "https://inventario-api.exegestion.com/products?low_stock=true&limit=10" \\
  -H "Authorization: Bearer ivk_..."</code></pre>

</div>
</body>
</html>`;

  return new Response(html, {
    headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' },
  });
}
