'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2, Star, X, Minus, Infinity, Zap, Clock } from 'lucide-react';
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
import { plans } from '@/data/mock-data';
import { cn } from '@/lib/utils';

// Current subscription - in real app comes from context
const currentPlanSlug = 'starter';

// Launch offer active (first 100 customers or first 6 months)
const isLaunchOfferActive = true;

// Feature comparison data for 3 plans
const featureComparison = [
  { 
    category: 'Inserate', 
    features: [
      { name: 'Aktive Inserate', values: ['1', '5', '25'] },
      { name: 'Extra-Inserate buchbar', values: [false, false, '+7€/Stück'] },
      { name: 'Unbegrenzte Entwürfe', values: [true, true, true] },
      { name: 'Featured Listings/Monat', values: ['–', '1', '5'] },
      { name: 'Top-Platzierung in Suche', values: [false, false, true] },
    ]
  },
  { 
    category: 'Statistiken', 
    features: [
      { name: 'Aufrufe & Performance', values: [false, true, true] },
      { name: 'Export (CSV/PDF)', values: [false, true, true] },
    ]
  },
  { 
    category: 'Lead-Management', 
    features: [
      { name: 'Anfragen empfangen', values: [true, true, true] },
      { name: 'Lead-Verwaltung', values: [false, true, true] },
      { name: 'Lead-Pipeline (Kanban)', values: [false, false, true] },
      { name: 'In-App E-Mail-Composer', values: [false, true, true] },
      { name: 'Auto-Reply', values: [false, false, true] },
    ]
  },
  { 
    category: 'Produktivität', 
    features: [
      { name: 'Bulk-Aktionen', values: [false, false, true] },
      { name: 'Team-Mitglieder', values: ['1', '1', '10'] },
      { name: 'API-Zugang', values: [false, false, true] },
    ]
  },
  { 
    category: 'Support & Extras', 
    features: [
      { name: 'E-Mail-Support', values: ['Standard', '24h', '4h'] },
      { name: 'Verifiziert-Badge', values: [false, true, true] },
    ]
  },
];

// Helper to format price
const formatPrice = (cents: number) => {
  return (cents / 100).toFixed(0);
};

export default function UpgradePage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleUpgrade = async (planSlug: string) => {
    setSelectedPlan(planSlug);
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Would redirect to Stripe Checkout
    setIsLoading(false);
  };

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

  // Get price based on billing interval and launch offer
  const getPrice = (plan: typeof plans[0]) => {
    if (isLaunchOfferActive && plan.launchPriceMonthly) {
      return billingInterval === 'monthly' 
        ? plan.launchPriceMonthly 
        : Math.round((plan.launchPriceYearly || plan.priceYearly) / 12);
    }
    return billingInterval === 'monthly' 
      ? plan.priceMonthly 
      : Math.round(plan.priceYearly / 12);
  };

  const getRegularPrice = (plan: typeof plans[0]) => {
    return billingInterval === 'monthly' 
      ? plan.priceMonthly 
      : Math.round(plan.priceYearly / 12);
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
          <h1 className="text-2xl font-bold">Abo upgraden</h1>
          <p className="text-muted-foreground">
            Wählen Sie das passende Paket für Ihre Anforderungen.
          </p>
        </div>
      </div>

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
                  🚀 Early Adopter Angebot
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    Limitiert
                  </Badge>
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Sichere dir jetzt <strong>bis zu 40% Rabatt</strong> – für immer! 
                  Nur für die ersten 100 Kunden.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Noch 73 Plätze verfügbar</span>
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
          Monatlich
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
          Jährlich
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
            Spare 20%
          </Badge>
        </Label>
      </div>

      {/* Plans Grid - 3 columns */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => {
          const isCurrent = plan.slug === currentPlanSlug;
          const isDowngrade = index < currentPlanIndex;
          const isHighlighted = plan.highlighted;
          const price = getPrice(plan);
          const regularPrice = getRegularPrice(plan);
          const hasLaunchDiscount = isLaunchOfferActive && plan.launchPriceMonthly && price < regularPrice;
          const discountPercent = hasLaunchDiscount 
            ? Math.round((1 - price / regularPrice) * 100) 
            : 0;

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                isHighlighted && 'border-primary shadow-xl scale-[1.02]',
                isCurrent && 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
              )}
            >
              {/* Launch Discount Badge */}
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
                    Empfohlen
                  </Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Aktuell
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  {plan.priceMonthly === 0 ? (
                    <span className="text-4xl font-bold">Kostenlos</span>
                  ) : (
                    <div>
                      {hasLaunchDiscount && (
                        <div className="text-muted-foreground line-through text-lg mb-1">
                          {formatPrice(regularPrice)}€
                        </div>
                      )}
                      <span className="text-4xl font-bold text-primary">
                        {formatPrice(price)}€
                      </span>
                      <span className="text-muted-foreground">/Monat</span>
                    </div>
                  )}
                  {billingInterval === 'yearly' && plan.priceYearly > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {isLaunchOfferActive && plan.launchPriceYearly
                          ? formatPrice(plan.launchPriceYearly)
                          : formatPrice(plan.priceYearly)}€ pro Jahr
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="text-center text-sm font-semibold text-primary mb-4 pb-4 border-b">
                  {plan.listingLimit === 1
                    ? '1 aktives Inserat'
                    : `${plan.listingLimit} aktive Inserate`}
                  {plan.extraListingPriceMonthly && (
                    <span className="block text-xs font-normal text-muted-foreground mt-1">
                      + {formatPrice(plan.extraListingPriceMonthly)}€ pro weiteres Inserat
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.slice(0, 7).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button disabled className="w-full" variant="outline">
                    Aktuelles Paket
                  </Button>
                ) : isDowngrade ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/kontakt">Downgrade anfragen</Link>
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
                    {plan.priceMonthly === 0 ? 'Downgraden' : 'Jetzt upgraden'}
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
              💰 Bis zu 85% günstiger als der Wettbewerb
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">1 Inserat</p>
                <p className="text-lg line-through text-muted-foreground">69€</p>
                <p className="text-2xl font-bold text-green-600">0€</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">5 Inserate</p>
                <p className="text-lg line-through text-muted-foreground">~345€</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLaunchOfferActive ? '29€' : '49€'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">25 Inserate</p>
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
          {showComparison ? 'Feature-Vergleich ausblenden' : 'Alle Features im Detail vergleichen'}
        </Button>
      </div>

      {/* Feature Comparison Table */}
      {showComparison && (
        <div className="mt-8 overflow-x-auto">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Detaillierter Feature-Vergleich</CardTitle>
              <CardDescription>
                Alle Funktionen aller Pläne im direkten Vergleich
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Feature</TableHead>
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
                          {plan.priceMonthly === 0 
                            ? 'Kostenlos' 
                            : `${formatPrice(isLaunchOfferActive && plan.launchPriceMonthly ? plan.launchPriceMonthly : plan.priceMonthly)}€/Mo`
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
        <h2 className="text-xl font-bold mb-6 text-center">Häufige Fragen</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Was ist das Early Adopter Angebot?</h3>
              <p className="text-muted-foreground text-sm">
                Die ersten 100 Kunden erhalten bis zu 40% Rabatt auf den regulären Preis – 
                und zwar dauerhaft, solange das Abo aktiv bleibt. Diese Preise werden niemals erhöht.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Kann ich zusätzliche Inserate buchen?</h3>
              <p className="text-muted-foreground text-sm">
                Ja! Im Business-Plan können Sie beliebig viele zusätzliche Inserate für 7€/Monat 
                (5€ bei jährlicher Zahlung) pro Inserat hinzubuchen.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Warum seid ihr so viel günstiger?</h3>
              <p className="text-muted-foreground text-sm">
                Wir sind ein neues, schlankes Team ohne überdimensionierte Strukturen. 
                Unser Ziel ist es, den CMM-Gebrauchtmarkt zugänglicher zu machen – nicht maximalen Profit.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Kann ich jederzeit kündigen?</h3>
              <p className="text-muted-foreground text-sm">
                Ja, Sie können Ihr Abo jederzeit zum Ende des Abrechnungszeitraums kündigen. 
                Es gibt keine Mindestvertragslaufzeit.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
