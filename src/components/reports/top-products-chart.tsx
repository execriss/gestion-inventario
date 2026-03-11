'use client'

import { useState, useMemo } from 'react'
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
import { Check, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { formatCurrency } from '@/lib/utils'

interface ProductData {
  name: string
  current_stock: number
  cost_price: number | null
}

interface TopProductsChartProps {
  data: ProductData[]
}

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
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    () => new Set(data.map((p) => p.name))
  )
  const [open, setOpen] = useState(false)

  const allSelected = selectedProducts.size === data.length
  const noneSelected = selectedProducts.size === 0

  function toggleProduct(name: string) {
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(data.map((p) => p.name)))
    }
  }

  const filteredData = useMemo(
    () => data.filter((p) => selectedProducts.has(p.name)),
    [data, selectedProducts]
  )

  const triggerLabel =
    allSelected
      ? `${data.length} productos`
      : `${selectedProducts.size} de ${data.length} productos`

  if (!data.length) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Sin datos de productos
        </p>
      </div>
    )
  }

  const chartData = filteredData.map((item) => ({
    name: truncate(item.name, 18),
    fullName: item.name,
    current_stock: item.current_stock,
    cost_price: item.cost_price,
  }))

  const chartHeight = Math.max(300, filteredData.length * 44)

  return (
    <div className="w-full space-y-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="size-4" />
            {triggerLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar producto..." />
            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={toggleAll} className="font-medium">
                  <div className={`flex size-4 items-center justify-center rounded-sm border border-primary mr-1 ${allSelected ? 'bg-primary' : ''}`}>
                    {allSelected && <Check className="size-3 text-primary-foreground" />}
                    {!allSelected && !noneSelected && (
                      <div className="size-2 rounded-[1px] bg-primary" />
                    )}
                  </div>
                  {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                {data.map((product) => {
                  const isSelected = selectedProducts.has(product.name)
                  return (
                    <CommandItem
                      key={product.name}
                      value={product.name}
                      onSelect={() => toggleProduct(product.name)}
                    >
                      <div className={`flex size-4 items-center justify-center rounded-sm border border-primary mr-1 ${isSelected ? 'bg-primary' : ''}`}>
                        {isSelected && <Check className="size-3 text-primary-foreground" />}
                      </div>
                      <span className="truncate">{product.name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {noneSelected ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Seleccioná al menos un producto para ver el gráfico
          </p>
        </div>
      ) : (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="cyanGradientH" x1="0" y1="0" x2="1" y2="0">
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
                dataKey="name"
                tick={{ fontSize: 11, fill: 'oklch(0.58 0.01 240)' }}
                axisLine={{ stroke: 'oklch(1 0 0 / 8%)' }}
                tickLine={false}
                width={150}
                interval={0}
              />
              <Tooltip
                content={CustomTooltip}
                cursor={{ fill: 'oklch(1 0 0 / 4%)' }}
              />
              <Bar
                dataKey="current_stock"
                fill="url(#cyanGradientH)"
                radius={[0, 4, 4, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
