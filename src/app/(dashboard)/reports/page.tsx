import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, BarChart3, Package } from 'lucide-react'
import {
  MovementsTimeline,
  StockByCategoryChart,
  TopProductsChart,
} from '@/components/reports/report-charts'
import {
  DEMO_MODE,
  DEMO_MOVEMENTS_30D,
  DEMO_STOCK_BY_CATEGORY,
  DEMO_PRODUCTS,
} from '@/lib/demo'

type MovementRow = { type: 'ingreso' | 'egreso'; quantity: number; total_price: number; created_at: string }
type StockCatRow = { category_name: string; color: string; total_stock: number; total_value: number; product_count: number }
type TopProductRow = { name: string; current_stock: number; cost_price: number | null }

export default async function ReportsPage() {
  let movements: MovementRow[]
  let stockByCategory: StockCatRow[]
  let topProducts: TopProductRow[]

  if (DEMO_MODE) {
    movements = DEMO_MOVEMENTS_30D
    stockByCategory = DEMO_STOCK_BY_CATEGORY as unknown as StockCatRow[]
    topProducts = DEMO_PRODUCTS
      .slice()
      .sort((a, b) => b.current_stock - a.current_stock)
      .slice(0, 10)
      .map(p => ({ name: p.name, current_stock: p.current_stock, cost_price: p.cost_price }))
  } else {
    const supabase = await createClient()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [movementsResult, stockByCatResult, topProductsResult] =
      await Promise.all([
        supabase
          .from('inventory_movements')
          .select('type, quantity, total_price, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at')
          .limit(500),
        supabase.from('stock_by_category').select('*'),
        supabase
          .from('products')
          .select('name, current_stock, cost_price')
          .eq('is_active', true)
          .order('current_stock', { ascending: false })
          .limit(10),
      ])

    movements = (movementsResult.data ?? []) as MovementRow[]
    stockByCategory = (stockByCatResult.data ?? []) as unknown as StockCatRow[]
    topProducts = (topProductsResult.data ?? []) as TopProductRow[]
  }

  return (
    <div className="space-y-6">
      {/* Titulo de pagina */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis y visualización de datos del inventario
          </p>
        </div>
      </div>

      {/* Tabs de reportes */}
      <Tabs defaultValue="movimientos" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="movimientos" className="gap-1.5">
            <TrendingUp className="hidden sm:block h-4 w-4" aria-hidden="true" />
            Movimientos
          </TabsTrigger>
          <TabsTrigger value="stock" className="gap-1.5">
            <BarChart3 className="hidden sm:block h-4 w-4" aria-hidden="true" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="productos" className="gap-1.5">
            <Package className="hidden sm:block h-4 w-4" aria-hidden="true" />
            Productos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movimientos">
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold">
                Movimientos últimos 30 días
              </h2>
              <p className="text-sm text-muted-foreground">
                Ingresos vs egresos en valor monetario
              </p>
            </div>
            <MovementsTimeline movements={movements} />
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold">
                Stock por Categoría
              </h2>
              <p className="text-sm text-muted-foreground">
                Distribución de unidades por categoría de producto
              </p>
            </div>
            <StockByCategoryChart data={stockByCategory} />
          </div>
        </TabsContent>

        <TabsContent value="productos">
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold">
                Top 10 Productos por Stock
              </h2>
              <p className="text-sm text-muted-foreground">
                Productos con mayor cantidad de unidades en inventario
              </p>
            </div>
            <TopProductsChart data={topProducts} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
