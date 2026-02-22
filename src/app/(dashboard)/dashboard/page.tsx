import { createClient } from '@/lib/supabase/server'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'
import { RecentMovements } from '@/components/dashboard/recent-movements'
import { StockChartWrapper } from '@/components/dashboard/stock-chart-wrapper'
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
} from 'lucide-react'
import {
  DEMO_MODE,
  DEMO_PRODUCTS,
  DEMO_LOW_STOCK,
  DEMO_STOCK_BY_CATEGORY,
  DEMO_TODAY_SUMMARY,
  DEMO_RECENT_MOVEMENTS,
} from '@/lib/demo'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

export default async function DashboardPage() {
  // ---- MODO DEMO ----
  if (DEMO_MODE) {
    const ingresosHoy = DEMO_TODAY_SUMMARY.find((s) => s.type === 'ingreso')
    const egresosHoy  = DEMO_TODAY_SUMMARY.find((s) => s.type === 'egreso')
    const alertCount  = DEMO_LOW_STOCK.length

    return (
      <DashboardLayout
        totalProducts={DEMO_PRODUCTS.length}
        ingresosHoy={ingresosHoy}
        egresosHoy={egresosHoy}
        alertCount={alertCount}
        stockByCategory={DEMO_STOCK_BY_CATEGORY}
        lowStockProducts={DEMO_LOW_STOCK}
        recentMovements={DEMO_RECENT_MOVEMENTS}
      />
    )
  }

  // ---- MODO REAL ----
  const supabase = await createClient()

  const [
    { data: todaySummary },
    { data: lowStockProducts },
    { data: stockByCategory },
    { count: totalProducts },
    { data: recentMovements },
  ] = await Promise.all([
    supabase.from('today_movements_summary').select('*'),
    supabase.from('low_stock_products').select('*').limit(5),
    supabase.from('stock_by_category').select('*'),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('inventory_movements')
      .select(
        'id, type, quantity, total_price, created_at, products(name, sku), profiles(full_name)'
      )
      .order('created_at', { ascending: false })
      .limit(8)
      .returns<
        Array<{
          id: string
          type: 'ingreso' | 'egreso'
          quantity: number
          total_price: number
          created_at: string
          products: { name: string; sku: string | null } | null
          profiles: { full_name: string | null } | null
        }>
      >(),
  ])

  const ingresosHoy = todaySummary?.find((s) => s.type === 'ingreso')
  const egresosHoy = todaySummary?.find((s) => s.type === 'egreso')
  const alertCount = lowStockProducts?.length ?? 0

  return (
    <DashboardLayout
      totalProducts={totalProducts ?? 0}
      ingresosHoy={ingresosHoy}
      egresosHoy={egresosHoy}
      alertCount={alertCount}
      stockByCategory={stockByCategory ?? []}
      lowStockProducts={lowStockProducts ?? []}
      recentMovements={recentMovements ?? []}
    />
  )
}

// ---- Componente de layout reutilizado por modo real y demo ----
function DashboardLayout({
  totalProducts,
  ingresosHoy,
  egresosHoy,
  alertCount,
  stockByCategory,
  lowStockProducts,
  recentMovements,
}: {
  totalProducts: number
  ingresosHoy?: { total_movements: number; total_value: number } | null
  egresosHoy?:  { total_movements: number; total_value: number } | null
  alertCount: number
  stockByCategory: Array<{ category_name: string; color: string; total_stock: number; product_count: number }>
  lowStockProducts: Array<{ id: string; name: string; sku: string | null; current_stock: number; min_stock: number; image_url: string | null; category_name: string; category_color: string; unit_abbreviation: string; stock_deficit: number }>
  recentMovements: Array<{ id: string; type: 'ingreso' | 'egreso'; quantity: number; total_price: number; created_at: string; products: { name: string; sku: string | null } | null; profiles: { full_name: string | null } | null }>
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen del inventario en tiempo real
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Productos Activos"
          value={totalProducts}
          subtitle="en inventario"
          icon={Package}
          color="cyan"
        />
        <KpiCard
          title="Ingresos Hoy"
          value={ingresosHoy?.total_movements ?? 0}
          subtitle={`${formatCurrency(ingresosHoy?.total_value ?? 0)} en valor`}
          icon={ArrowDownToLine}
          color="green"
        />
        <KpiCard
          title="Egresos Hoy"
          value={egresosHoy?.total_movements ?? 0}
          subtitle={`${formatCurrency(egresosHoy?.total_value ?? 0)} en valor`}
          icon={ArrowUpFromLine}
          color="red"
        />
        <KpiCard
          title="Alertas Stock"
          value={alertCount}
          subtitle={alertCount > 0 ? 'productos bajo mínimo' : 'todo en orden'}
          icon={AlertTriangle}
          color={alertCount > 0 ? 'amber' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-base font-semibold mb-4">Stock por Categoría</h2>
          <StockChartWrapper data={stockByCategory} />
        </div>
        <LowStockAlert products={lowStockProducts} />
      </div>

      <RecentMovements movements={recentMovements} />
    </div>
  )
}
