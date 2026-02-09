'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import {
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  LogIn,
  UserPlus,
  Building2,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { acceptTeamInvitation, getInvitationByToken } from '@/lib/actions/team';
import { useAuth } from '@/hooks/use-auth';

export default function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const t = useTranslations('auth.invitation');
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  const roleLabels: Record<string, { label: string; description: string }> = {
    admin: {
      label: t('roleAdmin'),
      description: t('roleAdminDesc'),
    },
    editor: {
      label: t('roleEditor'),
      description: t('roleEditorDesc'),
    },
    viewer: {
      label: t('roleViewer'),
      description: t('roleViewerDesc'),
    },
  };

  const [invitation, setInvitation] = useState<{
    email: string;
    companyName: string;
    role: string;
    isExpired: boolean;
    isAccepted: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await getInvitationByToken(token);
    
    if (result.success && result.data) {
      setInvitation(result.data);
    } else {
      setError(result.error || t('notFound'));
    }
    
    setIsLoading(false);
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/einladung/${token}` as any);
      return;
    }
    
    setIsAccepting(true);
    
    const result = await acceptTeamInvitation(token);
    
    if (result.success) {
      setSuccess(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 2000);
    } else {
      setError(result.error || t('acceptError'));
    }
    
    setIsAccepting(false);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('welcomeTeam')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('welcomeTeamDesc')}
            </p>
            <Button asChild>
              <Link href="/seller/dashboard">{t('toDashboard')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('invalid')}</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/">{t('backToHome')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const roleInfo = roleLabels[invitation.role] || {
    label: invitation.role,
    description: '',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('invitedTo')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Info */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{invitation.companyName}</p>
                <p className="text-sm text-muted-foreground">{t('onCmm24')}</p>
              </div>
            </div>
          </div>

          {/* Role Info */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('yourRole')}</span>
            </div>
            <Badge variant="secondary" className="mb-2">
              {roleInfo.label}
            </Badge>
            <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
          </div>

          {/* Status Messages */}
          {invitation.isExpired && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
              {t('expired')}
            </div>
          )}

          {invitation.isAccepted && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
              {t('alreadyAccepted')}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Email Match Warning */}
          {isAuthenticated && user?.email !== invitation.email && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
              {t.rich('emailMismatch', {
                currentEmail: user?.email || '',
                invitedEmail: invitation.email,
                bold: (chunks) => <strong>{chunks}</strong>,
              })}
            </div>
          )}

          {/* Actions */}
          {!invitation.isExpired && !invitation.isAccepted && (
            <div className="space-y-3">
              {isAuthenticated ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAccept}
                  disabled={isAccepting}
                >
                  {isAccepting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('accepting')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('accept')}
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => router.push(`/login?redirect=/einladung/${token}` as any)}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('loginAndAccept')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/registrieren?email=${encodeURIComponent(invitation.email)}&redirect=/einladung/${token}` as any)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('registerAndAccept')}
                  </Button>
                </>
              )}
            </div>
          )}

          {(invitation.isExpired || invitation.isAccepted) && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">{t('backToHome')}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
