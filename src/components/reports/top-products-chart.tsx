'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent'

interface TopProductsChartProps {
  data: Array<{
    name: string
    current_stock: number
    cost_price: number | null
  }>
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

function CustomTooltip({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as {
    fullName: string
    current_stock: number
    cost_price: number | null
  }

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-xl">
      <p className="font-medium mb-1">{data.fullName}</p>
      <p className="text-muted-foreground">
        Stock:{' '}
        <span className="font-semibold text-foreground">
          {data.current_stock}
        </span>
      </p>
      {data.cost_price != null && (
        <p className="text-muted-foreground">
          Costo:{' '}
          <span className="font-semibold text-foreground">
            {formatCurrency(data.cost_price)}
          </span>
        </p>
      )}
    </div>
  )
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Sin datos de productos
        </p>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: truncate(item.name, 15),
    fullName: item.name,
    current_stock: item.current_stock,
    cost_price: item.cost_price,
  }))

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="oklch(0.73 0.19 196)"
                stopOpacity={0.9}
              />
              <stop
                offset="100%"
                stopColor="oklch(0.73 0.19 196)"
                stopOpacity={0.4}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(1 0 0 / 8%)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'oklch(0.58 0.01 240)' }}
            axisLine={{ stroke: 'oklch(1 0 0 / 8%)' }}
            tickLine={false}
            angle={-35}
            textAnchor="end"
            height={60}
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
          <Bar
            dataKey="current_stock"
            fill="url(#cyanGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
