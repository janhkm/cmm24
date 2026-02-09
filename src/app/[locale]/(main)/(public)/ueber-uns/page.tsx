import { Link } from '@/i18n/navigation';
import { ArrowRight, Target, Users, Shield, Globe } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { teamMembers } from '@/data/content/company';
import { stats } from '@/data/constants';

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
      icon: Users,
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
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container-page">
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

        {/* Mission Section */}
        <section className="py-16 md:py-24">
          <div className="container-page">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">{t('missionTitle')}</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('missionP1')}
                </p>
                <p className="text-lg text-muted-foreground mb-6">
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
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted/50 py-16 md:py-24">
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
        <section className="py-16 md:py-24">
          <div className="container-page">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('teamTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('teamSubtitle')}
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-primary mb-2">{member.role}</p>
                        <p className="text-sm text-muted-foreground">{member.bio}</p>
                        {member.linkedin && (
                          <a 
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-2 inline-block"
                          >
                            LinkedIn →
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {t('ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/kontakt">{t('ctaButton')}</Link>
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
