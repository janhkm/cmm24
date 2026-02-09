import { ListingGridSkeleton } from '@/components/shared/page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function MaschinenLoading() {
  return (
    <div className="container-page py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-96" />
      </div>
      {/* Search + Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Grid */}
      <ListingGridSkeleton count={9} />
    </div>
  );
}
