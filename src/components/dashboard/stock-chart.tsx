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

interface StockChartProps {
  data: Array<{
    category_name: string
    color: string
    total_stock: number
    product_count: number
  }>
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-xl">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        Stock:{' '}
        <span className="font-semibold text-foreground">
          {payload[0].value}
        </span>
      </p>
    </div>
  )
}

export default function StockChart({ data }: StockChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Sin datos de categorias
        </p>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.category_name,
    stock: item.total_stock,
    color: item.color,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(1 0 0 / 8%)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'oklch(0.58 0.01 240)' }}
            axisLine={{ stroke: 'oklch(1 0 0 / 8%)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'oklch(0.58 0.01 240)' }}
            axisLine={{ stroke: 'oklch(1 0 0 / 8%)' }}
            tickLine={false}
          />
          <Tooltip
            content={CustomTooltip}
            cursor={{ fill: 'oklch(1 0 0 / 4%)' }}
          />
          <Bar dataKey="stock" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
