import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StockBadgeProps {
  currentStock: number
  minStock: number
}

export function StockBadge({ currentStock, minStock }: StockBadgeProps) {
  if (currentStock <= 0) {
    return (
      <Badge
        className={cn(
          'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20'
        )}
      >
        Sin stock
      </Badge>
    )
  }

  if (currentStock <= minStock) {
    return (
      <Badge
        className={cn(
          'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
        )}
      >
        Bajo
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
      )}
    >
      OK
    </Badge>
  )
}
