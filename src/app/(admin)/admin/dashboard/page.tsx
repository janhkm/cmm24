'use client';

import Link from 'next/link';
import {
  FileCheck,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockListings, mockInquiries, sellers } from '@/data/mock-data';

// Get pending listings for moderation
const pendingListings = mockListings.filter((l) => l.status === 'pending_review');
const activeListings = mockListings.filter((l) => l.status === 'active');
const totalAccounts = sellers.length;
const totalInquiries = mockInquiries.length;

const stats = [
  {
    title: 'Zur Moderation',
    value: pendingListings.length.toString(),
    description: 'Inserate warten auf Prüfung',
    icon: FileCheck,
    href: '/admin/moderation',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    title: 'Aktive Inserate',
    value: activeListings.length.toString(),
    description: 'Gesamt auf der Plattform',
    icon: FileText,
    href: '/admin/inserate',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Verkäufer-Accounts',
    value: totalAccounts.toString(),
    description: 'Registrierte Unternehmen',
    icon: Users,
    href: '/admin/accounts',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Anfragen (30 Tage)',
    value: totalInquiries.toString(),
    description: 'Lead-Generierung',
    icon: MessageSquare,
    href: '/admin/statistiken',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

// Recent activity (mock)
const recentActivity = [
  {
    id: '1',
    type: 'listing_submitted',
    title: 'Neues Inserat eingereicht',
    description: 'Zeiss ACCURA II von CMM-Trade GmbH',
    time: 'vor 15 Min',
    icon: FileText,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: '2',
    type: 'listing_approved',
    title: 'Inserat freigegeben',
    description: 'Hexagon Global S von Messtechnik Schmidt AG',
    time: 'vor 1 Std',
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: '3',
    type: 'account_created',
    title: 'Neuer Account',
    description: 'Precision Measure GmbH hat sich registriert',
    time: 'vor 2 Std',
    icon: Users,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: '4',
    type: 'listing_rejected',
    title: 'Inserat abgelehnt',
    description: 'Unvollständige Angaben bei Wenzel LH 87',
    time: 'vor 3 Std',
    icon: XCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    id: '5',
    type: 'report_received',
    title: 'Meldung eingegangen',
    description: 'Inserat #123 wurde als verdächtig gemeldet',
    time: 'vor 5 Std',
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminDashboardPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Übersicht und Verwaltung der CMM24 Plattform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pending Moderation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Zur Moderation</CardTitle>
              <CardDescription>
                Inserate, die auf Freigabe warten
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/moderation">
                Alle anzeigen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingListings.length > 0 ? (
              <div className="space-y-4">
                {pendingListings.slice(0, 5).map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/admin/moderation/${listing.id}`}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                      {listing.media[0] && (
                        <img
                          src={listing.media[0].url}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.seller?.companyName || 'Unbekannt'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Ausstehend
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(listing.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-muted-foreground">
                  Alle Inserate wurden geprüft
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
            <CardDescription>
              Systemweite Ereignisse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4"
                >
                  <div className={`rounded-lg p-2 ${activity.iconBg}`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/admin/moderation">
                <FileCheck className="h-5 w-5" />
                <span>Inserate prüfen</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/admin/accounts">
                <Users className="h-5 w-5" />
                <span>Accounts verwalten</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/admin/stammdaten/hersteller">
                <TrendingUp className="h-5 w-5" />
                <span>Hersteller verwalten</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/admin/reports">
                <AlertTriangle className="h-5 w-5" />
                <span>Reports prüfen</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Systemstatus</CardTitle>
          <CardDescription>
            Status der verbundenen Services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-sm">Supabase</p>
                <p className="text-xs text-muted-foreground">Verbunden</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-sm">Stripe</p>
                <p className="text-xs text-muted-foreground">Verbunden</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-sm">Resend</p>
                <p className="text-xs text-muted-foreground">Verbunden</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
