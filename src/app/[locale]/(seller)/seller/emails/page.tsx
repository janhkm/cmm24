'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  Inbox,
  Send,
  FileEdit,
  Trash2,
  Star,
  StarOff,
  Archive,
  Reply,
  Forward,
  MoreHorizontal,
  Search,
  RefreshCw,
  PenSquare,
  Paperclip,
  Clock,
  CheckCircle2,
  User,
  Building2,
  ExternalLink,
  Mail,
  MailOpen,
  X,
  ArrowLeft,
  Bot,
  Link2,
  Unplug,
  Shield,
  Zap,
  MessageSquare,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { FeatureLocked } from '@/components/features/feature-locked';
import { PageSkeleton } from '@/components/ui/skeletons';
import { AutoReplySettingsPanel } from '@/components/seller';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

// =============================================================================
// Typen
// =============================================================================

type ViewState = 'list' | 'email' | 'compose' | 'reply';

interface Email {
  id: string;
  external_id: string;
  from: {
    name: string;
    email: string;
    company?: string;
  };
  to: {
    name: string;
    address: string;
  }[];
  cc?: {
    name: string;
    address: string;
  }[];
  subject: string;
  preview: string;
  body: string;
  bodyHtml?: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  inquiryId?: string;
  threadId?: string;
}

interface EmailConnection {
  id: string;
  provider: string;
  email: string;
  is_active: boolean;
  last_sync_at: string | null;
}

// =============================================================================
// Onboarding-Ansicht: E-Mail-Konto verknüpfen
// =============================================================================

function EmailOnboarding() {
  const t = useTranslations('sellerEmails');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = (provider: string) => {
    if (provider === 'outlook') {
      setIsConnecting('outlook');
      window.location.href = '/api/email/connect/outlook';
    } else {
      toast.info(
        t('providerComingSoon', { provider: provider === 'gmail' ? 'Gmail' : 'IMAP' }),
        { duration: 5000 }
      );
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('onboardingTitle')}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('onboardingDesc')}
          </p>
        </div>

        {/* Provider-Auswahl */}
        <div className="grid gap-4 mb-8">
          {/* Microsoft Outlook / Office 365 */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
              isConnecting === 'outlook' && 'border-primary shadow-md'
            )}
            onClick={() => !isConnecting && handleConnect('outlook')}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0078D4]/10">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <path d="M22 6.5V17.5C22 18.88 20.88 20 19.5 20H8.5C7.12 20 6 18.88 6 17.5V6.5C6 5.12 7.12 4 8.5 4H19.5C20.88 4 22 5.12 22 6.5Z" fill="#0078D4" />
                  <path d="M2 7V19C2 19.55 2.45 20 3 20H6V6.5C6 5.12 7.12 4 8.5 4H2V7Z" fill="#0364B8" opacity="0.8" />
                  <path d="M14 8L8 12L14 16V8Z" fill="white" />
                  <path d="M14 8V16L20 12L14 8Z" fill="white" opacity="0.6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Microsoft Outlook / Office 365</span>
                  <Badge variant="secondary" className="text-xs">{t('recommended')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('outlookDesc')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!!isConnecting}
                className="shrink-0"
              >
                {isConnecting === 'outlook' ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="mr-2 h-4 w-4" />
                )}
                {t('connect')}
              </Button>
            </CardContent>
          </Card>

          {/* Google Gmail */}
          <Card
            className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md opacity-75"
            onClick={() => handleConnect('gmail')}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <path d="M22 6L12 13L2 6V4L12 11L22 4V6Z" fill="#EA4335" />
                  <path d="M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6L12 13L22 6Z" fill="#FBBC04" opacity="0.3" />
                  <path d="M2 6L12 13V20H4C2.9 20 2 19.1 2 18V6Z" fill="#34A853" opacity="0.5" />
                  <path d="M22 6L12 13V20H20C21.1 20 22 19.1 22 18V6Z" fill="#4285F4" opacity="0.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Google Gmail</span>
                  <Badge variant="outline" className="text-xs">{t('comingSoon')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('gmailDesc')}
                </p>
              </div>
              <Button variant="outline" size="sm" disabled className="shrink-0">
                <Link2 className="mr-2 h-4 w-4" />
                {t('connect')}
              </Button>
            </CardContent>
          </Card>

          {/* IMAP - Manuell */}
          <Card
            className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md opacity-75"
            onClick={() => handleConnect('imap')}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Settings className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t('imapProvider')}</span>
                  <Badge variant="outline" className="text-xs">{t('comingSoon')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('imapDesc')}
                </p>
              </div>
              <Button variant="outline" size="sm" disabled className="shrink-0">
                <Link2 className="mr-2 h-4 w-4" />
                {t('connect')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vorteile */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('benefit1')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('benefit1Desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('benefit2')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('benefit2Desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('benefit3')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('benefit3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Hinweis */}
        <p className="text-xs text-center text-muted-foreground">
          {t('oauthNote')}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Helper: synced_emails Row → Frontend Email
// =============================================================================

interface SyncedEmailRow {
  id: string;
  external_id: string;
  thread_id: string | null;
  folder: string;
  from_name: string | null;
  from_email: string;
  to_addresses: Array<{ name: string; address: string }>;
  cc_addresses: Array<{ name: string; address: string }> | null;
  subject: string | null;
  preview: string | null;
  body_html: string | null;
  body_text: string | null;
  is_read: boolean;
  is_starred: boolean;
  has_attachments: boolean;
  received_at: string;
  inquiry_id: string | null;
}

function mapRowToEmail(row: SyncedEmailRow): Email {
  return {
    id: row.id,
    external_id: row.external_id,
    from: {
      name: row.from_name || row.from_email.split('@')[0],
      email: row.from_email,
    },
    to: row.to_addresses?.map((a) => ({ name: a.name || a.address, address: a.address })) || [],
    cc: row.cc_addresses?.map((a) => ({ name: a.name || a.address, address: a.address })) || [],
    subject: row.subject || '(No subject)',
    preview: row.preview || '',
    body: row.body_text || row.body_html || '',
    bodyHtml: row.body_html || undefined,
    date: row.received_at,
    read: row.is_read,
    starred: row.is_starred,
    hasAttachment: row.has_attachments,
    folder: (row.folder as Email['folder']) || 'inbox',
    inquiryId: row.inquiry_id || undefined,
    threadId: row.thread_id || undefined,
  };
}

// =============================================================================
// Vorlagen
// =============================================================================

function useEmailTemplates() {
  const t = useTranslations('sellerEmails');
  return [
    { id: '1', name: t('template1Name'), subject: t('template1Subject') },
    { id: '2', name: t('template2Name'), subject: t('template2Subject') },
    { id: '3', name: t('template3Name'), subject: t('template3Subject') },
    { id: '4', name: t('template4Name'), subject: t('template4Subject') },
  ];
}

// =============================================================================
// Haupt-Seite
// =============================================================================

export default function EmailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('sellerEmails');
  const locale = useLocale();
  const { plan, account, isLoading: authLoading } = useSellerAuth();
  const emailTemplates = useEmailTemplates();

  // Feature-Flags prüfen
  const featureFlags = plan?.feature_flags as { email_composer?: boolean; auto_reply?: boolean } | null;
  const hasEmailAccess = featureFlags?.email_composer ?? false;
  const hasAutoReply = featureFlags?.auto_reply ?? false;

  // E-Mail-Verbindung
  const [emailConnection, setEmailConnection] = useState<EmailConnection | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(true);

  // E-Mail-Status
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('list');
  const [showAutoReply, setShowAutoReply] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Verfassen
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeTemplate, setComposeTemplate] = useState('');
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);

  const supabase = createClient();

  // =========================================================================
  // URL-Parameter nach OAuth-Callback verarbeiten
  // =========================================================================

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      const providerName = connected === 'outlook' ? 'Outlook' : connected === 'gmail' ? 'Gmail' : t('emailLabel');
      toast.success(t('accountConnected', { provider: providerName }));
      router.replace('/seller/emails');
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        access_denied: t('errorAccessDenied'),
        oauth_error: t('errorOAuth'),
        invalid_state: t('errorInvalidState'),
        missing_params: t('errorMissingParams'),
        callback_failed: t('errorCallbackFailed'),
        db_error: t('errorDbError'),
        no_account: t('errorNoAccount'),
        connect_failed: t('errorConnectFailed'),
      };
      toast.error(errorMessages[error] || t('errorGeneric'));
      router.replace('/seller/emails');
    }
  }, [searchParams, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // =========================================================================
  // E-Mail-Verbindung laden
  // =========================================================================

  const fetchEmailConnection = useCallback(async () => {
    if (!account?.id) return;

    try {
      const { data, error } = await supabase
        .from('email_connections')
        .select('id, provider, email, is_active, last_sync_at')
        .eq('account_id', account.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading email connection:', error);
      }

      setEmailConnection(data ? { ...data, is_active: data.is_active ?? false } : null);
    } catch (err) {
      console.error('Error loading email connection:', err);
    } finally {
      setConnectionLoading(false);
    }
  }, [account?.id, supabase]);

  useEffect(() => {
    if (!authLoading && hasEmailAccess) {
      fetchEmailConnection();
    } else if (!authLoading) {
      setConnectionLoading(false);
    }
  }, [authLoading, hasEmailAccess, fetchEmailConnection]);

  // =========================================================================
  // E-Mails aus Supabase laden
  // =========================================================================

  const fetchEmails = useCallback(async () => {
    if (!account?.id || !emailConnection?.id) return;

    setEmailsLoading(true);
    try {
      const { data, error } = await supabase
        .from('synced_emails')
        .select('*')
        .eq('account_id', account.id)
        .eq('connection_id', emailConnection.id)
        .order('received_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error loading emails:', error);
        return;
      }

      if (data) {
        setEmails(data.map((row: SyncedEmailRow) => mapRowToEmail(row)));
      }
    } catch (err) {
      console.error('Error loading emails:', err);
    } finally {
      setEmailsLoading(false);
    }
  }, [account?.id, emailConnection?.id, supabase]);

  // E-Mails laden wenn Verbindung da ist
  useEffect(() => {
    if (emailConnection) {
      fetchEmails();
    }
  }, [emailConnection, fetchEmails]);

  // Automatischer erster Sync wenn verbunden aber noch nie synchronisiert
  useEffect(() => {
    if (emailConnection && !emailConnection.last_sync_at && !isSyncing) {
      handleSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailConnection]);

  // =========================================================================
  // E-Mail-Sync über API
  // =========================================================================

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/email/sync', { method: 'POST' });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 && result.error?.includes('Token')) {
          toast.error(t('tokenExpired'), {
            action: {
              label: t('reconnect'),
              onClick: () => window.location.href = '/api/email/connect/outlook',
            },
          });
        } else {
          toast.error(result.error || t('syncFailed'));
        }
        return;
      }

      toast.success(t('emailsSynced', { count: result.synced }));

      // E-Mails und Verbindung neu laden
      await fetchEmails();
      await fetchEmailConnection();
    } catch {
      toast.error(t('connectionFailed'));
    } finally {
      setIsSyncing(false);
    }
  };

  // =========================================================================
  // E-Mail senden über API
  // =========================================================================

  const handleSend = async () => {
    if (!composeTo || !composeSubject) {
      toast.error(t('recipientAndSubjectRequired'));
      return;
    }

    setIsSending(true);
    try {
      const toAddresses = composeTo.split(',').map((a) => a.trim()).filter(Boolean);
      const ccAddresses = composeCc ? composeCc.split(',').map((a) => a.trim()).filter(Boolean) : undefined;
      const bccAddresses = composeBcc ? composeBcc.split(',').map((a) => a.trim()).filter(Boolean) : undefined;

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toAddresses,
          cc: ccAddresses,
          bcc: bccAddresses,
          subject: composeSubject,
          message: composeBody,
          replyToMessageId: replyToEmail?.external_id || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || t('sendFailed'));
        return;
      }

      // Felder zurücksetzen
      setComposeTo('');
      setComposeCc('');
      setComposeBcc('');
      setComposeSubject('');
      setComposeBody('');

      if (replyToEmail) {
        setViewState('email');
      } else {
        setActiveFolder('sent');
        setViewState('list');
      }

      toast.success(t('emailSent'));

      // Nach kurzem Delay sync'en um die gesendete Mail zu sehen
      setTimeout(() => handleSync(), 2000);
    } catch {
      toast.error(t('sendFailed'));
    } finally {
      setIsSending(false);
    }
  };

  // =========================================================================
  // E-Mail-Konto trennen über API
  // =========================================================================

  const handleDisconnect = async () => {
    if (!emailConnection) return;
    try {
      const response = await fetch('/api/email/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: emailConnection.id }),
      });

      if (!response.ok) {
        toast.error(t('disconnectError'));
        return;
      }

      setEmailConnection(null);
      setEmails([]);
      toast.success(t('accountDisconnected'));
    } catch {
      toast.error(t('disconnectError'));
    }
  };

  // =========================================================================
  // Lokale E-Mail-Aktionen
  // =========================================================================

  const handleMarkRead = async (emailId: string, read: boolean) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, read } : e))
    );
    await supabase
      .from('synced_emails')
      .update({ is_read: read })
      .eq('id', emailId);
  };

  const handleToggleStar = async (emailId: string) => {
    const email = emails.find((e) => e.id === emailId);
    if (!email) return;
    const newStarred = !email.starred;
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, starred: newStarred } : e))
    );
    await supabase
      .from('synced_emails')
      .update({ is_starred: newStarred })
      .eq('id', emailId);
  };

  const handleArchive = (emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId));
    setSelectedEmail(null);
    setViewState('list');
    toast.success(t('emailArchived'));
  };

  const handleDelete = (emailId: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, folder: 'trash' as const } : e))
    );
    setSelectedEmail(null);
    setViewState('list');
    toast.success(t('emailTrashed'));
  };

  const handleOpenEmail = (email: Email) => {
    setSelectedEmail(email);
    setViewState('email');
    if (!email.read) handleMarkRead(email.id, true);
  };

  const handleCompose = () => {
    setComposeTo('');
    setComposeCc('');
    setComposeBcc('');
    setShowCcBcc(false);
    setComposeSubject('');
    setComposeBody('');
    setComposeTemplate('');
    setReplyToEmail(null);
    setViewState('compose');
  };

  const handleReply = (email: Email) => {
    setReplyToEmail(email);
    setComposeTo(email.from.email);
    setComposeCc('');
    setComposeBcc('');
    setShowCcBcc(false);
    setComposeSubject(`Re: ${email.subject.replace(/^Re: /, '')}`);
    setComposeBody(`\n\n-------- ${t('originalMessage')} --------\n${t('fromLabel')}: ${email.from.name} <${email.from.email}>\n${t('dateLabel')}: ${formatFullDate(email.date)}\n\n${email.body}`);
    setViewState('reply');
  };

  const handleBack = () => {
    if (viewState === 'reply') {
      setViewState('email');
    } else {
      setSelectedEmail(null);
      setViewState('list');
    }
  };

  const handleDiscard = () => {
    setComposeTo('');
    setComposeCc('');
    setComposeBcc('');
    setComposeSubject('');
    setComposeBody('');
    if (replyToEmail) {
      setViewState('email');
    } else {
      setViewState('list');
    }
    toast.info(t('draftDiscarded'));
  };

  const handleSaveDraft = () => {
    toast.info(t('draftSaveFuture'));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find((tpl) => tpl.id === templateId);
    if (template) {
      setComposeSubject(template.subject);
      setComposeTemplate(templateId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================================
  // Lade-Status
  // =========================================================================

  if (authLoading || connectionLoading) {
    return <PageSkeleton />;
  }

  // Feature gesperrt
  if (!hasEmailAccess) {
    return (
      <FeatureLocked
        featureName={t('featureLockedName')}
        icon={Mail}
        headline={t('featureLockedHeadline')}
        description={t('featureLockedDesc')}
        targetAudience={t('featureLockedAudience')}
        requiredPlan="starter"
        benefits={[
          {
            title: t('lockedBenefit1Title'),
            description: t('lockedBenefit1Desc'),
          },
          {
            title: t('lockedBenefit2Title'),
            description: t('lockedBenefit2Desc'),
          },
          {
            title: t('lockedBenefit3Title'),
            description: t('lockedBenefit3Desc'),
          },
          {
            title: t('lockedBenefit4Title'),
            description: t('lockedBenefit4Desc'),
          },
        ]}
        testimonial={{
          quote: t('testimonialQuote'),
          author: t('testimonialAuthor'),
          company: t('testimonialCompany'),
        }}
      />
    );
  }

  // =========================================================================
  // Kein E-Mail-Konto verknüpft → Onboarding
  // =========================================================================

  if (!emailConnection) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 shrink-0">
          <h1 className="text-xl font-bold">{t('title')}</h1>
        </div>
        <EmailOnboarding />
      </div>
    );
  }

  // =========================================================================
  // E-Mail-Konto verbunden → E-Mail-Interface
  // =========================================================================

  const providerLabel =
    emailConnection.provider === 'outlook'
      ? 'Outlook'
      : emailConnection.provider === 'gmail'
        ? 'Gmail'
        : 'IMAP';

  const folderEmails = emails.filter((e) => e.folder === activeFolder);
  const filteredEmails = folderEmails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = emails.filter((e) => e.folder === 'inbox' && !e.read).length;
  const draftCount = emails.filter((e) => e.folder === 'drafts').length;

  // =========================================================================
  // Rechtes Panel rendern
  // =========================================================================

  const renderRightPanel = () => {
    // Verfassen / Antworten
    if (viewState === 'compose' || viewState === 'reply') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold text-sm">
                {viewState === 'reply' ? t('replyLabel') : t('newEmail')}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleDiscard}>
                <X className="mr-1 h-3 w-3" />
                {t('discard')}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSaveDraft}>
                <FileEdit className="mr-1 h-3 w-3" />
                {t('draft')}
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={handleSend} disabled={isSending}>
                {isSending ? (
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Send className="mr-1 h-3 w-3" />
                )}
                {t('send')}
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="shrink-0 border-b bg-background">
              <div className="flex items-center border-b px-4">
                <Label htmlFor="to" className="w-12 shrink-0 text-sm text-muted-foreground">{t('toLabel')}:</Label>
                <Input
                  id="to"
                  placeholder={t('recipientPlaceholder')}
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="border-0 focus-visible:ring-0 shadow-none rounded-none px-2"
                />
                {!showCcBcc && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground shrink-0"
                    onClick={() => setShowCcBcc(true)}
                  >
                    Cc/Bcc
                  </Button>
                )}
              </div>

              {showCcBcc && (
                <>
                  <div className="flex items-center border-b px-4">
                    <Label htmlFor="cc" className="w-12 shrink-0 text-sm text-muted-foreground">Cc:</Label>
                    <Input
                      id="cc"
                      placeholder={t('ccPlaceholder')}
                      value={composeCc}
                      onChange={(e) => setComposeCc(e.target.value)}
                      className="border-0 focus-visible:ring-0 shadow-none rounded-none px-2"
                    />
                  </div>
                  <div className="flex items-center border-b px-4">
                    <Label htmlFor="bcc" className="w-12 shrink-0 text-sm text-muted-foreground">Bcc:</Label>
                    <Input
                      id="bcc"
                      placeholder={t('bccPlaceholder')}
                      value={composeBcc}
                      onChange={(e) => setComposeBcc(e.target.value)}
                      className="border-0 focus-visible:ring-0 shadow-none rounded-none px-2"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground"
                      onClick={() => {
                        setShowCcBcc(false);
                        setComposeCc('');
                        setComposeBcc('');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}

              <div className="flex items-center px-4">
                <Label htmlFor="subject" className="w-12 shrink-0 text-sm text-muted-foreground">{t('subjectLabel')}:</Label>
                <Input
                  id="subject"
                  placeholder={t('subjectPlaceholder')}
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="border-0 focus-visible:ring-0 shadow-none rounded-none px-2"
                />
                {viewState === 'compose' && (
                  <Select value={composeTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="w-auto border-0 h-8 text-xs gap-1 text-muted-foreground">
                      <SelectValue placeholder={t('templateLabel')} />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <Textarea
                id="body"
                placeholder={t('messagePlaceholder')}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none p-4 text-sm leading-relaxed"
              />
            </div>

            <div className="shrink-0 flex items-center justify-between border-t px-4 py-2 bg-muted/30">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <Paperclip className="mr-1 h-3 w-3" />
                  {t('attach')}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">⌘</kbd>
                <span className="mx-1">+</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">Enter</kbd>
                <span className="ml-1">{t('toSend')}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // E-Mail anzeigen
    if (viewState === 'email' && selectedEmail) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back')}
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleReply(selectedEmail)}>
                <Reply className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Forward className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleStar(selectedEmail.id)}
              >
                {selectedEmail.starred ? (
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleMarkRead(selectedEmail.id, !selectedEmail.read)}>
                    {selectedEmail.read ? t('markUnread') : t('markRead')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleArchive(selectedEmail.id)}>
                    <Archive className="mr-2 h-4 w-4" />
                    {t('archive')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(selectedEmail.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 max-w-3xl">
              <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>

              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{selectedEmail.from.name}</span>
                    {selectedEmail.from.company && (
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {selectedEmail.from.company}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmail.from.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('toLabel')}: {selectedEmail.to.map((recipient) => recipient.address).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFullDate(selectedEmail.date)}
                  </p>
                </div>
              </div>

              {selectedEmail.inquiryId && (
                <Card className="mt-4 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{t('linkedToInquiry')}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/seller/anfragen/${selectedEmail.inquiryId}`}>
                        {t('viewInquiry')}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}

              {/* E-Mail-Body: HTML oder Text */}
              {selectedEmail.bodyHtml ? (
                <div
                  className="mt-6 border-t pt-6 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                />
              ) : (
                <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed border-t pt-6">
                  {selectedEmail.body}
                </div>
              )}

              {selectedEmail.hasAttachment && (
                <div className="mt-6 rounded-lg border p-4">
                  <p className="text-sm font-medium mb-2">{t('attachments')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('attachmentsFuture')}
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t">
                <Button onClick={() => handleReply(selectedEmail)} className="w-full sm:w-auto">
                  <Reply className="mr-2 h-4 w-4" />
                  {t('replyLabel')}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      );
    }

    // Leerer Zustand
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground h-full">
        <div className="text-center">
          <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">{t('selectEmail')}</p>
          <p className="text-sm mt-1">{t('orCompose')}</p>
          <Button className="mt-4" onClick={handleCompose}>
            <PenSquare className="mr-2 h-4 w-4" />
            {t('newEmail')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <Badge variant="secondary" className="hidden sm:flex gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t('providerConnected', { provider: providerLabel })}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                {emailConnection.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDisconnect}
              >
                <Unplug className="mr-2 h-4 w-4" />
                {t('disconnectAccount')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
          </Button>
          {hasAutoReply && (
            <Dialog open={showAutoReply} onOpenChange={setShowAutoReply}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Bot className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Auto-Reply</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="sr-only">{t('autoReplySettings')}</DialogTitle>
                </DialogHeader>
                <AutoReplySettingsPanel />
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={handleCompose}>
            <PenSquare className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('compose')}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Ordner */}
        <div className="hidden w-48 shrink-0 border-r bg-muted/30 md:flex md:flex-col">
          <div className="p-2 flex-1">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3',
                activeFolder === 'inbox' && 'bg-background shadow-sm'
              )}
              onClick={() => {
                setActiveFolder('inbox');
                setSelectedEmail(null);
                setViewState('list');
              }}
            >
              <Inbox className="h-4 w-4" />
              {t('inbox')}
              {unreadCount > 0 && (
                <Badge className="ml-auto">{unreadCount}</Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3',
                activeFolder === 'sent' && 'bg-background shadow-sm'
              )}
              onClick={() => {
                setActiveFolder('sent');
                setSelectedEmail(null);
                setViewState('list');
              }}
            >
              <Send className="h-4 w-4" />
              {t('sent')}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3',
                activeFolder === 'drafts' && 'bg-background shadow-sm'
              )}
              onClick={() => {
                setActiveFolder('drafts');
                setSelectedEmail(null);
                setViewState('list');
              }}
            >
              <FileEdit className="h-4 w-4" />
              {t('drafts')}
              {draftCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {draftCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3',
                activeFolder === 'trash' && 'bg-background shadow-sm'
              )}
              onClick={() => {
                setActiveFolder('trash');
                setSelectedEmail(null);
                setViewState('list');
              }}
            >
              <Trash2 className="h-4 w-4" />
              {t('trash')}
            </Button>
          </div>

          <Separator />

          <div className="p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {emailConnection.last_sync_at
                ? `${t('syncLabel')}: ${new Date(emailConnection.last_sync_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`
                : t('notSyncedYet')
              }
            </div>
            <p className="mt-1">{t('emailCount', { count: emails.length })}</p>
          </div>
        </div>

        {/* E-Mail-Liste */}
        <div className={cn(
          'w-full flex-col border-r md:w-80 lg:w-96 md:flex',
          (viewState !== 'list' && viewState !== 'email') && 'hidden md:flex'
        )}>
          <div className="border-b p-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchEmails')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Mobile Ordner-Tabs */}
          <div className="flex border-b md:hidden shrink-0">
            <button
              onClick={() => setActiveFolder('inbox')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeFolder === 'inbox' ? 'border-primary text-primary' : 'border-transparent'
              )}
            >
              {t('inbox')} {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveFolder('sent')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeFolder === 'sent' ? 'border-primary text-primary' : 'border-transparent'
              )}
            >
              {t('sent')}
            </button>
            <button
              onClick={() => setActiveFolder('drafts')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeFolder === 'drafts' ? 'border-primary text-primary' : 'border-transparent'
              )}
            >
              {t('drafts')}
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y">
              {emailsLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                  <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin opacity-30" />
                  <p>{t('loadingEmails')}</p>
                </div>
              ) : filteredEmails.length > 0 ? (
                filteredEmails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => handleOpenEmail(email)}
                    className={cn(
                      'flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50',
                      selectedEmail?.id === email.id && 'bg-muted',
                      !email.read && 'bg-primary/5'
                    )}
                  >
                    <div className="shrink-0 pt-1">
                      {email.read ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          'truncate text-sm',
                          !email.read && 'font-semibold'
                        )}>
                          {activeFolder === 'sent' || activeFolder === 'drafts'
                            ? email.to[0]?.name || email.to[0]?.address
                            : email.from.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      <p className={cn(
                        'truncate text-sm',
                        !email.read && 'font-medium'
                      )}>
                        {email.subject}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {email.preview}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {email.starred && (
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        )}
                        {email.hasAttachment && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                        {email.inquiryId && (
                          <Badge variant="outline" className="text-[10px] py-0">
                            {t('inquiryBadge')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Inbox className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">{t('noEmails')}</p>
                  <p className="text-sm mt-1">
                    {activeFolder === 'inbox'
                      ? t('inboxEmpty')
                      : activeFolder === 'sent'
                        ? t('sentEmpty')
                        : activeFolder === 'drafts'
                          ? t('draftsEmpty')
                          : t('trashEmpty')}
                  </p>
                  {!emailConnection.last_sync_at && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={handleSync}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      {t('syncNow')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Rechtes Panel */}
        <div className={cn(
          'flex-1 flex-col bg-background',
          viewState === 'list' ? 'hidden md:flex' : 'flex'
        )}>
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
}
