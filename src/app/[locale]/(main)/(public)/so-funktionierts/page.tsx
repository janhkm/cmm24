import { Link } from '@/i18n/navigation';
import { 
  Search, 
  FileText, 
  MessageSquare, 
  Handshake,
  CheckCircle,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Building2,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('howItWorksTitle'),
    description: t('howItWorksDescription'),
    openGraph: {
      title: t('howItWorksTitle'),
      description: t('howItWorksDescription'),
    },
  };
}

export default async function SoFunktioniertPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'howItWorks' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const buyerSteps = [
    {
      icon: Search,
      title: t('buyerStep1Title'),
      description: t('buyerStep1Desc'),
    },
    {
      icon: FileText,
      title: t('buyerStep2Title'),
      description: t('buyerStep2Desc'),
    },
    {
      icon: MessageSquare,
      title: t('buyerStep3Title'),
      description: t('buyerStep3Desc'),
    },
    {
      icon: Handshake,
      title: t('buyerStep4Title'),
      description: t('buyerStep4Desc'),
    },
  ];

  const sellerSteps = [
    {
      icon: Building2,
      title: t('sellerStep1Title'),
      description: t('sellerStep1Desc'),
    },
    {
      icon: FileText,
      title: t('sellerStep2Title'),
      description: t('sellerStep2Desc'),
    },
    {
      icon: CheckCircle,
      title: t('sellerStep3Title'),
      description: t('sellerStep3Desc'),
    },
    {
      icon: MessageSquare,
      title: t('sellerStep4Title'),
      description: t('sellerStep4Desc'),
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: t('benefit1Title'),
      description: t('benefit1Desc'),
    },
    {
      icon: Clock,
      title: t('benefit2Title'),
      description: t('benefit2Desc'),
    },
    {
      icon: Users,
      title: t('benefit3Title'),
      description: t('benefit3Desc'),
    },
    {
      icon: CreditCard,
      title: t('benefit4Title'),
      description: t('benefit4Desc'),
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '0 €',
      period: tc('free'),
      listings: t('planFreeListings'),
      features: [t('planFreeFeature1'), t('planFreeFeature2'), t('planFreeFeature3')],
      cta: t('planFreeCta'),
      highlighted: false,
    },
    {
      name: 'Starter',
      price: '12,99 €',
      period: '/ ' + tc('monthly').toLowerCase(),
      listings: t('planStarterListings'),
      features: [t('planStarterFeature1'), t('planStarterFeature2'), t('planStarterFeature3'), t('planStarterFeature4')],
      cta: t('planStarterCta'),
      highlighted: true,
    },
    {
      name: 'Professional',
      price: '21,99 €',
      period: '/ ' + tc('monthly').toLowerCase(),
      listings: t('planProfessionalListings'),
      features: [t('planProfessionalFeature1'), t('planProfessionalFeature2'), t('planProfessionalFeature3')],
      cta: t('planProfessionalCta'),
      highlighted: false,
    },
    {
      name: 'Business',
      price: '34,99 €',
      period: '/ ' + tc('monthly').toLowerCase(),
      listings: t('planBusinessListings'),
      features: [t('planBusinessFeature1'), t('planBusinessFeature2'), t('planBusinessFeature3')],
      cta: t('planBusinessCta'),
      highlighted: false,
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">{t('breadcrumbHome')}</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{t('breadcrumb')}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              {t('forBuyers')}
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {t('buyersTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            {t('buyersDesc')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {buyerSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {index < buyerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%+1rem)] w-8 h-0.5 bg-border" />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Button size="lg" asChild>
              <Link href="/maschinen">
                {t('browseMachines')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Sellers Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              {t('forSellers')}
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {t('sellersTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            {t('sellersDesc')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sellerSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {index < sellerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%+1rem)] w-8 h-0.5 bg-border" />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Button size="lg" asChild>
              <Link href="/registrieren">
                {t('sellNow')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t('whyTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('whyDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t('pricingTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricingDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={plan.highlighted ? 'border-primary shadow-lg relative' : ''}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      {tc('popular')}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm font-medium text-primary mt-2">{plan.listings}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/registrieren">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {t('pricingNote')}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {t('ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/maschinen">{t('ctaBrowse')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/registrieren">{t('ctaSell')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
