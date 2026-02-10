'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';
import { ErrorMessages } from './types';
import { sendInquiryMessageEmail } from '@/lib/email/send';
import { sanitizeText } from '@/lib/validations/sanitize';

// =============================================================================
// Typen
// =============================================================================

export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender_type: 'buyer' | 'seller' | 'system';
  sender_profile_id: string | null;
  content: string;
  is_read: boolean | null;
  read_at: string | null;
  created_at: string | null;
  sender_name?: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
}

export interface InquiryThread {
  messages: InquiryMessage[];
  inquiry: {
    id: string;
    account_id: string;
    contact_name: string;
    contact_email: string;
    contact_company: string | null;
    listing_title: string;
    listing_slug: string;
    original_message: string;
    created_at: string;
  };
}

// =============================================================================
// Nachrichten fuer eine Anfrage laden
// =============================================================================

export async function getInquiryMessages(
  inquiryId: string
): Promise<ActionResult<InquiryThread>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Anfrage laden mit Listing-Daten
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select(`
        id,
        contact_name,
        contact_email,
        contact_company,
        message,
        created_at,
        buyer_profile_id,
        account_id,
        listings(title, slug)
      `)
      .eq('id', inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }

    // Nachrichten laden
    const { data: messages, error: messagesError } = await supabase
      .from('inquiry_messages')
      .select(`
        id,
        inquiry_id,
        sender_type,
        sender_profile_id,
        content,
        is_read,
        read_at,
        created_at,
        attachment_url,
        attachment_name,
        attachment_type,
        attachment_size
      `)
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('[getInquiryMessages] Fehler:', messagesError);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }

    // Sender-Namen fuer alle Nachrichten laden
    const senderIds = [...new Set(
      (messages || [])
        .map((m) => m.sender_profile_id)
        .filter(Boolean) as string[]
    )];

    let senderNames: Record<string, string> = {};
    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', senderIds);

      if (profiles) {
        senderNames = Object.fromEntries(
          profiles.map((p) => [p.id, p.full_name || p.email?.split('@')[0] || 'Unbekannt'])
        );
      }
    }

    const listing = inquiry.listings as { title: string; slug: string } | null;

    return {
      success: true,
      data: {
        messages: (messages || []).map((m) => ({
          ...m,
          sender_type: m.sender_type as 'buyer' | 'seller' | 'system',
          sender_name: m.sender_profile_id
            ? senderNames[m.sender_profile_id] || 'Unbekannt'
            : m.sender_type === 'buyer'
              ? inquiry.contact_name
              : 'System',
        })),
        inquiry: {
          id: inquiry.id,
          account_id: inquiry.account_id,
          contact_name: inquiry.contact_name,
          contact_email: inquiry.contact_email,
          contact_company: inquiry.contact_company,
          listing_title: listing?.title || 'Unbekanntes Inserat',
          listing_slug: listing?.slug || '',
          original_message: inquiry.message,
          created_at: inquiry.created_at || new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    console.error('[getInquiryMessages] Unerwarteter Fehler:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Datei-Upload fuer Nachrichtenanhaenge (Business-only)
// =============================================================================

export async function uploadMessageAttachment(
  inquiryId: string,
  formData: FormData
): Promise<ActionResult<{ url: string; name: string; type: string; size: number }>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Keine Datei ausgewaehlt', code: 'VALIDATION_ERROR' };
    }

    // Dateityp pruefen
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Nur JPG, PNG, WEBP und PDF Dateien erlaubt', code: 'VALIDATION_ERROR' };
    }

    // Dateigroesse pruefen (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Datei ist zu gross (max. 10 MB)', code: 'VALIDATION_ERROR' };
    }

    // Dateiname generieren
    const ext = file.name.split('.').pop() || 'bin';
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const path = `${user.id}/${inquiryId}/${uniqueName}`;

    // In Supabase Storage hochladen
    const { error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[uploadMessageAttachment] Upload-Fehler:', uploadError);
      return { success: false, error: 'Upload fehlgeschlagen', code: 'SERVER_ERROR' };
    }

    // Signierte URL erstellen (7 Tage gueltig)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    if (signedUrlError || !signedUrlData) {
      console.error('[uploadMessageAttachment] URL-Fehler:', signedUrlError);
      return { success: false, error: 'URL konnte nicht erstellt werden', code: 'SERVER_ERROR' };
    }

    return {
      success: true,
      data: {
        url: signedUrlData.signedUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      },
    };
  } catch (error) {
    console.error('[uploadMessageAttachment] Fehler:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Nachricht senden (Seller oder Buyer)
// =============================================================================

export async function sendInquiryMessage(
  inquiryId: string,
  content: string,
  attachment?: {
    url: string;
    name: string;
    type: string;
    size: number;
  }
): Promise<ActionResult<InquiryMessage>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Content validieren
    const sanitizedContent = sanitizeText(content);
    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      return { success: false, error: 'Nachricht darf nicht leer sein', code: 'VALIDATION_ERROR' };
    }

    if (sanitizedContent.length > 10000) {
      return { success: false, error: 'Nachricht ist zu lang (max. 10.000 Zeichen)', code: 'VALIDATION_ERROR' };
    }

    // Anfrage laden um Sender-Typ zu bestimmen
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select(`
        id,
        account_id,
        buyer_profile_id,
        contact_name,
        contact_email,
        listings(title, slug, price, accounts(id, company_name, owner_id, profiles(email, full_name)))
      `)
      .eq('id', inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }

    // Sender-Typ bestimmen
    // Pruefen ob User der Seller ist (Account-Owner)
    const { data: account } = await supabase
      .from('accounts')
      .select('id, owner_id')
      .eq('id', inquiry.account_id)
      .single();

    const isSeller = account?.owner_id === user.id;
    const isBuyer = inquiry.buyer_profile_id === user.id;

    if (!isSeller && !isBuyer) {
      return { success: false, error: ErrorMessages.FORBIDDEN, code: 'FORBIDDEN' };
    }

    const senderType = isSeller ? 'seller' : 'buyer';

    // Nachricht einfuegen
    const { data: message, error: insertError } = await supabase
      .from('inquiry_messages')
      .insert({
        inquiry_id: inquiryId,
        sender_type: senderType,
        sender_profile_id: user.id,
        content: sanitizedContent,
        is_read: false,
        ...(attachment ? {
          attachment_url: attachment.url,
          attachment_name: attachment.name,
          attachment_type: attachment.type,
          attachment_size: attachment.size,
        } : {}),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[sendInquiryMessage] Insert-Fehler:', insertError);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }

    // Unread-Counter und last_message_at aktualisieren
    const updateData = {
      last_message_at: new Date().toISOString(),
      ...(isSeller
        ? { unread_messages_buyer: (await getUnreadCount(supabase, inquiryId, 'buyer')) }
        : { unread_messages_seller: (await getUnreadCount(supabase, inquiryId, 'seller')) }
      ),
    };

    await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', inquiryId);

    // E-Mail-Benachrichtigung an den Empfaenger senden (fire-and-forget)
    const listing = inquiry.listings as {
      title: string;
      slug: string;
      price: number | null;
      accounts: {
        id: string;
        company_name: string;
        owner_id: string;
        profiles: { email: string; full_name: string | null } | null;
      } | null;
    } | null;

    if (isSeller && inquiry.contact_email) {
      // Seller antwortet → Buyer benachrichtigen
      const sellerName = listing?.accounts?.profiles?.full_name || 'Verkäufer';
      const companyName = listing?.accounts?.company_name || 'CMM24';

      sendInquiryMessageEmail({
        to: inquiry.contact_email,
        recipientName: inquiry.contact_name,
        senderName: sellerName,
        senderCompany: companyName,
        listingTitle: listing?.title || 'Inserat',
        messagePreview: sanitizedContent.substring(0, 200),
        inquiryUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com'}/dashboard/anfragen`,
      }).catch((err) => {
        console.error('[sendInquiryMessage] E-Mail-Versand fehlgeschlagen:', err);
      });
    } else if (isBuyer) {
      // Buyer antwortet → Seller benachrichtigen
      const sellerEmail = listing?.accounts?.profiles?.email;
      const sellerName = listing?.accounts?.profiles?.full_name?.split(' ')[0] || 'Verkäufer';

      if (sellerEmail) {
        sendInquiryMessageEmail({
          to: sellerEmail,
          recipientName: sellerName,
          senderName: inquiry.contact_name,
          senderCompany: undefined,
          listingTitle: listing?.title || 'Inserat',
          messagePreview: sanitizedContent.substring(0, 200),
          inquiryUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com'}/seller/anfragen/${inquiryId}`,
        }).catch((err) => {
          console.error('[sendInquiryMessage] E-Mail-Versand fehlgeschlagen:', err);
        });
      }
    }

    // Wenn Seller antwortet und Status noch "new" ist, automatisch auf "contacted" setzen
    if (isSeller) {
      const { data: currentInquiry } = await supabase
        .from('inquiries')
        .select('status')
        .eq('id', inquiryId)
        .single();

      if (currentInquiry?.status === 'new') {
        await supabase
          .from('inquiries')
          .update({ status: 'contacted' })
          .eq('id', inquiryId);
      }
    }

    revalidatePath('/seller/anfragen');
    revalidatePath(`/seller/anfragen/${inquiryId}`);
    revalidatePath('/dashboard/anfragen');

    // Sender-Name fuer Rueckgabe
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    return {
      success: true,
      data: {
        ...message,
        sender_type: senderType as 'buyer' | 'seller' | 'system',
        sender_name: senderProfile?.full_name || senderProfile?.email?.split('@')[0] || 'Unbekannt',
      },
    };
  } catch (error) {
    console.error('[sendInquiryMessage] Unerwarteter Fehler:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Nachrichten als gelesen markieren
// =============================================================================

export async function markInquiryMessagesAsRead(
  inquiryId: string
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Bestimmen ob Seller oder Buyer
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('account_id, buyer_profile_id')
      .eq('id', inquiryId)
      .single();

    if (!inquiry) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }

    const { data: account } = await supabase
      .from('accounts')
      .select('owner_id')
      .eq('id', inquiry.account_id)
      .single();

    const isSeller = account?.owner_id === user.id;
    const isBuyer = inquiry.buyer_profile_id === user.id;

    if (!isSeller && !isBuyer) {
      return { success: false, error: ErrorMessages.FORBIDDEN, code: 'FORBIDDEN' };
    }

    // Nur Nachrichten des ANDEREN als gelesen markieren
    // Seller liest Buyer-Nachrichten, Buyer liest Seller-Nachrichten
    const senderTypeToMark = isSeller ? 'buyer' : 'seller';

    const now = new Date().toISOString();

    await supabase
      .from('inquiry_messages')
      .update({ is_read: true, read_at: now })
      .eq('inquiry_id', inquiryId)
      .eq('sender_type', senderTypeToMark)
      .eq('is_read', false);

    // Unread-Counter auf 0 setzen
    const counterField = isSeller ? 'unread_messages_seller' : 'unread_messages_buyer';

    await supabase
      .from('inquiries')
      .update({ [counterField]: 0 })
      .eq('id', inquiryId);

    return { success: true };
  } catch (error) {
    console.error('[markInquiryMessagesAsRead] Fehler:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Helper: Ungelesene Nachrichten zaehlen
// =============================================================================

async function getUnreadCount(
  supabase: Awaited<ReturnType<typeof createActionClient>>,
  inquiryId: string,
  forSenderType: 'buyer' | 'seller'
): Promise<number> {
  // Zaehle Nachrichten die der andere gesendet hat und noch ungelesen sind
  const otherType = forSenderType === 'buyer' ? 'seller' : 'buyer';

  // Wir zaehlen die Nachricht die gerade gesendet wurde mit
  // (ist noch nicht als gelesen markiert fuer den Empfaenger)
  const { count } = await supabase
    .from('inquiry_messages')
    .select('*', { count: 'exact', head: true })
    .eq('inquiry_id', inquiryId)
    .eq('sender_type', forSenderType === 'seller' ? 'buyer' : 'seller')
    .eq('is_read', false);

  // +1 fuer die gerade gesendete Nachricht
  return (count || 0) + 1;
}
