'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Search,
  ArrowRight,
  Package,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getBuyerStats, getMyBuyerInquiries, linkInquiriesToBuyer } from '@/lib/actions/inquiries';

export default function BuyerDashboardPage() {
  const t = useTranslations('buyerDashboard');
  const locale = useLocale();
  const { profile, account, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({ totalInquiries: 0, pendingInquiries: 0, respondedInquiries: 0 });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSeller = !!account;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Zuerst bestehende Anfragen verknuepfen (bei erstem Login)
      await linkInquiriesToBuyer();
      
      const [statsResult, inquiriesResult] = await Promise.all([
        getBuyerStats(),
        getMyBuyerInquiries(),
      ]);
      
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
      if (inquiriesResult.success && inquiriesResult.data) {
        setRecentInquiries(inquiriesResult.data.slice(0, 5));
      }
      setIsLoading(false);
    };

    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  const displayName = profile?.full_name?.split(' ')[0] || t('defaultName');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {t('hello', { name: authLoading ? '...' : displayName })}
        </h1>
        <p className="text-muted-foreground">
          {t('welcome')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalInquiries}
                </p>
                <p className="text-sm text-muted-foreground">{t('stats.totalInquiries')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingInquiries}
                </p>
                <p className="text-sm text-muted-foreground">{t('stats.pendingInquiries')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.respondedInquiries}
                </p>
                <p className="text-sm text-muted-foreground">{t('stats.respondedInquiries')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Letzte Anfragen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('recentInquiries')}</CardTitle>
              <CardDescription>{t('recentInquiriesDesc')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/anfragen">
                {t('showAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentInquiries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  {t('noInquiriesYet')}
                </p>
                <Button size="sm" asChild>
                  <Link href="/maschinen">
                    <Search className="mr-2 h-4 w-4" />
                    {t('browseMachines')}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    href={`/maschinen/${inquiry.listing?.slug || ''}`}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    {inquiry.listing?.primary_image ? (
                      <img
                        src={inquiry.listing.primary_image}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {inquiry.listing?.title || t('defaultListing')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inquiry.listing?.manufacturer_name} &bull; {new Date(inquiry.created_at).toLocaleDateString(locale)}
                      </p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      inquiry.status === 'new' ? 'bg-amber-100 text-amber-700' :
                      inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                      inquiry.status === 'offer_sent' ? 'bg-green-100 text-green-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {inquiry.status === 'new' ? t('statusNew') :
                       inquiry.status === 'contacted' ? t('statusContacted') :
                       inquiry.status === 'offer_sent' ? t('statusOfferSent') :
                       inquiry.status === 'won' ? t('statusWon') :
                       inquiry.status === 'lost' ? t('statusLost') : inquiry.status}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schnellaktionen */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/maschinen">
                  <Search className="mr-3 h-5 w-5" />
                  {t('browseMachines')}
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/vergleich">
                  <Package className="mr-3 h-5 w-5" />
                  {t('compareMachines')}
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/hersteller">
                  <Package className="mr-3 h-5 w-5" />
                  {t('discoverManufacturers')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Verkaufen CTA */}
          {!isSeller && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 text-center">
                <Package className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{t('sellCta')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('sellCtaDesc')}
                </p>
                <Button asChild>
                  <Link href="/seller/registrieren">
                    {t('becomeSeller')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
