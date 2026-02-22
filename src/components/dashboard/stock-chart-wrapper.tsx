'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const StockChart = dynamic(
  () => import('@/components/dashboard/stock-chart'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  }
)

interface StockChartWrapperProps {
  data: Array<{
    category_name: string
    color: string
    total_stock: number
    product_count: number
  }>
}

export function StockChartWrapper({ data }: StockChartWrapperProps) {
  return <StockChart data={data} />
}
