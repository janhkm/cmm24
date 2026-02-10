'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  User,
  Bot,
  Check,
  CheckCheck,
  Paperclip,
  Zap,
  Download,
  Image as ImageIcon,
  X,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { toast } from 'sonner';
import {
  getInquiry,
  updateInquiryStatus,
  updateInquiryNotes,
  markInquiryAsRead,
} from '@/lib/actions/inquiries';
import {
  getInquiryMessages,
  sendInquiryMessage,
  uploadMessageAttachment,
  markInquiryMessagesAsRead,
  type InquiryMessage,
} from '@/lib/actions/messages';
import {
  getMessageTemplates,
  type MessageTemplate,
} from '@/lib/actions/message-templates';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

// =============================================================================
// Nachrichten-Thread Komponente
// =============================================================================

function MessageThread({
  inquiryId,
  originalMessage,
  contactName,
  createdAt,
  hasMessagingAccess,
  hasReadReceipts,
  hasAttachments,
  hasTemplates,
  locale,
}: {
  inquiryId: string;
  originalMessage: string | null;
  contactName: string;
  createdAt: string | null;
  hasMessagingAccess: boolean;
  hasReadReceipts: boolean;
  hasAttachments: boolean;
  hasTemplates: boolean;
  locale: string;
}) {
  const t = useTranslations('sellerInquiries');
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    url: string; name: string; type: string; size: number;
  } | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessageCountRef = useRef(0);

  // Pruefen ob User am Ende des Chats ist (mit 100px Toleranz)
  const isNearBottom = useCallback(() => {
    const el = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Nachrichten laden (initial)
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      const result = await getInquiryMessages(inquiryId);
      if (result.success && result.data) {
        setMessages(result.data.messages);
        prevMessageCountRef.current = result.data.messages.length;
        // Nachrichten als gelesen markieren
        markInquiryMessagesAsRead(inquiryId).catch(() => {});
      }
      setIsLoading(false);
    };

    loadMessages();
  }, [inquiryId]);

  // Polling fuer neue Nachrichten (alle 10s) — nur updaten wenn sich etwas geaendert hat
  useEffect(() => {
    if (!hasMessagingAccess) return;
    const interval = setInterval(async () => {
      const result = await getInquiryMessages(inquiryId);
      if (result.success && result.data) {
        const newMessages = result.data.messages;
        // Nur updaten wenn sich die Anzahl oder Inhalte geaendert haben
        setMessages(prev => {
          if (prev.length === newMessages.length &&
              prev[prev.length - 1]?.id === newMessages[newMessages.length - 1]?.id) {
            // Nichts geaendert, kein Re-Render noetig
            return prev;
          }
          return newMessages;
        });
        markInquiryMessagesAsRead(inquiryId).catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [inquiryId, hasMessagingAccess]);

  // Nachrichtenvorlagen laden (nur wenn Feature aktiv)
  useEffect(() => {
    if (!hasTemplates) return;
    const loadTemplates = async () => {
      // Account-ID aus dem Seller-Auth holen
      const msgResult = await getInquiryMessages(inquiryId);
      if (msgResult.success && msgResult.data) {
        const accountId = msgResult.data.inquiry.account_id;
        if (accountId) {
          const tplResult = await getMessageTemplates(accountId);
          if (tplResult.success && tplResult.data) {
            setTemplates(tplResult.data);
          }
        }
      }
    };
    loadTemplates();
  }, [inquiryId, hasTemplates]);

  // Nach unten scrollen: nur beim ersten Laden oder wenn neue Nachrichten dazukommen
  // und der User bereits am Ende des Chats war
  useEffect(() => {
    if (isLoading) return;

    const hasNewMessages = messages.length > prevMessageCountRef.current;
    const wasAtBottom = isNearBottom();

    // Beim ersten Laden immer nach unten, danach nur wenn neue Nachrichten UND User am Ende war
    if (prevMessageCountRef.current === 0 || (hasNewMessages && wasAtBottom)) {
      scrollToBottom();
    }

    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading, scrollToBottom, isNearBottom]);

  // Datei-Upload Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // Reset fuer erneuten Upload

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadMessageAttachment(inquiryId, formData);
    if (result.success && result.data) {
      setPendingAttachment(result.data);
      toast.success(t('fileUploaded'));
    } else {
      toast.error(result.error || t('fileUploadError'));
    }
    setIsUploading(false);
  };

  // Template auswaehlen
  const handleTemplateSelect = (template: MessageTemplate) => {
    setNewMessage((prev) => prev ? `${prev}\n${template.content}` : template.content);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !pendingAttachment) || isSending) return;

    setIsSending(true);
    const content = newMessage.trim() || (pendingAttachment ? `📎 ${pendingAttachment.name}` : '');
    setNewMessage('');
    const attachment = pendingAttachment || undefined;
    setPendingAttachment(null);

    const result = await sendInquiryMessage(inquiryId, content, attachment);

    if (result.success && result.data) {
      setMessages((prev) => [...prev, result.data!]);
      toast.success(t('messageSent'));
    } else {
      toast.error(result.error || t('messageSendError'));
      setNewMessage(content); // Nachricht wiederherstellen
      if (attachment) setPendingAttachment(attachment);
    }

    setIsSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    if (isToday) return time;
    if (isYesterday) return `${t('yesterday')}, ${time}`;
    return `${date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}, ${time}`;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t('conversation')}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        {/* Nachrichten-Bereich */}
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {/* Original-Anfrage als erste Nachricht */}
            {originalMessage && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{contactName}</span>
                    <span className="text-xs text-muted-foreground">
                      {createdAt && formatMessageTime(createdAt)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-3">
                    <p className="text-sm whitespace-pre-wrap">{originalMessage}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('initialInquiry')}</p>
                </div>
              </div>
            )}

            {/* Lade-Indikator */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Nachrichten */}
            {messages.map((message) => {
              const isSeller = message.sender_type === 'seller';
              const isSystem = message.sender_type === 'system';

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                      <Bot className="h-3 w-3" />
                      {message.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className={`flex gap-3 ${isSeller ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isSeller
                      ? 'bg-primary/10 text-primary'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className={`max-w-[85%] min-w-0 ${isSeller ? 'ml-auto' : ''}`}>
                    <div className={`rounded-lg p-3 ${
                      isSeller
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <div className={`flex items-center gap-2 mb-1 ${isSeller ? 'justify-end' : ''}`}>
                        <span className={`text-xs font-medium ${isSeller ? 'text-primary-foreground/80' : 'text-foreground'}`}>
                          {message.sender_name || (isSeller ? t('you') : contactName)}
                        </span>
                        <span className={`text-[10px] ${isSeller ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                           {formatMessageTime(message.created_at || '')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-left">{message.content}</p>
                      {/* Anhang-Anzeige */}
                      {message.attachment_url && (
                        <div className="mt-2 pt-2 border-t border-current/10">
                          {message.attachment_type?.startsWith('image/') ? (
                            <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="block">
                              <img
                                src={message.attachment_url}
                                alt={message.attachment_name || 'Bild'}
                                className="max-w-[240px] rounded-md"
                              />
                            </a>
                          ) : (
                            <a
                              href={message.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 text-xs ${isSeller ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                              <Download className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{message.attachment_name || 'Datei'}</span>
                              {message.attachment_size && (
                                <span className="shrink-0">({(message.attachment_size / 1024).toFixed(0)} KB)</span>
                              )}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    {isSeller && (
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {hasReadReceipts ? (
                          message.is_read ? (
                            <>
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                              {message.read_at && (
                                <span className="text-[10px] text-muted-foreground ml-0.5">
                                  {t('readAt', { time: new Date(message.read_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) })}
                                </span>
                              )}
                            </>
                          ) : (
                            <Check className="h-3 w-3 text-muted-foreground" />
                          )
                        ) : (
                          <Check className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Eingabe-Bereich */}
        {hasMessagingAccess ? (
          <div className="border-t p-4 shrink-0">
            {/* Pending Attachment Preview */}
            {pendingAttachment && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-md text-sm">
                {pendingAttachment.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="truncate flex-1">{pendingAttachment.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  ({(pendingAttachment.size / 1024).toFixed(0)} KB)
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => setPendingAttachment(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              {/* Datei-Upload (nur Business) */}
              {hasAttachments && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-auto"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSending || isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Paperclip className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('attachFile')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              {/* Quick-Reply Templates (nur Business) */}
              {hasTemplates && templates.length > 0 && (
                <Popover open={showTemplates} onOpenChange={setShowTemplates}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-auto"
                      disabled={isSending}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72 p-1">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                      {t('quickReplies')}
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {templates.map((tpl) => (
                        <button
                          key={tpl.id}
                          className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors"
                          onClick={() => handleTemplateSelect(tpl)}
                        >
                          <div className="font-medium truncate">{tpl.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{tpl.content}</div>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('typeMessage')}
                rows={2}
                className="resize-none text-sm"
                disabled={isSending}
              />
              <Button
                onClick={handleSend}
                disabled={(!newMessage.trim() && !pendingAttachment) || isSending}
                size="icon"
                className="shrink-0 h-auto"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded">⌘</kbd>
              {' + '}
              <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded">Enter</kbd>
              {' '}{t('toSendMessage')}
            </p>
          </div>
        ) : (
          <div className="border-t p-4 shrink-0">
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-2">
                {t('messagingLocked')}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/seller/abo">
                  {t('upgradeToCommunicate')}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Haupt-Seite
// =============================================================================

export default function InquiryDetailPage() {
  const params = useParams();
  const t = useTranslations('sellerInquiries');
  const locale = useLocale();
  const { profile, plan, isLoading: authLoading } = useSellerAuth();
  const inquiryId = params.id as string;

  // Feature-Flags pruefen
  const featureFlags = plan?.feature_flags as Record<string, boolean> | null;
  const hasMessagingAccess = featureFlags?.inquiry_messaging ?? featureFlags?.email_composer ?? false;
  const hasReadReceipts = featureFlags?.read_receipts ?? false;
  const hasAttachments = featureFlags?.message_attachments ?? false;
  const hasTemplates = featureFlags?.message_templates ?? false;

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
              {inquiry.listing?.title && `${inquiry.listing.title} • `}
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
        {/* Linke Seite: Nachrichten-Thread (Hauptbereich) */}
        <div className="lg:col-span-2">
          <div className="h-[calc(100vh-16rem)]">
            <MessageThread
              inquiryId={inquiryId}
              originalMessage={inquiry.message}
              contactName={inquiry.name}
              createdAt={inquiry.created_at}
              hasMessagingAccess={hasMessagingAccess}
              hasReadReceipts={hasReadReceipts}
              hasAttachments={hasAttachments}
              hasTemplates={hasTemplates}
              locale={locale}
            />
          </div>
        </div>

        {/* Rechte Sidebar */}
        <div className="space-y-6">
          {/* Kontaktdaten */}
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
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`mailto:${inquiry.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {t('openInEmailClient')}
                  </a>
                </Button>
                {inquiry.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${inquiry.phone}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Angefragtes Inserat */}
          {inquiry.listing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('inquiredListing')}</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold truncate">{inquiry.listing.title}</h3>
                {inquiry.listing.price ? (
                  <p className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(inquiry.listing.price / 100)}
                  </p>
                ) : (
                  <p className="text-lg font-bold text-primary">{t('priceOnRequest') || 'VB'}</p>
                )}
                <Button variant="link" className="px-0 h-auto" asChild>
                  <Link href={`/maschinen/${inquiry.listing.slug}`} target="_blank">
                    {t('viewListing')}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

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

          {/* Interne Notizen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('internalNotes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
              <Button onClick={handleSaveNotes} disabled={isSaving} size="sm">
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t('saveNotes')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
