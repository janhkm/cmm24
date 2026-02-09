'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Download,
  FileText,
  Calendar,
  CreditCard,
  ExternalLink,
  Search,
  Loader2,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoices, createCustomerPortalSession, type StripeInvoice } from '@/lib/stripe/actions';
import { toast } from 'sonner';

export default function RechnungenPage() {
  const t = useTranslations('sellerInvoices');
  const locale = useLocale();

  const formatPrice = (cents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPeriod = (start: Date, end: Date) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return new Date(start).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    paid: { label: t('statusPaid'), variant: 'default' },
    open: { label: t('statusOpen'), variant: 'secondary' },
    draft: { label: t('statusDraft'), variant: 'outline' },
    void: { label: t('statusVoided'), variant: 'outline' },
    uncollectible: { label: t('statusUncollectible'), variant: 'destructive' },
  };

  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInvoices = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await getInvoices();
    
    if (result.success && result.data) {
      setInvoices(result.data);
    } else {
      setError(result.error || t('errorLoading'));
    }
    
    setIsLoading(false);
  };

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    
    const result = await createCustomerPortalSession();
    
    if (result.success && result.data) {
      window.location.href = result.data.url;
    } else {
      toast.error(result.error || t('errorPortal'));
      setIsOpeningPortal(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      !searchQuery ||
      invoice.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={handleOpenPortal} disabled={isOpeningPortal}>
          {isOpeningPortal ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          {t('managePayments')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('totalPaid')}</CardDescription>
            <CardTitle className="text-2xl">{formatPrice(totalPaid)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('invoiceCount')}</CardDescription>
            <CardTitle className="text-2xl">{invoices.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('lastPayment')}</CardDescription>
            <CardTitle className="text-2xl">
              {invoices.length > 0 ? formatDate(invoices[0].date) : '-'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('invoiceOverview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="paid">{t('statusPaid')}</SelectItem>
                <SelectItem value="open">{t('statusOpen')}</SelectItem>
                <SelectItem value="void">{t('statusVoided')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">{t('noInvoices')}</h3>
              <p className="text-muted-foreground">
                {invoices.length === 0
                  ? t('noInvoicesYet')
                  : t('noInvoicesFilter')}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('invoiceNumber')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('period')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {invoice.number || invoice.id.slice(-8).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(invoice.date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatPeriod(invoice.periodStart, invoice.periodEnd)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[invoice.status]?.variant || 'outline'}>
                          {statusLabels[invoice.status]?.label || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.hostedUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {invoice.pdfUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('changePaymentTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t('changePaymentDesc')}
              </p>
              <Button variant="outline" size="sm" onClick={handleOpenPortal} disabled={isOpeningPortal}>
                {isOpeningPortal ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                {t('openPortal')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
