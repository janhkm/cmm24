'use client';

import { useState } from 'react';
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
  ChevronLeft,
  Mail,
  MailOpen,
  X,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import Link from 'next/link';

// View states
type ViewState = 'list' | 'email' | 'compose' | 'reply';

// Mock email data
interface Email {
  id: string;
  from: {
    name: string;
    email: string;
    company?: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  inquiryId?: string;
  threadId?: string;
}

const mockEmails: Email[] = [
  {
    id: '1',
    from: { name: 'Max Mustermann', email: 'max@techcorp.de', company: 'TechCorp GmbH' },
    to: [{ name: 'Sandra Becker', email: 'sandra@precision-gmbh.de' }],
    subject: 'Re: Anfrage Zeiss ACCURA II 12/18/8',
    preview: 'Vielen Dank für Ihr Angebot. Könnten Sie mir noch mehr Details zur Wartungshistorie...',
    body: `Sehr geehrte Frau Becker,

vielen Dank für Ihr Angebot. Könnten Sie mir noch mehr Details zur Wartungshistorie der Maschine mitteilen?

Insbesondere interessiert mich:
- Letzte Kalibrierung
- Durchgeführte Reparaturen
- Verfügbare Ersatzteile

Mit freundlichen Grüßen
Max Mustermann
TechCorp GmbH`,
    date: '2026-01-23T09:30:00Z',
    read: false,
    starred: true,
    hasAttachment: false,
    folder: 'inbox',
    inquiryId: '1',
    threadId: 'thread-1',
  },
  {
    id: '2',
    from: { name: 'Julia Schmidt', email: 'j.schmidt@measuring-solutions.de', company: 'Measuring Solutions AG' },
    to: [{ name: 'Sandra Becker', email: 'sandra@precision-gmbh.de' }],
    subject: 'Interesse an Mitutoyo CRYSTA-Apex S 9106',
    preview: 'Guten Tag, ich habe Ihr Inserat auf CMM24 gesehen und hätte einige Fragen...',
    body: `Guten Tag Frau Becker,

ich habe Ihr Inserat auf CMM24 gesehen und hätte einige Fragen zur Mitutoyo CRYSTA-Apex S 9106:

1. Ist die Maschine noch verfügbar?
2. Wäre eine Besichtigung vor Ort möglich?
3. Bieten Sie auch Transport an?

Ich freue mich auf Ihre Rückmeldung.

Mit freundlichen Grüßen
Julia Schmidt`,
    date: '2026-01-22T14:15:00Z',
    read: true,
    starred: false,
    hasAttachment: false,
    folder: 'inbox',
    inquiryId: '2',
    threadId: 'thread-2',
  },
  {
    id: '3',
    from: { name: 'Thomas Weber', email: 't.weber@precision-parts.de', company: 'Precision Parts KG' },
    to: [{ name: 'Sandra Becker', email: 'sandra@precision-gmbh.de' }],
    subject: 'Kaufinteresse Hexagon Global S',
    preview: 'Wir sind sehr interessiert an der Hexagon Global S und würden gerne ein Angebot...',
    body: `Sehr geehrte Frau Becker,

wir sind sehr interessiert an der Hexagon Global S und würden gerne ein Angebot erhalten.

Unser Budget liegt bei ca. 60.000 EUR. Ist der Preis verhandelbar?

Bitte senden Sie uns auch die technischen Datenblätter zu.

Mit freundlichen Grüßen
Thomas Weber
Precision Parts KG`,
    date: '2026-01-21T11:45:00Z',
    read: true,
    starred: true,
    hasAttachment: true,
    folder: 'inbox',
    threadId: 'thread-3',
  },
  {
    id: '4',
    from: { name: 'Sandra Becker', email: 'sandra@precision-gmbh.de' },
    to: [{ name: 'Max Mustermann', email: 'max@techcorp.de' }],
    subject: 'Re: Anfrage Zeiss ACCURA II 12/18/8',
    preview: 'Sehr geehrter Herr Mustermann, vielen Dank für Ihr Interesse. Anbei finden Sie...',
    body: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihr Interesse an unserer Zeiss ACCURA II.

Anbei finden Sie:
- Kalibrierprotokoll vom 15.01.2026
- Wartungshistorie der letzten 3 Jahre
- Technisches Datenblatt

Die Maschine wurde regelmäßig gewartet und befindet sich in einwandfreiem Zustand.

Bei weiteren Fragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Sandra Becker
Precision GmbH`,
    date: '2026-01-22T16:00:00Z',
    read: true,
    starred: false,
    hasAttachment: true,
    folder: 'sent',
    inquiryId: '1',
    threadId: 'thread-1',
  },
  {
    id: '5',
    from: { name: 'Sandra Becker', email: 'sandra@precision-gmbh.de' },
    to: [{ name: 'Julia Schmidt', email: 'j.schmidt@measuring-solutions.de' }],
    subject: 'Re: Interesse an Mitutoyo CRYSTA-Apex',
    preview: 'Entwurf: Sehr geehrte Frau Schmidt, die Maschine ist noch verfügbar...',
    body: `Sehr geehrte Frau Schmidt,

die Maschine ist noch verfügbar. Eine Besichtigung ist jederzeit möglich.

Transport können wir gerne organisieren - je nach Entfernung zwischen 500-1500 EUR.

Wann würde Ihnen ein Termin passen?`,
    date: '2026-01-23T08:30:00Z',
    read: true,
    starred: false,
    hasAttachment: false,
    folder: 'drafts',
    inquiryId: '2',
    threadId: 'thread-2',
  },
];

// Email templates
const emailTemplates = [
  { id: '1', name: 'Erste Antwort', subject: 'Re: Ihre Anfrage auf CMM24' },
  { id: '2', name: 'Angebot senden', subject: 'Ihr Angebot von Precision GmbH' },
  { id: '3', name: 'Besichtigung vereinbaren', subject: 'Terminvorschlag Besichtigung' },
  { id: '4', name: 'Nachfassen', subject: 'Rückfrage zu Ihrer Anfrage' },
];

// User signature (from settings)
const userSignature = `
--
Mit freundlichen Grüßen,

Sandra Becker
Precision GmbH
Tel: +49 89 123456
Web: https://precision-gmbh.de`;

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('list');

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeTemplate, setComposeTemplate] = useState('');
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);

  const folderEmails = emails.filter((e) => e.folder === activeFolder);
  const filteredEmails = folderEmails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = emails.filter((e) => e.folder === 'inbox' && !e.read).length;
  const draftCount = emails.filter((e) => e.folder === 'drafts').length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success('Postfach aktualisiert');
  };

  const handleMarkRead = (emailId: string, read: boolean) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, read } : e))
    );
  };

  const handleToggleStar = (emailId: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, starred: !e.starred } : e))
    );
  };

  const handleArchive = (emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId));
    setSelectedEmail(null);
    setViewState('list');
    toast.success('E-Mail archiviert');
  };

  const handleDelete = (emailId: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, folder: 'trash' as const } : e))
    );
    setSelectedEmail(null);
    setViewState('list');
    toast.success('E-Mail in Papierkorb verschoben');
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
    setComposeBody(userSignature);
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
    setComposeBody(`${userSignature}\n\n-------- Ursprüngliche Nachricht --------\nVon: ${email.from.name} <${email.from.email}>\nDatum: ${formatFullDate(email.date)}\n\n${email.body}`);
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
    toast.info('Entwurf verworfen');
  };

  const handleSend = () => {
    if (!composeTo || !composeSubject) {
      toast.error('Bitte Empfänger und Betreff angeben');
      return;
    }

    const newEmail: Email = {
      id: `new-${Date.now()}`,
      from: { name: 'Sandra Becker', email: 'sandra@precision-gmbh.de' },
      to: [{ name: composeTo.split('@')[0], email: composeTo }],
      subject: composeSubject,
      preview: composeBody.slice(0, 100),
      body: composeBody,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      hasAttachment: false,
      folder: 'sent',
    };

    setEmails((prev) => [newEmail, ...prev]);
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
    
    toast.success('E-Mail gesendet');
  };

  const handleSaveDraft = () => {
    const newDraft: Email = {
      id: `draft-${Date.now()}`,
      from: { name: 'Sandra Becker', email: 'sandra@precision-gmbh.de' },
      to: composeTo ? [{ name: composeTo.split('@')[0], email: composeTo }] : [],
      subject: composeSubject || '(Kein Betreff)',
      preview: composeBody.slice(0, 100) || '(Leerer Entwurf)',
      body: composeBody,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      hasAttachment: false,
      folder: 'drafts',
    };

    setEmails((prev) => [newDraft, ...prev]);
    setComposeTo('');
    setComposeCc('');
    setComposeBcc('');
    setComposeSubject('');
    setComposeBody('');
    setActiveFolder('drafts');
    setViewState('list');
    toast.success('Entwurf gespeichert');
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId);
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
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render the right panel based on view state
  const renderRightPanel = () => {
    // Compose new email
    if (viewState === 'compose' || viewState === 'reply') {
      return (
        <div className="flex flex-col h-full">
          {/* Compose Header - Compact */}
          <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold text-sm">
                {viewState === 'reply' ? 'Antworten' : 'Neue E-Mail'}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleDiscard}>
                <X className="mr-1 h-3 w-3" />
                Verwerfen
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSaveDraft}>
                <FileEdit className="mr-1 h-3 w-3" />
                Entwurf
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={handleSend}>
                <Send className="mr-1 h-3 w-3" />
                Senden
              </Button>
            </div>
          </div>

          {/* Compose Form - Optimized for quick email writing */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Email Fields - Compact */}
            <div className="shrink-0 border-b bg-background">
              {/* To Field */}
              <div className="flex items-center border-b px-4">
                <Label htmlFor="to" className="w-12 shrink-0 text-sm text-muted-foreground">An:</Label>
                <Input
                  id="to"
                  placeholder="empfaenger@beispiel.de"
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

              {/* CC/BCC Fields - Togglable */}
              {showCcBcc && (
                <>
                  <div className="flex items-center border-b px-4">
                    <Label htmlFor="cc" className="w-12 shrink-0 text-sm text-muted-foreground">Cc:</Label>
                    <Input
                      id="cc"
                      placeholder="Weitere Empfänger (Komma-getrennt)"
                      value={composeCc}
                      onChange={(e) => setComposeCc(e.target.value)}
                      className="border-0 focus-visible:ring-0 shadow-none rounded-none px-2"
                    />
                  </div>
                  <div className="flex items-center border-b px-4">
                    <Label htmlFor="bcc" className="w-12 shrink-0 text-sm text-muted-foreground">Bcc:</Label>
                    <Input
                      id="bcc"
                      placeholder="Versteckte Empfänger (Komma-getrennt)"
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

              {/* Subject Field */}
              <div className="flex items-center px-4">
                <Label htmlFor="subject" className="w-12 shrink-0 text-sm text-muted-foreground">Betreff:</Label>
                <Input
                  id="subject"
                  placeholder="Betreff eingeben..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="border-0 focus-visible:ring-0 shadow-none rounded-none px-2"
                />
                {viewState === 'compose' && (
                  <Select value={composeTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="w-auto border-0 h-8 text-xs gap-1 text-muted-foreground">
                      <SelectValue placeholder="Vorlage" />
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

            {/* Message Body - Takes all remaining space */}
            <div className="flex-1 flex flex-col min-h-0">
              <Textarea
                id="body"
                placeholder="Ihre Nachricht..."
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

            {/* Bottom Toolbar - Compact */}
            <div className="shrink-0 flex items-center justify-between border-t px-4 py-2 bg-muted/30">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <Paperclip className="mr-1 h-3 w-3" />
                  Anhängen
                </Button>
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">⌘</kbd>
                <span className="mx-1">+</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">Enter</kbd>
                <span className="ml-1">zum Senden</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // View email
    if (viewState === 'email' && selectedEmail) {
      return (
        <div className="flex flex-col h-full">
          {/* Email Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
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
                    {selectedEmail.read ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleArchive(selectedEmail.id)}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archivieren
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(selectedEmail.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Email Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-3xl">
              {/* Subject */}
              <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>

              {/* Metadata */}
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
                    An: {selectedEmail.to.map((t) => t.email).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFullDate(selectedEmail.date)}
                  </p>
                </div>
              </div>

              {/* Inquiry Link */}
              {selectedEmail.inquiryId && (
                <Card className="mt-4 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Verknüpft mit Anfrage</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/seller/anfragen/${selectedEmail.inquiryId}`}>
                        Anfrage anzeigen
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}

              {/* Body */}
              <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed border-t pt-6">
                {selectedEmail.body}
              </div>

              {/* Attachments */}
              {selectedEmail.hasAttachment && (
                <div className="mt-6 rounded-lg border p-4">
                  <p className="text-sm font-medium mb-2">Anhänge</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Kalibrierprotokoll.pdf
                    </Button>
                    <Button variant="outline" size="sm">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Wartungshistorie.pdf
                    </Button>
                  </div>
                </div>
              )}

              {/* Reply Button */}
              <div className="mt-8 pt-6 border-t">
                <Button onClick={() => handleReply(selectedEmail)} className="w-full sm:w-auto">
                  <Reply className="mr-2 h-4 w-4" />
                  Antworten
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      );
    }

    // Empty state
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground h-full">
        <div className="text-center">
          <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Wählen Sie eine E-Mail aus</p>
          <p className="text-sm mt-1">oder verfassen Sie eine neue Nachricht</p>
          <Button className="mt-4" onClick={handleCompose}>
            <PenSquare className="mr-2 h-4 w-4" />
            Neue E-Mail
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
          <h1 className="text-xl font-bold">E-Mails</h1>
          <Badge variant="secondary" className="hidden sm:flex gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Outlook verbunden
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
          <Button onClick={handleCompose}>
            <PenSquare className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Verfassen</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Folders */}
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
              Posteingang
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
              Gesendet
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
              Entwürfe
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
              Papierkorb
            </Button>
          </div>

          <Separator />

          {/* Quick Stats */}
          <div className="p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Sync: Gerade eben
            </div>
            <p className="mt-1">{emails.length} E-Mails</p>
          </div>
        </div>

        {/* Email List */}
        <div className={cn(
          'w-full flex-col border-r md:w-80 lg:w-96 md:flex',
          (viewState !== 'list' && viewState !== 'email') && 'hidden md:flex'
        )}>
          {/* Search */}
          <div className="border-b p-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="E-Mails durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Mobile Folder Tabs */}
          <div className="flex border-b md:hidden shrink-0">
            <button
              onClick={() => setActiveFolder('inbox')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeFolder === 'inbox' ? 'border-primary text-primary' : 'border-transparent'
              )}
            >
              Inbox {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveFolder('sent')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeFolder === 'sent' ? 'border-primary text-primary' : 'border-transparent'
              )}
            >
              Sent
            </button>
            <button
              onClick={() => setActiveFolder('drafts')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeFolder === 'drafts' ? 'border-primary text-primary' : 'border-transparent'
              )}
            >
              Drafts
            </button>
          </div>

          {/* Email List */}
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredEmails.length > 0 ? (
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
                            ? email.to[0]?.name || email.to[0]?.email
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
                            Anfrage
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Keine E-Mails gefunden</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Email Detail / Compose */}
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
