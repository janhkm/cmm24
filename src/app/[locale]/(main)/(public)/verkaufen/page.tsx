import { Link } from '@/i18n/navigation';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Globe,
  Clock,
  UserPlus,
  PenLine,
  Inbox,
  XCircle,
  BadgeCheck,
  CreditCard,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('sellTitle'),
    description: t('sellDescription'),
    openGraph: {
      title: t('sellTitle'),
      description: t('sellDescription'),
    },
  };
}

export default async function VerkaufenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'sell' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const benefits = [
    {
      icon: CreditCard,
      title: t('benefit1Title'),
      description: t('benefit1Desc'),
    },
    {
      icon: Shield,
      title: t('benefit2Title'),
      description: t('benefit2Desc'),
    },
    {
      icon: Globe,
      title: t('benefit3Title'),
      description: t('benefit3Desc'),
    },
    {
      icon: Clock,
      title: t('benefit4Title'),
      description: t('benefit4Desc'),
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: PenLine,
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: Inbox,
      title: t('step3Title'),
      description: t('step3Desc'),
    },
  ];

  const comparisonRows = [
    {
      feature: t('comparisonFeature1'),
      us: t('comparisonUs1'),
      other: t('comparisonOther1'),
    },
    {
      feature: t('comparisonFeature2'),
      us: t('comparisonUs2'),
      other: t('comparisonOther2'),
    },
    {
      feature: t('comparisonFeature3'),
      us: t('comparisonUs3'),
      other: t('comparisonOther3'),
    },
    {
      feature: t('comparisonFeature4'),
      us: t('comparisonUs4'),
      other: t('comparisonOther4'),
    },
    {
      feature: t('comparisonFeature5'),
      us: t('comparisonUs5'),
      other: t('comparisonOther5'),
    },
  ];

  const faqs = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="container-page relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400 mb-6">
              <CheckCircle className="h-4 w-4" />
              {t('badge')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {t('description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/registrieren">
                  {t('ctaButton')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/so-funktionierts">{tn('howItWorks')}</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-48 h-48 bg-primary rounded-full blur-2xl" />
        </div>
      </section>

      {/* Warum kostenlos? */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              {t('highlightTitle')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('highlightDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t('stepsTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('stepsDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-border" />
                )}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                  <step.icon className="h-10 w-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/registrieren">
                {t('startFree')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t('comparisonTitle')}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-muted-foreground"></th>
                        <th className="p-4 font-semibold text-primary text-center">CMM24</th>
                        <th className="p-4 font-medium text-muted-foreground text-center">Andere</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, index) => (
                        <tr key={row.feature} className={index < comparisonRows.length - 1 ? 'border-b' : ''}>
                          <td className="p-4 font-medium text-sm">{row.feature}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <BadgeCheck className="h-4 w-4 text-green-600 shrink-0" />
                              <span className="font-medium text-green-700 dark:text-green-400">{row.us}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <XCircle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                              <span>{row.other}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t('faqTitle')}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              {t('faqMore').split('Alle FAQ ansehen')[0]}
              <Link href="/faq" className="text-primary hover:underline">{tn('faq')}</Link>
              {' '}{tc('or')}{' '}
              <a href="mailto:support@cmm24.com" className="text-primary hover:underline">support@cmm24.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('readyTitle')}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {t('readyDesc')}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/registrieren">
                {t('ctaButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm opacity-70 mt-4">
              {t('readyNote')}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
