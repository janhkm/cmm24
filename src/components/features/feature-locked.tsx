'use client';

import { Link } from '@/i18n/navigation';
import {
  Crown,
  CheckCircle,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export interface FeatureBenefit {
  title: string;
  description: string;
}

export interface FeatureLockedProps {
  /** Feature name displayed in the header */
  featureName: string;
  /** Icon to display */
  icon: LucideIcon;
  /** Main headline */
  headline: string;
  /** Subheadline / description */
  description: string;
  /** Who is this feature for? */
  targetAudience: string;
  /** List of benefits */
  benefits: FeatureBenefit[];
  /** Required plan to unlock */
  requiredPlan: 'starter' | 'business';
  /** Optional screenshot or illustration URL */
  screenshotUrl?: string;
  /** Optional testimonial */
  testimonial?: {
    quote: string;
    author: string;
    company: string;
  };
}

const planInfo = {
  starter: {
    name: 'Starter',
    price: '49€',
    launchPrice: '29€',
  },
  business: {
    name: 'Business',
    price: '149€',
    launchPrice: '89€',
  },
};

export function FeatureLocked({
  featureName,
  icon: Icon,
  headline,
  description,
  targetAudience,
  benefits,
  requiredPlan,
  screenshotUrl,
  testimonial,
}: FeatureLockedProps) {
  const t = useTranslations('featureLocked');
  const plan = planInfo[requiredPlan];

  return (
    <div className="p-6">
      {/* Header with Lock Badge */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{featureName}</h1>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                <Crown className="mr-1 h-3 w-3" />
                {plan.name}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('availableFrom', { plan: plan.name })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-3 space-y-8">
          {/* Hero Section */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardContent className="p-8">
              <div className="flex items-start gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary mt-1" />
                <span className="text-sm font-medium text-primary">{t('premiumFeature')}</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{headline}</h2>
              <p className="text-lg text-muted-foreground mb-6">{description}</p>
              
              {/* Target Audience */}
              <div className="rounded-lg bg-muted/50 p-4 mb-6">
                <p className="text-sm font-medium mb-1">{t('perfectFor')}</p>
                <p className="text-muted-foreground">{targetAudience}</p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/seller/abo/upgrade">
                    <Crown className="mr-2 h-4 w-4" />
                    {t('unlockNow', { plan: plan.name })}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="line-through">{plan.price}{t('perMonth')}</span>
                  <span className="font-semibold text-primary">{plan.launchPrice}{t('perMonth')}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {t('launchPrice')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Screenshot/Preview if provided */}
          {screenshotUrl && (
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                <img
                  src={screenshotUrl}
                  alt={t('previewAlt', { feature: featureName })}
                  className="w-full h-auto opacity-75"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <p className="text-sm text-muted-foreground">
                    {t('previewOf', { feature: featureName })}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Benefits Grid */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              {t('whatYouGet', { feature: featureName })}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonial if provided */}
          {testimonial && (
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <blockquote className="text-lg italic mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upgrade Card */}
          <Card className="border-primary bg-primary/5 sticky top-20">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Crown className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">
                  {t('upgradeTo', { plan: plan.name })}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('unlockFeatures', { feature: featureName })}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{featureName}</span>
                </div>
                {requiredPlan === 'starter' && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('starterFeature1')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('starterFeature2')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('starterFeature3')}</span>
                    </div>
                  </>
                )}
                {requiredPlan === 'business' && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('businessFeature1')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('businessFeature2')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('businessFeature3')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('businessFeature4')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{t('businessFeature5')}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary">
                  {plan.launchPrice}
                  <span className="text-base font-normal text-muted-foreground">{t('perMonth')}</span>
                </div>
                <p className="text-sm text-muted-foreground line-through">
                  {t('regularPrice', { price: plan.price })}
                </p>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href="/seller/abo/upgrade">
                  {t('upgradeNow')}
                </Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                {t('cancelAnytime')}
              </p>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-2">{t('questions')}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {t('teamHelp')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/kontakt">{t('contactUs')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
