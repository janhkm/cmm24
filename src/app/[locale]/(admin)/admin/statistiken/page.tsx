'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  ArrowUp,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAdminStats, type AdminStats } from '@/lib/actions/admin';

export default function AdminStatistikenPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await getAdminStats();
    
    if (result.success && result.data) {
      setStats(result.data);
    } else {
      setError(result.error || 'Fehler beim Laden der Statistiken');
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Statistiken konnten nicht geladen werden'}</AlertDescription>
        </Alert>
      </div>
    );
  }

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
        <Badge variant="outline" className="self-start">
          <Clock className="mr-1 h-3 w-3" />
          Live-Daten
        </Badge>
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
            <div className="flex items-center gap-2 text-xs mt-1">
              <span className="text-green-600">{stats.activeListings} aktiv</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-amber-600">{stats.pendingListings} ausstehend</span>
            </div>
            {stats.soldListings > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {stats.soldListings} verkauft
              </p>
            )}
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
            <div className="flex items-center gap-2 text-xs mt-1">
              <span className="text-green-600">{stats.activeAccounts} aktiv</span>
              {stats.suspendedAccounts > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-red-600">{stats.suspendedAccounts} gesperrt</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <CheckCircle className="inline h-3 w-3 mr-1 text-green-600" />
              {stats.verifiedAccounts} verifiziert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anfragen
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              +{stats.newInquiriesThisMonth} diesen Monat
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.newInquiriesThisWeek} diese Woche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Zahlende Kunden
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.planDistribution.filter(p => p.plan !== 'Free').reduce((sum, p) => sum + p.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.planDistribution.find(p => p.plan === 'Starter')?.count || 0} Starter,{' '}
              {stats.planDistribution.find(p => p.plan === 'Business')?.count || 0} Business
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Manufacturers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Hersteller</CardTitle>
            <CardDescription>Nach Anzahl der aktiven Inserate</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topManufacturers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Keine Daten verfügbar</p>
            ) : (
              <div className="space-y-4">
                {stats.topManufacturers.map((manufacturer, index) => (
                  <div key={manufacturer.id} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{manufacturer.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {manufacturer.count} Inserate
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${(manufacturer.count / (stats.topManufacturers[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Standorte</CardTitle>
            <CardDescription>Nach Anzahl der aktiven Inserate</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topLocations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Keine Daten verfügbar</p>
            ) : (
              <div className="space-y-4">
                {stats.topLocations.map((location, index) => (
                  <div key={`${location.city}-${location.country}`} className="flex items-center gap-4">
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
                            width: `${(location.count / (stats.topLocations[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan-Verteilung</CardTitle>
            <CardDescription>Aktive Accounts nach Plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.planDistribution.map((item) => (
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

            {stats.totalAccounts > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conversion Free → Paid
                  </span>
                  <span className="font-bold text-green-600">
                    {Math.round(
                      ((stats.planDistribution.filter(p => p.plan !== 'Free').reduce((sum, p) => sum + p.count, 0)) /
                        stats.totalAccounts) *
                        100
                    )}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Neueste Anmeldungen</CardTitle>
            <CardDescription>Letzte 5 Registrierungen</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSignups.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Keine Anmeldungen</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Firma</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentSignups.map((signup) => (
                    <TableRow key={signup.id}>
                      <TableCell className="font-medium">{signup.companyName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            signup.planSlug === 'business'
                              ? 'bg-purple-100 text-purple-800'
                              : signup.planSlug === 'starter'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {signup.planSlug.charAt(0).toUpperCase() + signup.planSlug.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(signup.createdAt).toLocaleDateString('de-DE')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
