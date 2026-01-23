import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Wartungsarbeiten | CMM24',
  description: 'CMM24 befindet sich derzeit in Wartung. Wir sind in Kürze zurück.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <span className="text-2xl font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-2xl font-bold">CMM24</span>
            </Link>
          </div>

          {/* Maintenance Icon */}
          <div className="mb-8 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Wrench className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            Wartungsarbeiten
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Wir führen gerade geplante Wartungsarbeiten durch, um CMM24 noch besser 
            für Sie zu machen. Bitte haben Sie etwas Geduld – wir sind bald wieder da!
          </p>

          {/* Estimated time */}
          <div className="inline-flex items-center gap-2 bg-background border rounded-lg px-4 py-2 mb-8">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Voraussichtlich bis: <strong>21.01.2026, 18:00 Uhr</strong>
            </span>
          </div>

          {/* Contact */}
          <div className="bg-background border rounded-lg p-6">
            <h2 className="font-semibold mb-2">Dringende Anfragen?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Für dringende Anliegen erreichen Sie uns per E-Mail:
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:support@cmm24.de">
                <Mail className="mr-2 h-4 w-4" />
                support@cmm24.de
              </a>
            </Button>
          </div>

          {/* Social links or status page could go here */}
          <p className="text-xs text-muted-foreground mt-8">
            Vielen Dank für Ihr Verständnis!
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CMM24. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
