import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('faqTitle'),
    description: t('faqDescription'),
    openGraph: {
      title: t('faqTitle'),
      description: t('faqDescription'),
    },
  };
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'faq' });

  const faqCategories = [
    {
      title: t('forBuyers'),
      items: [
        { question: t('buyer1Q'), answer: t('buyer1A') },
        { question: t('buyer2Q'), answer: t('buyer2A') },
        { question: t('buyer3Q'), answer: t('buyer3A') },
        { question: t('buyer4Q'), answer: t('buyer4A') },
      ],
    },
    {
      title: t('forSellers'),
      items: [
        { question: t('seller1Q'), answer: t('seller1A') },
        { question: t('seller2Q'), answer: t('seller2A') },
        { question: t('seller3Q'), answer: t('seller3A') },
        { question: t('seller4Q'), answer: t('seller4A') },
      ],
    },
    {
      title: t('technical'),
      items: [
        { question: t('tech1Q'), answer: t('tech1A') },
        { question: t('tech2Q'), answer: t('tech2A') },
        { question: t('tech3Q'), answer: t('tech3A') },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {t('breadcrumbHome')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{t('breadcrumb')}</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold md:text-4xl">{t('title')}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category) => (
              <Card key={category.title}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="mt-12 bg-muted/50">
            <CardContent className="py-8 text-center">
              <h2 className="text-xl font-semibold">{t('ctaTitle')}</h2>
              <p className="mt-2 text-muted-foreground">
                {t('ctaDesc')}
              </p>
              <Button asChild className="mt-4">
                <Link href="/kontakt">{t('ctaButton')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
