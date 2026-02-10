import { Link, redirect } from '@/i18n/navigation';
import {
  FileText,
  MessageSquare,
  Eye,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  // AUSKOMMENTIERT: Nicht mehr benoetigte Imports (Plan Status Card entfernt)
  // CheckCircle,
  // Zap,
  // Crown,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// AUSKOMMENTIERT: import { Progress } from '@/components/ui/progress';
import { OnboardingChecklist } from '@/components/features/seller';
// AUSKOMMENTIERT: Aktivitaeten-Log
// import { ActivityLog } from '@/components/features/seller';
import { getSellerLayoutData, getSellerDashboardData } from '@/lib/actions/dashboard';

/**
 * Seller Dashboard - Server Component.
 *
 * Laedt alle Daten serverseitig parallel und rendert das Dashboard
 * als fertiges HTML. Kein useEffect, kein useAuth, kein Wasserfall.
 *
 * Vorher: ~15 sequentielle Client-Server-Round-Trips (nach Layout)
 * Jetzt: ~7 parallele DB-Queries serverseitig (parallel mit Layout)
 */

export default async function SellerDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Translations parallel laden
  const [t, tStatus, tTime, tSeller, tc, tn, tm] = await Promise.all([
    getTranslations({ locale, namespace: 'seller.dashboard' }),
    getTranslations({ locale, namespace: 'seller.status' }),
    getTranslations({ locale, namespace: 'seller.timeAgo' }),
    getTranslations({ locale, namespace: 'seller' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'machines' }),
  ]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return tTime('justNow');
    if (hours < 24) return tTime('hours', { hours });
    if (days === 1) return tTime('yesterday');
    return tTime('days', { days });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '—';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active': return tStatus('active');
      case 'sold': return tStatus('sold');
      case 'draft': return tStatus('draft');
      case 'pending_review': return tStatus('inReview');
      case 'archived': return tStatus('archived');
      default: return status || '';
    }
  };

  // Daten parallel laden (Layout hat bereits Auth geprueft)
  const layoutData = await getSellerLayoutData();

  if (!layoutData) {
    redirect('/login');
  }

  const { profile, account, plan } = layoutData!;
  const dashboardData = await getSellerDashboardData(account.id);
  // AUSKOMMENTIERT: subscription und isEarlyAdopter nicht mehr benoetig (alles ist Free)
  // const { subscription } = layoutData!;
  // const isEarlyAdopter = subscription?.is_early_adopter ?? false;
  const { stats, recentInquiries, recentListings } = dashboardData;

  // Usage berechnen
  const listingsUsed = stats.activeListings;
  const listingLimit = stats.listingLimit;
  const usagePercent = listingLimit === -1 ? 0 : Math.min((listingsUsed / listingLimit) * 100, 100);

  // AUSKOMMENTIERT: Feature flags (Plan Status Card entfernt)
  // const featureFlags = (plan?.feature_flags as Record<string, boolean>) || {};

  // Stats cards
  const statsCards = [
    {
      title: t('activeListings'),
      value: `${listingsUsed}`,
      description: listingLimit === -1
        ? t('unlimitedInPlan', { plan: plan?.name || 'Free' })
        : t('ofLimitInPlan', { limit: listingLimit, plan: plan?.name || 'Free' }),
      icon: FileText,
      trend: null as string | null,
    },
    {
      title: t('newInquiries'),
      value: `${stats.newInquiries}`,
      description: t('last7Days'),
      icon: MessageSquare,
      trend: stats.inquiriesChange !== 0
        ? `${stats.inquiriesChange > 0 ? '+' : ''}${stats.inquiriesChange.toFixed(0)}%`
        : null,
    },
    {
      title: t('totalViews'),
      value: stats.totalViews.toLocaleString(locale),
      description: t('onAllListings'),
      icon: Eye,
      trend: stats.viewsChange !== 0
        ? `${stats.viewsChange > 0 ? '+' : ''}${stats.viewsChange.toFixed(0)}%`
        : null,
    },
    {
      title: t('inquiryRate'),
      value: `${stats.conversionRate.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
      description: t('inquiriesPerView'),
      icon: TrendingUp,
      trend: null,
    },
  ];

  const firstName = profile.full_name?.split(' ')[0] || profile.email?.split('@')[0] || '';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('welcome', { name: firstName })}</h1>
          <p className="text-muted-foreground">
            {t('overview')}
          </p>
        </div>
        <Button asChild>
          <Link href="/seller/inserate/neu">
            <Plus className="mr-2 h-4 w-4" />
            {tSeller('newListing')}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
                {stat.trend && (
                  <Badge
                    variant="secondary"
                    className={`text-[10px] sm:text-xs ${stat.trend.startsWith('+') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}
                  >
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AUSKOMMENTIERT: Plan Status Card (alles ist jetzt Free, kein Upgrade noetig) */}
      {/* <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          ... Plan Status Card auskommentiert ...
        </CardContent>
      </Card> */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg">{t('latestInquiries')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('latestInquiriesDesc')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href="/seller/anfragen">{tc('showAll')}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentInquiries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('noInquiries')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInquiries.map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    href={{ pathname: '/seller/anfragen/[id]' as any, params: { id: inquiry.id } }}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className={`mt-1 h-2 w-2 rounded-full ${inquiry.status === 'new' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{inquiry.company || inquiry.name}</span>
                        {inquiry.status === 'new' && <Badge>{tc('new')}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {inquiry.listing?.title || t('unknownListing')}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{formatDate(inquiry.created_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Listings */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg">{t('myListingsTitle')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('myListingsDesc')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href="/seller/inserate">{tc('showAll')}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('noListings')}</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/seller/inserate/neu"><Plus className="mr-2 h-4 w-4" />{t('createFirst')}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={{ pathname: '/seller/inserate/[id]' as any, params: { id: listing.id } }}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {listing.primaryImage ? (
                        <img src={listing.primaryImage} alt={listing.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{listing.title}</span>
                        <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                          {getStatusLabel(listing.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatPrice(listing.price)}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{tm('views', { count: listing.views_count || 0 })}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{tm('inquiriesCount', { count: listing.inquiryCount })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle>{t('quickActions')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/seller/inserate/neu"><Plus className="h-5 w-5" /><span>{t('createListing')}</span></Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/seller/anfragen"><MessageSquare className="h-5 w-5" /><span>{t('processInquiries')}</span></Link>
            </Button>
            {/* AUSKOMMENTIERT: Upgrade Quick Action (alles ist jetzt Free) */}
            {/* <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/seller/abo"><TrendingUp className="h-5 w-5" /><span>{t('upgradePlan')}</span></Link>
            </Button> */}
          </div>
        </CardContent>
      </Card>

      {/* AUSKOMMENTIERT: Activity Log
      <ActivityLog limit={5} showFilter={false} />
      */}
    </div>
  );
}
