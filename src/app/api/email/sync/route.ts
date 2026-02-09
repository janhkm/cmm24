import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { log } from '@/lib/logger';
import {
  getValidAccessToken,
  fetchAllEmails,
  type GraphEmail,
} from '@/lib/email/outlook';

// Admin-Client für INSERT in synced_emails (RLS erlaubt nur SELECT/UPDATE für User)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// =============================================================================
// POST /api/email/sync
// Synchronisiert E-Mails vom Provider in die Datenbank
// =============================================================================

export async function POST(request: Request) {
  try {
    // 1. User authentifizieren
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // 2. Account und E-Mail-Verbindung laden
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: 'Kein Account gefunden' }, { status: 404 });
    }

    const { data: connection } = await supabase
      .from('email_connections')
      .select('id, provider, last_sync_at')
      .eq('account_id', account.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!connection) {
      return NextResponse.json({ error: 'Keine E-Mail-Verbindung' }, { status: 404 });
    }

    // 3. Access Token holen (automatisch erneuern wenn nötig)
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken(connection.id);
    } catch (err) {
      log('error', 'Email Sync', 'Token-Fehler', err);
      return NextResponse.json(
        { error: 'Token abgelaufen. Bitte erneut verbinden.' },
        { status: 401 }
      );
    }

    // 4. E-Mails von Microsoft Graph abrufen
    // Bei erstem Sync: letzte 100 E-Mails, danach nur neue seit letztem Sync
    const sinceDate = connection.last_sync_at
      ? new Date(connection.last_sync_at).toISOString()
      : undefined;

    const { inbox, sent } = await fetchAllEmails(accessToken, {
      top: sinceDate ? 50 : 100,
      sinceDate,
    });

    // 5. E-Mails in DB speichern (Upsert)
    let syncedCount = 0;

    const allEmails = [
      ...inbox.map((e) => ({ ...e, folder: 'inbox' as const })),
      ...sent.map((e) => ({ ...e, folder: 'sent' as const })),
    ];

    if (allEmails.length > 0) {
      const rows = allEmails.map((email) => mapGraphEmailToRow(email, account.id, connection.id));

      // Batch-Upsert (in Chunks von 50)
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        const { error: upsertError, count } = await supabaseAdmin
          .from('synced_emails')
          .upsert(chunk, {
            onConflict: 'connection_id,external_id',
            ignoreDuplicates: false,
          });

        if (upsertError) {
          log('error', 'Email Sync', 'Upsert-Fehler', upsertError);
        } else {
          syncedCount += chunk.length;
        }
      }
    }

    // 6. last_sync_at aktualisieren
    await supabaseAdmin
      .from('email_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection.id);

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      inbox: inbox.length,
      sent: sent.length,
    });
  } catch (err) {
    log('error', 'Email Sync', 'Fehler', err);
    return NextResponse.json({ error: 'Sync fehlgeschlagen' }, { status: 500 });
  }
}

// =============================================================================
// Helper: Microsoft Graph E-Mail → DB-Row
// =============================================================================

function mapGraphEmailToRow(
  email: GraphEmail & { folder: 'inbox' | 'sent' },
  accountId: string,
  connectionId: string
) {
  return {
    account_id: accountId,
    connection_id: connectionId,
    external_id: email.id,
    thread_id: email.conversationId || null,
    folder: email.folder,
    from_name: email.from?.emailAddress?.name || null,
    from_email: email.from?.emailAddress?.address || 'unbekannt',
    to_addresses: email.toRecipients?.map((r) => ({
      name: r.emailAddress.name,
      address: r.emailAddress.address,
    })) || [],
    cc_addresses: email.ccRecipients?.map((r) => ({
      name: r.emailAddress.name,
      address: r.emailAddress.address,
    })) || [],
    subject: email.subject || '(Kein Betreff)',
    preview: email.bodyPreview || '',
    body_html: email.body?.contentType === 'html' ? email.body.content : null,
    body_text: email.body?.contentType === 'text' ? email.body.content : email.bodyPreview || '',
    is_read: email.isRead,
    is_starred: false,
    has_attachments: email.hasAttachments,
    importance: email.importance || 'normal',
    received_at: email.receivedDateTime,
  };
}
