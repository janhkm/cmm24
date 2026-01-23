'use client';

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  Eye,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { manufacturers } from '@/data/mock-data';

// Mock statistics data
const stats = {
  totalListings: 156,
  listingsChange: 12,
  activeListings: 142,
  totalAccounts: 48,
  accountsChange: 5,
  totalInquiries: 324,
  inquiriesChange: 28,
  mrr: 289700, // in cents
  mrrChange: 8.5,
};

const topManufacturers = manufacturers
  .sort((a, b) => (b.listingCount || 0) - (a.listingCount || 0))
  .slice(0, 5);

const topLocations = [
  { city: 'München', country: 'Deutschland', count: 28 },
  { city: 'Stuttgart', country: 'Deutschland', count: 22 },
  { city: 'Wien', country: 'Österreich', count: 18 },
  { city: 'Berlin', country: 'Deutschland', count: 15 },
  { city: 'Zürich', country: 'Schweiz', count: 12 },
];

const recentSignups = [
  { company: 'TechMeasure GmbH', plan: 'starter', date: '2026-01-22' },
  { company: 'Quality Systems AG', plan: 'business', date: '2026-01-21' },
  { company: 'Präzision & Co', plan: 'free', date: '2026-01-20' },
  { company: 'MessTech Berlin', plan: 'starter', date: '2026-01-19' },
  { company: 'CMM Solutions', plan: 'business', date: '2026-01-18' },
];

const planDistribution = [
  { plan: 'Free', count: 25, percentage: 52 },
  { plan: 'Starter', count: 15, percentage: 31 },
  { plan: 'Business', count: 8, percentage: 17 },
];

export default function AdminStatistikenPage() {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Plattform-Statistiken</h1>
          <p className="text-muted-foreground">
            Übersicht über die wichtigsten Kennzahlen
          </p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Letzte 7 Tage</SelectItem>
            <SelectItem value="30d">Letzte 30 Tage</SelectItem>
            <SelectItem value="90d">Letzte 90 Tage</SelectItem>
            <SelectItem value="365d">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inserate gesamt
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              +{stats.listingsChange} diesen Monat
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeListings} aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verkäufer-Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              +{stats.accountsChange} diesen Monat
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anfragen (30 Tage)
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              +{stats.inquiriesChange} vs. Vormonat
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              MRR
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.mrr)}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              +{stats.mrrChange}% vs. Vormonat
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Manufacturers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Hersteller</CardTitle>
            <CardDescription>Nach Anzahl der Inserate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topManufacturers.map((manufacturer, index) => (
                <div key={manufacturer.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{manufacturer.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {manufacturer.listingCount || 0} Inserate
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${((manufacturer.listingCount || 0) / (topManufacturers[0].listingCount || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Standorte</CardTitle>
            <CardDescription>Nach Anzahl der Inserate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topLocations.map((location, index) => (
                <div key={location.city} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {location.city}, {location.country}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {location.count} Inserate
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${(location.count / topLocations[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan-Verteilung</CardTitle>
            <CardDescription>Aktive Abonnements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planDistribution.map((item) => (
                <div key={item.plan} className="flex items-center gap-4">
                  <div className="w-20">
                    <Badge
                      variant="secondary"
                      className={
                        item.plan === 'Business'
                          ? 'bg-purple-100 text-purple-800'
                          : item.plan === 'Starter'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {item.plan}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.count} Accounts</span>
                      <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${
                          item.plan === 'Business'
                            ? 'bg-purple-500'
                            : item.plan === 'Starter'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Conversion Free → Paid
                </span>
                <span className="font-bold text-green-600">23%</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">
                  Churn Rate
                </span>
                <span className="font-bold text-amber-600">4.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Neueste Anmeldungen</CardTitle>
            <CardDescription>Letzte 5 Registrierungen</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSignups.map((signup, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{signup.company}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          signup.plan === 'business'
                            ? 'bg-purple-100 text-purple-800'
                            : signup.plan === 'starter'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {signup.plan.charAt(0).toUpperCase() + signup.plan.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(signup.date).toLocaleDateString('de-DE')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel (30 Tage)</CardTitle>
          <CardDescription>Von Besuch bis Anfrage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            {[
              { label: 'Besucher', value: '12.450', percentage: 100 },
              { label: 'Suche genutzt', value: '4.830', percentage: 39 },
              { label: 'Inserat angesehen', value: '2.156', percentage: 17 },
              { label: 'Anfrage gesendet', value: '324', percentage: 2.6 },
            ].map((step, index) => (
              <div key={step.label} className="flex-1 text-center">
                <div className="relative">
                  <div
                    className="h-24 rounded-lg bg-primary/20 flex items-end justify-center"
                    style={{ height: `${Math.max(step.percentage, 10)}px` }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-lg bg-primary"
                      style={{ height: `${step.percentage}%`, minHeight: '10px' }}
                    />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold">{step.value}</p>
                <p className="text-sm text-muted-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.percentage}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
