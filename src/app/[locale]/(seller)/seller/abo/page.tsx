'use client';

import { useState, useEffect, Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  CreditCard,
  CheckCircle,
  Calendar,
  ArrowRight,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
  PartyPopper,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { getDashboardStats } from '@/lib/actions/dashboard';
import { createCustomerPortalSession, cancelSubscription, resumeSubscription } from '@/lib/stripe/actions';
import { toast } from 'sonner';

// Wrapper component to handle Suspense boundary for useSearchParams
export default function AboPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AboPageContent />
    </Suspense>
  );
}

function AboPageContent() {
  const { plan, subscription, isLoading: authLoading } = useSellerAuth();
  const t = useTranslations('sellerAbo');
  const locale = useLocale();
  const refreshProfile = () => { window.location.reload(); };
  const searchParams = useSearchParams();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [stats, setStats] = useState<{ activeListings: number; listingLimit: number } | null>(null);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);

  const CANCEL_REASONS = [
    { value: 'too_expensive', label: t('cancelTooExpensive') },
    { value: 'not_enough_features', label: t('cancelNotEnoughFeatures') },
    { value: 'switching_service', label: t('cancelSwitchingService') },
    { value: 'no_longer_needed', label: t('cancelNoLongerNeeded') },
    { value: 'temporary_pause', label: t('cancelTemporaryPause') },
    { value: 'other', label: t('cancelOther') },
  ];

  // Check for successful checkout
  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    const loadStats = async () => {
      const result = await getDashboardStats();
      if (result.success && result.data) {
        setStats({
          activeListings: result.data.activeListings,
          listingLimit: result.data.listingLimit,
        });
      }
    };
    
    if (!authLoading) {
      loadStats();
      
      // Nach erfolgreichem Checkout: Polling bis der Webhook die DB aktualisiert hat
      if (isSuccess && plan?.slug === 'free') {
        setIsProcessingUpgrade(true);
        let attempts = 0;
        const maxAttempts = 10;
        
        const pollForUpgrade = setInterval(async () => {
          attempts++;
          await refreshProfile();
          
          const statsResult = await getDashboardStats();
          if (statsResult.success && statsResult.data) {
            setStats({
              activeListings: statsResult.data.activeListings,
              listingLimit: statsResult.data.listingLimit,
            });
          }
          
          if (attempts >= maxAttempts) {
            clearInterval(pollForUpgrade);
            setIsProcessingUpgrade(false);
          }
        }, 2000);
        
        return () => clearInterval(pollForUpgrade);
      } else if (isSuccess) {
        refreshProfile();
      }
    }
  }, [authLoading, isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling stoppen sobald Plan sich geaendert hat
  useEffect(() => {
    if (isProcessingUpgrade && plan?.slug !== 'free') {
      setIsProcessingUpgrade(false);
    }
  }, [plan, isProcessingUpgrade]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelSubscription();
      if (result.success) {
        toast.success(t('cancelSuccess'));
        refreshProfile();
      } else {
        toast.error(result.error || t('cancelError'));
      }
    } catch {
      toast.error(t('errorOccurred'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResume = async () => {
    setIsCancelling(true);
    try {
      const result = await resumeSubscription();
      if (result.success) {
        toast.success(t('resumeSuccess'));
        refreshProfile();
      } else {
        toast.error(result.error || t('resumeError'));
      }
    } catch {
      toast.error(t('errorOccurred'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const result = await createCustomerPortalSession();
      if (result.success && result.data) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error || t('portalError'));
        setIsOpeningPortal(false);
      }
    } catch {
      toast.error(t('errorOccurred'));
      setIsOpeningPortal(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (authLoading) {
    return <PageSkeleton />;
  }

  const listingsUsed = stats?.activeListings || 0;
  const listingsLimit = stats?.listingLimit || plan?.listing_limit || 1;
  const usagePercent = listingsLimit === -1 ? 0 : Math.min((listingsUsed / listingsLimit) * 100, 100);
  
  // Get features from plan
  const features = (plan?.features as string[]) || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Success Alert */}
      {isProcessingUpgrade && (
        <Card className="mb-6 border-primary/30">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{t('upgradePreparing')}</h3>
            <p className="text-muted-foreground mt-2">
              {t('upgradePreparingDesc')}
            </p>
          </CardContent>
        </Card>
      )}

      {isSuccess && !isProcessingUpgrade && (
        <Alert className="mb-6 border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <PartyPopper className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            {t('welcomeTo', { plan: plan?.name || '' })}
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            {t('upgradeSuccessDesc')}
          </AlertDescription>
        </Alert>
      )}

      {/* Cancellation Pending Alert */}
      {subscription?.cancel_at_period_end && (
        <Card className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  {t('cancellationPending')}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {t('cancellationPendingDesc', {
                    plan: plan?.name || '',
                    date: subscription.current_period_end
                      ? formatDate(subscription.current_period_end)
                      : t('endOfBillingPeriod'),
                  })}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                  {t('cancellationUntilThen')}
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleResume}
                    disabled={isCancelling}
                    size="sm"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('resuming')}
                      </>
                    ) : (
                      t('revokeCancellation')
                    )}
                  </Button>
                  <p className="text-xs text-amber-600 dark:text-amber-400 self-center">
                    {t('canReactivateAnytime')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>{plan?.name || 'Free'}</span>
                    <Badge variant="secondary">{t('current')}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {subscription?.billing_interval === 'yearly' ? t('billedYearly') : t('billedMonthly')}
                  </CardDescription>
                </div>
                <div className="text-right">
                  {(() => {
                    const isEarlyAdopter = subscription?.is_early_adopter ?? false;
                    const interval = subscription?.billing_interval || 'monthly';
                    const currentPrice = isEarlyAdopter
                      ? (interval === 'yearly' ? plan?.launch_price_yearly : plan?.launch_price_monthly) ?? plan?.price_monthly ?? 0
                      : (interval === 'yearly' ? plan?.price_yearly : plan?.price_monthly) ?? 0;
                    const regularPrice = interval === 'yearly' ? plan?.price_yearly ?? 0 : plan?.price_monthly ?? 0;
                    const periodLabel = interval === 'yearly' ? t('perYear') : t('perMonth');

                    if (currentPrice === 0) {
                      return <div className="text-2xl font-bold">{t('free')}</div>;
                    }

                    return (
                      <>
                        <div className="text-2xl font-bold">
                          {currentPrice} €
                        </div>
                        <div className="text-sm text-muted-foreground">{periodLabel}</div>
                        {isEarlyAdopter && regularPrice > currentPrice && (
                          <div className="text-xs text-green-600 mt-1">
                            {t('earlyAdopterPrice')}
                            <span className="line-through text-muted-foreground ml-1">
                              {regularPrice} €
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t('listingUsage')}</span>
                  <span className="text-sm text-muted-foreground">
                    {t('usageCount', { used: listingsUsed, limit: listingsLimit === -1 ? '∞' : listingsLimit })}
                  </span>
                </div>
                {listingsLimit !== -1 && (
                  <Progress value={usagePercent} className="h-2" />
                )}
              </div>

              {/* Subscription Status */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('status')}</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription?.status === 'active' && t('statusActive')}
                    {subscription?.status === 'trialing' && t('statusTrialing')}
                    {subscription?.status === 'past_due' && t('statusPastDue')}
                    {subscription?.status === 'canceled' && t('statusCanceled')}
                    {!subscription && t('statusFree')}
                  </p>
                </div>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">{t('includedFeatures')}</h4>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {plan?.slug !== 'business' && (
                  <Button asChild>
                    <Link href="/seller/abo/upgrade">
                      {t('upgrade')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {plan?.slug !== 'free' && subscription?.status === 'active' && !subscription?.cancel_at_period_end && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCancelDialogOpen(true);
                        setCancelReason('');
                        setCancelFeedback('');
                      }}
                    >
                      {t('cancelAbo')}
                    </Button>

                    {/* Kuendigungs-Dialog mit Feedback-Abfrage */}
                    <Dialog
                      open={cancelDialogOpen}
                      onOpenChange={(open) => {
                        setCancelDialogOpen(open);
                        if (!open) { setCancelStep(1); setCancelReason(''); setCancelFeedback(''); }
                      }}
                    >
                      <DialogContent className="sm:max-w-[480px]">
                        {cancelStep === 1 ? (
                          <>
                            <DialogHeader>
                              <DialogTitle>{t('cancelDialogTitle')}</DialogTitle>
                              <DialogDescription>
                                {t('cancelDialogDesc')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="space-y-3">
                                {CANCEL_REASONS.map((reason) => (
                                  <div key={reason.value} className="flex items-center space-x-3">
                                    <RadioGroupItem value={reason.value} id={reason.value} />
                                    <Label htmlFor={reason.value} className="cursor-pointer">{reason.label}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                              <div className="space-y-2">
                                <Label htmlFor="cancel-feedback">{t('cancelFeedbackLabel')}</Label>
                                <Textarea
                                  id="cancel-feedback"
                                  placeholder={t('cancelFeedbackPlaceholder')}
                                  value={cancelFeedback}
                                  onChange={(e) => setCancelFeedback(e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>{t('cancelBtn')}</Button>
                              <Button variant="destructive" disabled={!cancelReason} onClick={() => setCancelStep(2)}>{t('continue')}</Button>
                            </DialogFooter>
                          </>
                        ) : (
                          <>
                            <DialogHeader>
                              <DialogTitle>{t('confirmCancelTitle')}</DialogTitle>
                              <DialogDescription>{t('confirmCancelDesc', { plan: plan?.name || '' })}</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t('afterCancelTitle')}</p>
                                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5">
                                  <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>{t('afterCancel1', { date: subscription?.current_period_end ? formatDate(subscription.current_period_end) : t('endOfBillingPeriod') })}</span>
                                  </li>
                                  <li className="flex items-start gap-2"><span className="mt-1">•</span><span>{t('afterCancel2')}</span></li>
                                  <li className="flex items-start gap-2"><span className="mt-1">•</span><span>{t('afterCancel3')}</span></li>
                                </ul>
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <Button variant="outline" onClick={() => setCancelStep(1)}>{t('back')}</Button>
                              <Button
                                variant="destructive"
                                disabled={isCancelling}
                                onClick={async () => {
                                  await handleCancel();
                                  setCancelDialogOpen(false);
                                  setCancelStep(1);
                                  setCancelReason('');
                                  setCancelFeedback('');
                                }}
                              >
                                {isCancelling ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('cancelling')}</>) : t('yesCancelAbo')}
                              </Button>
                            </DialogFooter>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoices - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>{t('invoicesTitle')}</CardTitle>
              <CardDescription>
                {t('invoicesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('noInvoicesYet')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('paymentMethod')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan?.slug === 'free' ? (
                <p className="text-sm text-muted-foreground">
                  {t('noPaymentNeeded')}
                </p>
              ) : subscription?.stripe_subscription_id ? (
                <>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{t('paymentActive')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('manageInPortal')}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleOpenPortal}
                    disabled={isOpeningPortal}
                  >
                    {isOpeningPortal ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Settings className="mr-2 h-4 w-4" />
                    )}
                    {t('openPortal')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('portalDesc')}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground">{t('noPaymentMethod')}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/seller/abo/upgrade">
                      {t('upgradeNow')}
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Upgrade CTA */}
          {plan?.slug !== 'business' && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{t('needMoreFeatures')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('upgradeCtaDesc')}
                </p>
                <Button asChild className="w-full">
                  <Link href="/seller/abo/upgrade">
                    {t('comparePlans')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{t('aboQuestions')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('supportHelp')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/kontakt">
                  {t('contactUs')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
