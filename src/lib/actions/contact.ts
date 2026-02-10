'use server';

import { sendContactFormEmail, sendContactFormConfirmationEmail } from '@/lib/email/send';
import type { ActionResult } from './types';
import { checkRateLimit, getRateLimitMessage } from '@/lib/rate-limit';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  acceptedPrivacy: boolean;
}

/**
 * Submit contact form
 */
export async function submitContactForm(data: ContactFormData): Promise<ActionResult<void>> {
  // Rate Limiting
  const rateLimit = await checkRateLimit('contact');
  if (!rateLimit.success) {
    return { success: false, error: getRateLimitMessage('contact') };
  }

  // Datenschutz-Einwilligung pruefen (DSGVO Art. 6 Abs. 1 lit. a)
  if (!data.acceptedPrivacy) {
    return { success: false, error: 'Bitte akzeptieren Sie die Datenschutzerklärung' };
  }

  // Validate input
  if (!data.name || data.name.trim().length < 2) {
    return { success: false, error: 'Bitte geben Sie Ihren Namen ein' };
  }
  
  if (!data.email || !data.email.includes('@')) {
    return { success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' };
  }
  
  if (!data.subject || data.subject.trim().length < 3) {
    return { success: false, error: 'Bitte geben Sie einen Betreff ein' };
  }
  
  if (!data.message || data.message.trim().length < 10) {
    return { success: false, error: 'Bitte geben Sie eine Nachricht ein (min. 10 Zeichen)' };
  }
  
  try {
    const result = await sendContactFormEmail({
      senderName: data.name.trim(),
      senderEmail: data.email.trim(),
      senderPhone: data.phone?.trim() || undefined,
      senderCompany: data.company?.trim() || undefined,
      subject: data.subject.trim(),
      message: data.message.trim(),
    });
    
    if (!result.success) {
      console.error('[Contact Form] Email send failed:', result.error);
      return { success: false, error: 'Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.' };
    }
    
    // Bestaetigungs-E-Mail an Absender senden (fire and forget)
    sendContactFormConfirmationEmail({
      to: data.email.trim(),
      senderName: data.name.trim().split(' ')[0] || data.name.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
    }).catch(err => {
      console.error('[Contact Form] Confirmation email failed');
    });
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[Contact Form] Error:', error);
    return { success: false, error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' };
  }
}
