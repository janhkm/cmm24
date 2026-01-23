'use client';

import { useState } from 'react';
import { 
  Share2, 
  Link as LinkIcon, 
  Mail, 
  Linkedin, 
  Twitter,
  CheckCircle,
  MessageCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Listing } from '@/types';

interface ShareModalProps {
  listing: Listing;
  trigger?: React.ReactNode;
}

export function ShareModal({ listing, trigger }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined' 
    ? `${window.location.origin}/maschinen/${listing.slug}`
    : `https://cmm24.de/maschinen/${listing.slug}`;

  const title = listing.title;
  const text = `${listing.title} - ${(listing.price / 100).toLocaleString('de-DE')} € auf CMM24`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Schau dir dieses Angebot an:\n\n${text}\n\n${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        // User cancelled or error
        console.error('Share failed:', err);
      }
    }
  };

  // Check if native share is available
  const canNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Teilen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inserat teilen</DialogTitle>
          <DialogDescription>
            Teilen Sie dieses Inserat mit Kollegen oder in sozialen Netzwerken.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link kopieren</label>
            <div className="flex gap-2">
              <Input
                value={url}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant={copied ? 'default' : 'outline'}
                size="icon"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600">Link kopiert!</p>
            )}
          </div>

          {/* Share Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Teilen via</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start"
                asChild
              >
                <a href={shareLinks.email}>
                  <Mail className="mr-2 h-4 w-4" />
                  E-Mail
                </a>
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                asChild
              >
                <a 
                  href={shareLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                asChild
              >
                <a 
                  href={shareLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  X / Twitter
                </a>
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                asChild
              >
                <a 
                  href={shareLinks.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button
                variant="outline"
                className="justify-start col-span-2 sm:col-span-1"
                asChild
              >
                <a 
                  href={shareLinks.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Telegram
                </a>
              </Button>
              {canNativeShare && (
                <Button
                  variant="outline"
                  className="justify-start col-span-2 sm:col-span-1"
                  onClick={handleNativeShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Mehr...
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
