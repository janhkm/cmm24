'use client';

import Link from 'next/link';
import {
  FileText,
  MessageSquare,
  Eye,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  Zap,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockListings, mockInquiries, plans } from '@/data/mock-data';
import { OnboardingChecklist, ActivityLog } from '@/components/features/seller';

// Filter for current seller's listings
const sellerListings = mockListings.filter((l) => l.accountId === '1').slice(0, 3);
const sellerInquiries = mockInquiries.slice(0, 5);

// Current plan (mock)
const currentPlan = plans.find((p) => p.slug === 'business')!; // Business plan
const listingsUsed = 3;
const usagePercent = currentPlan.listingLimit === -1 ? 0 : (listingsUsed / currentPlan.listingLimit) * 100;

const stats = [
  {
    title: 'Aktive Inserate',
    value: `${listingsUsed}`,
    description: currentPlan.listingLimit === -1 
      ? `unbegrenzt im ${currentPlan.name}-Plan`
      : `von ${currentPlan.listingLimit} im ${currentPlan.name}-Plan`,
    icon: FileText,
    trend: null,
  },
  {
    title: 'Neue Anfragen',
    value: '5',
    description: 'in den letzten 7 Tagen',
    icon: MessageSquare,
    trend: '+2',
  },
  {
    title: 'Aufrufe gesamt',
    value: '1.234',
    description: 'in den letzten 30 Tagen',
    icon: Eye,
    trend: '+15%',
  },
  {
    title: 'Anfrage-Quote',
    value: '3,2%',
    description: 'Anfragen pro Aufruf',
    icon: TrendingUp,
    trend: '+0,5%',
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'vor wenigen Minuten';
  if (hours < 24) return `vor ${hours} Stunden`;
  if (days === 1) return 'gestern';
  return `vor ${days} Tagen`;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price / 100);
};

export default function SellerDashboardPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Willkommen zurück, Sandra!</h1>
          <p className="text-muted-foreground">
            Hier ist eine Übersicht Ihrer Aktivitäten.
          </p>
        </div>
        <Button asChild>
          <Link href="/seller/inserate/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neues Inserat
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.trend && (
                  <Badge variant="secondary" className="text-green-600 bg-green-100">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Status Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Plan Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{currentPlan.name} Plan</h3>
                  <Badge variant="secondary">
                    {(currentPlan.priceMonthly / 100).toFixed(2).replace('.', ',')}€/Mo
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{currentPlan.description}</p>
                
                {/* Usage Bar */}
                <div className="mt-3 max-w-xs">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Inserate: {listingsUsed} / {currentPlan.listingLimit}</span>
                    <span className="text-muted-foreground">{Math.round(usagePercent)}%</span>
                  </div>
                  <Progress value={usagePercent} className="h-2" />
                </div>
              </div>
            </div>
            
            {/* Features & Upgrade */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Key Features */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inklusive</p>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.featureFlags.hasLeadManagement && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Lead-Management
                    </Badge>
                  )}
                  {currentPlan.featureFlags.hasVerifiedBadge && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verifiziert-Badge
                    </Badge>
                  )}
                  {currentPlan.featureFlags.hasPrioritySupport && (
                    <Badge variant="outline" className="gap-1">
                      <Zap className="h-3 w-3" />
                      Prioritäts-Support
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Upgrade Button */}
              <div className="flex items-center">
                <Button asChild>
                  <Link href="/seller/abo/upgrade">
                    Upgrade
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Neueste Anfragen</CardTitle>
              <CardDescription>
                Ihre letzten Anfragen auf einen Blick
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/seller/anfragen">
                Alle anzeigen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sellerInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/seller/anfragen/${inquiry.id}`}
                  className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full ${
                      inquiry.status === 'new' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {inquiry.contactCompany || inquiry.contactName}
                      </span>
                      {inquiry.status === 'new' && (
                        <Badge>Neu</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {inquiry.listing?.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(inquiry.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Meine Inserate</CardTitle>
              <CardDescription>
                Ihre aktiven Inserate
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/seller/inserate">
                Alle anzeigen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sellerListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/seller/inserate/${listing.id}`}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
                    {listing.media[0] && (
                      <img
                        src={listing.media[0].url}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{listing.title}</span>
                      <Badge
                        variant={listing.status === 'active' ? 'default' : 'secondary'}
                      >
                        {listing.status === 'active'
                          ? 'Aktiv'
                          : listing.status === 'sold'
                          ? 'Verkauft'
                          : 'Entwurf'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(listing.price)}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing.viewsCount} Aufrufe
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Checklist (for new users) */}
      <OnboardingChecklist />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/seller/inserate/neu">
                <Plus className="h-5 w-5" />
                <span>Inserat erstellen</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/seller/anfragen">
                <MessageSquare className="h-5 w-5" />
                <span>Anfragen bearbeiten</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/seller/abo">
                <TrendingUp className="h-5 w-5" />
                <span>Plan upgraden</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <ActivityLog limit={5} showFilter={false} />
    </div>
  );
}
