'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent'
import { format, eachDayOfInterval, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

interface MovementsTimelineProps {
  movements: Array<{
    type: 'ingreso' | 'egreso'
    total_price: number
    created_at: string
  }>
}

import { formatCurrency } from '@/lib/utils'

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-xl">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          {entry.name}:{' '}
          <span className="font-semibold text-foreground">
            {formatCurrency(entry.value as number)}
          </span>
        </p>
      ))}
    </div>
  )
}

export default function MovementsTimeline({
  movements,
}: MovementsTimelineProps) {
  const days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  })

  const chartData = days.map((day) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const dayMovements = movements.filter((m) =>
      m.created_at.startsWith(dateKey)
    )

    return {
      fecha: format(day, 'dd/MM', { locale: es }),
      Ingresos: dayMovements
        .filter((m) => m.type === 'ingreso')
        .reduce((sum, m) => sum + m.total_price, 0),
      Egresos: dayMovements
        .filter((m) => m.type === 'egreso')
        .reduce((sum, m) => sum + m.total_price, 0),
    }
  })

  if (!movements.length) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Sin movimientos en los ultimos 30 dias
        </p>
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(1 0 0 / 8%)"
            vertical={false}
          />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 11, fill: 'oklch(0.58 0.01 240)' }}
            axisLine={{ stroke: 'oklch(1 0 0 / 8%)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'oklch(0.58 0.01 240)' }}
            axisLine={{ stroke: 'oklch(1 0 0 / 8%)' }}
            tickLine={false}
            tickFormatter={(value) =>
              new Intl.NumberFormat('es-AR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
          />
          <Tooltip content={CustomTooltip} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="Ingresos"
            stroke="oklch(0.73 0.19 196)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="Egresos"
            stroke="oklch(0.62 0.22 25)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
