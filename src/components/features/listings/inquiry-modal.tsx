'use client';

import { useState } from 'react';
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Listing } from '@/types';
import { createInquiry } from '@/lib/actions/inquiries';
import { Link } from '@/i18n/navigation';

interface InquiryModalProps {
  listing: Listing;
  trigger?: React.ReactNode;
}

export function InquiryModal({ listing, trigger }: InquiryModalProps) {
  const t = useTranslations('inquiry');
  const tc = useTranslations('common');

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: t('defaultMessage', { listing: listing.title }),
    acceptPrivacy: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptPrivacy) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the real server action to create inquiry
      // This will also auto-create a contact for Business sellers
      const result = await createInquiry({
        listingId: listing.id,
        contactName: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone || undefined,
        contactCompany: formData.company || undefined,
        message: formData.message,
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success(t('sent'));
      } else {
        setError(result.error || t('errorOccurred'));
        toast.error(result.error || t('sentError'));
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      setError(t('unexpectedError'));
      toast.error(t('sentError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      setIsSuccess(false);
      setError(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: t('defaultMessage', { listing: listing.title }),
        acceptPrivacy: false,
      });
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {t('title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                {t('successTitle')}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t('successDesc')}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-6">
              {tc('close')}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('title')}</DialogTitle>
              <DialogDescription>
                {t('description', { listing: listing.title })}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')} *</Label>
                  <Input
                    id="name"
                    placeholder={t('namePlaceholder')}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{t('company')}</Label>
                  <Input
                    id="company"
                    placeholder={t('companyPlaceholder')}
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('phonePlaceholder')}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t('message')} *</Label>
                <Textarea
                  id="message"
                  placeholder={t('messagePlaceholder')}
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={formData.acceptPrivacy}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acceptPrivacy: checked as boolean })
                  }
                  required
                />
                <Label
                  htmlFor="privacy"
                  className="text-sm leading-tight cursor-pointer"
                >
                  {t.rich('privacyConsent', {
                    privacyLink: (chunks) => (
                      <Link
                        href="/datenschutz"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </Label>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  {tc('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.acceptPrivacy}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('sending')}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('title')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
