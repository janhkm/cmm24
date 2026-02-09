'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
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
  Search,
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
import { InquiryPipelineSkeleton } from '@/components/ui/skeletons';
import { FeatureGate, useFeatureAccess } from '@/components/features/feature-gate';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { 
  getInquiriesByStatus, 
  updateInquiryStatus, 
  updateInquiryNotes,
  markInquiryAsRead,
} from '@/lib/actions/inquiries';

type InquiryStatus = 'new' | 'contacted' | 'offer_sent' | 'won' | 'lost';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: InquiryStatus | null;
  notes: string | null;
  created_at: string | null;
  read_at: string | null;
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
  } | null;
}

export default function PipelinePage() {
  const { isLoading: authLoading } = useSellerAuth();
  const hasAccess = useFeatureAccess('lead_pipeline');
  const t = useTranslations('sellerInquiries');
  const locale = useLocale();
  
  // Pipeline columns configuration
  const pipelineColumns: {
    id: InquiryStatus;
    title: string;
    color: string;
    description: string;
  }[] = [
    { id: 'new', title: t('colNewInquiries'), color: 'bg-blue-500', description: t('colNewDesc') },
    { id: 'contacted', title: t('statusContacted'), color: 'bg-yellow-500', description: t('colContactedDesc') },
    { id: 'offer_sent', title: t('statusOfferSent'), color: 'bg-purple-500', description: t('colOfferSentDesc') },
    { id: 'won', title: t('statusWon'), color: 'bg-green-500', description: t('colWonDesc') },
    { id: 'lost', title: t('statusLost'), color: 'bg-gray-500', description: t('colLostDesc') },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Record<InquiryStatus, Inquiry[]>>({
    new: [],
    contacted: [],
    offer_sent: [],
    won: [],
    lost: [],
  });
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<InquiryStatus | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [mobileColumnIndex, setMobileColumnIndex] = useState(0);
  const [isSavingNote, setIsSavingNote] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [listingFilter, setListingFilter] = useState('all');
  
  // For undo functionality
  const undoDataRef = useRef<{ inquiryId: string; previousStatus: InquiryStatus } | null>(null);

  // Load inquiries
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getInquiriesByStatus();
        if (result.success && result.data) {
          setInquiries(result.data as unknown as Record<InquiryStatus, Inquiry[]>);
        } else {
          toast.error(result.error || t('errorLoading'));
        }
      } catch (error) {
        console.error('Error loading inquiries:', error);
        toast.error(t('errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get all inquiries as flat array
  const allInquiries = useMemo(() => {
    return Object.values(inquiries).flat();
  }, [inquiries]);

  // Get unique listings from inquiries
  const uniqueListings = useMemo(() => {
    const listings = allInquiries
      .map((i) => i.listing)
      .filter((l): l is NonNullable<typeof l> => l !== null);
    return [...new Map(listings.map((l) => [l.id, l])).values()];
  }, [allInquiries]);

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    const filtered: Record<InquiryStatus, Inquiry[]> = {
      new: [],
      contacted: [],
      offer_sent: [],
      won: [],
      lost: [],
    };
    
    Object.entries(inquiries).forEach(([status, statusInquiries]) => {
      filtered[status as InquiryStatus] = statusInquiries.filter((inquiry) => {
        const matchesSearch =
          searchQuery === '' ||
          inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inquiry.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inquiry.listing?.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesDate = true;
        if (dateFilter !== 'all' && inquiry.created_at) {
          const inquiryDate = new Date(inquiry.created_at);
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
        
        const matchesListing =
          listingFilter === 'all' || inquiry.listing?.id === listingFilter;
        
        return matchesSearch && matchesDate && matchesListing;
      });
    });
    
    return filtered;
  }, [inquiries, searchQuery, dateFilter, listingFilter]);

  const totalCount = allInquiries.length;
  const filteredCount = Object.values(filteredInquiries).flat().length;
  const hasActiveFilters = searchQuery !== '' || dateFilter !== 'all' || listingFilter !== 'all';
  
  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setListingFilter('all');
  };

  const handleUndo = async () => {
    if (undoDataRef.current) {
      const { inquiryId, previousStatus } = undoDataRef.current;
      await handleStatusChange(inquiryId, previousStatus, true);
      undoDataRef.current = null;
    }
  };

  const handleDragStart = (e: React.DragEvent, inquiryId: string) => {
    setDraggedItem(inquiryId);
    e.dataTransfer.effectAllowed = 'move';
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
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: InquiryStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    let currentStatus: InquiryStatus | null = null;
    for (const [status, items] of Object.entries(inquiries)) {
      if (items.find(i => i.id === draggedItem)) {
        currentStatus = status as InquiryStatus;
        break;
      }
    }

    if (!currentStatus || currentStatus === newStatus) {
      setDraggedItem(null);
      setDragOverColumn(null);
      return;
    }

    await handleStatusChange(draggedItem, newStatus);
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus, isUndo = false) => {
    let inquiry: Inquiry | undefined;
    let previousStatus: InquiryStatus | null = null;
    
    for (const [status, items] of Object.entries(inquiries)) {
      const found = items.find(i => i.id === inquiryId);
      if (found) {
        inquiry = found;
        previousStatus = status as InquiryStatus;
        break;
      }
    }

    if (!inquiry || !previousStatus || previousStatus === newStatus) return;

    const newColumn = pipelineColumns.find((c) => c.id === newStatus);

    // Optimistic update
    setInquiries(prev => {
      const newState = { ...prev };
      newState[previousStatus] = newState[previousStatus].filter(i => i.id !== inquiryId);
      newState[newStatus] = [...newState[newStatus], { ...inquiry!, status: newStatus }];
      return newState;
    });

    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }

    const result = await updateInquiryStatus(inquiryId, newStatus);
    
    if (result.success) {
      if (!isUndo) {
        undoDataRef.current = { inquiryId, previousStatus };
        
        toast.success(t('inquiryMoved'), {
          description: `"${inquiry.name}" → ${newColumn?.title}`,
          action: {
            label: t('undo'),
            onClick: handleUndo,
          },
        });
      } else {
        toast.success(t('undone'));
      }
    } else {
      // Revert on error
      setInquiries(prev => {
        const newState = { ...prev };
        newState[newStatus] = newState[newStatus].filter(i => i.id !== inquiryId);
        newState[previousStatus] = [...newState[previousStatus], inquiry!];
        return newState;
      });
      toast.error(result.error || t('errorUpdating'));
    }
  };

  const openDetail = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNoteInput(inquiry.notes || '');
    setIsDetailOpen(true);
    
    if (!inquiry.read_at) {
      await markInquiryAsRead(inquiry.id);
    }
  };

  const saveNote = async () => {
    if (!selectedInquiry) return;
    
    setIsSavingNote(true);
    const result = await updateInquiryNotes(selectedInquiry.id, noteInput);
    setIsSavingNote(false);
    
    if (result.success) {
      const status = selectedInquiry.status || 'new';
      setInquiries(prev => ({
        ...prev,
        [status]: prev[status].map(i => 
          i.id === selectedInquiry.id ? { ...i, notes: noteInput } : i
        ),
      }));
      setSelectedInquiry({ ...selectedInquiry, notes: noteInput });
      toast.success(t('noteSaved'));
    } else {
      toast.error(result.error || t('errorSaving'));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('daysAgo', { count: diffDays });
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
        draggedItem === inquiry.id && 'opacity-50 scale-95',
        !inquiry.read_at && 'border-l-4 border-l-blue-500'
      )}
    >
      <CardContent className="p-2.5 md:p-2">
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {showDragHandle && (
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 hidden lg:block shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {inquiry.name}
              </p>
              {inquiry.company && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <Building className="h-3 w-3 shrink-0" />
                  <span className="truncate">{inquiry.company}</span>
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
                {t('showDetails')}
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
                    {t('moveTo', { column: c.title })}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {inquiry.listing && (
          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
            {inquiry.listing.title}
          </p>
        )}

        {inquiry.message && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {inquiry.message}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">{getTimeAgo(inquiry.created_at)}</span>
          </div>

          {inquiry.notes && (
            <MessageSquare className="h-3 w-3 shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading || authLoading) {
    return <InquiryPipelineSkeleton />;
  }

  return (
    <FeatureGate feature="lead_pipeline">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">
              {t('manageInquiries')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:flex">
              {filteredCount}{hasActiveFilters ? ` ${t('of')} ${totalCount}` : ''} {t('inquiriesLabel')}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/seller/anfragen/liste">
                <List className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('listView')}</span>
                <span className="sm:hidden">{t('list')}</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchPipelinePlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[130px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('timeRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="today">{t('today')}</SelectItem>
                <SelectItem value="week">{t('last7Days')}</SelectItem>
                <SelectItem value="month">{t('last30Days')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={listingFilter} onValueChange={setListingFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('listing')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allListings')}</SelectItem>
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
                {t('resetFilters')}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile: Swipeable Column View */}
        <div className="md:hidden">
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
                {filteredInquiries[currentMobileColumn.id].length}
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

          <div className="space-y-3">
            {filteredInquiries[currentMobileColumn.id].map((inquiry) => 
              renderInquiryCard(inquiry, false)
            )}

            {filteredInquiries[currentMobileColumn.id].length === 0 && (
              <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
                {t('noInquiriesInColumn')}
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
                <div className="mb-3 flex items-center gap-1.5 sticky top-0 bg-background/95 backdrop-blur py-1 px-1">
                  <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', column.color)} />
                  <h3 className="font-semibold text-sm truncate">{column.title}</h3>
                  <Badge variant="secondary" className="shrink-0">
                    {filteredInquiries[column.id].length}
                  </Badge>
                </div>

                <ScrollArea className="h-[calc(100vh-14rem)]">
                  <div className="space-y-3 pr-1 px-1 pb-4">
                    {filteredInquiries[column.id].map((inquiry) => 
                      renderInquiryCard(inquiry, true)
                    )}

                    {filteredInquiries[column.id].length === 0 && (
                      <div className={cn(
                        'rounded-lg border-2 border-dashed p-4 text-center text-sm text-muted-foreground transition-colors',
                        dragOverColumn === column.id && draggedItem && 'border-primary bg-primary/5 text-primary'
                      )}>
                        {dragOverColumn === column.id && draggedItem 
                          ? t('dropHere')
                          : t('noInquiriesShort')
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
              <DialogTitle>{t('inquiryDetails')}</DialogTitle>
              <DialogDescription>
                {selectedInquiry?.name}
                {selectedInquiry?.company &&
                  ` • ${selectedInquiry.company}`}
              </DialogDescription>
            </DialogHeader>

            {selectedInquiry && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium text-sm">{t('contactDetails')}</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selectedInquiry.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedInquiry.email}
                      </a>
                    </div>
                    {selectedInquiry.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${selectedInquiry.phone}`}
                          className="text-primary hover:underline"
                        >
                          {selectedInquiry.phone}
                        </a>
                      </div>
                    )}
                    {selectedInquiry.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {selectedInquiry.company}
                      </div>
                    )}
                  </div>
                </div>

                {selectedInquiry.listing && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-sm mb-2">{t('inquiredListing')}</h4>
                    <p className="text-sm">{selectedInquiry.listing.title}</p>
                    {selectedInquiry.listing.price && (
                      <p className="text-xs text-muted-foreground">
                        {selectedInquiry.listing.price.toLocaleString(locale)} €
                      </p>
                    )}
                  </div>
                )}

                {selectedInquiry.message && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-sm mb-2">{t('message')}</h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedInquiry.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('receivedOn', { date: formatDate(selectedInquiry.created_at) })}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('status')}</span>
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
                          }}
                        >
                          <div className={cn('h-2 w-2 rounded-full mr-2', c.color)} />
                          {c.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('internalNotes')}</label>
                  <Textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={t('addNotesPlaceholder')}
                    rows={3}
                  />
                  <Button size="sm" onClick={saveNote} disabled={isSavingNote}>
                    {isSavingNote ? t('saving') : t('saveNote')}
                  </Button>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`mailto:${selectedInquiry.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      {t('sendEmail')}
                    </a>
                  </Button>
                  {selectedInquiry.phone && (
                    <Button variant="outline" className="flex-1" asChild>
                      <a href={`tel:${selectedInquiry.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        {t('call')}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </FeatureGate>
  );
}
