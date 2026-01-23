'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  FileText,
  ChevronDown,
  Paperclip,
  X,
  Loader2,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Email templates
const emailTemplates = [
  {
    id: 'first-response',
    name: 'Erstantwort',
    subject: 'Ihre Anfrage zu {{maschine}}',
    body: `Sehr geehrte/r {{kunde}},

vielen Dank für Ihr Interesse an unserer {{maschine}}.

Gerne beantworte ich Ihre Fragen und stehe für weitere Informationen zur Verfügung.

Die Maschine ist derzeit verfügbar und kann nach Vereinbarung besichtigt werden.

Mit freundlichen Grüßen
{{verkäufer}}`,
  },
  {
    id: 'offer',
    name: 'Angebot senden',
    subject: 'Angebot: {{maschine}}',
    body: `Sehr geehrte/r {{kunde}},

wie besprochen sende ich Ihnen hiermit unser Angebot für die {{maschine}}.

Preis: {{preis}}
(zzgl. Transport und Installation nach Aufwand)

Das Angebot ist 14 Tage gültig.

Bei Fragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
{{verkäufer}}`,
  },
  {
    id: 'appointment',
    name: 'Besichtigungstermin',
    subject: 'Besichtigungstermin: {{maschine}}',
    body: `Sehr geehrte/r {{kunde}},

gerne können Sie die {{maschine}} bei uns vor Ort besichtigen.

Bitte teilen Sie mir 2-3 mögliche Termine mit, damit wir einen passenden Zeitpunkt finden können.

Mit freundlichen Grüßen
{{verkäufer}}`,
  },
  {
    id: 'followup',
    name: 'Follow-up',
    subject: 'Rückfrage: {{maschine}}',
    body: `Sehr geehrte/r {{kunde}},

ich wollte mich erkundigen, ob Sie noch Interesse an der {{maschine}} haben.

Falls Sie weitere Informationen benötigen oder Fragen haben, stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
{{verkäufer}}`,
  },
];

interface EmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  recipientEmail: string;
  recipientCompany?: string;
  machineName?: string;
  machinePrice?: string;
  sellerName?: string;
}

export function EmailComposer({
  open,
  onOpenChange,
  recipientName,
  recipientEmail,
  recipientCompany,
  machineName = 'Maschine',
  machinePrice = 'Auf Anfrage',
  sellerName = 'Ihr CMM24-Verkäufer',
}: EmailComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Replace template variables
  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{kunde\}\}/g, recipientName)
      .replace(/\{\{firma\}\}/g, recipientCompany || '')
      .replace(/\{\{maschine\}\}/g, machineName)
      .replace(/\{\{preis\}\}/g, machinePrice)
      .replace(/\{\{verkäufer\}\}/g, sellerName);
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(replaceVariables(template.subject));
      setBody(replaceVariables(template.body));
    }
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSelectedTemplate(null);
      setSubject('');
      setBody('');
      setIsSent(false);
    }
  }, [open]);

  // Simulate sending
  const handleSend = async () => {
    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    setIsSent(true);
    // Auto-close after success
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            E-Mail senden
          </DialogTitle>
          <DialogDescription>
            An: {recipientName} ({recipientEmail})
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800">E-Mail gesendet!</h3>
            <p className="text-muted-foreground mt-1">
              Ihre Nachricht wurde erfolgreich an {recipientName} gesendet.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Vorlage auswählen</Label>
              <div className="flex flex-wrap gap-2">
                {emailTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyTemplate(template.id)}
                    className="gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recipient Display */}
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{recipientName}</p>
                  <p className="text-xs text-muted-foreground">{recipientEmail}</p>
                </div>
                {recipientCompany && (
                  <Badge variant="secondary">{recipientCompany}</Badge>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Betreff</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Betreff eingeben..."
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Nachricht</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nachricht eingeben..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Variable Hints */}
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-3">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Verfügbare Variablen (werden automatisch ersetzt):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['{{kunde}}', '{{firma}}', '{{maschine}}', '{{preis}}', '{{verkäufer}}'].map((v) => (
                  <code
                    key={v}
                    className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs cursor-pointer hover:bg-blue-200"
                    onClick={() => setBody((prev) => prev + ' ' + v)}
                  >
                    {v}
                  </code>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSend}
                  disabled={!subject || !body || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Senden
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
