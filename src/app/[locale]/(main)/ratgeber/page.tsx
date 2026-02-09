import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Clock, User, ArrowRight, BookOpen, Scale, Wrench, TrendingUp } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { articles } from '@/data/content/articles';

interface RatgeberPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: RatgeberPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('guidesTitle'),
    description: t('guidesDescription'),
    openGraph: {
      title: t('guidesTitle'),
      description: t('guidesDescription'),
      locale,
    },
  };
}

const categoryIcons = {
  kaufratgeber: BookOpen,
  vergleich: Scale,
  technik: Wrench,
  markt: TrendingUp,
};

export default async function RatgeberPage({ params }: RatgeberPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('guidesPage');
  const tBreadcrumb = await getTranslations('breadcrumb');

  const categoryInfo: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; description: string }> = {
    kaufratgeber: {
      icon: BookOpen,
      label: t('categoryKaufratgeber'),
      description: t('categoryKaufratgeberDesc'),
    },
    vergleich: {
      icon: Scale,
      label: t('categoryVergleich'),
      description: t('categoryVergleichDesc'),
    },
    technik: {
      icon: Wrench,
      label: t('categoryTechnik'),
      description: t('categoryTechnikDesc'),
    },
    markt: {
      icon: TrendingUp,
      label: t('categoryMarkt'),
      description: t('categoryMarktDesc'),
    },
  };

  // Group articles by category
  const articlesByCategory = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  // Get featured article (first one)
  const featuredArticle = articles[0];

  return (
    <main className="py-12 md:py-16">
      <div className="container-page">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">{tBreadcrumb('home')}</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">{tBreadcrumb('guides')}</li>
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {Object.entries(categoryInfo).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <a 
                key={key} 
                href={`#${key}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{info.label}</span>
              </a>
            );
          })}
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <section className="mb-16">
            <Link href={`/ratgeber/${featuredArticle.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-[16/10] md:aspect-auto">
                    <Image
                      src={featuredArticle.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge>{t('recommended')}</Badge>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <Badge variant="secondary" className="w-fit mb-3">
                      {categoryInfo[featuredArticle.category as keyof typeof categoryInfo]?.label || featuredArticle.category}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {featuredArticle.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t('readingTime', { minutes: featuredArticle.readingTime })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </section>
        )}

        {/* Articles by Category */}
        {Object.entries(categoryInfo).map(([categoryKey, info]) => {
          const categoryArticles = articlesByCategory[categoryKey] || [];
          if (categoryArticles.length === 0) return null;

          const Icon = info.icon;

          return (
            <section key={categoryKey} id={categoryKey} className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{info.label}</h2>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryArticles.map((article) => (
                  <Link key={article.id} href={`/ratgeber/${article.slug}`}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      {article.image && (
                        <div className="relative aspect-[16/9]">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        </div>
                      )}
                      <CardHeader className={article.image ? 'pt-4' : ''}>
                        <CardTitle className="text-lg line-clamp-2">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{article.author.name}</span>
                          <span>{t('readingTimeShort', { minutes: article.readingTime })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA Section */}
        <section className="bg-muted/50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t('specificQuestion')}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('specificQuestionDesc')}
          </p>
          <Button asChild>
            <Link href="/glossar">
              {t('toGlossary')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
