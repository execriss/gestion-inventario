import { Skeleton } from '@/components/ui/skeleton'

export default function MovementsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Filtros tipo */}
      <div className="flex gap-2">
        {[80, 90, 90].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-full" style={{ width: w }} />
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex gap-4 px-4 py-3 border-b border-border">
          {[120, 80, 180, 80, 80, 80, 140, 100, 100].map((w, i) => (
            <Skeleton key={i} className="h-4" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-border/50">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
