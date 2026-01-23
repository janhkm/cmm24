'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type CookiePreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
};

const COOKIE_CONSENT_KEY = 'cmm24-cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be changed
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
    });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-full duration-500"
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
      >
        <Card className="mx-auto max-w-4xl shadow-2xl border-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 id="cookie-banner-title" className="text-lg font-semibold">
                    🍪 Wir verwenden Cookies
                  </h2>
                  <p id="cookie-banner-description" className="mt-1 text-sm text-muted-foreground">
                    Wir nutzen Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                    Einige sind für den Betrieb der Website notwendig, andere helfen uns, die Website zu verbessern.
                    Mehr dazu in unserer{' '}
                    <Link href="/datenschutz" className="text-primary hover:underline">
                      Datenschutzerklärung
                    </Link>{' '}
                    und{' '}
                    <Link href="/cookie-richtlinie" className="text-primary hover:underline">
                      Cookie-Richtlinie
                    </Link>
                    .
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={acceptAll} className="flex-1 sm:flex-none">
                    Alle akzeptieren
                  </Button>
                  <Button
                    variant="outline"
                    onClick={acceptNecessary}
                    className="flex-1 sm:flex-none"
                  >
                    Nur notwendige
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowSettings(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Einstellungen
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cookie-Einstellungen</DialogTitle>
            <DialogDescription>
              Wählen Sie aus, welche Arten von Cookies Sie akzeptieren möchten.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="necessary" className="text-base font-medium">
                  Notwendige Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Diese Cookies sind für den Betrieb der Website unbedingt erforderlich 
                  (z.B. Session, Authentifizierung).
                </p>
              </div>
              <Switch
                id="necessary"
                checked={true}
                disabled
                aria-describedby="necessary-description"
              />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="functional" className="text-base font-medium">
                  Funktionale Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ermöglichen erweiterte Funktionen wie Spracheinstellungen 
                  und Vergleichsliste.
                </p>
              </div>
              <Switch
                id="functional"
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, functional: checked }))
                }
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="analytics" className="text-base font-medium">
                  Analyse-Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Helfen uns zu verstehen, wie Besucher die Website nutzen 
                  (anonymisierte Statistiken).
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Abbrechen
            </Button>
            <Button onClick={saveCustomPreferences}>
              Einstellungen speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
