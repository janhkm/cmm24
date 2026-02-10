'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Cookie, Settings2 } from 'lucide-react';
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
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = 'cmm24-cookie-consent';

export function CookieConsent() {
  const t = useTranslations('cookie');
  const tc = useTranslations('common');
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
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
    // Custom Event fuer andere Komponenten (z.B. ConsentGatedAdSense)
    window.dispatchEvent(new Event('cookie-consent-changed'));
  };

  const acceptAll = () => {
    savePreferences({ necessary: true, functional: true, analytics: true, marketing: true });
  };

  const acceptNecessary = () => {
    savePreferences({ necessary: true, functional: false, analytics: false, marketing: false });
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
                    {t('title')}
                  </h2>
                  <p id="cookie-banner-description" className="mt-1 text-sm text-muted-foreground">
                    {t('description')}{' '}
                    <Link href="/datenschutz" className="text-primary hover:underline">
                      {t('privacyPolicy')}
                    </Link>{' '}
                    &amp;{' '}
                    <Link href="/cookie-richtlinie" className="text-primary hover:underline">
                      {t('cookiePolicy')}
                    </Link>
                    .
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={acceptAll} className="flex-1 sm:flex-none">
                    {t('acceptAll')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={acceptNecessary}
                    className="flex-1 sm:flex-none"
                  >
                    {t('acceptNecessary')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowSettings(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    {t('settings')}
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
            <DialogTitle>{t('settingsTitle')}</DialogTitle>
            <DialogDescription>
              {t('settingsDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="necessary" className="text-base font-medium">
                  {t('necessary')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('necessaryDesc')}
                </p>
              </div>
              <Switch id="necessary" checked={true} disabled />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="functional" className="text-base font-medium">
                  {t('functional')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('functionalDesc')}
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
                  {t('analytics')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('analyticsDesc')}
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

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="marketing" className="text-base font-medium">
                  {t('marketing')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('marketingDesc')}
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              {tc('cancel')}
            </Button>
            <Button onClick={saveCustomPreferences}>
              {t('saveSettings')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
