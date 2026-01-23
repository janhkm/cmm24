'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Check,
  Info,
  AlertCircle,
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
import { plans } from '@/data/mock-data';

// Onboarding Steps
type Step = 'welcome' | 'profile' | 'plan' | 'checkout' | 'success';

// Form Data
interface OnboardingData {
  // Step 1: Welcome
  userIntent: 'buy' | 'sell' | 'both' | '';
  machineCount: '1' | '2-3' | '4-7' | '8+' | '';
  
  // Step 2: Profile
  name: string;
  company: string;
  email: string;
  password: string;
  phone: string;
  
  // Step 3: Plan
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
  phone: '',
  selectedPlan: 'free',
  billingInterval: 'yearly',
  acceptedTerms: false,
  acceptedMarketing: false,
};

const stepInfo: Record<Step, { title: string; progress: number }> = {
  welcome: { title: 'Willkommen', progress: 20 },
  profile: { title: 'Über Sie', progress: 40 },
  plan: { title: 'Plan wählen', progress: 60 },
  checkout: { title: 'Checkout', progress: 80 },
  success: { title: 'Fertig!', progress: 100 },
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});

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
        if (!data.userIntent) newErrors.userIntent = 'Bitte wählen Sie eine Option';
        if (!data.machineCount) newErrors.machineCount = 'Bitte wählen Sie eine Option';
        break;

      case 'profile':
        if (!data.name.trim()) newErrors.name = 'Name ist erforderlich';
        if (!data.company.trim()) newErrors.company = 'Firmenname ist erforderlich';
        if (!data.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
          newErrors.email = 'Ungültige E-Mail-Adresse';
        if (!data.password) newErrors.password = 'Passwort ist erforderlich';
        else if (data.password.length < 8)
          newErrors.password = 'Mindestens 8 Zeichen erforderlich';
        if (!data.acceptedTerms) newErrors.acceptedTerms = 'Bitte akzeptieren Sie die AGB';
        break;

      case 'plan':
        if (!data.selectedPlan) newErrors.selectedPlan = 'Bitte wählen Sie einen Plan';
        break;
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
        setStep('plan');
        break;
      case 'plan':
        if (data.selectedPlan === 'free') {
          // Free plan: Skip checkout, go to success
          handleFreeRegistration();
        } else {
          setStep('checkout');
        }
        break;
      case 'checkout':
        handlePaidRegistration();
        break;
    }
  };

  const prevStep = () => {
    switch (step) {
      case 'profile':
        setStep('welcome');
        break;
      case 'plan':
        setStep('profile');
        break;
      case 'checkout':
        setStep('plan');
        break;
    }
  };

  const handleFreeRegistration = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('success');
  };

  const handlePaidRegistration = async () => {
    setIsLoading(true);
    // Simulate Stripe checkout
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setStep('success');
  };

  const selectedPlanData = plans.find((p) => p.slug === data.selectedPlan);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step !== 'success' && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{stepInfo[step].title}</span>
            <span className="text-muted-foreground">
              Schritt {Object.keys(stepInfo).indexOf(step) + 1} von 5
            </span>
          </div>
          <Progress value={stepInfo[step].progress} className="h-2" />
        </div>
      )}

      {/* Step: Welcome */}
      {step === 'welcome' && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Willkommen bei CMM24!</CardTitle>
            <CardDescription className="text-base">
              Erzählen Sie uns ein wenig über sich, damit wir Sie optimal unterstützen können.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* User Intent */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Was möchten Sie auf CMM24 tun?
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
                    <div className="font-medium">Messmaschinen verkaufen</div>
                    <div className="text-sm text-muted-foreground">
                      Ich möchte gebrauchte Koordinatenmessmaschinen anbieten
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
                    <div className="font-medium">Messmaschinen kaufen</div>
                    <div className="text-sm text-muted-foreground">
                      Ich suche gebrauchte Koordinatenmessmaschinen
                    </div>
                  </div>
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </Label>
                <Label
                  htmlFor="intent-both"
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all',
                    data.userIntent === 'both' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value="both" id="intent-both" />
                  <div className="flex-1">
                    <div className="font-medium">Beides</div>
                    <div className="text-sm text-muted-foreground">
                      Ich möchte kaufen und verkaufen
                    </div>
                  </div>
                </Label>
              </RadioGroup>
              {errors.userIntent && (
                <p className="text-sm text-destructive">{errors.userIntent}</p>
              )}
            </div>

            {/* Machine Count - Only show for sellers */}
            {(data.userIntent === 'sell' || data.userIntent === 'both') && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Wie viele Maschinen möchten Sie verkaufen?
                </Label>
                <RadioGroup
                  value={data.machineCount}
                  onValueChange={(value) => updateData({ machineCount: value as OnboardingData['machineCount'] })}
                  className="grid grid-cols-2 gap-3"
                >
                  {[
                    { value: '1', label: '1 Maschine' },
                    { value: '2-3', label: '2-3 Maschinen' },
                    { value: '4-7', label: '4-7 Maschinen' },
                    { value: '8+', label: '8+ Maschinen' },
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
                    <p className="font-medium">Als Käufer kostenlos</p>
                    <p className="text-sm text-muted-foreground">
                      Suchen, vergleichen und anfragen – komplett kostenlos und ohne Registrierung möglich.
                      Mit einem Konto können Sie Favoriten speichern und Anfragen verwalten.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={nextStep} className="w-full" size="lg">
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Profile */}
      {step === 'profile' && (
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Über Sie</CardTitle>
            <CardDescription>
              Erstellen Sie Ihr persönliches Konto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Ihr Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Max Mustermann"
                    className={cn('pl-10', errors.name && 'border-destructive')}
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Firmenname *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Musterfirma GmbH"
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
              <Label htmlFor="email">E-Mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@firma.de"
                  className={cn('pl-10', errors.email && 'border-destructive')}
                  value={data.email}
                  onChange={(e) => updateData({ email: e.target.value })}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Passwort *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  className={cn('pl-10', errors.password && 'border-destructive')}
                  value={data.password}
                  onChange={(e) => updateData({ password: e.target.value })}
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+49 123 456789"
                value={data.phone}
                onChange={(e) => updateData({ phone: e.target.value })}
              />
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
                  Ich akzeptiere die{' '}
                  <Link href="/agb" className="text-primary hover:underline">AGB</Link>{' '}
                  und{' '}
                  <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link> *
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
                  Ich möchte gelegentlich über neue Features und Angebote informiert werden
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Bereits registriert?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Jetzt anmelden
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step: Plan Selection */}
      {step === 'plan' && (
        <div className="space-y-3">
          {/* Header + Launch Banner Combined */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Wählen Sie Ihren Plan</h2>
            {(data.userIntent === 'sell' || data.userIntent === 'both') && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  🚀 Early Adopter -58%
                </span>
                <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                  73 Plätze
                </Badge>
              </div>
            )}
          </div>

          {/* Billing Toggle - Inline */}
          {(data.userIntent === 'sell' || data.userIntent === 'both') && (
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className={data.billingInterval === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
                Monatlich
              </span>
              <button
                onClick={() => updateData({ billingInterval: data.billingInterval === 'monthly' ? 'yearly' : 'monthly' })}
                className={cn(
                  'relative h-4 w-8 rounded-full transition-colors',
                  data.billingInterval === 'yearly' ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform',
                  data.billingInterval === 'yearly' ? 'left-4' : 'left-0.5'
                )} />
              </button>
              <span className={data.billingInterval === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
                Jährlich <span className="text-green-600">-20%</span>
              </span>
            </div>
          )}

          {/* Plan Cards - Super Compact */}
          <div className="grid gap-2 grid-cols-3">
            {plans.map((plan) => {
              const isSelected = data.selectedPlan === plan.slug;
              const regularPrice = (data.billingInterval === 'yearly' ? plan.priceYearly / 12 : plan.priceMonthly) / 100;
              const launchPrice = (data.billingInterval === 'yearly' 
                ? (plan.launchPriceYearly || plan.priceYearly) / 12 
                : (plan.launchPriceMonthly || plan.priceMonthly)) / 100;
              const hasDiscount = plan.launchPriceMonthly && plan.launchPriceMonthly < plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  onClick={() => updateData({ selectedPlan: plan.slug })}
                  className={cn(
                    'relative rounded-lg border-2 p-3 cursor-pointer transition-all text-center',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                    plan.highlighted && 'ring-1 ring-primary/30'
                  )}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-[9px] px-1.5 py-0">
                      Beliebt
                    </Badge>
                  )}
                  
                  <p className="font-semibold text-sm">{plan.name}</p>
                  
                  <div className="my-1">
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through mr-1">
                        {regularPrice.toFixed(0)}€
                      </span>
                    )}
                    <span className="text-2xl font-bold text-primary">{launchPrice.toFixed(0)}€</span>
                    <span className="text-[10px] text-muted-foreground">/Mo</span>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground mb-2">
                    {plan.listingLimit} {plan.listingLimit === 1 ? 'Inserat' : 'Inserate'}
                  </p>
                  
                  <div className={cn(
                    'py-1 rounded text-[10px] font-medium',
                    isSelected ? 'bg-primary text-white' : 'bg-muted'
                  )}>
                    {isSelected ? '✓' : 'Wählen'}
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
                  <th className="text-left py-1.5 px-2 font-medium">Features</th>
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
                  <td className="py-1 px-2">Lead-Pipeline</td>
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
            💰 Bis zu 92% günstiger als Wettbewerb • Keine Vertragsbindung
          </p>

          {errors.selectedPlan && (
            <p className="text-center text-sm text-destructive">{errors.selectedPlan}</p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={nextStep} className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : data.selectedPlan === 'free' ? (
                <>
                  Kostenlos starten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Weiter zur Zahlung
                  <CreditCard className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Checkout (for paid plans) */}
      {step === 'checkout' && selectedPlanData && (
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Checkout</CardTitle>
            <CardDescription>
              Schließen Sie Ihre Registrierung mit {selectedPlanData.name} ab
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Order Summary */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">{selectedPlanData.name} Plan</span>
                <span>
                  {data.billingInterval === 'yearly'
                    ? `${(selectedPlanData.priceYearly / 100).toFixed(0)}€/Jahr`
                    : `${(selectedPlanData.priceMonthly / 100).toFixed(0)}€/Monat`}
                </span>
              </div>
              {data.billingInterval === 'yearly' && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Ersparnis gegenüber monatlich</span>
                  <span className="text-green-600">
                    -{((selectedPlanData.priceMonthly * 12 - selectedPlanData.priceYearly) / 100).toFixed(0)}€
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Gesamt</span>
                <span>
                  {data.billingInterval === 'yearly'
                    ? `${(selectedPlanData.priceYearly / 100).toFixed(0)}€`
                    : `${(selectedPlanData.priceMonthly / 100).toFixed(0)}€`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                zzgl. MwSt. · Jederzeit kündbar
              </p>
            </div>

            {/* Simulated Stripe Checkout */}
            <div className="rounded-lg border p-6 bg-muted/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-[#635BFF]">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <p className="font-medium">Sichere Zahlung mit Stripe</p>
                  <p className="text-sm text-muted-foreground">
                    Kreditkarte, SEPA-Lastschrift, PayPal
                  </p>
                </div>
              </div>

              {/* Simulated Card Input */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Kartennummer</Label>
                  <Input placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Ablaufdatum</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Dies ist eine Demo. In der Produktion werden Sie zu Stripe weitergeleitet.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button onClick={nextStep} className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zahlung wird verarbeitet...
                  </>
                ) : (
                  <>
                    Jetzt bezahlen
                    <CreditCard className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
                {data.selectedPlan === 'free'
                  ? 'Willkommen bei CMM24!'
                  : 'Zahlung erfolgreich!'}
              </h2>
              <p className="text-muted-foreground mt-2">
                Ihr Konto wurde erfolgreich erstellt.
              </p>
            </div>

            {/* Email Verification Notice */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20 p-4 text-left">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Bitte bestätigen Sie Ihre E-Mail-Adresse
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Wir haben eine Bestätigungsmail an <strong>{data.email}</strong> gesendet.
                    Klicken Sie auf den Link in der E-Mail, um alle Funktionen freizuschalten.
                  </p>
                </div>
              </div>
            </div>

            {data.selectedPlan !== 'free' && (
              <div className="rounded-lg bg-muted/50 p-4 text-left">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {plans.find((p) => p.slug === data.selectedPlan)?.name} Plan aktiviert
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sie können jetzt bis zu {plans.find((p) => p.slug === data.selectedPlan)?.listingLimit} Inserate erstellen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button size="lg" className="w-full" onClick={() => router.push('/seller/inserate/neu')}>
                Erstes Inserat erstellen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/seller/dashboard')}>
                Zum Dashboard
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Keine E-Mail erhalten?{' '}
              <button className="text-primary hover:underline">
                Erneut senden
              </button>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
