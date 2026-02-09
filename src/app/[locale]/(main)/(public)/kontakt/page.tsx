'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { companyInfo } from '@/data/content/company';
import { submitContactForm } from '@/lib/actions/contact';
import { toast } from 'sonner';

const subjectKeys = [
  { value: 'allgemein', key: 'general' },
  { value: 'verkauf', key: 'sell' },
  { value: 'technisch', key: 'support' },
  { value: 'abo', key: 'billing' },
  { value: 'partner', key: 'partnership' },
  { value: 'presse', key: 'press' },
  { value: 'sonstiges', key: 'other' },
];

export default function KontaktPage() {
  const t = useTranslations('contact');
  const tc = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });

  const subjects = subjectKeys.map((s) => ({
    value: s.value,
    label: t(`subjects.${s.key}`),
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const selectedSubject = subjects.find(s => s.value === formData.subject);
    
    const result = await submitContactForm({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      subject: selectedSubject?.label || formData.subject || t('subjects.general'),
      message: formData.message,
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setIsSubmitted(true);
      toast.success(t('sentToast'));
    } else {
      toast.error(result.error || t('sendError'));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="py-12 md:py-16">
      <div className="container-page">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('email')}</h3>
                    <a 
                      href={`mailto:${companyInfo.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {companyInfo.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('phone')}</h3>
                    <a 
                      href={`tel:${companyInfo.phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {companyInfo.phone}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('businessHours')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('address')}</h3>
                    <p className="text-muted-foreground">
                      {companyInfo.street}<br />
                      {companyInfo.postalCode} {companyInfo.city}<br />
                      {companyInfo.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('responseTime')}</h3>
                    <p className="text-muted-foreground">
                      {t('responseTimeDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('sendMessage')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('successTitle')}</h3>
                    <p className="text-muted-foreground mb-6">
                      {t('successDesc')}
                    </p>
                    <Button variant="outline" onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        subject: '',
                        message: '',
                      });
                    }}>
                      {t('sendAnother')}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">{t('name')} *</Label>
                        <Input 
                          id="name" 
                          placeholder={t('namePlaceholder')}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">{t('company')}</Label>
                        <Input 
                          id="company" 
                          placeholder={t('companyPlaceholder')}
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">{t('email')} *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder={t('emailPlaceholder')}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('phone')}</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder={t('phonePlaceholder')}
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">{t('subject')} *</Label>
                      <Select 
                        value={formData.subject} 
                        onValueChange={(value) => handleInputChange('subject', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('subjectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">{t('message')} *</Label>
                      <Textarea 
                        id="message" 
                        placeholder={t('messagePlaceholder')}
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        * {tc('required')}
                      </p>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {tc('sending')}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {t('sendMessage')}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
