'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type VerificationState = 'loading' | 'success' | 'error' | 'expired';

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [state, setState] = useState<VerificationState>('loading');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState('error');
        return;
      }

      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random success/failure for demo
      // In real app, this would call the API
      const isValid = token.length > 10;
      setState(isValid ? 'success' : 'expired');
    };

    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    setIsResending(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsResending(false);
    setResendSuccess(true);
  };

  // Loading state
  if (state === 'loading') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl">E-Mail wird bestätigt...</CardTitle>
          <CardDescription>
            Bitte warten Sie einen Moment.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">E-Mail bestätigt!</CardTitle>
          <CardDescription>
            Vielen Dank! Ihre E-Mail-Adresse wurde erfolgreich bestätigt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Sie können jetzt alle Funktionen von CMM24 nutzen.
          </p>
          <div className="flex flex-col gap-2">
            <Button className="w-full" asChild>
              <Link href="/seller/dashboard">Zum Dashboard</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/maschinen">Maschinen durchsuchen</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expired token state
  if (state === 'expired') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Link abgelaufen</CardTitle>
          <CardDescription>
            Der Bestätigungslink ist leider abgelaufen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resendSuccess ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-800">
                Ein neuer Bestätigungslink wurde an Ihre E-Mail-Adresse gesendet.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Bestätigungslinks sind aus Sicherheitsgründen nur 24 Stunden gültig.
                Fordern Sie einen neuen Link an.
              </p>
              <Button 
                className="w-full" 
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Neuen Link senden
                  </>
                )}
              </Button>
            </>
          )}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Zurück zum Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error state (no token)
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Ungültiger Link</CardTitle>
        <CardDescription>
          Der Bestätigungslink ist ungültig.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Bitte überprüfen Sie den Link in Ihrer E-Mail oder fordern Sie einen 
          neuen Bestätigungslink an.
        </p>
        <Button className="w-full" asChild>
          <Link href="/login">Zum Login</Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Probleme? <Link href="/kontakt" className="text-primary hover:underline">Kontaktieren Sie uns</Link>
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        <CardTitle className="text-2xl">Laden...</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function EmailBestätigenPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailVerificationContent />
    </Suspense>
  );
}
