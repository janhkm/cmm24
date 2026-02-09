import { Link } from '@/i18n/navigation';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { getManufacturersWithCounts } from '@/lib/actions/listings';

interface HerstellerPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HerstellerPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('manufacturersTitle'),
    description: t('manufacturersDescription'),
    openGraph: {
      title: t('manufacturersTitle'),
      description: t('manufacturersDescription'),
      locale,
    },
  };
}

export default async function HerstellerPage({ params }: HerstellerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('manufacturersPage');
  const tBreadcrumb = await getTranslations('breadcrumb');

  const result = await getManufacturersWithCounts();
  const manufacturers = result.success ? result.data || [] : [];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {tBreadcrumb('home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{tBreadcrumb('manufacturers')}</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {manufacturers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {manufacturers.map((manufacturer) => (
              <Link key={manufacturer.id} href={`/hersteller/${manufacturer.slug}`}>
                <Card className="group h-full transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted overflow-hidden">
                        {manufacturer.logo_url ? (
                          <img 
                            src={manufacturer.logo_url} 
                            alt={manufacturer.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-primary">
                            {manufacturer.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h2 className="font-semibold group-hover:text-primary transition-colors">
                          {manufacturer.name}
                        </h2>
                        {manufacturer.country && (
                          <p className="text-sm text-muted-foreground">
                            {manufacturer.country}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-medium text-primary">
                          {manufacturer.listingCount} {t('offerCount', { count: manufacturer.listingCount })}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              {t('noManufacturers')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
