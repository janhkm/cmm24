'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
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
import { mockListings, plans, manufacturers } from '@/data/mock-data';

// Mock current plan
const currentPlan = plans.find((p) => p.slug === 'business')!;


// Filter for current seller's listings
const sellerListings = mockListings.filter((l) => ['1', '2', '3'].includes(l.accountId));

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price / 100);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Aktiv</Badge>;
    case 'pending_review':
      return <Badge className="bg-yellow-100 text-yellow-800">In Prüfung</Badge>;
    case 'draft':
      return <Badge variant="secondary">Entwurf</Badge>;
    case 'sold':
      return <Badge className="bg-blue-100 text-blue-800">Verkauft</Badge>;
    case 'archived':
      return <Badge variant="outline">Archiviert</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function InseratePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [listings, setListings] = useState(sellerListings);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'archive' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Featured listing dialog
  const [featuredDialogOpen, setFeaturedDialogOpen] = useState(false);
  const [selectedListingForFeatured, setSelectedListingForFeatured] = useState<string>('');
  const [selectedFeaturedDate, setSelectedFeaturedDate] = useState<string>('');
  const [isFeaturing, setIsFeaturing] = useState(false);
  
  // For undo functionality
  const undoDataRef = useRef<{ action: string; data: typeof listings } | null>(null);

  const hasBulkActions = currentPlan.featureFlags.hasBulkActions;

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      listing.manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || listing.status === statusFilter;
    const matchesManufacturer =
      manufacturerFilter === 'all' || listing.manufacturer.id === manufacturerFilter;
    return matchesSearch && matchesStatus && matchesManufacturer;
  });
  
  // Get unique manufacturers from listings
  const listingManufacturers = [...new Set(listings.map((l) => l.manufacturer.id))]
    .map((id) => manufacturers.find((m) => m.id === id))
    .filter(Boolean);

  const featuredCount = listings.filter((l) => l.featured).length;
  const hasFeaturedLimit = currentPlan.featureFlags.hasFeaturedListings;
  const canFeatureMore = hasFeaturedLimit === -1 || featuredCount < hasFeaturedLimit;

  const toggleFeatured = (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    const wasFeature = listing?.featured;
    
    if (wasFeature) {
      // Remove featured status
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, featured: false } : l
        )
      );
      toast.success('Hervorhebung entfernt', { description: listing?.title });
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
    if (!selectedListingForFeatured || !selectedFeaturedDate) return;
    
    setIsFeaturing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const listing = listings.find((l) => l.id === selectedListingForFeatured);
    const formattedDate = new Date(selectedFeaturedDate).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    
    setListings((prev) =>
      prev.map((l) =>
        l.id === selectedListingForFeatured ? { ...l, featured: true } : l
      )
    );
    
    setIsFeaturing(false);
    setFeaturedDialogOpen(false);
    setSelectedListingForFeatured('');
    setSelectedFeaturedDate('');
    
    toast.success('Inserat wird hervorgehoben', {
      description: `"${listing?.title}" wird am ${formattedDate} als Featured angezeigt.`,
      duration: 6000,
    });
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
      toast.success('Rückgängig gemacht');
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
    
    toast.success(`${affectedCount} Inserate archiviert`, {
      description: 'Diese Aktion kann rückgängig gemacht werden.',
      action: {
        label: 'Rückgängig',
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
    
    toast.success(`${affectedCount} Inserate gelöscht`, {
      description: 'Diese Aktion kann rückgängig gemacht werden.',
      action: {
        label: 'Rückgängig',
        onClick: handleUndo,
      },
      duration: 10000,
    });
  };

  // Single item actions with toast
  const handleDuplicate = (listing: typeof listings[0]) => {
    const newListing = {
      ...listing,
      id: `${Date.now()}`,
      title: `${listing.title} (Kopie)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    };
    setListings((prev) => [newListing, ...prev]);
    toast.success('Inserat dupliziert', {
      description: 'Entwurf wurde erstellt.',
    });
  };

  const handleArchive = (listing: typeof listings[0]) => {
    undoDataRef.current = { action: 'archive', data: [...listings] };
    setListings((prev) =>
      prev.map((l) =>
        l.id === listing.id ? { ...l, status: 'archived' as const } : l
      )
    );
    toast.success('Inserat archiviert', {
      description: listing.title,
      action: {
        label: 'Rückgängig',
        onClick: handleUndo,
      },
    });
  };

  const handleDelete = (listing: typeof listings[0]) => {
    undoDataRef.current = { action: 'delete', data: [...listings] };
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    toast.success('Inserat gelöscht', {
      description: listing.title,
      action: {
        label: 'Rückgängig',
        onClick: handleUndo,
      },
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meine Inserate</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Maschinen-Inserate
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasFeaturedLimit !== 0 && (
            <Button variant="outline" onClick={openFeaturedDialog}>
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              Inserat hervorheben
            </Button>
          )}
          <Button asChild>
            <Link href="/seller/inserate/neu">
              <Plus className="mr-2 h-4 w-4" />
              Neues Inserat
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Titel oder Hersteller suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="pending_review">In Prüfung</SelectItem>
              <SelectItem value="draft">Entwurf</SelectItem>
              <SelectItem value="sold">Verkauft</SelectItem>
              <SelectItem value="archived">Archiviert</SelectItem>
            </SelectContent>
          </Select>
          <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Hersteller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Hersteller</SelectItem>
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
              Filter zurücksetzen
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
            <p className="text-sm text-muted-foreground">Aktive Inserate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {listings.filter((l) => l.status === 'draft').length}
            </div>
            <p className="text-sm text-muted-foreground">Entwürfe</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {listings.filter((l) => l.status === 'pending_review').length}
            </div>
            <p className="text-sm text-muted-foreground">In Prüfung</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {listings.filter((l) => l.status === 'sold').length}
            </div>
            <p className="text-sm text-muted-foreground">Verkauft</p>
          </CardContent>
        </Card>
        <Card className={cn(
          hasFeaturedLimit > 0 && 'border-amber-500/50'
        )}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <div className="text-2xl font-bold">
                {featuredCount}
                {hasFeaturedLimit !== -1 && hasFeaturedLimit > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{hasFeaturedLimit}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Hervorgehoben</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && hasBulkActions && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Card className="shadow-lg border-primary/20">
            <CardContent className="py-3 px-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedIds.length} ausgewählt</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction('archive')}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archivieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setBulkAction('delete')}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
                </Button>
              </div>
              <div className="h-6 w-px bg-border" />
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="mr-1 h-4 w-4" />
                Abbrechen
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Action Dialogs */}
      <AlertDialog open={bulkAction === 'archive'} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedIds.length} Inserate archivieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Die ausgewählten Inserate werden archiviert und sind nicht mehr öffentlich sichtbar.
              Sie können sie später wiederherstellen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkArchive} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird archiviert...
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archivieren
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkAction === 'delete'} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedIds.length} Inserate löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die ausgewählten Inserate
              werden dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
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
                          aria-label="Alle auswählen"
                        />
                      </TableHead>
                    )}
                    <TableHead className="w-[300px]">Inserat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4" />
                        <span className="sr-only">Hervorgehoben</span>
                      </div>
                    </TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Aufrufe</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => (
                    <TableRow
                      key={listing.id}
                      className={cn(selectedIds.includes(listing.id) && 'bg-primary/5')}
                    >
                      {hasBulkActions && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(listing.id)}
                            onCheckedChange={() => toggleSelect(listing.id)}
                            aria-label={`${listing.title} auswählen`}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Link
                          href={`/seller/inserate/${listing.id}`}
                          className="flex items-center gap-4 hover:opacity-80"
                        >
                          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                            {listing.media[0] && (
                              <Image
                                src={listing.media[0].url}
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
                              {listing.manufacturer.name}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{getStatusBadge(listing.status)}</TableCell>
                      <TableCell className="text-center">
                        {listing.featured ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                <Star className="h-3 w-3 fill-current" />
                                Featured
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Dieses Inserat ist hervorgehoben</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(listing.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          {listing.viewsCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(listing.createdAt)}
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
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/maschinen/${listing.slug}`}
                                target="_blank"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Vorschau
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(listing)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplizieren
                            </DropdownMenuItem>
                            {hasFeaturedLimit !== 0 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => toggleFeatured(listing.id)}
                                  disabled={
                                    !listing.featured &&
                                    !canFeatureMore &&
                                    hasFeaturedLimit !== -1
                                  }
                                >
                                  <Star className={cn(
                                    'mr-2 h-4 w-4',
                                    listing.featured && 'fill-amber-500 text-amber-500'
                                  )} />
                                  {listing.featured ? 'Hervorhebung entfernen' : 'Hervorheben'}
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleArchive(listing)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archivieren
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(listing)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <h3 className="font-semibold">Keine Inserate gefunden</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || manufacturerFilter !== 'all'
                ? 'Versuchen Sie, Ihre Filter anzupassen.'
                : 'Erstellen Sie Ihr erstes Inserat, um zu starten.'}
            </p>
            {!searchQuery && statusFilter === 'all' && manufacturerFilter === 'all' && (
              <Button asChild className="mt-4">
                <Link href="/seller/inserate/neu">
                  <Plus className="mr-2 h-4 w-4" />
                  Erstes Inserat erstellen
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Featured Listing Dialog */}
      <Dialog open={featuredDialogOpen} onOpenChange={setFeaturedDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Inserat hervorheben
            </DialogTitle>
            <DialogDescription>
              Hervorgehobene Inserate werden prominent auf der Startseite und in den Suchergebnissen angezeigt.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Listing Selection */}
            <div className="space-y-2">
              <Label htmlFor="listing-select">Welches Inserat möchten Sie hervorheben?</Label>
              <Select
                value={selectedListingForFeatured}
                onValueChange={setSelectedListingForFeatured}
              >
                <SelectTrigger id="listing-select">
                  <SelectValue placeholder="Inserat auswählen..." />
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
                      Keine aktiven Inserate verfügbar
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="featured-date">Ab welchem Tag soll es hervorgehoben werden?</Label>
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
                        Wird ab dem{' '}
                        <span className="font-medium text-foreground">
                          {new Date(selectedFeaturedDate).toLocaleDateString('de-DE', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>{' '}
                        als Featured angezeigt.
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
                  <p>Im Business-Plan sind unbegrenzt Featured-Inserate inklusive.</p>
                ) : (
                  <p>
                    Sie haben noch{' '}
                    <span className="font-medium text-foreground">
                      {Math.max(0, hasFeaturedLimit - featuredCount)}
                    </span>{' '}
                    von {hasFeaturedLimit} Featured-Slots in diesem Monat verfügbar.
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
              Abbrechen
            </Button>
            <Button
              onClick={handleConfirmFeatured}
              disabled={!selectedListingForFeatured || !selectedFeaturedDate || isFeaturing}
            >
              {isFeaturing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird aktiviert...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Hervorheben
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
