import { createClient } from '@supabase/supabase-js';
import { encryptToken, decryptToken } from './crypto';

// =============================================================================
// Microsoft Graph / Outlook Integration
// =============================================================================

// Supabase Admin Client (Service Role) für Token-Updates
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Config
export const outlookConfig = {
  clientId: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  tenantId: process.env.AZURE_TENANT_ID || 'common',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/email/callback/outlook`,
  scopes: [
    'openid',
    'profile',
    'email',
    'offline_access',
    'Mail.Read',
    'Mail.ReadWrite',
    'Mail.Send',
    'User.Read',
  ],
};

/**
 * Generiert die OAuth-Autorisierungs-URL für Microsoft.
 */
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: outlookConfig.clientId,
    response_type: 'code',
    redirect_uri: outlookConfig.redirectUri,
    scope: outlookConfig.scopes.join(' '),
    state,
    response_mode: 'query',
    prompt: 'consent', // Immer Zustimmung einholen für refresh_token
  });

  return `https://login.microsoftonline.com/${outlookConfig.tenantId}/oauth2/v2.0/authorize?${params}`;
}

// =============================================================================
// Token-Operationen
// =============================================================================

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // Sekunden
  token_type: string;
  scope: string;
}

/**
 * Tauscht einen Authorization Code gegen Access + Refresh Token.
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const response = await fetch(
    `https://login.microsoftonline.com/${outlookConfig.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: outlookConfig.clientId,
        client_secret: outlookConfig.clientSecret,
        code,
        redirect_uri: outlookConfig.redirectUri,
        grant_type: 'authorization_code',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('[Outlook] Token-Austausch fehlgeschlagen:', error);
    throw new Error(error.error_description || 'Token-Austausch fehlgeschlagen');
  }

  return response.json();
}

/**
 * Erneuert einen abgelaufenen Access Token mit dem Refresh Token.
 */
async function refreshAccessToken(refreshTokenEncrypted: string): Promise<TokenResponse> {
  const refreshToken = decryptToken(refreshTokenEncrypted);

  const response = await fetch(
    `https://login.microsoftonline.com/${outlookConfig.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: outlookConfig.clientId,
        client_secret: outlookConfig.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: outlookConfig.scopes.join(' '),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('[Outlook] Token-Refresh fehlgeschlagen:', error);
    throw new Error(error.error_description || 'Token-Refresh fehlgeschlagen');
  }

  return response.json();
}

/**
 * Gibt einen gültigen Access Token zurück.
 * Erneuert ihn automatisch, falls abgelaufen.
 */
export async function getValidAccessToken(connectionId: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: connection, error } = await supabase
    .from('email_connections')
    .select('access_token, refresh_token, token_expires_at')
    .eq('id', connectionId)
    .eq('is_active', true)
    .single();

  if (error || !connection) {
    throw new Error('[Outlook] E-Mail-Verbindung nicht gefunden');
  }

  if (!connection.access_token || !connection.refresh_token) {
    throw new Error('[Outlook] Tokens fehlen in der Verbindung');
  }

  // Prüfen ob Token noch gültig ist (5 Minuten Puffer)
  const expiresAt = connection.token_expires_at
    ? new Date(connection.token_expires_at)
    : new Date(0);
  const isExpired = expiresAt.getTime() - 5 * 60 * 1000 < Date.now();

  if (!isExpired) {
    return decryptToken(connection.access_token);
  }

  // Token erneuern
  // Access Token abgelaufen, erneuere...
  const tokens = await refreshAccessToken(connection.refresh_token);

  // Neue Tokens in DB speichern
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  await supabase
    .from('email_connections')
    .update({
      access_token: encryptToken(tokens.access_token),
      refresh_token: encryptToken(tokens.refresh_token),
      token_expires_at: newExpiresAt,
    })
    .eq('id', connectionId);

  return tokens.access_token;
}

// =============================================================================
// Microsoft Graph API – User-Info
// =============================================================================

interface MicrosoftUser {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
}

/**
 * Holt das Profil des authentifizierten Microsoft-Users.
 */
export async function getMicrosoftUser(accessToken: string): Promise<MicrosoftUser> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Microsoft User-Abfrage fehlgeschlagen');
  }

  return response.json();
}

// =============================================================================
// Microsoft Graph API – E-Mails lesen
// =============================================================================

export interface GraphEmail {
  id: string;
  conversationId: string;
  subject: string;
  bodyPreview: string;
  body: {
    contentType: string;
    content: string;
  };
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  toRecipients: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
  ccRecipients: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
  isRead: boolean;
  importance: string;
  hasAttachments: boolean;
  receivedDateTime: string;
  parentFolderId: string;
}

interface GraphEmailResponse {
  value: GraphEmail[];
  '@odata.nextLink'?: string;
}

/**
 * Holt E-Mails aus einem bestimmten Ordner.
 */
export async function fetchEmails(
  accessToken: string,
  options: {
    folder?: string;  // inbox, sentitems, drafts, deleteditems
    top?: number;
    skip?: number;
    filter?: string;  // OData-Filter (z.B. nach Datum)
  } = {}
): Promise<GraphEmailResponse> {
  const { folder = 'inbox', top = 50, skip = 0, filter } = options;

  const params = new URLSearchParams({
    $top: top.toString(),
    $skip: skip.toString(),
    $orderby: 'receivedDateTime desc',
    $select: 'id,conversationId,subject,bodyPreview,body,from,toRecipients,ccRecipients,isRead,importance,hasAttachments,receivedDateTime,parentFolderId',
  });

  if (filter) {
    params.set('$filter', filter);
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${folder}/messages?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('[Outlook] E-Mail-Abfrage fehlgeschlagen:', error);
    throw new Error(error.error?.message || 'E-Mail-Abfrage fehlgeschlagen');
  }

  return response.json();
}

/**
 * Holt E-Mails aus allen relevanten Ordnern (Inbox + Sent).
 */
export async function fetchAllEmails(
  accessToken: string,
  options: { top?: number; sinceDate?: string } = {}
): Promise<{ inbox: GraphEmail[]; sent: GraphEmail[] }> {
  const { top = 50, sinceDate } = options;

  const filter = sinceDate
    ? `receivedDateTime ge ${sinceDate}`
    : undefined;

  const [inboxResult, sentResult] = await Promise.all([
    fetchEmails(accessToken, { folder: 'inbox', top, filter }),
    fetchEmails(accessToken, { folder: 'sentitems', top, filter }),
  ]);

  return {
    inbox: inboxResult.value,
    sent: sentResult.value,
  };
}

// =============================================================================
// Microsoft Graph API – E-Mail senden
// =============================================================================

interface SendEmailParams {
  to: Array<{ name?: string; address: string }>;
  cc?: Array<{ name?: string; address: string }>;
  bcc?: Array<{ name?: string; address: string }>;
  subject: string;
  body: string;
  bodyType?: 'text' | 'html';
  replyToMessageId?: string;
}

/**
 * Sendet eine E-Mail über Microsoft Graph.
 */
export async function sendOutlookEmail(
  accessToken: string,
  params: SendEmailParams
): Promise<void> {
  const { to, cc, bcc, subject, body, bodyType = 'text', replyToMessageId } = params;

  const toRecipients = to.map((r) => ({
    emailAddress: { name: r.name || r.address, address: r.address },
  }));
  const ccRecipients = cc?.map((r) => ({
    emailAddress: { name: r.name || r.address, address: r.address },
  }));
  const bccRecipients = bcc?.map((r) => ({
    emailAddress: { name: r.name || r.address, address: r.address },
  }));

  // Falls Reply: Microsoft Graph Reply-Endpoint nutzen
  if (replyToMessageId) {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${replyToMessageId}/reply`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: body,
        }),
      }
    );

    if (!response.ok && response.status !== 202) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Antwort konnte nicht gesendet werden');
    }
    return;
  }

  // Neue E-Mail senden
  const message = {
    subject,
    body: {
      contentType: bodyType === 'html' ? 'HTML' : 'Text',
      content: body,
    },
    toRecipients,
    ...(ccRecipients && { ccRecipients }),
    ...(bccRecipients && { bccRecipients }),
  };

  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok && response.status !== 202) {
    const error = await response.json();
    throw new Error(error.error?.message || 'E-Mail konnte nicht gesendet werden');
  }
}

// =============================================================================
// Microsoft Graph API – E-Mail-Aktionen
// =============================================================================

/**
 * Markiert eine E-Mail als gelesen/ungelesen.
 */
export async function markEmailRead(
  accessToken: string,
  messageId: string,
  isRead: boolean
): Promise<void> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRead }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Status konnte nicht geändert werden');
  }
}

/**
 * Verschiebt eine E-Mail in den Papierkorb.
 */
export async function moveToTrash(
  accessToken: string,
  messageId: string
): Promise<void> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}/move`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destinationId: 'deleteditems' }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'E-Mail konnte nicht verschoben werden');
  }
}
