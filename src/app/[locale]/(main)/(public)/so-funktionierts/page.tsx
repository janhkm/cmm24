import { Link } from '@/i18n/navigation';
import { 
  Search, 
  Handshake,
  ArrowRight,
  Building2,
  Send,
  Eye,
  UserPlus,
  PenLine,
  ShieldCheck,
  Inbox,
  ShoppingCart,
  CreditCard,
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

  const buyerSteps = [
    {
      icon: Search,
      title: t('buyerStep1Title'),
      description: t('buyerStep1Desc'),
    },
    {
      icon: Eye,
      title: t('buyerStep2Title'),
      description: t('buyerStep2Desc'),
    },
    {
      icon: Send,
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
      icon: UserPlus,
      title: t('sellerStep1Title'),
      description: t('sellerStep1Desc'),
    },
    {
      icon: PenLine,
      title: t('sellerStep2Title'),
      description: t('sellerStep2Desc'),
    },
    {
      icon: ShieldCheck,
      title: t('sellerStep3Title'),
      description: t('sellerStep3Desc'),
    },
    {
      icon: Inbox,
      title: t('sellerStep4Title'),
      description: t('sellerStep4Desc'),
    },
  ];

  const summaryItems = [
    {
      icon: ShoppingCart,
      title: t('summaryBuyer'),
      description: t('summaryBuyerDesc'),
    },
    {
      icon: Building2,
      title: t('summarySeller'),
      description: t('summarySellerDesc'),
    },
    {
      icon: CreditCard,
      title: t('summaryFree'),
      description: t('summaryFreeDesc'),
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

      {/* Intro / Das Prinzip */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              {t('introTitle')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              {t('introP1')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('introP2')}
            </p>
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section className="py-16 md:py-24 bg-muted/30">
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
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
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

      {/* Summary Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t('summaryTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {summaryItems.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
