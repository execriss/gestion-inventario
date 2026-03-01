import { Skeleton } from '@/components/ui/skeleton'

export default function MembersLoading() {
  return (
    <div className="space-y-6">
      {/* Members section skeleton */}
      <div className="glass-card rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-5 w-36" />
          <div className="flex-1" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/30 px-4 py-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="size-8 rounded" />
          </div>
        ))}
      </div>

      {/* Invitations section skeleton */}
      <div className="glass-card rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-5 w-36" />
          <div className="flex-1" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/30 px-4 py-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Create invitation skeleton */}
      <div className="glass-card rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-5 w-44" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
