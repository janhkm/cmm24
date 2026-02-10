import { Link } from '@/i18n/navigation';
import { ArrowRight, Target, Shield, Globe, Building2, Lightbulb } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { teamMembers, companyInfo } from '@/data/content/company';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    openGraph: {
      title: t('aboutTitle'),
      description: t('aboutDescription'),
    },
  };
}

export default async function UeberUnsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  const tn = await getTranslations({ locale, namespace: 'nav' });

  // JSON-LD for About Page
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'Organization',
      name: 'CMM24',
      description: t('description'),
      foundingDate: '2026',
      parentOrganization: {
        '@type': 'Organization',
        name: companyInfo.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: companyInfo.street,
          postalCode: companyInfo.postalCode,
          addressLocality: companyInfo.city,
          addressCountry: 'DE',
        },
      },
      founders: teamMembers.map((member) => ({
        '@type': 'Person',
        name: member.name,
        jobTitle: member.role,
      })),
    },
  };

  const values = [
    {
      icon: Target,
      title: t('valueTransparency'),
      description: t('valueTransparencyDesc'),
    },
    {
      icon: Lightbulb,
      title: t('valueExpertise'),
      description: t('valueExpertiseDesc'),
    },
    {
      icon: Shield,
      title: t('valueTrust'),
      description: t('valueTrustDesc'),
    },
    {
      icon: Globe,
      title: t('valueReach'),
      description: t('valueReachDesc'),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container-page">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                <Building2 className="h-4 w-4" />
                {t('subtitle')}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                {t('title')}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t('description')}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section - Wie alles begann */}
        <section className="py-16 md:py-24">
          <div className="container-page">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-6">{t('storyTitle')}</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>{t('storyP1')}</p>
                <p>{t('storyP2')}</p>
                <p>{t('storyP3')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-page">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-6">{t('missionTitle')}</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t('missionP1')}
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t('missionP2')}
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{t('missionBullet1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{t('missionBullet2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{t('missionBullet3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{t('missionBullet4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        

        {/* Values Section */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container-page">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('valuesTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('valuesSubtitle')}
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
       

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container-page text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {t('ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="mailto:support@cmm24.com">{t('ctaButton')}</a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
                <Link href="/faq">{tn('faq')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
