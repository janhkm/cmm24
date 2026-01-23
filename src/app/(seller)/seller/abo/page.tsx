'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle,
  Calendar,
  ArrowRight,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { plans } from '@/data/mock-data';

// Mock subscription data (Early Adopter pricing)
const subscription = {
  planSlug: 'starter',
  status: 'active' as const,
  billingInterval: 'monthly' as const,
  currentPeriodStart: '2025-12-21',
  currentPeriodEnd: '2026-01-21',
  cancelAtPeriodEnd: false,
  listingsUsed: 3,
  listingsLimit: 5,
  isEarlyAdopter: true, // Locked in Early Adopter pricing
};

// Mock invoices (Early Adopter price: 29€)
const invoices = [
  {
    id: '1',
    date: '2025-12-21',
    amount: 2900,
    status: 'paid',
    pdfUrl: '#',
  },
  {
    id: '2',
    date: '2025-11-21',
    amount: 2900,
    status: 'paid',
    pdfUrl: '#',
  },
  {
    id: '3',
    date: '2025-10-21',
    amount: 2900,
    status: 'paid',
    pdfUrl: '#',
  },
];

const currentPlan = plans.find((p) => p.slug === subscription.planSlug)!;

export default function AboPage() {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsCancelling(false);
  };

  const usagePercent = (subscription.listingsUsed / subscription.listingsLimit) * 100;
  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Abonnement</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Abo und sehen Sie Ihre Rechnungen ein.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>{currentPlan.name}</span>
                    <Badge variant="secondary">Aktuell</Badge>
                  </CardTitle>
                  <CardDescription>
                    {subscription.billingInterval === 'monthly' ? 'Monatlich' : 'Jährlich'} abgerechnet
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {(currentPlan.priceMonthly / 100).toLocaleString('de-DE')} €
                  </div>
                  <div className="text-sm text-muted-foreground">pro Monat</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inserat-Nutzung</span>
                  <span className="text-sm text-muted-foreground">
                    {subscription.listingsUsed} von {subscription.listingsLimit}
                  </span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>

              {/* Billing Period */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Abrechnungszeitraum</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString('de-DE')} bis{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('de-DE')}
                    <span className="ml-2">({daysRemaining} Tage verbleibend)</span>
                  </p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Enthaltene Funktionen:</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/seller/abo/upgrade">
                    Upgrade
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {!subscription.cancelAtPeriodEnd ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Abo kündigen</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Abo kündigen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ihr Abo wird zum Ende des aktuellen Abrechnungszeitraums 
                          ({new Date(subscription.currentPeriodEnd).toLocaleDateString('de-DE')}) 
                          beendet. Sie können bis dahin alle Funktionen weiter nutzen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Ja, kündigen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Kündigung zum {new Date(subscription.currentPeriodEnd).toLocaleDateString('de-DE')} vorgemerkt
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Rechnungen</CardTitle>
              <CardDescription>
                Ihre letzten Rechnungen zum Download.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {new Date(invoice.date).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>
                        {(invoice.amount / 100).toLocaleString('de-DE')} €
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Bezahlt
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.pdfUrl} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zahlungsmethode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CreditCard className="h-5 w-5" />
                <div>
                  <p className="font-medium">Visa •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Läuft ab 12/2027</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Zahlungsmethode ändern
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Mehr Inserate benötigt?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Mit einem Upgrade erhalten Sie mehr aktive Inserate und zusätzliche Funktionen.
              </p>
              <Button asChild className="w-full">
                <Link href="/seller/abo/upgrade">
                  Pakete vergleichen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Fragen zum Abo?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unser Support-Team hilft Ihnen gerne weiter.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/kontakt">
                  Kontakt aufnehmen
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
