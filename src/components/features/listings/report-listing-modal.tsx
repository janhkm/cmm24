'use client';

import { useState } from 'react';
import { Flag, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createReport } from '@/lib/actions/reports';

interface ReportListingModalProps {
  listingId: string;
  listingTitle: string;
}

const REPORT_REASONS = [
  { value: 'fake', label: 'Falsche / irreführende Angaben' },
  { value: 'spam', label: 'Spam oder Betrug' },
  { value: 'duplicate', label: 'Duplikat / doppeltes Inserat' },
  { value: 'inappropriate', label: 'Unangemessener Inhalt' },
  { value: 'other', label: 'Sonstiges' },
] as const;

export function ReportListingModal({ listingId, listingTitle }: ReportListingModalProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setReason('');
    setDescription('');
    setEmail('');
    setAcceptedPrivacy(false);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Bitte wählen Sie einen Grund aus.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }
    if (!acceptedPrivacy) {
      toast.error('Bitte akzeptieren Sie die Datenschutzerklärung.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReport({
        listingId,
        reporterEmail: email.trim(),
        reason,
        description: description.trim() || undefined,
        acceptedPrivacy,
      });

      if (result.success) {
        setSuccess(true);
        toast.success('Meldung wurde gesendet.');
      } else {
        toast.error(result.error || 'Fehler beim Senden der Meldung.');
      }
    } catch {
      toast.error('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          <Flag className="mr-2 h-4 w-4" />
          Inserat melden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Inserat melden</DialogTitle>
          <DialogDescription>
            Melden Sie &quot;{listingTitle}&quot;, wenn es gegen unsere Richtlinien verstößt.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Vielen Dank für Ihre Meldung</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Wir werden die Meldung prüfen und bei Bedarf Maßnahmen ergreifen.
            </p>
            <Button onClick={() => setOpen(false)}>Schließen</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Grund */}
            <div className="space-y-2">
              <Label htmlFor="report-reason">Grund der Meldung *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Bitte wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Beschreibung */}
            <div className="space-y-2">
              <Label htmlFor="report-description">Beschreibung</Label>
              <Textarea
                id="report-description"
                placeholder="Bitte beschreiben Sie das Problem genauer (optional)..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                disabled={isSubmitting}
              />
            </div>

            {/* E-Mail */}
            <div className="space-y-2">
              <Label htmlFor="report-email">Ihre E-Mail-Adresse *</Label>
              <Input
                id="report-email"
                type="email"
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Wird nur für Rückfragen zu dieser Meldung verwendet.
              </p>
            </div>

            {/* Datenschutz-Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="report-privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                disabled={isSubmitting}
              />
              <Label htmlFor="report-privacy" className="text-sm leading-snug font-normal">
                Ich akzeptiere die{' '}
                <a href="/datenschutz" target="_blank" className="text-primary hover:underline">
                  Datenschutzerklärung
                </a>{' '}
                und stimme der Verarbeitung meiner Daten zur Bearbeitung dieser Meldung zu.
              </Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Flag className="mr-2 h-4 w-4" />
                    Meldung absenden
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
