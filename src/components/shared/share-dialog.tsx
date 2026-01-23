'use client';

import { useState } from 'react';
import {
  Mail,
  Linkedin,
  Twitter,
  MessageCircle,
  Send,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ShareDialogProps {
  url: string;
  title: string;
  description?: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({ url, title, description, trigger }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}` 
    : `https://cmm24.de${url}`;

  const shareText = description || title;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Link kopiert!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  const handleNativeShare = async () => {
    if (typeof window !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl,
        });
        setOpen(false);
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }
  };

  const shareLinks = [
    {
      name: 'E-Mail',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        `${shareText}\n\n${fullUrl}`
      )}`,
      color: 'hover:bg-gray-100 hover:text-gray-900',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        fullUrl
      )}`,
      color: 'hover:bg-[#0077b5]/10 hover:text-[#0077b5]',
    },
    {
      name: 'X / Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(fullUrl)}`,
      color: 'hover:bg-black/10 hover:text-black',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${fullUrl}`)}`,
      color: 'hover:bg-[#25D366]/10 hover:text-[#25D366]',
      mobileOnly: true,
    },
    {
      name: 'Telegram',
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(
        fullUrl
      )}&text=${encodeURIComponent(shareText)}`,
      color: 'hover:bg-[#0088cc]/10 hover:text-[#0088cc]',
      mobileOnly: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Teilen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Copy Link */}
          <div className="flex gap-2">
            <Input
              value={fullUrl}
              readOnly
              className="flex-1 text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Native Share (Mobile) */}
          {typeof window !== 'undefined' && 'share' in navigator && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNativeShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Mit App teilen
            </Button>
          )}

          {/* Share Links */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors ${
                  link.color
                } ${link.mobileOnly ? 'sm:hidden' : ''}`}
                onClick={() => {
                  toast.success(`Teilen via ${link.name}`);
                }}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-xs">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
