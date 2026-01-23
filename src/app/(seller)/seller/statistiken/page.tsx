'use client';

import { useState } from 'react';
import {
  Eye,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  FileText,
  BarChart3,
  ArrowUpRight,
  Lock,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock current plan - in real app this comes from context/API
const currentPlan = {
  slug: 'business', // 'free' | 'starter' | 'business'
  hasStatistics: true,
  hasStatisticsExport: true,
};

// Mock statistics data
const overviewStats = [
  {
    title: 'Gesamtaufrufe',
    value: '2.847',
    change: '+12.5%',
    trend: 'up',
    period: 'vs. Vormonat',
    icon: Eye,
  },
  {
    title: 'Anfragen',
    value: '23',
    change: '+8.3%',
    trend: 'up',
    period: 'vs. Vormonat',
    icon: MessageSquare,
  },
  {
    title: 'Konversionsrate',
    value: '0.81%',
    change: '-2.1%',
    trend: 'down',
    period: 'vs. Vormonat',
    icon: TrendingUp,
  },
  {
    title: 'Ø Verweildauer',
    value: '2:34 min',
    change: '+15.2%',
    trend: 'up',
    period: 'vs. Vormonat',
    icon: Calendar,
  },
];

// Mock listing performance data
const listingPerformance = [
  {
    id: '1',
    title: 'Zeiss ACCURA II 12/18/8',
    views: 847,
    inquiries: 8,
    conversionRate: 0.94,
    avgTimeOnPage: '3:12',
    trend: 'up',
    status: 'active',
  },
  {
    id: '2',
    title: 'Mitutoyo CRYSTA-Apex S 9106',
    views: 623,
    inquiries: 6,
    conversionRate: 0.96,
    avgTimeOnPage: '2:45',
    trend: 'up',
    status: 'active',
  },
  {
    id: '3',
    title: 'Wenzel LH 87',
    views: 412,
    inquiries: 4,
    conversionRate: 0.97,
    avgTimeOnPage: '2:18',
    trend: 'down',
    status: 'active',
  },
  {
    id: '4',
    title: 'Hexagon Global S 9.12.8',
    views: 389,
    inquiries: 3,
    conversionRate: 0.77,
    avgTimeOnPage: '1:52',
    trend: 'stable',
    status: 'active',
  },
  {
    id: '5',
    title: 'Coord3 ARES',
    views: 256,
    inquiries: 2,
    conversionRate: 0.78,
    avgTimeOnPage: '1:45',
    trend: 'up',
    status: 'active',
  },
];

// Mock chart data (simplified bar representation)
const weeklyViews = [
  { day: 'Mo', views: 123, inquiries: 2 },
  { day: 'Di', views: 156, inquiries: 3 },
  { day: 'Mi', views: 189, inquiries: 4 },
  { day: 'Do', views: 134, inquiries: 2 },
  { day: 'Fr', views: 167, inquiries: 5 },
  { day: 'Sa', views: 89, inquiries: 1 },
  { day: 'So', views: 67, inquiries: 0 },
];

// Traffic sources
const trafficSources = [
  { source: 'Organische Suche', percentage: 45, visits: 1281 },
  { source: 'Direkt', percentage: 28, visits: 797 },
  { source: 'CMM24 Startseite', percentage: 15, visits: 427 },
  { source: 'Kategorieseiten', percentage: 8, visits: 228 },
  { source: 'Externe Links', percentage: 4, visits: 114 },
];

// Geographic data
const topRegions = [
  { region: 'Deutschland', visits: 1853, percentage: 65 },
  { region: 'Österreich', visits: 427, percentage: 15 },
  { region: 'Schweiz', visits: 342, percentage: 12 },
  { region: 'Andere', visits: 228, percentage: 8 },
];

export default function StatistikenPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [exportLoading, setExportLoading] = useState<'csv' | 'pdf' | null>(null);

  const maxViews = Math.max(...weeklyViews.map((d) => d.views));

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExportLoading(format);
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setExportLoading(null);
    // In real app: trigger download
    alert(`${format.toUpperCase()}-Export wird heruntergeladen...`);
  };

  // With the simplified plan structure, all stats features are available if hasStatistics is true
  const isFeatureAvailable = () => {
    return currentPlan.hasStatistics;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statistiken</h1>
          <p className="text-muted-foreground">
            Analysieren Sie die Performance Ihrer Inserate
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzte 30 Tage</SelectItem>
              <SelectItem value="90d">Letzte 90 Tage</SelectItem>
              <SelectItem value="365d">Letztes Jahr</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={!currentPlan.hasStatisticsExport || exportLoading !== null}
            >
              {exportLoading === 'csv' ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={!currentPlan.hasStatisticsExport || exportLoading !== null}
            >
              {exportLoading === 'pdf' ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="listings">Nach Inserat</TabsTrigger>
          <TabsTrigger value="traffic" disabled={!isFeatureAvailable()}>
            Traffic-Quellen
            {!isFeatureAvailable() && <Lock className="ml-1 h-3 w-3" />}
          </TabsTrigger>
          <TabsTrigger value="geography" disabled={!isFeatureAvailable()}>
            Geografie
            {!isFeatureAvailable() && <Lock className="ml-1 h-3 w-3" />}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Weekly Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Aufrufe & Anfragen
                </CardTitle>
                <CardDescription>Letzte 7 Tage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyViews.map((day) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <span className="w-8 text-sm text-muted-foreground">{day.day}</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 rounded bg-primary/80"
                            style={{ width: `${(day.views / maxViews) * 100}%` }}
                          />
                          <span className="text-sm font-medium">{day.views}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 rounded bg-blue-400"
                            style={{ width: `${(day.inquiries / 5) * 30}%` }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {day.inquiries} Anfragen
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary/80" />
                    <span>Aufrufe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-blue-400" />
                    <span>Anfragen</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Insights
                </CardTitle>
                <CardDescription>Automatische Erkenntnisse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Starke Performance
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        &quot;Zeiss ACCURA II&quot; hat diese Woche 23% mehr Aufrufe als der
                        Durchschnitt.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Hohe Konversion
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Mittwoch ist Ihr bester Tag für Anfragen. 4 von 23 Anfragen
                        kamen mittwochs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        Verbesserungspotential
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        &quot;Hexagon Global S&quot; hat viele Aufrufe, aber niedrige Konversion.
                        Überarbeiten Sie die Beschreibung.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Performance nach Inserat</CardTitle>
              <CardDescription>
                Detaillierte Statistiken für jedes Ihrer aktiven Inserate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inserat</TableHead>
                      <TableHead className="text-right">Aufrufe</TableHead>
                      <TableHead className="text-right">Anfragen</TableHead>
                      <TableHead className="text-right">Konversion</TableHead>
                      <TableHead className="text-right">Ø Verweildauer</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listingPerformance.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium max-w-[250px] truncate">
                          {listing.title}
                        </TableCell>
                        <TableCell className="text-right">{listing.views}</TableCell>
                        <TableCell className="text-right">{listing.inquiries}</TableCell>
                        <TableCell className="text-right">
                          {listing.conversionRate.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">{listing.avgTimeOnPage}</TableCell>
                        <TableCell className="text-right">
                          {listing.trend === 'up' ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <TrendingUp className="mr-1 h-3 w-3" />
                              Steigend
                            </Badge>
                          ) : listing.trend === 'down' ? (
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              <TrendingDown className="mr-1 h-3 w-3" />
                              Fallend
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Stabil</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic-Quellen</CardTitle>
              <CardDescription>
                Woher kommen Ihre Besucher?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{source.source}</span>
                    <span className="text-muted-foreground">
                      {source.visits} Besucher ({source.percentage}%)
                    </span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Geografische Verteilung</CardTitle>
              <CardDescription>
                Aus welchen Regionen kommen Ihre Besucher?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {topRegions.map((region) => (
                  <div
                    key={region.region}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{region.region}</p>
                      <p className="text-sm text-muted-foreground">
                        {region.visits} Besucher
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{region.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Banner for Free plan users */}
      {currentPlan.slug === 'free' && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  Statistiken freischalten
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upgraden Sie auf Starter oder Business für detaillierte Statistiken und Export-Funktionen
                </p>
              </div>
            </div>
            <Button asChild>
              <a href="/seller/abo/upgrade">Jetzt upgraden</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
