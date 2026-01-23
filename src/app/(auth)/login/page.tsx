'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    // In real app: redirect to dashboard
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending magic link
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setMagicLinkSent(true);
  };

  return (
    <div className="w-full max-w-md mx-auto">
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Willkommen zurück</CardTitle>
        <CardDescription>
          Melden Sie sich an, um Ihre Inserate und Anfragen zu verwalten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Mit Passwort</TabsTrigger>
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          </TabsList>

          {/* Password Login */}
          <TabsContent value="password">
            <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@firma.de"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  <Link
                    href="/passwort-vergessen"
                    className="text-sm text-primary hover:underline"
                  >
                    Passwort vergessen?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird angemeldet...
                  </>
                ) : (
                  <>
                    Anmelden
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Magic Link Login */}
          <TabsContent value="magic-link">
            {magicLinkSent ? (
              <div className="text-center py-8">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">E-Mail gesendet!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Wir haben Ihnen einen Anmeldelink gesendet. Bitte prüfen Sie Ihr Postfach.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setMagicLinkSent(false)}
                >
                  Erneut senden
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicLinkLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="name@firma.de"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Wir senden Ihnen einen Link per E-Mail, mit dem Sie sich ohne Passwort anmelden können.
                </p>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Link wird gesendet...
                    </>
                  ) : (
                    <>
                      Magic Link senden
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{' '}
          <Link href="/registrieren" className="text-primary hover:underline font-medium">
            Jetzt registrieren
          </Link>
        </p>
      </CardContent>
    </Card>
    </div>
  );
}
