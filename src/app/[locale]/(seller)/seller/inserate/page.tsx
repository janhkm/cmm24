'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  Trash2,
  Copy,
  ExternalLink,
  Star,
  Crown,
  Lock,
  X,
  CheckSquare,
  Loader2,
  Undo2,
  Filter,
  Sparkles,
  CalendarDays,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { getMyListings, deleteListing, toggleListingFeatured, getManufacturers } from '@/lib/actions/listings';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import type { Database } from '@/types/supabase';

type Listing = Database['public']['Tables']['listings']['Row'] & {
  listing_media?: { id: string; url: string; thumbnail_url: string | null; is_primary: boolean | null }[];
};

// Feature flags based on plan (will be dynamic later)
const getFeatureFlags = (planSlug: string | null) => ({
  hasBulkActions: planSlug === 'business',
  hasFeaturedListings: planSlug === 'free' ? 0 : planSlug === 'starter' ? 1 : 5,
});

export default function InseratePage() {
  const t = useTranslations('sellerListings');
  const locale = useLocale();
  const { plan, isLoading: authLoading } = useSellerAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [manufacturers, setManufacturers] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'archive' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Featured listing dialog
  const [featuredDialogOpen, setFeaturedDialogOpen] = useState(false);
  const [selectedListingForFeatured, setSelectedListingForFeatured] = useState<string>('');
  const [selectedFeaturedDate, setSelectedFeaturedDate] = useState<string>('');
  const [isFeaturing, setIsFeaturing] = useState(false);
  
  // For undo functionality
  const undoDataRef = useRef<{ action: string; data: Listing[] } | null>(null);

  const featureFlags = getFeatureFlags(plan?.slug ?? null);
  const hasBulkActions = featureFlags.hasBulkActions;
  const hasFeaturedLimit = featureFlags.hasFeaturedListings;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{t('statusActive')}</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('statusPendingReview')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('statusDraft')}</Badge>;
      case 'sold':
        return <Badge className="bg-blue-100 text-blue-800">{t('statusSold')}</Badge>;
      case 'archived':
        return <Badge variant="outline">{t('statusArchived')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Listings und Hersteller aus der Datenbank laden
  useEffect(() => {
    const loadData = async () => {
      const [listingsResult, manufacturersResult] = await Promise.all([
        getMyListings(),
        getManufacturers(),
      ]);
      if (listingsResult.success && listingsResult.data) {
        setListings(listingsResult.data);
      }
      if (manufacturersResult.success && manufacturersResult.data) {
        setManufacturers(manufacturersResult.data);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const manufacturer = manufacturers.find((m) => m.id === listing.manufacturer_id);
    const matchesSearch = listing.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      (manufacturer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus =
      statusFilter === 'all' || listing.status === statusFilter;
    const matchesManufacturer =
      manufacturerFilter === 'all' || listing.manufacturer_id === manufacturerFilter;
    return matchesSearch && matchesStatus && matchesManufacturer;
  });
  
  // Get unique manufacturers from listings
  const listingManufacturers = [...new Set(listings.map((l) => l.manufacturer_id))]
    .map((id) => manufacturers.find((m) => m.id === id))
    .filter(Boolean);

  const featuredCount = listings.filter((l) => l.featured).length;
  const canFeatureMore = hasFeaturedLimit === -1 || featuredCount < hasFeaturedLimit;

  // Show loading state
  if (isLoading || authLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const toggleFeatured = async (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    const wasFeature = listing?.featured;
    
    if (wasFeature) {
      // Remove featured status
      const result = await toggleListingFeatured(listingId, false);
      if (result.success) {
        setListings((prev) =>
          prev.map((l) =>
            l.id === listingId ? { ...l, featured: false } : l
          )
        );
        toast.success(t('highlightRemoved'), { description: listing?.title });
      } else {
        toast.error(result.error || t('errorRemovingHighlight'));
      }
    } else {
      // Open dialog to set featured date
      setSelectedListingForFeatured(listingId);
      setSelectedFeaturedDate(getMinDate());
      setFeaturedDialogOpen(true);
    }
  };
  
  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  // Handle featured listing confirmation
  const handleConfirmFeatured = async () => {
    if (!selectedListingForFeatured) return;
    
    setIsFeaturing(true);
    
    const listing = listings.find((l) => l.id === selectedListingForFeatured);
    const result = await toggleListingFeatured(selectedListingForFeatured, true);
    
    setIsFeaturing(false);
    
    if (result.success) {
      setListings((prev) =>
        prev.map((l) =>
          l.id === selectedListingForFeatured ? { ...l, featured: true } : l
        )
      );
      
      setFeaturedDialogOpen(false);
      setSelectedListingForFeatured('');
      setSelectedFeaturedDate('');
      
      toast.success(t('listingHighlighted'), {
        description: t('listingHighlightedDesc', { title: listing?.title || '' }),
        duration: 6000,
      });
    } else {
      toast.error(result.error || t('errorHighlighting'));
    }
  };
  
  // Open featured dialog from button
  const openFeaturedDialog = () => {
    setSelectedListingForFeatured('');
    setSelectedFeaturedDate(getMinDate());
    setFeaturedDialogOpen(true);
  };

  // Bulk selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredListings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredListings.map((l) => l.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  // Undo function
  const handleUndo = () => {
    if (undoDataRef.current) {
      setListings(undoDataRef.current.data);
      toast.success(t('undone'));
      undoDataRef.current = null;
    }
  };

  // Bulk actions with Undo
  const handleBulkArchive = async () => {
    setIsProcessing(true);
    const affectedCount = selectedIds.length;
    
    // Save state for undo
    undoDataRef.current = { action: 'archive', data: [...listings] };
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setListings((prev) =>
      prev.map((l) =>
        selectedIds.includes(l.id) ? { ...l, status: 'archived' as const } : l
      )
    );
    setSelectedIds([]);
    setBulkAction(null);
    setIsProcessing(false);
    
    toast.success(t('listingsArchived', { count: affectedCount }), {
      description: t('undoAvailable'),
      action: {
        label: t('undo'),
        onClick: handleUndo,
      },
      duration: 10000,
    });
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    const affectedCount = selectedIds.length;
    
    // Save state for undo
    undoDataRef.current = { action: 'delete', data: [...listings] };
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setListings((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
    setSelectedIds([]);
    setBulkAction(null);
    setIsProcessing(false);
    
    toast.success(t('listingsDeleted', { count: affectedCount }), {
      description: t('undoAvailable'),
      action: {
        label: t('undo'),
        onClick: handleUndo,
      },
      duration: 10000,
    });
  };

  // Single item actions with toast
  const handleDuplicate = async (listing: Listing) => {
    const { duplicateListing } = await import('@/lib/actions/listings');
    const result = await duplicateListing(listing.id);
    if (result.success) {
      toast.success(t('listingDuplicated'), {
        description: t('duplicateDesc'),
      });
      // Listing-Liste neu laden
      const refreshResult = await getMyListings();
      if (refreshResult.success && refreshResult.data) {
        setListings(refreshResult.data);
      }
    } else {
      toast.error(t('errorDuplicating'), {
        description: result.error || t('errorDuplicatingDesc'),
      });
    }
  };

  const handleArchive = async (listing: Listing) => {
    // Archive uses soft-delete (same as delete)
    const result = await deleteListing(listing.id);
    if (result.success) {
      undoDataRef.current = { action: 'archive', data: [...listings] };
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
      toast.success(t('listingArchived'), {
        description: listing.title,
      });
    } else {
      toast.error(t('errorArchiving'), { description: result.error });
    }
  };

  const handleDelete = async (listing: Listing) => {
    const result = await deleteListing(listing.id);
    if (result.success) {
      undoDataRef.current = { action: 'delete', data: [...listings] };
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
      toast.success(t('listingDeletedToast'), {
        description: listing.title,
      });
    } else {
      toast.error(t('errorDeleting'), { description: result.error });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('myListings')}</h1>
          <p className="text-muted-foreground">
            {t('manageListings')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* AUSKOMMENTIERT: Featured/Hervorheben Button
          {hasFeaturedLimit !== 0 && (
            <Button variant="outline" onClick={openFeaturedDialog}>
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              {t('highlightListing')}
            </Button>
          )}
          */}
          <Button asChild>
            <Link href="/seller/inserate/neu">
              <Plus className="mr-2 h-4 w-4" />
              {t('newListing')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('statusActive')}</SelectItem>
              <SelectItem value="pending_review">{t('statusPendingReview')}</SelectItem>
              <SelectItem value="draft">{t('statusDraft')}</SelectItem>
              <SelectItem value="sold">{t('statusSold')}</SelectItem>
              <SelectItem value="archived">{t('statusArchived')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('manufacturerPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allManufacturers')}</SelectItem>
              {listingManufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer!.id} value={manufacturer!.id}>
                  {manufacturer!.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(statusFilter !== 'all' || manufacturerFilter !== 'all' || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setManufacturerFilter('all');
                setSearchQuery('');
              }}
            >
              <X className="mr-1 h-4 w-4" />
              {t('resetFilters')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {listings.filter((l) => l.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">{t('activeListings')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {listings.filter((l) => l.status === 'draft').length}
            </div>
            <p className="text-sm text-muted-foreground">{t('drafts')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {listings.filter((l) => l.status === 'pending_review').length}
            </div>
            <p className="text-sm text-muted-foreground">{t('inReview')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {listings.filter((l) => l.status === 'sold').length}
            </div>
            <p className="text-sm text-muted-foreground">{t('sold')}</p>
          </CardContent>
        </Card>
        {/* AUSKOMMENTIERT: Featured/Hervorgehoben Stats-Card
        <Card className={cn(hasFeaturedLimit > 0 && 'border-amber-500/50')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <div className="text-2xl font-bold">{featuredCount}</div>
            </div>
            <p className="text-sm text-muted-foreground">{t('highlighted')}</p>
          </CardContent>
        </Card>
        */}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && hasBulkActions && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Card className="shadow-lg border-primary/20">
            <CardContent className="py-3 px-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('selected', { count: selectedIds.length })}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction('archive')}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {t('archive')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setBulkAction('delete')}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('deleteBulk')}
                </Button>
              </div>
              <div className="h-6 w-px bg-border" />
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="mr-1 h-4 w-4" />
                {t('cancel')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Action Dialogs */}
      <AlertDialog open={bulkAction === 'archive'} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('archiveConfirmTitle', { count: selectedIds.length })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('archiveConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkArchive} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('archiving')}
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  {t('archive')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkAction === 'delete'} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle', { count: selectedIds.length })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('deleteBulk')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Listings Table */}
      {filteredListings.length > 0 ? (
        <TooltipProvider>
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {hasBulkActions && (
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedIds.length === filteredListings.length && filteredListings.length > 0}
                          onCheckedChange={selectAll}
                          aria-label={t('selectAllLabel')}
                        />
                      </TableHead>
                    )}
                    <TableHead className="w-[300px]">{t('listingColumn')}</TableHead>
                    <TableHead>{t('statusColumn')}</TableHead>
                    {/* AUSKOMMENTIERT: Featured-Spalte
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4" />
                        <span className="sr-only">{t('highlighted')}</span>
                      </div>
                    </TableHead>
                    */}
                    <TableHead>{t('priceColumn')}</TableHead>
                    <TableHead>{t('viewsColumn')}</TableHead>
                    <TableHead>{t('createdColumn')}</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => {
                    const manufacturer = manufacturers.find((m) => m.id === listing.manufacturer_id);
                    const primaryImage = listing.listing_media?.find((m) => m.is_primary) || listing.listing_media?.[0];
                    
                    return (
                    <TableRow
                      key={listing.id}
                      className={cn(selectedIds.includes(listing.id) && 'bg-primary/5')}
                    >
                      {hasBulkActions && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(listing.id)}
                            onCheckedChange={() => toggleSelect(listing.id)}
                            aria-label={t('selectLabel', { title: listing.title })}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Link
                          href={`/seller/inserate/${listing.id}`}
                          className="flex items-center gap-4 hover:opacity-80"
                        >
                          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                            {primaryImage && (
                              <Image
                                src={primaryImage.url}
                                alt={listing.title}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {manufacturer?.name || t('unknown')}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{getStatusBadge(listing.status || 'draft')}</TableCell>
                      {/* AUSKOMMENTIERT: Featured-Zelle
                      <TableCell className="text-center">
                        {listing.featured ? (
                          <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700">
                            <Star className="h-3 w-3 fill-current" />Featured
                          </Badge>
                        ) : (<span className="text-muted-foreground">–</span>)}
                      </TableCell>
                      */}
                      <TableCell className="font-medium">
                        {formatPrice(listing.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          {listing.views_count || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {listing.created_at ? formatDate(listing.created_at) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/seller/inserate/${listing.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('edit')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/maschinen/${listing.slug}`}
                                target="_blank"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {t('preview')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(listing)}>
                              <Copy className="mr-2 h-4 w-4" />
                              {t('duplicate')}
                            </DropdownMenuItem>
                            {/* AUSKOMMENTIERT: Featured/Hervorheben Menueeintrag
                            {hasFeaturedLimit !== 0 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toggleFeatured(listing.id)}>
                                  <Star className="mr-2 h-4 w-4" />
                                  {listing.featured ? t('removeHighlight') : t('highlight')}
                                </DropdownMenuItem>
                              </>
                            )}
                            */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleArchive(listing)}>
                              <Archive className="mr-2 h-4 w-4" />
                              {t('archive')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(listing)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('deleteBulk')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TooltipProvider>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">{t('noListingsFound')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || manufacturerFilter !== 'all'
                ? t('adjustFilters')
                : t('createFirstDesc')}
            </p>
            {!searchQuery && statusFilter === 'all' && manufacturerFilter === 'all' && (
              <Button asChild className="mt-4">
                <Link href="/seller/inserate/neu">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createFirst')}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* AUSKOMMENTIERT: Featured Listing Dialog */}
      {false && <Dialog open={featuredDialogOpen} onOpenChange={setFeaturedDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              {t('featuredDialogTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('featuredDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Listing Selection */}
            <div className="space-y-2">
              <Label htmlFor="listing-select">{t('whichListingHighlight')}</Label>
              <Select
                value={selectedListingForFeatured}
                onValueChange={setSelectedListingForFeatured}
              >
                <SelectTrigger id="listing-select">
                  <SelectValue placeholder={t('selectListing')} />
                </SelectTrigger>
                <SelectContent>
                  {listings
                    .filter((l) => l.status === 'active' && !l.featured)
                    .map((listing) => (
                      <SelectItem key={listing.id} value={listing.id}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{listing.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  {listings.filter((l) => l.status === 'active' && !l.featured).length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      {t('noActiveListings')}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="featured-date">{t('featuredFromDate')}</Label>
              <Input
                id="featured-date"
                type="date"
                value={selectedFeaturedDate}
                onChange={(e) => setSelectedFeaturedDate(e.target.value)}
                min={getMinDate()}
              />
            </div>

            {/* Preview */}
            {selectedListingForFeatured && selectedFeaturedDate && (
              <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                      <Star className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        &quot;{listings.find((l) => l.id === selectedListingForFeatured)?.title}&quot;
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('willBeFeaturedFrom', {
                          date: new Date(selectedFeaturedDate).toLocaleDateString(locale, {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          }),
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Info */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                {hasFeaturedLimit === -1 ? (
                  <p>{t('businessUnlimitedFeatured')}</p>
                ) : (
                  <p>
                    {t('featuredSlotsRemaining', {
                      remaining: Math.max(0, hasFeaturedLimit - featuredCount),
                      total: hasFeaturedLimit,
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeaturedDialogOpen(false)}
              disabled={isFeaturing}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirmFeatured}
              disabled={!selectedListingForFeatured || !selectedFeaturedDate || isFeaturing}
            >
              {isFeaturing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('activating')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('highlight')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}
    </div>
  );
}
