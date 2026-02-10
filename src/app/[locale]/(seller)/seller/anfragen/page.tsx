'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  Search,
  Mail,
  Phone,
  Building2,
  Clock,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Send,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InquiryListSkeleton } from '@/components/ui/skeletons';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { getMyInquiries, getMyBuyerInquiries } from '@/lib/actions/inquiries';
import { toast } from 'sonner';

// =============================================
// Typen
// =============================================

interface ReceivedInquiry {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  contact_company: string | null;
  message: string | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
  } | null;
}

interface SentInquiry {
  id: string;
  status: string | null;
  message: string | null;
  created_at: string | null;
  contact_name: string;
  contact_email: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
    status: string;
    manufacturer_name: string;
    primary_image: string | null;
  } | null;
}

export default function AnfragenPage() {
  const router = useRouter();
  const t = useTranslations('sellerInquiries');
  const locale = useLocale();
  const { isLoading: authLoading } = useSellerAuth();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isLoading, setIsLoading] = useState(true);

  // ---- Erhaltene Anfragen State ----
  const [receivedInquiries, setReceivedInquiries] = useState<ReceivedInquiry[]>([]);
  const [receivedSearch, setReceivedSearch] = useState('');
  const [receivedStatusFilter, setReceivedStatusFilter] = useState('all');

  // ---- Meine Anfragen State ----
  const [sentInquiries, setSentInquiries] = useState<SentInquiry[]>([]);
  const [isLoadingSent, setIsLoadingSent] = useState(true);
  const [sentSearch, setSentSearch] = useState('');

  // ---- Helpers ----
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return t('fewMinutesAgo');
    if (hours < 24) return t('hoursAgo', { count: hours });
    if (days === 1) return t('yesterday');
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case 'new':
        return { label: t('statusNew'), color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
      case 'contacted':
        return { label: t('statusContacted'), color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
      case 'offer_sent':
        return { label: t('statusOfferSent'), color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' };
      case 'won':
        return { label: t('statusWon'), color: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
      case 'lost':
        return { label: t('statusLost'), color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
      default:
        return { label: t('statusNew'), color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
    }
  };

  // ---- Erhaltene Anfragen laden ----
  useEffect(() => {
    if (!authLoading) {
      loadReceivedInquiries();
    }
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReceivedInquiries = async () => {
    setIsLoading(true);
    try {
      const result = await getMyInquiries();
      if (result.success && result.data) {
        const mapped: ReceivedInquiry[] = (result.data as any[]).map((d) => ({
          id: d.id,
          contact_name: d.contact_name || '',
          contact_email: d.contact_email || '',
          contact_phone: d.contact_phone || null,
          contact_company: d.contact_company || null,
          message: d.message || null,
          status: d.status || 'new',
          notes: d.notes || null,
          created_at: d.created_at || null,
          listing: d.listing || d.listings || null,
        }));
        setReceivedInquiries(mapped);
      }
    } catch {
      toast.error(t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Meine Anfragen laden (lazy, beim Tab-Wechsel) ----
  useEffect(() => {
    if (!authLoading && activeTab === 'sent' && sentInquiries.length === 0 && isLoadingSent) {
      loadSentInquiries();
    }
  }, [authLoading, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSentInquiries = async () => {
    setIsLoadingSent(true);
    try {
      const result = await getMyBuyerInquiries();
      if (result.success && result.data) {
        setSentInquiries(result.data as any);
      }
    } catch {
      toast.error(t('errorLoading'));
    } finally {
      setIsLoadingSent(false);
    }
  };

  // ---- Filter ----
  const filteredReceived = useMemo(() => {
    return receivedInquiries.filter((inquiry) => {
      const searchLower = receivedSearch.toLowerCase();
      const matchesSearch =
        !receivedSearch ||
        inquiry.contact_name.toLowerCase().includes(searchLower) ||
        (inquiry.contact_company || '').toLowerCase().includes(searchLower) ||
        (inquiry.listing?.title || '').toLowerCase().includes(searchLower);
      const matchesStatus =
        receivedStatusFilter === 'all' || inquiry.status === receivedStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [receivedInquiries, receivedSearch, receivedStatusFilter]);

  const [sentStatusFilter, setSentStatusFilter] = useState('all');

  const filteredSent = useMemo(() => {
    return sentInquiries.filter((inq) => {
      const matchesSearch = !sentSearch ||
        inq.listing?.title?.toLowerCase().includes(sentSearch.toLowerCase()) ||
        inq.listing?.manufacturer_name?.toLowerCase().includes(sentSearch.toLowerCase());
      const matchesStatus = sentStatusFilter === 'all' || (inq.status || 'new') === sentStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sentInquiries, sentSearch, sentStatusFilter]);

  // Stats fuer Erhaltene
  const newCount = receivedInquiries.filter((i) => i.status === 'new').length;
  const contactedCount = receivedInquiries.filter((i) => i.status === 'contacted').length;
  const offerSentCount = receivedInquiries.filter((i) => i.status === 'offer_sent').length;

  if (isLoading || authLoading) {
    return <InquiryListSkeleton />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('totalCount', { count: receivedInquiries.length })}
          </p>
        </div>
      </div>

      {/* Tabs: Erhaltene | Meine Anfragen */}
      <div className="flex items-center gap-1 border-b -mx-4 md:-mx-6 px-4 md:px-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Inbox className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
          {t('receivedInquiries') || 'Erhaltene Anfragen'}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Send className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
          {t('myInquiries') || 'Meine Anfragen'}
          {sentInquiries.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 text-[10px]">{sentInquiries.length}</Badge>
          )}
        </button>
      </div>

      {/* ================================================================= */}
      {/* ERHALTENE ANFRAGEN (Listenansicht) */}
      {/* ================================================================= */}
      {activeTab === 'received' && (
        <>
          {/* Stats */}
          <div className="grid gap-4 grid-cols-3">
            <Card>
              <CardContent className="pt-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('new')}</p>
                    <p className="text-xl sm:text-2xl font-bold">{newCount}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('inProgress')}</p>
                    <p className="text-xl sm:text-2xl font-bold">{contactedCount}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('offer')}</p>
                    <p className="text-xl sm:text-2xl font-bold">{offerSentCount}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={receivedSearch}
                onChange={(e) => setReceivedSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={receivedStatusFilter} onValueChange={setReceivedStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="new">{t('statusNew')}</SelectItem>
                <SelectItem value="contacted">{t('statusContacted')}</SelectItem>
                <SelectItem value="offer_sent">{t('statusOfferSent')}</SelectItem>
                <SelectItem value="won">{t('statusWon')}</SelectItem>
                <SelectItem value="lost">{t('statusLost')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Received Inquiries List */}
          {filteredReceived.length > 0 ? (
            <div className="space-y-4">
              {filteredReceived.map((inquiry) => {
                const statusCfg = getStatusConfig(inquiry.status);
                return (
                  <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${statusCfg.dot}`} />
                            <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                            <span className="text-sm text-muted-foreground">{formatDate(inquiry.created_at)}</span>
                          </div>
                          <h3 className="font-semibold text-lg">{inquiry.contact_name}</h3>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {inquiry.contact_company && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 shrink-0" />
                                <span className="truncate">{inquiry.contact_company}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 shrink-0" />
                              <a href={`mailto:${inquiry.contact_email}`} className="hover:text-foreground truncate">
                                {inquiry.contact_email}
                              </a>
                            </div>
                            {inquiry.contact_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                <a href={`tel:${inquiry.contact_phone}`} className="hover:text-foreground">
                                  {inquiry.contact_phone}
                                </a>
                              </div>
                            )}
                          </div>
                          {inquiry.message && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                              &quot;{inquiry.message}&quot;
                            </p>
                          )}
                        </div>
                        {inquiry.listing && (
                          <div className="lg:w-64 shrink-0">
                            <div className="rounded-lg border p-3">
                              <p className="text-xs text-muted-foreground mb-1">{t('regarding')}</p>
                              <Link href={`/maschinen/${inquiry.listing.slug}`} className="font-medium hover:text-primary line-clamp-1">
                                {inquiry.listing.title}
                              </Link>
                              {inquiry.listing.price ? (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(inquiry.listing.price / 100)}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground mt-1">VB</p>
                              )}
                            </div>
                            <div className="mt-3 flex flex-col gap-2">
                              <Button size="sm" asChild>
                                <Link href={`/seller/anfragen/${inquiry.id}`}>
                                  {t('details')}<ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={`mailto:${inquiry.contact_email}`}>
                                  <Mail className="mr-2 h-4 w-4" />{t('email')}
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{t('noInquiries')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {receivedSearch || receivedStatusFilter !== 'all' ? t('tryAdjustFilters') : t('inquiriesWillAppear')}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ================================================================= */}
      {/* MEINE ANFRAGEN (Listenansicht) */}
      {/* ================================================================= */}
      {activeTab === 'sent' && (
        <>
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={sentSearch}
                onChange={(e) => setSentSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sentStatusFilter} onValueChange={setSentStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="new">{t('statusNew')}</SelectItem>
                <SelectItem value="contacted">{t('statusContacted')}</SelectItem>
                <SelectItem value="offer_sent">{t('statusOfferSent')}</SelectItem>
                <SelectItem value="won">{t('statusWon')}</SelectItem>
                <SelectItem value="lost">{t('statusLost')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoadingSent ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredSent.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Send className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{t('noSentInquiries') || 'Keine gesendeten Anfragen'}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {sentSearch || sentStatusFilter !== 'all'
                    ? t('tryAdjustFilters')
                    : (t('sentInquiriesHint') || 'Anfragen, die Sie an andere Verkäufer gestellt haben, erscheinen hier.')}
                </p>
                {!sentSearch && sentStatusFilter === 'all' && (
                  <Button className="mt-4" asChild>
                    <Link href="/maschinen">
                      <Search className="mr-2 h-4 w-4" />
                      {t('browseMachines') || 'Maschinen durchsuchen'}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSent.map((inq) => {
                const statusCfg = getStatusConfig(inq.status);
                return (
                  <Card key={inq.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${statusCfg.dot}`} />
                            <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                            <span className="text-sm text-muted-foreground">{formatDate(inq.created_at)}</span>
                          </div>
                          <h3 className="font-semibold text-lg">
                            {inq.listing?.title || 'Unbekanntes Inserat'}
                          </h3>
                          {inq.listing?.manufacturer_name && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {inq.listing.manufacturer_name}
                            </p>
                          )}
                          {inq.message && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                              &quot;{inq.message}&quot;
                            </p>
                          )}
                        </div>
                        {inq.listing && (
                          <div className="lg:w-64 shrink-0">
                            {inq.listing.primary_image && (
                              <div className="h-32 rounded-lg overflow-hidden border mb-3">
                                <img src={inq.listing.primary_image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="rounded-lg border p-3">
                              <Link href={`/maschinen/${inq.listing.slug}`} className="font-medium hover:text-primary line-clamp-1">
                                {inq.listing.title}
                              </Link>
                              {!!inq.listing.price && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(inq.listing.price / 100)}
                                </p>
                              )}
                            </div>
                            <div className="mt-3">
                              <Button size="sm" className="w-full" asChild>
                                <Link href={`/dashboard/anfragen/${inq.id}`}>
                                  {t('details')}<ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
