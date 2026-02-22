'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const MovementsTimelineChart = dynamic(
  () => import('@/components/reports/movements-timeline'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
  }
)

const StockByCategoryChartComponent = dynamic(
  () => import('@/components/reports/stock-by-category-chart'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
  }
)

const TopProductsChartComponent = dynamic(
  () => import('@/components/reports/top-products-chart'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
  }
)

// Re-export the dynamically loaded components for use in the reports page
export function MovementsTimeline({
  movements,
}: {
  movements: Array<{
    type: 'ingreso' | 'egreso'
    total_price: number
    created_at: string
  }>
}) {
  return <MovementsTimelineChart movements={movements} />
}

export function StockByCategoryChart({
  data,
}: {
  data: Array<{
    category_name: string
    color: string
    total_stock: number
    total_value: number
  }>
}) {
  return <StockByCategoryChartComponent data={data} />
}

export function TopProductsChart({
  data,
}: {
  data: Array<{
    name: string
    current_stock: number
    cost_price: number | null
  }>
}) {
  return <TopProductsChartComponent data={data} />
}
