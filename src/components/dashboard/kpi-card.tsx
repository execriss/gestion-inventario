import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  color: 'cyan' | 'violet' | 'green' | 'amber' | 'red'
}

const colorMap = {
  cyan: {
    iconBg: 'bg-cyan-500/10',
    iconText: 'text-cyan-400',
    bar: 'bg-cyan-400',
  },
  violet: {
    iconBg: 'bg-violet-500/10',
    iconText: 'text-violet-400',
    bar: 'bg-violet-400',
  },
  green: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    bar: 'bg-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    bar: 'bg-amber-400',
  },
  red: {
    iconBg: 'bg-red-500/10',
    iconText: 'text-red-400',
    bar: 'bg-red-400',
  },
} as const

export function KpiCard({ title, value, subtitle, icon: Icon, color }: KpiCardProps) {
  const colors = colorMap[color]

  return (
    <div className="glass-card rounded-xl p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            colors.iconBg,
            colors.iconText
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {/* Barra inferior de color */}
      <div
        className={cn('absolute bottom-0 left-0 h-1 w-full', colors.bar)}
        aria-hidden="true"
      />
    </div>
  )
}
