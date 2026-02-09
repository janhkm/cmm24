import { Skeleton } from '@/components/ui/skeleton';

export default function AnfragenLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Tabs */}
      <Skeleton className="h-10 w-96" />
      {/* Anfragen-Liste */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
