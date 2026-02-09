import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Building2, MoveHorizontal, Maximize, Eye } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryPages } from '@/data/content/categories';

interface KategorienPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: KategorienPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('categoriesTitle'),
    description: t('categoriesDescription'),
    openGraph: {
      title: t('categoriesTitle'),
      description: t('categoriesDescription'),
      locale,
    },
  };
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  ArrowRightFromLine: MoveHorizontal,
  MoveHorizontal,
  Maximize,
  Eye,
};

export default async function KategorienPage({ params }: KategorienPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('categoriesPage');
  const tBreadcrumb = await getTranslations('breadcrumb');

  return (
    <main className="py-12 md:py-16">
      <div className="container-page">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">{tBreadcrumb('home')}</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">{tBreadcrumb('categories')}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {t('subtitle')}
          </p>
        </header>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoryPages.map((category) => {
            const IconComponent = iconMap[category.icon || 'Building2'] || Building2;
            
            return (
              <Link key={category.id} href={`/kategorien/${category.slug}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">
                        {t('offers', { count: category.listingCount })}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <span className="inline-flex items-center text-primary text-sm font-medium">
                      {t('showMachines')}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <section className="mt-16 bg-muted/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">{t('whichType')}</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p>
              {t('choosingIntro')}
            </p>
            <ul className="space-y-2 mt-4">
              <li>
                <strong>{t('factorSize')}</strong> {t('factorSizeDesc')}
              </li>
              <li>
                <strong>{t('factorAccess')}</strong> {t('factorAccessDesc')}
              </li>
              <li>
                <strong>{t('factorAccuracy')}</strong> {t('factorAccuracyDesc')}
              </li>
              <li>
                <strong>{t('factorType')}</strong> {t('factorTypeDesc')}
              </li>
              <li>
                <strong>{t('factorSurface')}</strong> {t('factorSurfaceDesc')}
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
