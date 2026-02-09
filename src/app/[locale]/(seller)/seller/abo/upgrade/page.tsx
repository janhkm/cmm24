'use client';

import { useState, useEffect, Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle, Loader2, Star, X, Minus, Infinity, Zap, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { getAllPlans } from '@/lib/actions/dashboard';
import { createCheckoutSession } from '@/lib/stripe/actions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Database } from '@/types/supabase';

type Plan = Database['public']['Tables']['plans']['Row'];

// Launch offer active (first 100 customers or first 6 months)
const isLaunchOfferActive = true;

// Wrapper component to handle Suspense boundary for useSearchParams
export default function UpgradePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UpgradePageContent />
    </Suspense>
  );
}

function UpgradePageContent() {
  const { plan: currentPlan, subscription, isLoading: authLoading } = useSellerAuth();
  const t = useTranslations('sellerAbo');
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Feature comparison data for 3 plans
  const featureComparison = [
    { 
      category: t('catListings'), 
      features: [
        { name: t('featActiveListings'), values: ['1', '5', '25'] },
        { name: t('featExtraListings'), values: [false, false, '+7€/' + t('perPiece')] },
        { name: t('featUnlimitedDrafts'), values: [true, true, true] },
        { name: t('featFeaturedPerMonth'), values: ['–', '1', '5'] },
        { name: t('featTopPlacement'), values: [false, false, true] },
      ]
    },
    { 
      category: t('catStatistics'), 
      features: [
        { name: t('featViewsPerformance'), values: [false, true, true] },
        { name: t('featExport'), values: [false, true, true] },
      ]
    },
    { 
      category: t('catLeadManagement'), 
      features: [
        { name: t('featReceiveInquiries'), values: [true, true, true] },
        { name: t('featLeadManagement'), values: [false, true, true] },
        { name: t('featLeadPipeline'), values: [false, false, true] },
        { name: t('featEmailComposer'), values: [false, true, true] },
        { name: t('featAutoReply'), values: [false, false, true] },
      ]
    },
    { 
      category: t('catProductivity'), 
      features: [
        { name: t('featBulkActions'), values: [false, false, true] },
        { name: t('featTeamMembers'), values: ['1', '1', '10'] },
        { name: t('featApiAccess'), values: [false, false, true] },
      ]
    },
    { 
      category: t('catSupportExtras'), 
      features: [
        { name: t('featEmailSupport'), values: [t('standard'), '24h', '4h'] },
        { name: t('featVerifiedBadge'), values: [false, true, true] },
      ]
    },
  ];

  // Check for canceled checkout
  const wasCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    const loadPlans = async () => {
      const result = await getAllPlans();
      if (result.success && result.data) {
        setPlans(result.data);
      }
      setIsLoadingPlans(false);
    };
    loadPlans();
  }, []);

  const handleUpgrade = async (planSlug: string) => {
    if (planSlug === 'free') return;
    
    setSelectedPlan(planSlug);
    setIsLoading(true);
    setCheckoutError(null);
    
    try {
      const result = await createCheckoutSession({
        planSlug: planSlug as 'starter' | 'business',
        interval: billingInterval,
      });
      
      if (result.success && result.data) {
        window.location.href = result.data.url;
      } else {
        setCheckoutError(result.error || t('checkoutError'));
        toast.error(result.error || t('checkoutError'));
        setIsLoading(false);
      }
    } catch {
      console.error('Checkout error');
      setCheckoutError(t('unexpectedError'));
      toast.error(t('unexpectedError'));
      setIsLoading(false);
    }
  };

  if (authLoading || isLoadingPlans) {
    return <PageSkeleton />;
  }

  const currentPlanSlug = currentPlan?.slug || 'free';
  const currentPlanIndex = plans.findIndex((p) => p.slug === currentPlanSlug);

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/50 mx-auto" />
      );
    }
    if (value === '–') {
      return <Minus className="h-4 w-4 text-muted-foreground/50 mx-auto" />;
    }
    if (value === '∞') {
      return <Infinity className="h-4 w-4 text-green-600 mx-auto" />;
    }
    return <span className="text-sm">{value}</span>;
  };

  const getPrice = (plan: Plan) => {
    if (isLaunchOfferActive && plan.launch_price_monthly && plan.launch_price_monthly > 0) {
      return billingInterval === 'monthly' 
        ? plan.launch_price_monthly 
        : Math.round((plan.launch_price_yearly || plan.price_yearly) / 12);
    }
    return billingInterval === 'monthly' 
      ? plan.price_monthly 
      : Math.round(plan.price_yearly / 12);
  };

  const getRegularPrice = (plan: Plan) => {
    return billingInterval === 'monthly' 
      ? plan.price_monthly 
      : Math.round(plan.price_yearly / 12);
  };

  const getFeatures = (plan: Plan): string[] => {
    return (plan.features as string[]) || [];
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/abo">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('upgradeTitle')}</h1>
          <p className="text-muted-foreground">
            {t('upgradeSubtitle')}
          </p>
        </div>
      </div>

      {/* Canceled Checkout Alert */}
      {wasCanceled && (
        <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            {t('checkoutCanceled')}
          </AlertDescription>
        </Alert>
      )}

      {/* Checkout Error Alert */}
      {checkoutError && (
        <Alert className="mb-6 border-red-500/50 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {checkoutError}
          </AlertDescription>
        </Alert>
      )}

      {/* Launch Offer Banner */}
      {isLaunchOfferActive && (
        <div className="mb-8 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-500/20 p-2">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {t('earlyAdopterOffer')}
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {t('limited')}
                  </Badge>
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {t('earlyAdopterDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t('spotsRemaining', { count: 73 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Label
          htmlFor="billing-toggle"
          className={billingInterval === 'monthly' ? 'font-medium' : 'text-muted-foreground'}
        >
          {t('monthly')}
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingInterval === 'yearly'}
          onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
        />
        <Label
          htmlFor="billing-toggle"
          className={billingInterval === 'yearly' ? 'font-medium' : 'text-muted-foreground'}
        >
          {t('yearly')}
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
            {t('save20')}
          </Badge>
        </Label>
      </div>

      {/* Plans Grid - 3 columns */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => {
          const isCurrent = plan.slug === currentPlanSlug;
          const isDowngrade = index < currentPlanIndex;
          const isHighlighted = plan.slug === 'starter';
          const price = getPrice(plan);
          const regularPrice = getRegularPrice(plan);
          const hasLaunchDiscount = isLaunchOfferActive && plan.launch_price_monthly && plan.launch_price_monthly > 0 && price < regularPrice;
          const discountPercent = hasLaunchDiscount 
            ? Math.round((1 - price / regularPrice) * 100) 
            : 0;
          const features = getFeatures(plan);

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                isHighlighted && 'border-primary shadow-xl scale-[1.02]',
                isCurrent && 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
              )}
            >
              {hasLaunchDiscount && !isCurrent && (
                <div className="absolute -top-3 -right-3">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 shadow-lg">
                    -{discountPercent}%
                  </Badge>
                </div>
              )}
              {isHighlighted && !isCurrent && !hasLaunchDiscount && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    {t('recommended')}
                  </Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {t('current')}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description || ''}</CardDescription>
                <div className="mt-4">
                  {plan.price_monthly === 0 ? (
                    <span className="text-4xl font-bold">{t('free')}</span>
                  ) : (
                    <div>
                      {hasLaunchDiscount && (
                        <div className="text-muted-foreground line-through text-lg mb-1">
                          {regularPrice}€
                        </div>
                      )}
                      <span className="text-4xl font-bold text-primary">
                        {price}€
                      </span>
                      <span className="text-muted-foreground">/{t('monthShort')}</span>
                    </div>
                  )}
                  {billingInterval === 'yearly' && plan.price_yearly > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {isLaunchOfferActive && plan.launch_price_yearly
                          ? plan.launch_price_yearly
                          : plan.price_yearly}€ {t('perYear')}
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="text-center text-sm font-semibold text-primary mb-4 pb-4 border-b">
                  {plan.listing_limit === 1
                    ? t('oneActiveListing')
                    : t('activeListingsCount', { count: plan.listing_limit })}
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {features.slice(0, 7).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button disabled className="w-full" variant="outline">
                    {t('currentPlan')}
                  </Button>
                ) : isDowngrade ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/kontakt">{t('requestDowngrade')}</Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={isHighlighted ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.slug)}
                    disabled={isLoading && selectedPlan === plan.slug}
                  >
                    {isLoading && selectedPlan === plan.slug ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {plan.price_monthly === 0 ? t('downgrade') : t('upgradeNow')}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Competitor Comparison */}
      <div className="mt-12 max-w-3xl mx-auto">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4 text-center">
              {t('cheaperThanCompetition')}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">{t('oneListing')}</p>
                <p className="text-lg line-through text-muted-foreground">69€</p>
                <p className="text-2xl font-bold text-green-600">0€</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('fiveListings')}</p>
                <p className="text-lg line-through text-muted-foreground">~345€</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLaunchOfferActive ? '29€' : '49€'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('twentyfiveListings')}</p>
                <p className="text-lg line-through text-muted-foreground">~475€</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLaunchOfferActive ? '89€' : '149€'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison Toggle */}
      <div className="text-center mt-8">
        <Button
          variant="outline"
          onClick={() => setShowComparison(!showComparison)}
        >
          {showComparison ? t('hideComparison') : t('showComparison')}
        </Button>
      </div>

      {/* Feature Comparison Table */}
      {showComparison && (
        <div className="mt-8 overflow-x-auto">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{t('detailedComparison')}</CardTitle>
              <CardDescription>
                {t('detailedComparisonDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">{t('feature')}</TableHead>
                    {plans.map((plan) => (
                      <TableHead 
                        key={plan.id} 
                        className={cn(
                          'text-center min-w-[120px]',
                          plan.slug === currentPlanSlug && 'bg-green-50 dark:bg-green-950/20'
                        )}
                      >
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-xs font-normal text-muted-foreground">
                          {plan.price_monthly === 0 
                            ? t('free') 
                            : `${isLaunchOfferActive && plan.launch_price_monthly ? plan.launch_price_monthly : plan.price_monthly}€/${t('monthShortAbbr')}`
                          }
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureComparison.map((category) => (
                    <>
                      <TableRow key={category.category} className="bg-muted/30">
                        <TableCell colSpan={4} className="font-semibold text-sm">
                          {category.category}
                        </TableCell>
                      </TableRow>
                      {category.features.map((feature) => (
                        <TableRow key={feature.name}>
                          <TableCell className="text-sm">{feature.name}</TableCell>
                          {feature.values.map((value, i) => (
                            <TableCell 
                              key={i} 
                              className={cn(
                                'text-center',
                                plans[i]?.slug === currentPlanSlug && 'bg-green-50 dark:bg-green-950/20'
                              )}
                            >
                              {renderFeatureValue(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-center">{t('faqTitle')}</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{t('faq1Question')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('faq1Answer')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{t('faq2Question')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('faq2Answer')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{t('faq3Question')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('faq3Answer')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{t('faq4Question')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('faq4Answer')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
