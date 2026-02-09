import { Skeleton } from '@/components/ui/skeleton';

export default function InserateLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      {/* Tabelle */}
      <div className="border rounded-lg">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
