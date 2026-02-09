'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  FileText,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { StatisticsSkeleton } from '@/components/ui/skeletons';
import { FeatureLocked } from '@/components/features/feature-locked';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { getAccountStatistics } from '@/lib/actions/dashboard';
import { toast } from 'sonner';

interface ListingStat {
  id: string;
  title: string;
  views: number;
  inquiries: number;
}

export default function StatistikenPage() {
  const { plan, isLoading: authLoading } = useSellerAuth();
  const t = useTranslations('sellerStats');
  const locale = useLocale();
  
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalViews: number;
    totalInquiries: number;
    conversionRate: number;
    listingStats: ListingStat[];
  } | null>(null);

  // Check if user has access to statistics
  const featureFlags = plan?.feature_flags as { statistics?: boolean } | null;
  const hasStatistics = featureFlags?.statistics ?? false;

  useEffect(() => {
    const loadData = async () => {
      try {
        const endDate = new Date().toISOString();
        let days = 30;
        switch (timeRange) {
          case '7d': days = 7; break;
          case '30d': days = 30; break;
          case '90d': days = 90; break;
          case '365d': days = 365; break;
        }
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        
        const result = await getAccountStatistics({ startDate, endDate });
        if (result.success && result.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
        toast.error(t('errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading && hasStatistics) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, hasStatistics, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading skeleton
  if (authLoading || (hasStatistics && isLoading)) {
    return <StatisticsSkeleton />;
  }

  // Show feature locked page if no access
  if (!hasStatistics) {
    return (
      <FeatureLocked
        featureName={t('featureLockedName')}
        icon={BarChart3}
        headline={t('featureLockedHeadline')}
        description={t('featureLockedDesc')}
        targetAudience={t('featureLockedAudience')}
        requiredPlan="starter"
        benefits={[
          {
            title: t('benefit1Title'),
            description: t('benefit1Desc'),
          },
          {
            title: t('benefit2Title'),
            description: t('benefit2Desc'),
          },
          {
            title: t('benefit3Title'),
            description: t('benefit3Desc'),
          },
          {
            title: t('benefit4Title'),
            description: t('benefit4Desc'),
          },
        ]}
        testimonial={{
          quote: t('testimonialQuote'),
          author: t('testimonialAuthor'),
          company: t('testimonialCompany'),
        }}
      />
    );
  }

  // Overview stats
  const overviewStats = [
    {
      title: t('totalViews'),
      value: stats?.totalViews.toLocaleString(locale) || '0',
      icon: Eye,
    },
    {
      title: t('inquiries'),
      value: stats?.totalInquiries.toString() || '0',
      icon: MessageSquare,
    },
    {
      title: t('conversionRate'),
      value: `${(stats?.conversionRate || 0).toFixed(2)}%`,
      icon: TrendingUp,
    },
    {
      title: t('listings'),
      value: stats?.listingStats.length.toString() || '0',
      icon: FileText,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('last7Days')}</SelectItem>
              <SelectItem value="30d">{t('last30Days')}</SelectItem>
              <SelectItem value="90d">{t('last90Days')}</SelectItem>
              <SelectItem value="365d">{t('lastYear')}</SelectItem>
            </SelectContent>
          </Select>
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listing Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('performanceTitle')}</CardTitle>
          <CardDescription>
            {t('performanceDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.listingStats && stats.listingStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('listing')}</TableHead>
                  <TableHead className="text-right">{t('views')}</TableHead>
                  <TableHead className="text-right">{t('inquiries')}</TableHead>
                  <TableHead className="text-right">{t('conversion')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.listingStats.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell className="text-right">{listing.views.toLocaleString(locale)}</TableCell>
                    <TableCell className="text-right">{listing.inquiries}</TableCell>
                    <TableCell className="text-right">
                      {listing.views > 0 
                        ? `${((listing.inquiries / listing.views) * 100).toFixed(1)}%`
                        : '—'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('noStats')}</p>
              <p className="text-sm">{t('createListings')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
