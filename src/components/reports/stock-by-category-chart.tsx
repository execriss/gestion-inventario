'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent'
import { formatCurrency } from '@/lib/utils'

interface StockByCategoryData {
  category_name: string
  color: string
  total_stock: number
  total_value: number
  product_count: number
}

interface StockByCategoryChartProps {
  data: StockByCategoryData[]
}

function CustomTooltip({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as StockByCategoryData

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-xl">
      <p className="font-medium mb-1">{data.category_name}</p>
      <p className="text-muted-foreground">
        Stock:{' '}
        <span className="font-semibold text-foreground">
          {data.total_stock}
        </span>
      </p>
      <p className="text-muted-foreground">
        Valor:{' '}
        <span className="font-semibold text-foreground">
          {formatCurrency(data.total_value)}
        </span>
      </p>
      <p className="text-muted-foreground">
        Productos:{' '}
        <span className="font-semibold text-foreground">
          {data.product_count}
        </span>
      </p>
    </div>
  )
}

export default function StockByCategoryChart({
  data,
}: StockByCategoryChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Sin datos de categorias
        </p>
      </div>
    )
  }

  const sortedData = [...data].sort((a, b) => b.total_stock - a.total_stock)
  const chartHeight = Math.max(240, sortedData.length * 56)

  return (
    <div className="w-full">
      {/* Bar chart */}
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(1 0 0 / 8%)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'oklch(0.58 0.01 240)' }}
              axisLine={{ stroke: 'oklch(1 0 0 / 8%)' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="category_name"
              tick={{ fontSize: 11, fill: 'oklch(0.58 0.01 240)' }}
              axisLine={{ stroke: 'oklch(1 0 0 / 8%)' }}
              tickLine={false}
              width={140}
              interval={0}
            />
            <Tooltip
              content={CustomTooltip}
              cursor={{ fill: 'oklch(1 0 0 / 4%)' }}
            />
            <Bar dataKey="total_stock" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || '#6b7280'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="mt-6 space-y-2">
        {sortedData.map((entry) => (
          <div
            key={entry.category_name}
            className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || '#6b7280' }}
                aria-hidden="true"
              />
              <span className="text-sm truncate">{entry.category_name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm shrink-0 ml-4">
              <span>
                <span className="font-bold">{entry.total_stock}</span>{' '}
                <span className="text-muted-foreground">uds.</span>
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(entry.total_value)}
              </span>
              <span className="text-muted-foreground">
                {entry.product_count} productos
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
