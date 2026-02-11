'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  MessageSquare,
  Search,
  ArrowRight,
  Mail,
  User,
  Loader2,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  UserCircle,
  Building2,
  Plus,
  MoreHorizontal,
  Upload,
  Download,
  Send,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { PageSkeleton } from '@/components/ui/skeletons';
import { getMyInquiries, getMyBuyerInquiries } from '@/lib/actions/inquiries';
import {
  getContacts,
  createContact,
  deleteContact,
  getContactStats,
  type Contact,
  type LeadStatus,
  type CreateContactData,
} from '@/lib/actions/contacts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// =============================================================================
// Kommunikations-Seite (Nachrichten + Kontakte in einem)
// =============================================================================

export default function CommunicationPage() {
  const t = useTranslations('sellerEmails');
  const tInq = useTranslations('sellerInquiries');
  const tContacts = useTranslations('contacts');
  const locale = useLocale();
  const router = useRouter();
  const { isLoading: authLoading } = useSellerAuth();

  const [activeTab, setActiveTab] = useState<'messages' | 'contacts'>('messages');

  // ---- Nachrichten State ----
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'received' | 'sent'>('all');

  // ---- Kontakte State ----
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [contactSearch, setContactSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [contactStats, setContactStats] = useState<{
    total: number;
    byStatus: Record<LeadStatus, number>;
    newThisMonth: number;
    avgLeadScore: number;
  } | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newContactData, setNewContactData] = useState<Partial<CreateContactData>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Status config fuer Kontakte
  const statusColors: Record<LeadStatus, { color: string; bg: string }> = {
    new: { color: 'text-blue-700', bg: 'bg-blue-100' },
    contacted: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
    qualified: { color: 'text-green-700', bg: 'bg-green-100' },
    negotiation: { color: 'text-purple-700', bg: 'bg-purple-100' },
    won: { color: 'text-emerald-700', bg: 'bg-emerald-100' },
    lost: { color: 'text-red-700', bg: 'bg-red-100' },
  };
  const getStatusLabel = (status: LeadStatus) => tContacts(`status.${status}`);

  // ---- Nachrichten laden ----
  useEffect(() => {
    if (!authLoading) {
      loadInquiries();
    }
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInquiries = async () => {
    setIsLoadingMessages(true);
    // Lade sowohl erhaltene als auch gesendete Anfragen
    const [receivedResult, sentResult] = await Promise.all([
      getMyInquiries(),
      getMyBuyerInquiries(),
    ]);

    const all: any[] = [];

    // Erhaltene Anfragen markieren
    if (receivedResult.success && receivedResult.data) {
      for (const inq of receivedResult.data) {
        all.push({ ...inq, _type: 'received' as const });
      }
    }

    // Gesendete Anfragen markieren
    if (sentResult.success && sentResult.data) {
      for (const inq of sentResult.data) {
        all.push({ ...inq, _type: 'sent' as const });
      }
    }

    // Nach letzter Nachricht / Erstelldatum sortieren
    const sorted = all.sort((a, b) => {
      const dateA = new Date(a.last_message_at || a.created_at || 0).getTime();
      const dateB = new Date(b.last_message_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    setInquiries(sorted);
    setIsLoadingMessages(false);
  };

  // ---- Kontakte laden ----
  useEffect(() => {
    if (!authLoading && activeTab === 'contacts') {
      fetchContacts();
    }
  }, [authLoading, activeTab, contactSearch, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    const [contactsResult, statsResult] = await Promise.all([
      getContacts({
        search: contactSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
      getContactStats(),
    ]);

    if (contactsResult.success && contactsResult.data) {
      setContacts(contactsResult.data.contacts);
      setContactsTotal(contactsResult.data.total);
    }
    if (statsResult.success && statsResult.data) {
      setContactStats(statsResult.data);
    }
    setIsLoadingContacts(false);
  };

  // ---- Kontakt erstellen ----
  const handleCreateContact = async () => {
    if (!newContactData.email) {
      toast.error(tContacts('emailRequired'));
      return;
    }
    setIsCreating(true);
    const result = await createContact(newContactData as CreateContactData);
    setIsCreating(false);
    if (result.success && result.data) {
      toast.success(tContacts('contactCreated'));
      setIsCreateDialogOpen(false);
      setNewContactData({});
      fetchContacts();
    } else {
      toast.error(result.error || tContacts('createError'));
    }
  };

  // ---- Kontakt loeschen ----
  const handleDeleteContact = async (contactId: string) => {
    const result = await deleteContact(contactId);
    if (result.success) {
      toast.success(tContacts('contactDeleted'));
      setContacts(prev => prev.filter(c => c.id !== contactId));
      setContactsTotal(prev => prev - 1);
    } else {
      toast.error(result.error || tContacts('deleteError'));
    }
  };

  // ---- Helpers ----
  const statusConfig: Record<string, { label: string; color: string; icon: typeof MessageSquare }> = {
    new: { label: tInq('statusNew'), color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
    contacted: { label: tInq('statusContacted'), color: 'bg-yellow-100 text-yellow-800', icon: Phone },
    offer_sent: { label: tInq('statusOfferSent'), color: 'bg-purple-100 text-purple-800', icon: FileText },
    won: { label: tInq('statusWon'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
    lost: { label: tInq('statusLost'), color: 'bg-gray-100 text-gray-500', icon: XCircle },
  };

  const filteredInquiries = inquiries.filter((inq) => {
    // Filter nach Typ (Erhalten/Gesendet)
    if (messageFilter === 'received' && inq._type !== 'received') return false;
    if (messageFilter === 'sent' && inq._type !== 'sent') return false;

    if (!messageSearch) return true;
    const q = messageSearch.toLowerCase();
    return (
      inq.contact_name?.toLowerCase().includes(q) ||
      inq.contact_email?.toLowerCase().includes(q) ||
      inq.contact_company?.toLowerCase().includes(q) ||
      inq.listing?.title?.toLowerCase().includes(q) ||
      inq.listing?.manufacturer_name?.toLowerCase().includes(q)
    );
  });

  const formatMessageDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
    if (isToday) return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    if (isYesterday) return t('yesterdayLabel');
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  };

  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return tContacts('today');
    if (diffDays === 1) return tContacts('yesterday');
    if (diffDays < 7) return tContacts('daysAgo', { days: diffDays });
    if (diffDays < 30) return tContacts('weeksAgo', { weeks: Math.floor(diffDays / 7) });
    return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (authLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold">{t('commTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('commSubtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b px-4 md:px-6 shrink-0">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'messages'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
          {t('tabMessages')}
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'contacts'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserCircle className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
          {t('tabContacts')}
        </button>
      </div>

      {/* ================================================================= */}
      {/* NACHRICHTEN TAB */}
      {/* ================================================================= */}
      {activeTab === 'messages' && (
        <>
          <div className="border-b px-4 py-2 md:px-6 shrink-0">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('commSearch')}
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {/* AUSKOMMENTIERT: Filter-Buttons Alle/Erhalten/Gesendet
            <div className="flex items-center gap-1">
              <Button variant={messageFilter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setMessageFilter('all')} className="text-xs h-8">{t('filterAll') || 'Alle'}</Button>
              <Button variant={messageFilter === 'received' ? 'default' : 'ghost'} size="sm" onClick={() => setMessageFilter('received')} className="text-xs h-8"><Inbox className="h-3 w-3 mr-1" />{t('filterReceived') || 'Erhalten'}</Button>
              <Button variant={messageFilter === 'sent' ? 'default' : 'ghost'} size="sm" onClick={() => setMessageFilter('sent')} className="text-xs h-8"><Send className="h-3 w-3 mr-1" />{t('filterSent') || 'Gesendet'}</Button>
            </div>
            */}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
                <p className="font-medium">{t('commEmpty')}</p>
                <p className="text-sm mt-1">{t('commEmptyHint')}</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredInquiries.map((inq) => {
                  const status = statusConfig[inq.status] || statusConfig.new;
                  const unreadCount = inq.unread_messages_seller || 0;
                  const isSent = inq._type === 'sent';
                  const detailHref = `/seller/anfragen/${inq.id}`;

                  return (
                    <Link
                      key={`${inq._type}-${inq.id}`}
                      href={detailHref}
                      className="flex items-center gap-4 px-4 py-3 md:px-6 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm truncate ${unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>
                            {isSent
                              ? (inq.listing?.title || 'Unbekanntes Inserat')
                              : inq.contact_name
                            }
                          </span>
                          {!isSent && inq.contact_company && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              ({inq.contact_company})
                            </span>
                          )}
                          <Badge variant="secondary" className={`text-[10px] py-0 ${status.color}`}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {isSent
                            ? (inq.listing?.manufacturer_name || 'Verkäufer')
                            : (inq.listing?.title || 'Unbekanntes Inserat')
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatMessageDate(inq.last_message_at || inq.created_at)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ================================================================= */}
      {/* KONTAKTE TAB */}
      {/* ================================================================= */}
      {activeTab === 'contacts' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{tContacts('title')}</h2>
                <p className="text-sm text-muted-foreground">{tContacts('subtitle')}</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {tContacts('newContact')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{tContacts('createTitle')}</DialogTitle>
                      <DialogDescription>{tContacts('createDescription')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{tContacts('firstName')}</Label>
                          <Input
                            placeholder="Max"
                            value={newContactData.firstName || ''}
                            onChange={(e) => setNewContactData(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{tContacts('lastName')}</Label>
                          <Input
                            placeholder="Mustermann"
                            value={newContactData.lastName || ''}
                            onChange={(e) => setNewContactData(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{tContacts('email')} *</Label>
                        <Input
                          type="email"
                          placeholder="max@example.com"
                          value={newContactData.email || ''}
                          onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{tContacts('company')}</Label>
                        <Input
                          placeholder="Mustermann GmbH"
                          value={newContactData.companyName || ''}
                          onChange={(e) => setNewContactData(prev => ({ ...prev, companyName: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{tContacts('phone')}</Label>
                          <Input
                            placeholder="+49 89 123456"
                            value={newContactData.phone || ''}
                            onChange={(e) => setNewContactData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{tContacts('position')}</Label>
                          <Input
                            placeholder="Geschäftsführer"
                            value={newContactData.jobTitle || ''}
                            onChange={(e) => setNewContactData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        {tContacts('cancel', { ns: 'common' })}
                      </Button>
                      <Button onClick={handleCreateContact} disabled={isCreating}>
                        {isCreating ? tContacts('creating') : tContacts('createContact')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            {contactStats && (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <Card>
                  <CardHeader className="p-3 sm:p-6 pb-2">
                    <CardDescription className="text-xs sm:text-sm">{tContacts('totalContacts')}</CardDescription>
                    <CardTitle className="text-xl sm:text-3xl">{contactStats.total}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-3 sm:p-6 pb-2">
                    <CardDescription className="text-xs sm:text-sm">{tContacts('newThisMonth')}</CardDescription>
                    <CardTitle className="text-xl sm:text-3xl text-blue-600">+{contactStats.newThisMonth}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-3 sm:p-6 pb-2">
                    <CardDescription className="text-xs sm:text-sm">{tContacts('qualified')}</CardDescription>
                    <CardTitle className="text-xl sm:text-3xl text-green-600">{contactStats.byStatus.qualified || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-3 sm:p-6 pb-2">
                    <CardDescription className="text-xs sm:text-sm">{tContacts('inNegotiation')}</CardDescription>
                    <CardTitle className="text-xl sm:text-3xl text-purple-600">{contactStats.byStatus.negotiation || 0}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={tContacts('searchPlaceholder')}
                  className="pl-10"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={tContacts('statusFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tContacts('allStatuses')}</SelectItem>
                  {(Object.keys(statusColors) as LeadStatus[]).map((key) => (
                    <SelectItem key={key} value={key}>{getStatusLabel(key)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contacts — Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {isLoadingContacts ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}><CardHeader><Skeleton className="h-12 w-full" /></CardHeader></Card>
                ))
              ) : contacts.length === 0 ? (
                <Card>
                  <CardHeader className="text-center py-12">
                    <UserCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      {contactSearch || statusFilter !== 'all'
                        ? tContacts('noContactsFound')
                        : tContacts('noContactsYet')}
                    </p>
                    {!contactSearch && statusFilter === 'all' && (
                      <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)} className="mt-2 mx-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        {tContacts('createFirst')}
                      </Button>
                    )}
                  </CardHeader>
                </Card>
              ) : (
                contacts.map((contact) => {
                  const colors = statusColors[contact.lead_status];
                  const statusLabel = getStatusLabel(contact.lead_status);
                  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email;
                  return (
                    <Card
                      key={contact.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/seller/kontakte/${contact.id}`)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                            {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{fullName}</p>
                              <Badge variant="secondary" className={cn(colors.bg, colors.color, 'border-0 text-[10px] shrink-0')}>
                                {statusLabel}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                            {contact.company_name && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building2 className="h-3 w-3" />{contact.company_name}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/seller/kontakte/${contact.id}`); }}>
                                {tContacts('showDetails')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${contact.email}`; }}>
                                <Mail className="mr-2 h-4 w-4" />{tContacts('sendEmail')}
                              </DropdownMenuItem>
                              {contact.phone && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${contact.phone}`; }}>
                                  <Phone className="mr-2 h-4 w-4" />{tContacts('call')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}>
                                {tContacts('delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })
              )}
              {contactsTotal > 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {tContacts('ofTotal', { count: contacts.length, total: contactsTotal })}
                </p>
              )}
            </div>

            {/* Contacts — Desktop Table */}
            <Card className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tContacts('tableContact')}</TableHead>
                    <TableHead>{tContacts('tableCompany')}</TableHead>
                    <TableHead>{tContacts('tableStatus')}</TableHead>
                    <TableHead>{tContacts('tableInquiries')}</TableHead>
                    <TableHead>{tContacts('tableLastContact')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingContacts ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {contactSearch || statusFilter !== 'all'
                              ? tContacts('noContactsFound')
                              : tContacts('noContactsYet')}
                          </p>
                          {!contactSearch && statusFilter === 'all' && (
                            <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              {tContacts('createFirst')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => {
                      const colors = statusColors[contact.lead_status];
                      const statusLabel = getStatusLabel(contact.lead_status);
                      const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email;
                      return (
                        <TableRow
                          key={contact.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/seller/kontakte/${contact.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                                {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{fullName}</p>
                                <p className="text-sm text-muted-foreground">{contact.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {contact.company_name ? (
                              <div className="flex items-center gap-1.5">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{contact.company_name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={cn(colors.bg, colors.color, 'border-0')}>
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{contact.total_inquiries}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {formatRelativeDate(contact.last_contact_at || contact.created_at)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/seller/kontakte/${contact.id}`);
                                }}>
                                  {tContacts('showDetails')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `mailto:${contact.email}`;
                                }}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  {tContacts('sendEmail')}
                                </DropdownMenuItem>
                                {contact.phone && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `tel:${contact.phone}`;
                                  }}>
                                    <Phone className="mr-2 h-4 w-4" />
                                    {tContacts('call')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteContact(contact.id);
                                  }}
                                >
                                  {tContacts('delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              {contactsTotal > 0 && (
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  {tContacts('ofTotal', { count: contacts.length, total: contactsTotal })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
