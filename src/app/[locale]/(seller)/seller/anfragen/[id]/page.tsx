'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { EmailComposer } from '@/components/features/seller';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { toast } from 'sonner';
import {
  getInquiry,
  updateInquiryStatus,
  updateInquiryNotes,
  markInquiryAsRead,
} from '@/lib/actions/inquiries';

type InquiryStatus = 'new' | 'contacted' | 'offer_sent' | 'won' | 'lost';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: InquiryStatus | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  read_at: string | null;
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
  } | null;
}

export default function InquiryDetailPage() {
  const params = useParams();
  const t = useTranslations('sellerInquiries');
  const locale = useLocale();
  const { profile, isLoading: authLoading } = useSellerAuth();
  const inquiryId = params.id as string;

  const statusConfig: Record<string, { label: string; color: string; icon: typeof MessageSquare }> = {
    new: { label: t('statusNew'), color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
    contacted: { label: t('statusContacted'), color: 'bg-yellow-100 text-yellow-800', icon: Phone },
    offer_sent: { label: t('statusOfferSent'), color: 'bg-purple-100 text-purple-800', icon: FileText },
    won: { label: t('statusWon'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
    lost: { label: t('statusLost'), color: 'bg-gray-100 text-gray-500', icon: XCircle },
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<InquiryStatus>('new');
  const [copied, setCopied] = useState<string | null>(null);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getInquiry(inquiryId);
        if (result.success && result.data) {
          const data = result.data as unknown as Inquiry;
          setInquiry(data);
          setNotes(data.notes || '');
          setStatus(data.status || 'new');
          
          if (!data.read_at) {
            await markInquiryAsRead(inquiryId);
          }
        } else {
          toast.error(result.error || t('inquiryNotFound'));
        }
      } catch (error) {
        console.error('Error loading inquiry:', error);
        toast.error(t('errorLoadingInquiry'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading) {
      loadData();
    }
  }, [inquiryId, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const result = await updateInquiryNotes(inquiryId, notes);
      if (result.success) {
        setInquiry(prev => prev ? { ...prev, notes } : null);
        toast.success(t('notesSaved'));
      } else {
        toast.error(result.error || t('errorSaving'));
      }
    } catch {
      toast.error(t('errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    setStatus(newStatus);
    setIsSaving(true);
    try {
      const result = await updateInquiryStatus(inquiryId, newStatus);
      if (result.success) {
        setInquiry(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(t('statusUpdated'));
      } else {
        toast.error(result.error || t('errorUpdating'));
        setStatus(inquiry?.status || 'new');
      }
    } catch {
      toast.error(t('errorUpdating'));
      setStatus(inquiry?.status || 'new');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading || authLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('inquiryNotFound')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('inquiryNotFoundDesc')}
        </p>
        <Button asChild>
          <Link href="/seller/anfragen">{t('backToInquiries')}</Link>
        </Button>
      </div>
    );
  }

  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/seller/anfragen">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('inquiryFrom', { name: inquiry.name })}</h1>
            <p className="text-muted-foreground">
              {inquiry.company && `${inquiry.company} • `}
              {inquiry.created_at && new Date(inquiry.created_at).toLocaleDateString(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <Badge className={statusInfo.color}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusInfo.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('message')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{inquiry.message || t('noMessage')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Listing Info */}
          {inquiry.listing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('inquiredListing')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{inquiry.listing.title}</h3>
                    {inquiry.listing.price && (
                      <p className="text-lg font-bold text-primary">
                        {inquiry.listing.price.toLocaleString(locale)} €
                      </p>
                    )}
                    <Button variant="link" className="px-0 h-auto" asChild>
                      <Link href={`/maschinen/${inquiry.listing.slug}`} target="_blank">
                        {t('viewListing')}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('internalNotes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={4}
              />
              <Button onClick={handleSaveNotes} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t('saveNotes')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('contactDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">{t('email')}</p>
                  <p className="font-medium truncate">{inquiry.email}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(inquiry.email, 'email')}
                >
                  {copied === 'email' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {inquiry.phone && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{t('phone')}</p>
                    <p className="font-medium">{inquiry.phone}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(inquiry.phone!, 'phone')}
                  >
                    {copied === 'phone' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {inquiry.company && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{t('company')}</p>
                    <p className="font-medium">{inquiry.company}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => setIsEmailComposerOpen(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('emailWithTemplate')}
                </Button>
                {inquiry.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${inquiry.phone}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${inquiry.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('openInEmailClient')}
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('changeStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={status} onValueChange={(v) => handleStatusChange(v as InquiryStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-xs text-muted-foreground">
                {inquiry.created_at && (
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t('received')}: {new Date(inquiry.created_at).toLocaleString(locale)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange('contacted')}
                disabled={status === 'contacted'}
              >
                <Phone className="mr-2 h-4 w-4" />
                {t('markContacted')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange('offer_sent')}
                disabled={status === 'offer_sent'}
              >
                <FileText className="mr-2 h-4 w-4" />
                {t('statusOfferSent')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-green-600 hover:text-green-700"
                onClick={() => handleStatusChange('won')}
                disabled={status === 'won'}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('markWon')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground"
                onClick={() => handleStatusChange('lost')}
                disabled={status === 'lost'}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('markLost')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Composer Modal */}
      <EmailComposer
        open={isEmailComposerOpen}
        onOpenChange={setIsEmailComposerOpen}
        recipientName={inquiry.name}
        recipientEmail={inquiry.email}
        recipientCompany={inquiry.company || undefined}
        machineName={inquiry.listing?.title}
        machinePrice={inquiry.listing?.price ? `${inquiry.listing.price.toLocaleString(locale)} €` : undefined}
        sellerName={profile?.full_name || t('seller')}
      />
    </div>
  );
}
