'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
  ExternalLink,
  User,
  Building2,
  Bot,
  Check,
  CheckCheck,
  Package,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  getInquiryMessages,
  sendInquiryMessage,
  markInquiryMessagesAsRead,
  type InquiryMessage,
  type InquiryThread,
} from '@/lib/actions/messages';

// =============================================================================
// Buyer Anfragen-Detailseite mit Nachrichten-Thread
// =============================================================================

export default function BuyerInquiryDetailPage() {
  const params = useParams();
  const t = useTranslations('buyerDashboard.inquiries');
  const locale = useLocale();
  const inquiryId = params.id as string;

  const [thread, setThread] = useState<InquiryThread | null>(null);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Daten laden (initial)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const result = await getInquiryMessages(inquiryId);
      if (result.success && result.data) {
        setThread(result.data);
        setMessages(result.data.messages);
        prevMessageCountRef.current = result.data.messages.length;
        markInquiryMessagesAsRead(inquiryId).catch(() => {});
      } else {
        toast.error(t('errorLoading'));
      }
      setIsLoading(false);
    };

    loadData();
  }, [inquiryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling fuer neue Nachrichten (alle 10s) — nur updaten wenn sich etwas geaendert hat
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await getInquiryMessages(inquiryId);
      if (result.success && result.data) {
        const newMessages = result.data.messages;
        setMessages(prev => {
          if (prev.length === newMessages.length &&
              prev[prev.length - 1]?.id === newMessages[newMessages.length - 1]?.id) {
            return prev; // Nichts geaendert
          }
          return newMessages;
        });
        markInquiryMessagesAsRead(inquiryId).catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [inquiryId]);

  // Scrollen: nur beim ersten Laden oder wenn neue Nachrichten UND User am Ende
  useEffect(() => {
    if (isLoading) return;
    const hasNewMessages = messages.length > prevMessageCountRef.current;
    const wasAtBottom = isNearBottom();
    if (prevMessageCountRef.current === 0 || (hasNewMessages && wasAtBottom)) {
      scrollToBottom();
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading, scrollToBottom, isNearBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const result = await sendInquiryMessage(inquiryId, content);

    if (result.success && result.data) {
      setMessages((prev) => [...prev, result.data!]);
      toast.success(t('messageSent'));
    } else {
      toast.error(result.error || t('messageSendError'));
      setNewMessage(content);
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('errorLoading')}</h1>
        <Button asChild>
          <Link href="/dashboard/anfragen">{t('backToInquiries')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/anfragen">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{thread.inquiry.listing_title}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(thread.inquiry.created_at).toLocaleDateString(locale, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>
        {thread.inquiry.listing_slug && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/maschinen/${thread.inquiry.listing_slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Inserat ansehen
            </Link>
          </Button>
        )}
      </div>

      {/* Nachrichten-Thread */}
      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('conversation')}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 p-0 h-[calc(100%-4rem)]">
          {/* Nachrichten */}
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {/* Original-Anfrage */}
              {thread.inquiry.original_message && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-sm font-medium">{t('you')}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(thread.inquiry.created_at)}
                      </span>
                    </div>
                    <div className="inline-block rounded-lg p-3 max-w-[85%] bg-primary text-primary-foreground ml-auto">
                      <p className="text-sm whitespace-pre-wrap text-left">{thread.inquiry.original_message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('initialInquiry')}</p>
                  </div>
                </div>
              )}

              {/* Keine Nachrichten */}
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t('noConversation')}</p>
                </div>
              )}

              {/* Nachrichten-Liste */}
              {messages.map((message) => {
                const isBuyer = message.sender_type === 'buyer';
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
                  <div key={message.id} className={`flex gap-3 ${isBuyer ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isBuyer
                        ? 'bg-primary/10 text-primary'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isBuyer ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[85%] min-w-0 ${isBuyer ? 'ml-auto' : ''}`}>
                      <div className={`rounded-lg p-3 ${
                        isBuyer
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <div className={`flex items-center gap-2 mb-1 ${isBuyer ? 'justify-end' : ''}`}>
                          <span className={`text-xs font-medium ${isBuyer ? 'text-primary-foreground/80' : 'text-foreground'}`}>
                            {isBuyer ? t('you') : (message.sender_name || t('sellerCompany'))}
                          </span>
                          <span className={`text-[10px] ${isBuyer ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
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
                                className={`flex items-center gap-2 text-xs ${isBuyer ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
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
                      {isBuyer && (
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          {message.is_read ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
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
          <div className="border-t p-4 shrink-0">
            <div className="flex gap-2">
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
                disabled={!newMessage.trim() || isSending}
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
        </CardContent>
      </Card>
    </div>
  );
}
