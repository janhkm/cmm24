import { Resend } from 'resend';

// Initialize Resend client
// RESEND_API_KEY should be set in .env.local
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('[Email] RESEND_API_KEY is not set. Emails will not be sent.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email configuration
export const emailConfig = {
  from: {
    default: 'CMM24 <noreply@cmm24.com>',
    support: 'CMM24 Support <support@cmm24.com>',
    notifications: 'CMM24 <benachrichtigungen@cmm24.com>',
  },
  replyTo: 'support@cmm24.com',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com',
};

// Check if email sending is enabled
export const isEmailEnabled = (): boolean => {
  return resend !== null;
};
