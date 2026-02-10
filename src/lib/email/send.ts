'use server';

import { resend, emailConfig, isEmailEnabled } from './client';
import {
  WelcomeEmail,
  EmailVerificationEmail,
  NewInquiryEmail,
  InquiryConfirmationEmail,
  PasswordResetEmail,
  ListingApprovedEmail,
  AutoReplyEmail,
  ContactFormEmail,
  TeamInvitationEmail,
  UpgradeConfirmationEmail,
  PaymentFailedEmail,
  ListingRejectedEmail,
  PasswordChangedEmail,
  ContactFormConfirmationEmail,
  SubscriptionCanceledEmail,
  SubscriptionExpiringEmail,
  TeamMemberJoinedEmail,
  AccountSuspendedEmail,
  AccountVerifiedEmail,
  InquiryMessageEmail,
} from './templates';

// =============================================================================
// Types
// =============================================================================

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

async function sendEmail(
  to: string,
  subject: string,
  react: React.ReactElement,
  options?: {
    from?: string;
    replyTo?: string;
  }
): Promise<SendEmailResult> {
  if (!isEmailEnabled() || !resend) {
    console.warn('[Email] Email sending is disabled (no API key)');
    return { success: true, messageId: 'mock-disabled' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options?.from || emailConfig.from.default,
      to,
      subject,
      react,
      replyTo: options?.replyTo || emailConfig.replyTo,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return { success: false, error: error.message };
    }

    // Email erfolgreich gesendet
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

// =============================================================================
// Email Send Functions
// =============================================================================

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(params: {
  to: string;
  userName: string;
  companyName: string;
}): Promise<SendEmailResult> {
  const { to, userName, companyName } = params;
  
  return sendEmail(
    to,
    `Willkommen bei CMM24, ${userName}!`,
    WelcomeEmail({
      userName,
      companyName,
      loginUrl: `${emailConfig.baseUrl}/login`,
    })
  );
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(params: {
  to: string;
  userName: string;
  verificationUrl: string;
}): Promise<SendEmailResult> {
  const { to, userName, verificationUrl } = params;
  
  return sendEmail(
    to,
    'Bestätigen Sie Ihre E-Mail-Adresse',
    EmailVerificationEmail({
      userName,
      verificationUrl,
    })
  );
}

/**
 * Send new inquiry notification to seller
 */
export async function sendNewInquiryEmail(params: {
  to: string;
  sellerName: string;
  listingTitle: string;
  listingPrice: string;
  listingImage?: string;
  listingUrl: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerCompany?: string;
  message: string;
  inquiryId: string;
}): Promise<SendEmailResult> {
  const { to, inquiryId, ...rest } = params;
  
  return sendEmail(
    to,
    `Neue Anfrage: ${rest.listingTitle}`,
    NewInquiryEmail({
      ...rest,
      inquiryUrl: `${emailConfig.baseUrl}/seller/anfragen/${inquiryId}`,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

/**
 * Send inquiry confirmation to buyer
 */
export async function sendInquiryConfirmationEmail(params: {
  to: string;
  buyerName: string;
  listingTitle: string;
  listingPrice: string;
  listingImage?: string;
  listingSlug: string;
  sellerCompany: string;
}): Promise<SendEmailResult> {
  const { to, listingSlug, ...rest } = params;
  
  return sendEmail(
    to,
    `Ihre Anfrage: ${rest.listingTitle}`,
    InquiryConfirmationEmail({
      ...rest,
      listingUrl: `${emailConfig.baseUrl}/maschinen/${listingSlug}`,
    })
  );
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  userName: string;
  resetUrl: string;
}): Promise<SendEmailResult> {
  const { to, userName, resetUrl } = params;
  
  return sendEmail(
    to,
    'Passwort zurücksetzen',
    PasswordResetEmail({
      userName,
      resetUrl,
    })
  );
}

/**
 * Send listing approved notification
 */
export async function sendListingApprovedEmail(params: {
  to: string;
  sellerName: string;
  listingTitle: string;
  listingPrice: string;
  listingImage?: string;
  listingSlug: string;
}): Promise<SendEmailResult> {
  const { to, listingSlug, ...rest } = params;
  
  return sendEmail(
    to,
    `Ihr Inserat ist online: ${rest.listingTitle}`,
    ListingApprovedEmail({
      ...rest,
      listingUrl: `${emailConfig.baseUrl}/maschinen/${listingSlug}`,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

/**
 * Send auto-reply email to inquiry sender
 */
export async function sendAutoReplyEmail(params: {
  to: string;
  recipientName: string;
  subject: string;
  message: string;
  listingTitle?: string;
  listingSlug?: string;
  companyName?: string;
}): Promise<SendEmailResult> {
  const { to, recipientName, subject, message, listingTitle, listingSlug, companyName } = params;
  
  return sendEmail(
    to,
    subject,
    AutoReplyEmail({
      recipientName,
      message,
      listingTitle,
      listingUrl: listingSlug ? `${emailConfig.baseUrl}/maschinen/${listingSlug}` : undefined,
      companyName,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

/**
 * Send contact form email to support
 */
export async function sendContactFormEmail(params: {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderCompany?: string;
  subject: string;
  message: string;
}): Promise<SendEmailResult> {
  const { senderName, senderEmail, senderPhone, senderCompany, subject, message } = params;
  
  // Send to support email
  const supportEmail = process.env.SUPPORT_EMAIL || 'kontakt@cmm24.com';
  
  return sendEmail(
    supportEmail,
    `[Kontakt] ${subject}`,
    ContactFormEmail({
      senderName,
      senderEmail,
      senderPhone,
      senderCompany,
      subject,
      message,
    }),
    {
      replyTo: senderEmail,
    }
  );
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitationEmail(params: {
  to: string;
  inviteeName?: string;
  companyName: string;
  inviterName: string | null;
  role: string;
  inviteToken: string;
}): Promise<SendEmailResult> {
  const { to, inviteeName, companyName, inviterName, role, inviteToken } = params;
  
  const inviteUrl = `${emailConfig.baseUrl}/einladung/${inviteToken}`;
  
  return sendEmail(
    to,
    `Einladung zum Team von ${companyName}`,
    TeamInvitationEmail({
      inviteeName: inviteeName || '',
      companyName,
      inviterName,
      role,
      inviteUrl,
      expiresInDays: 7,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

// =============================================================================
// Upgrade / Subscription Email Functions
// =============================================================================

/**
 * Send upgrade confirmation email
 */
export async function sendUpgradeConfirmationEmail(params: {
  to: string;
  userName: string;
  planName: string;
  interval: string;
}): Promise<SendEmailResult> {
  const { to, userName, planName, interval } = params;
  
  return sendEmail(
    to,
    `Upgrade erfolgreich: ${planName}-Plan`,
    UpgradeConfirmationEmail({
      userName,
      planName,
      interval,
      dashboardUrl: `${emailConfig.baseUrl}/seller/dashboard`,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(params: {
  to: string;
  userName: string;
  planName: string;
}): Promise<SendEmailResult> {
  const { to, userName, planName } = params;
  
  return sendEmail(
    to,
    'Zahlung fehlgeschlagen - Bitte aktualisieren Sie Ihre Zahlungsmethode',
    PaymentFailedEmail({
      userName,
      planName,
      billingUrl: `${emailConfig.baseUrl}/seller/abo`,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

/**
 * Send subscription canceled confirmation email
 */
export async function sendSubscriptionCanceledEmail(params: {
  to: string;
  userName: string;
  planName: string;
  activeUntil: string;
}): Promise<SendEmailResult> {
  const { to, userName, planName, activeUntil } = params;
  
  return sendEmail(
    to,
    `Kuendigung bestaetigt: ${planName}-Plan`,
    SubscriptionCanceledEmail({
      userName,
      planName,
      activeUntil,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

/**
 * Send subscription expiring reminder email
 */
export async function sendSubscriptionExpiringEmail(params: {
  to: string;
  userName: string;
  planName: string;
  daysLeft: number;
  expiresAt: string;
}): Promise<SendEmailResult> {
  const { to, userName, planName, daysLeft, expiresAt } = params;
  
  return sendEmail(
    to,
    `Ihr ${planName}-Plan laeuft in ${daysLeft} Tagen ab`,
    SubscriptionExpiringEmail({
      userName,
      planName,
      daysLeft,
      expiresAt,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

// =============================================================================
// Listing Email Functions (additional)
// =============================================================================

/**
 * Send listing rejected notification email
 */
export async function sendListingRejectedEmail(params: {
  to: string;
  sellerName: string;
  listingTitle: string;
  rejectionReason: string;
  listingId: string;
}): Promise<SendEmailResult> {
  const { to, sellerName, listingTitle, rejectionReason, listingId } = params;
  
  return sendEmail(
    to,
    `Inserat nicht freigegeben: ${listingTitle}`,
    ListingRejectedEmail({
      sellerName,
      listingTitle,
      rejectionReason,
      listingEditUrl: `${emailConfig.baseUrl}/seller/inserate/${listingId}`,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

// =============================================================================
// Security Email Functions
// =============================================================================

/**
 * Send password changed security notification
 */
export async function sendPasswordChangedEmail(params: {
  to: string;
  userName: string;
}): Promise<SendEmailResult> {
  const { to, userName } = params;
  
  const changeDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return sendEmail(
    to,
    'Passwort geaendert - Sicherheitshinweis',
    PasswordChangedEmail({
      userName,
      changeDate,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

// =============================================================================
// Contact Form Confirmation
// =============================================================================

/**
 * Send contact form confirmation to sender
 */
export async function sendContactFormConfirmationEmail(params: {
  to: string;
  senderName: string;
  subject: string;
  message: string;
}): Promise<SendEmailResult> {
  const { to, senderName, subject, message } = params;
  
  return sendEmail(
    to,
    'Wir haben Ihre Nachricht erhalten',
    ContactFormConfirmationEmail({
      senderName,
      subject,
      message,
    })
  );
}

// =============================================================================
// Team Email Functions (additional)
// =============================================================================

/**
 * Send team member joined notification to owner
 */
export async function sendTeamMemberJoinedEmail(params: {
  to: string;
  ownerName: string;
  memberName: string;
  memberEmail: string;
  role: string;
  companyName: string;
}): Promise<SendEmailResult> {
  const { to, ownerName, memberName, memberEmail, role, companyName } = params;
  
  return sendEmail(
    to,
    `${memberName} ist Ihrem Team beigetreten`,
    TeamMemberJoinedEmail({
      ownerName,
      memberName,
      memberEmail,
      role,
      companyName,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

// =============================================================================
// Account Admin Email Functions
// =============================================================================

/**
 * Send account suspended notification
 */
export async function sendAccountSuspendedEmail(params: {
  to: string;
  userName: string;
  companyName: string;
  reason: string;
}): Promise<SendEmailResult> {
  const { to, userName, companyName, reason } = params;
  
  return sendEmail(
    to,
    `Account gesperrt: ${companyName}`,
    AccountSuspendedEmail({
      userName,
      companyName,
      reason,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

/**
 * Send account verified notification
 */
export async function sendAccountVerifiedEmail(params: {
  to: string;
  userName: string;
  companyName: string;
}): Promise<SendEmailResult> {
  const { to, userName, companyName } = params;
  
  return sendEmail(
    to,
    `${companyName} wurde verifiziert!`,
    AccountVerifiedEmail({
      userName,
      companyName,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

// =============================================================================
// Inquiry Message Notification
// =============================================================================

/**
 * Benachrichtigung ueber neue Nachricht in einer Anfrage
 */
export async function sendInquiryMessageEmail(params: {
  to: string;
  recipientName: string;
  senderName: string;
  senderCompany?: string;
  listingTitle: string;
  messagePreview: string;
  inquiryUrl: string;
}): Promise<SendEmailResult> {
  const { to, recipientName, senderName, senderCompany, listingTitle, messagePreview, inquiryUrl } = params;

  return sendEmail(
    to,
    `Neue Nachricht zu: ${listingTitle}`,
    InquiryMessageEmail({
      recipientName,
      senderName,
      senderCompany,
      listingTitle,
      messagePreview,
      inquiryUrl,
    }),
    {
      from: emailConfig.from.notifications,
    }
  );
}

// =============================================================================
// Batch Email Functions
// =============================================================================

/**
 * Send batch emails (for admin notifications, etc.)
 */
export async function sendBatchEmails(
  emails: Array<{
    to: string;
    subject: string;
    react: React.ReactElement;
  }>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email.to, email.subject, email.react);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
