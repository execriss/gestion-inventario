import { Skeleton } from '@/components/ui/skeleton'

export default function OrganizationLoading() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-5">
      <div className="space-y-1">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  )
}
