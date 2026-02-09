import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, User, Calendar, Tag, ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { articles } from '@/data/content/articles';

interface RatgeberDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Generate static params for all articles
export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Generate metadata dynamically
export async function generateMetadata({ params }: RatgeberDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'guidesPage' });
  const article = articles.find((a) => a.slug === slug);
  
  if (!article) {
    return {
      title: t('notFoundTitle'),
    };
  }

  return {
    title: t('articleTitle', { title: article.title }),
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      locale,
    },
  };
}

export default async function RatgeberDetailPage({ params }: RatgeberDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('guidesPage');
  const tBreadcrumb = await getTranslations('breadcrumb');

  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  // Get related articles (same category, excluding current)
  const relatedArticles = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  // Category label mapping
  const categoryLabels: Record<string, string> = {
    kaufratgeber: t('categoryKaufratgeber'),
    vergleich: t('categoryVergleich'),
    technik: t('categoryTechnik'),
    markt: t('categoryMarkt'),
  };

  // JSON-LD for Article
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CMM24',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cmm24.de/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://cmm24.de/ratgeber/${article.slug}`,
    },
  };

  // Format date locale-aware
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main className="py-8 md:py-12">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">{tBreadcrumb('home')}</Link></li>
              <li>/</li>
              <li><Link href="/ratgeber" className="hover:text-foreground">{tBreadcrumb('guides')}</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium truncate max-w-[200px]">{article.title}</li>
            </ol>
          </nav>

          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/ratgeber">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToAll')}
            </Link>
          </Button>

          <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <Badge variant="secondary" className="mb-4">
                {categoryLabels[article.category] || article.category}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {article.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.author.name}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('readingTime', { minutes: article.readingTime })}
                </span>
              </div>
            </header>

            {/* Featured Image */}
            {article.image && (
              <div className="relative aspect-[16/9] mb-8 rounded-xl overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary">
              {/* Render markdown content */}
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Author Box */}
            <div className="mt-8 p-6 bg-muted/50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                  {article.author.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold">{article.author.name}</p>
                  <p className="text-sm text-muted-foreground">{article.author.role}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
              <h3 className="text-xl font-bold mb-2">{t('findMachine')}</h3>
              <p className="opacity-90 mb-4">
                {t('findMachineDesc')}
              </p>
              <Button variant="secondary" asChild>
                <Link href="/maschinen">
                  {t('discoverMachines')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">{t('relatedArticles')}</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link key={related.id} href={`/ratgeber/${related.slug}`}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base line-clamp-2">
                          {related.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {related.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

// Simple markdown to HTML converter (basic implementation)
function renderMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    // Tables (basic)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean);
      if (cells.some(cell => cell.trim().match(/^[-:]+$/))) {
        return ''; // Skip separator row
      }
      const tag = cells.length > 0 ? 'td' : 'th';
      return `<tr>${cells.map(cell => `<${tag}>${cell.trim()}</${tag}>`).join('')}</tr>`;
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br />');
}
