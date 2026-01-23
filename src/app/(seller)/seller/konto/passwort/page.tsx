'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Password strength calculator
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  if (score < 30) return { score, label: 'Sehr schwach', color: 'bg-red-500' };
  if (score < 50) return { score, label: 'Schwach', color: 'bg-orange-500' };
  if (score < 70) return { score, label: 'Mittel', color: 'bg-yellow-500' };
  if (score < 90) return { score, label: 'Stark', color: 'bg-green-500' };
  return { score: 100, label: 'Sehr stark', color: 'bg-green-600' };
}

export default function PasswortPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast.success('Passwort erfolgreich geändert');
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="container-page py-8 max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/seller/konto"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück zu Kontoeinstellungen
        </Link>
        <h1 className="text-2xl font-bold">Passwort ändern</h1>
        <p className="text-muted-foreground">
          Aktualisieren Sie Ihr Kontopasswort
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Passwort ändern
            </CardTitle>
            <CardDescription>
              Geben Sie Ihr aktuelles Passwort ein und wählen Sie ein neues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Passwortstärke</span>
                    <span className={cn(
                      'font-medium',
                      passwordStrength.score < 50 ? 'text-orange-500' : 'text-green-600'
                    )}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength.score}
                    className={cn('h-1.5', passwordStrength.color)}
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    'pr-10',
                    confirmPassword.length > 0 && !passwordsMatch && 'border-destructive'
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Die Passwörter stimmen nicht überein
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Requirements */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">Passwort-Anforderungen:</h3>
            <ul className="space-y-2 text-sm">
              {[
                { check: newPassword.length >= 8, text: 'Mindestens 8 Zeichen' },
                { check: /[A-Z]/.test(newPassword), text: 'Mindestens ein Großbuchstabe' },
                { check: /[a-z]/.test(newPassword), text: 'Mindestens ein Kleinbuchstabe' },
                { check: /[0-9]/.test(newPassword), text: 'Mindestens eine Zahl' },
              ].map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full flex items-center justify-center',
                      req.check
                        ? 'bg-green-100 text-green-600'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {req.check ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </div>
                  <span className={req.check ? 'text-green-600' : 'text-muted-foreground'}>
                    {req.text}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/seller/konto">Abbrechen</Link>
          </Button>
          <Button type="submit" disabled={!canSubmit || isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">◠</span>
                Wird geändert...
              </>
            ) : (
              'Passwort ändern'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
