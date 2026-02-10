'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  MessageSquare,
  Search,
  Package,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyBuyerInquiries } from '@/lib/actions/inquiries';

export default function BuyerInquiriesPage() {
  const t = useTranslations('buyerDashboard.inquiries');
  const locale = useLocale();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await getMyBuyerInquiries();
      if (result.success && result.data) {
        setInquiries(result.data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Filtern
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch = !searchQuery || 
      inquiry.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.listing?.manufacturer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || inquiry.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const formatPrice = (cents: number | null) => {
    if (!cents) return t('priceOnRequest');
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(cents / 100);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: t('statusNew'), color: 'bg-amber-100 text-amber-700' },
    contacted: { label: t('statusContacted'), color: 'bg-blue-100 text-blue-700' },
    offer_sent: { label: t('statusOfferSent'), color: 'bg-green-100 text-green-700' },
    won: { label: t('statusWon'), color: 'bg-emerald-100 text-emerald-700' },
    lost: { label: t('statusLost'), color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button asChild>
          <Link href="/maschinen">
            <Search className="mr-2 h-4 w-4" />
            {t('searchMachines')}
          </Link>
        </Button>
      </div>

      {/* Suche + Tabs */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('tabAll', { count: inquiries.length })}
            </TabsTrigger>
            <TabsTrigger value="new">
              {t('tabOpen', { count: inquiries.filter(i => i.status === 'new').length })}
            </TabsTrigger>
            <TabsTrigger value="contacted">
              {t('tabContacted', { count: inquiries.filter(i => i.status === 'contacted').length })}
            </TabsTrigger>
            <TabsTrigger value="offer_sent">
              {t('tabOffers', { count: inquiries.filter(i => i.status === 'offer_sent').length })}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">
              {searchQuery ? t('noResults') : t('noInquiriesYet')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery 
                ? t('noResultsHint')
                : t('noInquiriesHint')}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/maschinen">
                  <Search className="mr-2 h-4 w-4" />
                  {t('browseMachines')}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => {
            const status = statusLabels[inquiry.status] || statusLabels.new;
            
            return (
              <Card key={inquiry.id} className="overflow-hidden">
                <div className="flex items-stretch">
                  {/* Bild */}
                  <div className="hidden sm:block w-32 shrink-0">
                    {inquiry.listing?.primary_image ? (
                      <img
                        src={inquiry.listing.primary_image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Inhalt */}
                  <CardContent className="flex-1 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {inquiry.listing?.title || t('listingUnavailable')}
                          </h3>
                          <Badge variant="secondary" className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {inquiry.listing?.manufacturer_name} &bull; {formatPrice(inquiry.listing?.price)} &bull; {t('inquiredOn', { date: new Date(inquiry.created_at).toLocaleDateString(locale) })}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {inquiry.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/dashboard/anfragen/${inquiry.id}`}>
                            <MessageSquare className="mr-1 h-3 w-3" />
                            {t('viewConversation')}
                          </Link>
                        </Button>
                        {inquiry.listing?.slug && inquiry.listing?.status === 'active' && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/maschinen/${inquiry.listing.slug}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
