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

interface StockByCategoryChartProps {
  data: Array<{
    category_name: string
    color: string
    total_stock: number
    total_value: number
  }>
}

import { formatCurrency } from '@/lib/utils'

function CustomTooltip({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as {
    category_name: string
    total_stock: number
    total_value: number
  }

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

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
            width={80}
          />
          <Tooltip
            content={CustomTooltip}
            cursor={{ fill: 'oklch(1 0 0 / 4%)' }}
          />
          <Bar dataKey="total_stock" radius={[0, 4, 4, 0]} maxBarSize={32}>
            {data.map((entry, index) => (
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
