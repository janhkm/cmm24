'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  ShoppingCart,
  Package,
  Sparkles,
  CreditCard,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { signUp, resendVerificationEmail } from '@/lib/actions/auth';
import { getAllPlans } from '@/lib/actions/dashboard';
import { createCheckoutForNewUser } from '@/lib/stripe/actions';
import type { Database } from '@/types/supabase';

type Plan = Database['public']['Tables']['plans']['Row'];

// Onboarding Steps - Plan-Auswahl AUSKOMMENTIERT (alles ist jetzt Free)
type Step = 'welcome' | 'profile' | /* 'plan' | */ 'success';

// Form Data
interface OnboardingData {
  // Step 1: Welcome
  userIntent: 'buy' | 'sell' | '';
  machineCount: '1' | '2-3' | '4-7' | '8+' | '';
  
  // Step 2: Profile
  name: string;
  company: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  
  // AUSKOMMENTIERT: Step 3: Plan (alles ist jetzt Free)
  selectedPlan: string;
  billingInterval: 'monthly' | 'yearly';
  
  // Agreements
  acceptedTerms: boolean;
  acceptedMarketing: boolean;
}

const initialData: OnboardingData = {
  userIntent: '',
  machineCount: '',
  name: '',
  company: '',
  email: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  selectedPlan: 'free',
  billingInterval: 'yearly',
  acceptedTerms: false,
  acceptedMarketing: false,
};

// AUSKOMMENTIERT: Plan-Schritt entfernt (alles ist jetzt Free)
// const steps: Step[] = ['welcome', 'profile', 'plan', 'success'];
const steps: Step[] = ['welcome', 'profile', 'success'];

const stepProgress: Record<Step, number> = {
  welcome: 33,
  profile: 66,
  // plan: 75,  // AUSKOMMENTIERT
  success: 100,
};

// Check if launch offer is active (early adopter pricing)
const isLaunchOfferActive = true; // Set to false when launch is over

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth.register');
  const tc = useTranslations('common');

  const stepTitles: Record<Step, string> = {
    welcome: t('title'),
    profile: t('stepAbout'),
    // plan: t('stepPlan'),  // AUSKOMMENTIERT
    success: t('stepDone'),
  };

  const [step, setStep] = useState<Step>('welcome');
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Load plans from database
  useEffect(() => {
    const loadPlans = async () => {
      setPlansLoading(true);
      const result = await getAllPlans();
      if (result.success && result.data) {
        setPlans(result.data);
      }
      setPlansLoading(false);
    };
    loadPlans();
  }, []);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete clearedErrors[key as keyof OnboardingData];
    });
    setErrors(clearedErrors);
  };

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof OnboardingData, string>> = {};

    switch (step) {
      case 'welcome':
        if (!data.userIntent) newErrors.userIntent = t('selectOption');
        if (data.userIntent === 'sell' && !data.machineCount) {
          newErrors.machineCount = t('selectOption');
        }
        break;

      case 'profile':
        if (!data.name.trim()) newErrors.name = t('nameRequired');
        if (data.userIntent === 'sell' && !data.company.trim()) newErrors.company = t('companyRequired');
        if (!data.email.trim()) newErrors.email = t('emailRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
          newErrors.email = t('invalidEmail');
        if (!data.password) newErrors.password = t('passwordRequired');
        else if (data.password.length < 8)
          newErrors.password = t('minChars');
        if (!data.passwordConfirm) newErrors.passwordConfirm = t('confirmPasswordRequired');
        else if (data.password !== data.passwordConfirm)
          newErrors.passwordConfirm = t('passwordsDontMatch');
        if (!data.acceptedTerms) newErrors.acceptedTerms = t('acceptTermsRequired');
        break;

      // AUSKOMMENTIERT: Plan-Validierung (alles ist jetzt Free)
      // case 'plan':
      //   if (!data.selectedPlan) newErrors.selectedPlan = t('selectPlan');
      //   break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    switch (step) {
      case 'welcome':
        setStep('profile');
        break;
      case 'profile':
        // ALLES IST JETZT FREE - direkt registrieren, kein Plan-Schritt
        handleRegistration();
        break;
      // AUSKOMMENTIERT: Plan-Schritt
      // case 'plan':
      //   handleRegistration();
      //   break;
    }
  };

  const prevStep = () => {
    switch (step) {
      case 'profile':
        setStep('welcome');
        break;
      // AUSKOMMENTIERT: Plan-Schritt
      // case 'plan':
      //   setStep('profile');
      //   break;
    }
  };

  const handleRegistration = async () => {
    setIsLoading(true);
    setGeneralError(null);

    // First, register the user
    const result = await signUp({
      email: data.email,
      password: data.password,
      fullName: data.name,
      companyName: data.company,
      phone: data.phone || undefined,
      acceptedTerms: data.acceptedTerms,
      acceptedMarketing: data.acceptedMarketing,
      userIntent: data.userIntent || undefined,
      machineCount: data.machineCount || undefined,
    });

    if (!result.success) {
      setIsLoading(false);
      if (result.error?.includes('E-Mail') || result.error?.includes('email')) {
        setErrors({ email: result.error });
        setStep('profile');
      } else {
        setGeneralError(result.error || t('errorOccurred'));
      }
      return;
    }

    // Get account data from registration result
    const registrationData = result.data as Record<string, unknown> | undefined;
    const finalAccountId = (registrationData?.accountId || registrationData?.account_id || null) as string | null;

    console.log('[Registrierung] signUp result.data:', JSON.stringify(registrationData));
    console.log('[Registrierung] finalAccountId:', finalAccountId);
    console.log('[Registrierung] selectedPlan:', data.selectedPlan, 'billingInterval:', data.billingInterval);

    // If free plan, show success
    if (data.selectedPlan === 'free') {
      setIsLoading(false);
      setStep('success');
      return;
    }

    // For paid plans, redirect to Stripe checkout
    const selectedPlanData = plans.find((p) => p.slug === data.selectedPlan);
    console.log('[Registrierung] selectedPlanData:', selectedPlanData?.slug, 'monthly:', selectedPlanData?.stripe_price_id_monthly, 'yearly:', selectedPlanData?.stripe_price_id_yearly);
    
    if (!selectedPlanData) {
      console.error('[Registrierung] Plan nicht gefunden:', data.selectedPlan);
      setIsLoading(false);
      setStep('success');
      return;
    }

    const priceId = data.billingInterval === 'yearly' 
      ? selectedPlanData.stripe_price_id_yearly 
      : selectedPlanData.stripe_price_id_monthly;

    console.log('[Registrierung] priceId:', priceId);

    if (!priceId || !priceId.startsWith('price_')) {
      console.error('[Registrierung] Stripe price ID nicht konfiguriert fuer Plan:', data.selectedPlan, '-> priceId:', priceId);
      setGeneralError(t('stripeNotConfigured'));
      setIsLoading(false);
      setStep('success');
      return;
    }

    // Check if we have the account ID from registration
    if (!finalAccountId) {
      console.error('[Registrierung] Keine Account-ID von Registrierung erhalten:', registrationData);
      setGeneralError(t('accountCreateError'));
      setIsLoading(false);
      setStep('success');
      return;
    }

    console.log('[Registrierung] Starte Stripe Checkout mit:', { accountId: finalAccountId, priceId, planSlug: data.selectedPlan });

    // Create Stripe checkout session for new user (no auth required)
    const checkoutResult = await createCheckoutForNewUser({
      accountId: finalAccountId,
      email: data.email,
      userName: data.name,
      priceId,
      planSlug: data.selectedPlan,
    });

    console.log('[Registrierung] Stripe Checkout Ergebnis:', JSON.stringify(checkoutResult));

    if (checkoutResult.success && checkoutResult.data?.url) {
      // Redirect to Stripe checkout
      window.location.href = checkoutResult.data.url;
    } else {
      console.error('[Registrierung] Stripe checkout fehlgeschlagen:', checkoutResult.error);
      setGeneralError(t('paymentError', { error: checkoutResult.error || 'Unknown error' }));
      setIsLoading(false);
      setStep('success');
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    const result = await resendVerificationEmail();
    setIsResending(false);
    
    if (!result.success) {
      setGeneralError(result.error || t('emailSendError'));
    }
  };

  const selectedPlanData = plans.find((p) => p.slug === data.selectedPlan);

  // Helper to get price for display
  const getPlanPrice = (plan: Plan, interval: 'monthly' | 'yearly'): number => {
    if (interval === 'yearly') {
      if (isLaunchOfferActive && plan.launch_price_yearly && plan.launch_price_yearly > 0) {
        return plan.launch_price_yearly / 12; // Monthly equivalent
      }
      return plan.price_yearly / 12;
    }
    if (isLaunchOfferActive && plan.launch_price_monthly && plan.launch_price_monthly > 0) {
      return plan.launch_price_monthly;
    }
    return plan.price_monthly;
  };

  const getRegularPrice = (plan: Plan, interval: 'monthly' | 'yearly'): number => {
    if (interval === 'yearly') {
      return plan.price_yearly / 12;
    }
    return plan.price_monthly;
  };

  const currentStep = steps.indexOf(step) + 1;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step !== 'success' && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{stepTitles[step]}</span>
            <span className="text-muted-foreground">
              {t('stepOf', { step: currentStep, total: 4 })}
            </span>
          </div>
          <Progress value={stepProgress[step]} className="h-2" />
        </div>
      )}

      {/* Step: Welcome */}
      {step === 'welcome' && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('welcomeTitle')}</CardTitle>
            <CardDescription className="text-base">
              {t('welcomeDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* User Intent */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                {t('whatToDo')}
              </Label>
              <RadioGroup
                value={data.userIntent}
                onValueChange={(value) => updateData({ userIntent: value as OnboardingData['userIntent'] })}
                className="grid gap-3"
              >
                <Label
                  htmlFor="intent-sell"
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all',
                    data.userIntent === 'sell' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value="sell" id="intent-sell" />
                  <div className="flex-1">
                    <div className="font-medium">{t('wantToSell')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('wantToSellDesc')}
                    </div>
                  </div>
                  <Package className="h-5 w-5 text-muted-foreground" />
                </Label>
                <Label
                  htmlFor="intent-buy"
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all',
                    data.userIntent === 'buy' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value="buy" id="intent-buy" />
                  <div className="flex-1">
                    <div className="font-medium">{t('wantToBuy')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('wantToBuyDesc')}
                    </div>
                  </div>
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </Label>
{/* "Beides" entfernt - Kaeufer koennen spaeter Verkaeufer werden */}
              </RadioGroup>
              {errors.userIntent && (
                <p className="text-sm text-destructive">{errors.userIntent}</p>
              )}
            </div>

            {/* Machine Count - Only show for sellers */}
            {data.userIntent === 'sell' && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  {t('howMany')}
                </Label>
                <RadioGroup
                  value={data.machineCount}
                  onValueChange={(value) => updateData({ machineCount: value as OnboardingData['machineCount'] })}
                  className="grid grid-cols-2 gap-3"
                >
                  {[
                    { value: '1', label: t('oneMachine') },
                    { value: '2-3', label: t('fewMachines') },
                    { value: '4-7', label: t('severalMachines') },
                    { value: '8+', label: t('manyMachines') },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`count-${option.value}`}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-all',
                        data.machineCount === option.value && 'border-primary bg-primary/5'
                      )}
                    >
                      <RadioGroupItem value={option.value} id={`count-${option.value}`} />
                      <span>{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
                {errors.machineCount && (
                  <p className="text-sm text-destructive">{errors.machineCount}</p>
                )}
              </div>
            )}

            {/* For buyers only - skip machine count */}
            {data.userIntent === 'buy' && (
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('buyerFree')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('buyerFreeDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={nextStep} className="w-full" size="lg">
              {tc('next')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Profile */}
      {step === 'profile' && (
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{t('stepAbout')}</CardTitle>
            <CardDescription>
              {t('createAccount')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('yourName')} *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('namePlaceholder')}
                    className={cn('pl-10', errors.name && 'border-destructive')}
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">
                  {t('companyName')} {data.userIntent === 'sell' ? '*' : <span className="text-xs text-muted-foreground font-normal">({tc('optional')})</span>}
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    placeholder={t('companyPlaceholder')}
                    className={cn('pl-10', errors.company && 'border-destructive')}
                    value={data.company}
                    onChange={(e) => updateData({ company: e.target.value })}
                  />
                </div>
                {errors.company && <p className="text-sm text-destructive">{errors.company}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')} *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className={cn('pl-10', errors.email && 'border-destructive')}
                  value={data.email}
                  onChange={(e) => updateData({ email: e.target.value })}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')} *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordHint')}
                  className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                  value={data.password}
                  onChange={(e) => updateData({ password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              {/* Password Strength Indicator */}
              {data.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = 
                        (data.password.length >= 8 ? 1 : 0) +
                        (/[A-Z]/.test(data.password) ? 1 : 0) +
                        (/[0-9]/.test(data.password) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(data.password) ? 1 : 0);
                      return (
                        <div
                          key={level}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-colors',
                            level <= strength
                              ? strength <= 1 ? 'bg-red-500'
                                : strength === 2 ? 'bg-orange-500'
                                : strength === 3 ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-muted'
                          )}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {t('passwordTip')}
                  </p>
                </div>
              )}
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t('confirmPassword')} *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className={cn('pl-10 pr-10', errors.passwordConfirm && 'border-destructive')}
                  value={data.passwordConfirm}
                  onChange={(e) => updateData({ passwordConfirm: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.passwordConfirm && <p className="text-sm text-destructive">{errors.passwordConfirm}</p>}
              {data.passwordConfirm && data.password === data.passwordConfirm && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> {t('passwordsMatch')}
                </p>
              )}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneLabel')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={data.phone}
                onChange={(e) => updateData({ phone: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                {t('phoneHint')}
              </p>
            </div>

            <Separator />

            {/* Terms */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={data.acceptedTerms}
                  onCheckedChange={(checked) => updateData({ acceptedTerms: checked as boolean })}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                  {t.rich('acceptTerms', {
                    agb: (chunks) => <Link href="/agb" className="text-primary hover:underline">{chunks}</Link>,
                    datenschutz: (chunks) => <Link href="/datenschutz" className="text-primary hover:underline">{chunks}</Link>,
                  })} *
                </label>
              </div>
              {errors.acceptedTerms && (
                <p className="text-sm text-destructive">{errors.acceptedTerms}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={data.acceptedMarketing}
                  onCheckedChange={(checked) => updateData({ acceptedMarketing: checked as boolean })}
                />
                <label htmlFor="marketing" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                  {t('acceptNewsletter')}
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {tc('back')}
              </Button>
              <Button onClick={nextStep} className="flex-1">
                {tc('next')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {t('alreadyRegistered')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('loginNow')}
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* AUSKOMMENTIERT: Step: Plan Selection (alles ist jetzt Free) */}
      {false && (
        <div className="space-y-3">
          {/* Header + Launch Banner Combined */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t('choosePlan')}</h2>
            {data.userIntent === 'sell' && isLaunchOfferActive && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  🚀 {t('earlyAdopter')}
                </span>
                <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                  {tc('limited')}
                </Badge>
              </div>
            )}
          </div>

          {/* Billing Toggle - More Prominent */}
          {data.userIntent === 'sell' && (
            <div className="flex items-center justify-center gap-3 py-2 px-4 bg-muted/50 rounded-lg">
              <span className={cn(
                'text-sm transition-colors',
                data.billingInterval === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'
              )}>
                {tc('monthly')}
              </span>
              <button
                onClick={() => updateData({ billingInterval: data.billingInterval === 'monthly' ? 'yearly' : 'monthly' })}
                className={cn(
                  'relative h-6 w-12 rounded-full transition-colors',
                  data.billingInterval === 'yearly' ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              >
                <span className={cn(
                  'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform',
                  data.billingInterval === 'yearly' ? 'left-7' : 'left-1'
                )} />
              </button>
              <span className={cn(
                'text-sm transition-colors',
                data.billingInterval === 'yearly' ? 'font-semibold text-foreground' : 'text-muted-foreground'
              )}>
                {tc('yearly')}
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 text-[10px]">
                  {t('discount')}
                </Badge>
              </span>
            </div>
          )}

          {/* Loading State */}
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Plan Cards - Super Compact */}
              <div className="grid gap-2 grid-cols-3">
                {plans.map((plan) => {
                  const isSelected = data.selectedPlan === plan.slug;
                  const price = getPlanPrice(plan, data.billingInterval);
                  const regularPrice = getRegularPrice(plan, data.billingInterval);
                  const hasDiscount = isLaunchOfferActive && 
                    ((data.billingInterval === 'monthly' && plan.launch_price_monthly && plan.launch_price_monthly < plan.price_monthly) ||
                     (data.billingInterval === 'yearly' && plan.launch_price_yearly && plan.launch_price_yearly < plan.price_yearly));

                  return (
                    <div
                      key={plan.id}
                      onClick={() => updateData({ selectedPlan: plan.slug })}
                      className={cn(
                        'relative rounded-lg border-2 p-3 cursor-pointer transition-all text-center',
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                        plan.slug === 'starter' && 'ring-1 ring-primary/30'
                      )}
                    >
                      {plan.slug === 'starter' && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-[9px] px-1.5 py-0">
                          {tc('popular')}
                        </Badge>
                      )}
                      
                      <p className="font-semibold text-sm">{plan.name}</p>
                      
                      <div className="my-1">
                        {hasDiscount && (
                          <span className="text-xs text-muted-foreground line-through mr-1">
                            {regularPrice.toFixed(0)}€
                          </span>
                        )}
                        <span className="text-2xl font-bold text-primary">{price.toFixed(0)}€</span>
                        <span className="text-[10px] text-muted-foreground">/Mo</span>
                      </div>
                      
                      <p className="text-[10px] text-muted-foreground mb-2">
                        {plan.listing_limit === -1 ? tc('unlimited') : plan.listing_limit} {plan.listing_limit === 1 ? 'Inserat' : 'Inserate'}
                      </p>
                      
                      <div className={cn(
                        'py-1 rounded text-[10px] font-medium',
                        isSelected ? 'bg-primary text-white' : 'bg-muted'
                      )}>
                        {isSelected ? '✓' : tc('select')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feature Comparison Matrix */}
              <div className="border rounded-lg overflow-hidden text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-1.5 px-2 font-medium">{tc('features')}</th>
                      <th className="text-center py-1.5 px-1 font-medium w-16">Free</th>
                      <th className="text-center py-1.5 px-1 font-medium w-16">Starter</th>
                      <th className="text-center py-1.5 px-1 font-medium w-16 bg-primary/10">Business</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-1 px-2">Inserate</td>
                      <td className="text-center">1</td>
                      <td className="text-center">5</td>
                      <td className="text-center bg-primary/5 font-medium">25</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">Statistiken</td>
                      <td className="text-center text-muted-foreground">—</td>
                      <td className="text-center text-green-600">✓</td>
                      <td className="text-center bg-primary/5 text-green-600">✓</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">E-Mail-Composer</td>
                      <td className="text-center text-muted-foreground">—</td>
                      <td className="text-center text-green-600">✓</td>
                      <td className="text-center bg-primary/5 text-green-600">✓</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">Nano-CRM mit Lead-Pipeline</td>
                      <td className="text-center text-muted-foreground">—</td>
                      <td className="text-center text-muted-foreground">—</td>
                      <td className="text-center bg-primary/5 text-green-600">✓</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">Kontakte</td>
                      <td className="text-center text-muted-foreground">—</td>
                      <td className="text-center text-muted-foreground">—</td>
                      <td className="text-center bg-primary/5 text-green-600">✓</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">Auto-Reply</td>
                      <td className="text-center text-muted-foreground">—</td>
                      <td className="text-center text-muted-foreground">—</td>
                      <td className="text-center bg-primary/5 text-green-600">✓</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">Featured/Monat</td>
                      <td className="text-center text-muted-foreground">0</td>
                      <td className="text-center">1</td>
                      <td className="text-center bg-primary/5 font-medium">5</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">Support</td>
                      <td className="text-center text-muted-foreground text-[10px]">Email</td>
                      <td className="text-center text-[10px]">24h</td>
                      <td className="text-center bg-primary/5 text-[10px] font-medium">4h</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Compact Footer */}
              <p className="text-center text-[10px] text-muted-foreground">
                💰 {t('noBinding')}
              </p>
            </>
          )}

          {errors.selectedPlan && (
            <p className="text-center text-sm text-destructive">{errors.selectedPlan}</p>
          )}

          {generalError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-center">
              <p className="text-sm text-destructive">{generalError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tc('back')}
            </Button>
            <Button onClick={nextStep} className="flex-1" disabled={isLoading || plansLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tc('processing')}
                </>
              ) : data.selectedPlan === 'free' ? (
                <>
                  {t('freeStart')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  {t('continueToPay')}
                  <CreditCard className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {t('successTitle')}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t('successDesc')}
              </p>
            </div>

            {/* Email Verification Notice */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20 p-4 text-left">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    {t('confirmEmail')}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t.rich('confirmEmailDesc', {
                      email: data.email,
                      bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Info - Different message for Free vs Paid */}
            <div className="rounded-lg bg-muted/50 p-4 text-left">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  {data.selectedPlan === 'free' ? (
                    <>
                      <p className="font-medium">{t('freePlanActive')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('freePlanActiveDesc')}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        {t('planSelected', { plan: selectedPlanData?.name || 'Bezahlter' })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('planSelectedDesc')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {data.userIntent === 'sell' ? (
                <>
                  <Button size="lg" className="w-full" onClick={() => router.push('/seller/inserate/neu')}>
                    {t('createFirstListing')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/seller/dashboard')}>
                    {t('goToDashboard')}
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="w-full" onClick={() => router.push('/maschinen')}>
                    <Search className="mr-2 h-4 w-4" />
                    {t('browseMachines')}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
                    {t('goToBuyerDashboard')}
                  </Button>
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {t('noEmailReceived')}{' '}
              <button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? tc('sending') : t('resendLink')}
              </button>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
