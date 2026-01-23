'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  User,
  Building,
  Clock,
  Mail,
  Phone,
  List,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  MessageSquare,
  Undo2,
  Search,
  Filter,
  X,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { mockInquiries, mockListings } from '@/data/mock-data';
import type { Inquiry, InquiryStatus } from '@/types';

// Pipeline columns configuration
const pipelineColumns: {
  id: InquiryStatus;
  title: string;
  color: string;
  description: string;
}[] = [
  {
    id: 'new',
    title: 'Neue Anfragen',
    color: 'bg-blue-500',
    description: 'Noch nicht bearbeitet',
  },
  {
    id: 'contacted',
    title: 'Kontaktiert',
    color: 'bg-yellow-500',
    description: 'Erster Kontakt hergestellt',
  },
  {
    id: 'offer_sent',
    title: 'Angebot gesendet',
    color: 'bg-purple-500',
    description: 'Warten auf Rückmeldung',
  },
  {
    id: 'won',
    title: 'Gewonnen',
    color: 'bg-green-500',
    description: 'Verkauf abgeschlossen',
  },
  {
    id: 'lost',
    title: 'Verloren',
    color: 'bg-gray-500',
    description: 'Kein Abschluss',
  },
];

// Enrich inquiries with listing data
const enrichedInquiries = mockInquiries.map((inquiry) => ({
  ...inquiry,
  listing: mockListings.find((l) => l.id === inquiry.listingId),
}));

export default function PipelinePage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(enrichedInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<InquiryStatus | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [mobileColumnIndex, setMobileColumnIndex] = useState(0);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [listingFilter, setListingFilter] = useState('all');
  
  // For undo functionality
  const undoDataRef = useRef<{ inquiry: Inquiry; previousStatus: InquiryStatus } | null>(null);

  // Get unique listings from inquiries
  const uniqueListings = useMemo(() => {
    const listings = inquiries
      .map((i) => i.listing)
      .filter((l): l is NonNullable<typeof l> => l !== undefined);
    return [...new Map(listings.map((l) => [l.id, l])).values()];
  }, [inquiries]);

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        inquiry.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.contactCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.listing?.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const inquiryDate = new Date(inquiry.createdAt);
        const now = new Date();
        
        if (dateFilter === 'today') {
          matchesDate = inquiryDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = inquiryDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = inquiryDate >= monthAgo;
        }
      }
      
      // Listing filter
      const matchesListing =
        listingFilter === 'all' || inquiry.listingId === listingFilter;
      
      return matchesSearch && matchesDate && matchesListing;
    });
  }, [inquiries, searchQuery, dateFilter, listingFilter]);

  // Group filtered inquiries by status
  const groupedInquiries = pipelineColumns.reduce(
    (acc, column) => {
      acc[column.id] = filteredInquiries.filter((i) => i.status === column.id);
      return acc;
    },
    {} as Record<InquiryStatus, Inquiry[]>
  );
  
  const hasActiveFilters = searchQuery !== '' || dateFilter !== 'all' || listingFilter !== 'all';
  
  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setListingFilter('all');
  };

  const handleUndo = () => {
    if (undoDataRef.current) {
      const { inquiry, previousStatus } = undoDataRef.current;
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, status: previousStatus } : i))
      );
      toast.success('Rückgängig gemacht');
      undoDataRef.current = null;
    }
  };

  const handleDragStart = (e: React.DragEvent, inquiryId: string) => {
    setDraggedItem(inquiryId);
    e.dataTransfer.effectAllowed = 'move';
    // Add drag image
    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.opacity = '1';
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, columnId: InquiryStatus) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: InquiryStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    const inquiry = inquiries.find((i) => i.id === draggedItem);
    if (!inquiry || inquiry.status === newStatus) {
      setDraggedItem(null);
      setDragOverColumn(null);
      return;
    }

    const previousStatus = inquiry.status;
    const newColumn = pipelineColumns.find((c) => c.id === newStatus);

    // Save for undo
    undoDataRef.current = { inquiry, previousStatus };

    setInquiries((prev) =>
      prev.map((i) => (i.id === draggedItem ? { ...i, status: newStatus } : i))
    );
    setDraggedItem(null);
    setDragOverColumn(null);

    toast.success(`Anfrage verschoben`, {
      description: `"${inquiry.contactName}" → ${newColumn?.title}`,
      action: {
        label: 'Rückgängig',
        onClick: handleUndo,
      },
    });
  };

  const handleStatusChange = (inquiryId: string, newStatus: InquiryStatus) => {
    const inquiry = inquiries.find((i) => i.id === inquiryId);
    if (!inquiry || inquiry.status === newStatus) return;

    const previousStatus = inquiry.status;
    const newColumn = pipelineColumns.find((c) => c.id === newStatus);

    // Save for undo
    undoDataRef.current = { inquiry, previousStatus };

    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i))
    );

    toast.success(`Status geändert`, {
      description: `"${inquiry.contactName}" → ${newColumn?.title}`,
      action: {
        label: 'Rückgängig',
        onClick: handleUndo,
      },
    });
  };

  const openDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNoteInput(inquiry.notes || '');
    setIsDetailOpen(true);
  };

  const saveNote = () => {
    if (!selectedInquiry) return;
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === selectedInquiry.id ? { ...i, notes: noteInput } : i
      )
    );
    setSelectedInquiry({ ...selectedInquiry, notes: noteInput });
    toast.success('Notiz gespeichert');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
    return formatDate(dateString);
  };

  const currentMobileColumn = pipelineColumns[mobileColumnIndex];

  const renderInquiryCard = (inquiry: Inquiry, showDragHandle = true) => (
    <Card
      key={inquiry.id}
      draggable={showDragHandle}
      onDragStart={(e) => handleDragStart(e, inquiry.id)}
      onDragEnd={handleDragEnd}
      onClick={() => openDetail(inquiry)}
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        showDragHandle && 'cursor-grab active:cursor-grabbing',
        draggedItem === inquiry.id && 'opacity-50 scale-95'
      )}
    >
      <CardContent className="p-2.5 md:p-2">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {showDragHandle && (
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 hidden lg:block shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {inquiry.contactName}
              </p>
              {inquiry.contactCompany && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <Building className="h-3 w-3 shrink-0" />
                  <span className="truncate">{inquiry.contactCompany}</span>
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetail(inquiry)}>
                Details anzeigen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {pipelineColumns
                .filter((c) => c.id !== inquiry.status)
                .map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(inquiry.id, c.id);
                    }}
                  >
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full mr-2',
                        c.color
                      )}
                    />
                    Zu &quot;{c.title}&quot;
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Listing Info */}
        {inquiry.listing && (
          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
            {inquiry.listing.title}
          </p>
        )}

        {/* Message Preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {inquiry.message}
        </p>

        {/* Card Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">{getTimeAgo(inquiry.createdAt)}</span>
          </div>

          {inquiry.notes && (
            <MessageSquare className="h-3 w-3 shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Anfragen</h1>
          <p className="text-muted-foreground text-sm">
            Verwalten Sie Ihre Anfragen
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:flex">
            {filteredInquiries.length}{hasActiveFilters ? ` von ${inquiries.length}` : ''} Anfragen
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/seller/anfragen/liste">
              <List className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Listenansicht</span>
              <span className="sm:hidden">Liste</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Name, Firma oder Inserat suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="week">Letzte 7 Tage</SelectItem>
              <SelectItem value="month">Letzte 30 Tage</SelectItem>
            </SelectContent>
          </Select>
          <Select value={listingFilter} onValueChange={setListingFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Inserat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Inserate</SelectItem>
              {uniqueListings.map((listing) => (
                <SelectItem key={listing.id} value={listing.id}>
                  <span className="truncate">{listing.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Filter zurücksetzen
            </Button>
          )}
        </div>
      </div>

      {/* Mobile: Swipeable Column View */}
      <div className="md:hidden">
        {/* Mobile Column Selector */}
        <div className="flex items-center justify-between mb-4 bg-muted/50 rounded-lg p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileColumnIndex(Math.max(0, mobileColumnIndex - 1))}
            disabled={mobileColumnIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className={cn('h-3 w-3 rounded-full', currentMobileColumn.color)} />
            <span className="font-semibold">{currentMobileColumn.title}</span>
            <Badge variant="secondary">
              {groupedInquiries[currentMobileColumn.id].length}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileColumnIndex(Math.min(pipelineColumns.length - 1, mobileColumnIndex + 1))}
            disabled={mobileColumnIndex === pipelineColumns.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Column Dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {pipelineColumns.map((col, idx) => (
            <button
              key={col.id}
              onClick={() => setMobileColumnIndex(idx)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                idx === mobileColumnIndex ? col.color : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3">
          {groupedInquiries[currentMobileColumn.id].map((inquiry) => 
            renderInquiryCard(inquiry, false)
          )}

          {groupedInquiries[currentMobileColumn.id].length === 0 && (
            <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
              Keine Anfragen in dieser Spalte
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Kanban Board */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-3 lg:gap-4">
          {pipelineColumns.map((column) => (
            <div
              key={column.id}
              className={cn(
                'min-w-0 rounded-lg transition-all',
                dragOverColumn === column.id && draggedItem && 'bg-muted/50 ring-2 ring-primary/50 ring-dashed'
              )}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center gap-1.5 sticky top-0 bg-background/95 backdrop-blur py-1 px-1">
                <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', column.color)} />
                <h3 className="font-semibold text-sm truncate">{column.title}</h3>
                <Badge variant="secondary" className="shrink-0">
                  {groupedInquiries[column.id].length}
                </Badge>
              </div>

              {/* Column Cards */}
              <ScrollArea className="h-[calc(100vh-14rem)]">
                <div className="space-y-3 pr-1 px-1 pb-4">
                  {groupedInquiries[column.id].map((inquiry) => 
                    renderInquiryCard(inquiry, true)
                  )}

                  {/* Empty State / Drop Zone */}
                  {groupedInquiries[column.id].length === 0 && (
                    <div className={cn(
                      'rounded-lg border-2 border-dashed p-4 text-center text-sm text-muted-foreground transition-colors',
                      dragOverColumn === column.id && draggedItem && 'border-primary bg-primary/5 text-primary'
                    )}>
                      {dragOverColumn === column.id && draggedItem 
                        ? 'Hier ablegen'
                        : 'Keine Anfragen'
                      }
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Anfrage-Details</DialogTitle>
            <DialogDescription>
              {selectedInquiry?.contactName}
              {selectedInquiry?.contactCompany &&
                ` • ${selectedInquiry.contactCompany}`}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-medium text-sm">Kontaktdaten</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {selectedInquiry.contactName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${selectedInquiry.contactEmail}`}
                      className="text-primary hover:underline"
                    >
                      {selectedInquiry.contactEmail}
                    </a>
                  </div>
                  {selectedInquiry.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${selectedInquiry.contactPhone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedInquiry.contactPhone}
                      </a>
                    </div>
                  )}
                  {selectedInquiry.contactCompany && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {selectedInquiry.contactCompany}
                    </div>
                  )}
                </div>
              </div>

              {/* Listing */}
              {selectedInquiry.listing && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium text-sm mb-2">Angefragtes Inserat</h4>
                  <p className="text-sm">{selectedInquiry.listing.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedInquiry.listing.price.toLocaleString('de-DE')} €
                  </p>
                </div>
              )}

              {/* Message */}
              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-sm mb-2">Nachricht</h4>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Erhalten am {formatDate(selectedInquiry.createdAt)}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full mr-2',
                          pipelineColumns.find(
                            (c) => c.id === selectedInquiry.status
                          )?.color
                        )}
                      />
                      {
                        pipelineColumns.find(
                          (c) => c.id === selectedInquiry.status
                        )?.title
                      }
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {pipelineColumns.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => {
                          handleStatusChange(selectedInquiry.id, c.id);
                          setSelectedInquiry({
                            ...selectedInquiry,
                            status: c.id,
                          });
                        }}
                      >
                        <div className={cn('h-2 w-2 rounded-full mr-2', c.color)} />
                        {c.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Interne Notizen</label>
                <Textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Fügen Sie interne Notizen hinzu..."
                  rows={3}
                />
                <Button size="sm" onClick={saveNote}>
                  Notiz speichern
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`mailto:${selectedInquiry.contactEmail}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    E-Mail senden
                  </a>
                </Button>
                {selectedInquiry.contactPhone && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`tel:${selectedInquiry.contactPhone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Anrufen
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
