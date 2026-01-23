import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      
      <CardContent className="p-4">
        {/* Manufacturer */}
        <Skeleton className="h-3 w-16 mb-2" />
        
        {/* Title */}
        <Skeleton className="h-5 w-3/4 mb-3" />
        
        {/* Details */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
        
        {/* Price & Button */}
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
