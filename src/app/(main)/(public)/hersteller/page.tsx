import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { manufacturers } from '@/data/mock-data';

export default function HerstellerPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Startseite
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Hersteller</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Hersteller</h1>
          <p className="mt-2 text-muted-foreground">
            Entdecken Sie Maschinen aller führenden CMM-Hersteller
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {manufacturers.map((manufacturer) => (
            <Link key={manufacturer.id} href={`/hersteller/${manufacturer.slug}`}>
              <Card className="group h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                      <span className="text-2xl font-bold text-primary">
                        {manufacturer.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold group-hover:text-primary transition-colors">
                        {manufacturer.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {manufacturer.country}
                      </p>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {manufacturer.listingCount} Angebote
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
