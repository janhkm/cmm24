import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidAccessToken, sendOutlookEmail } from '@/lib/email/outlook';
import { log } from '@/lib/logger';

// =============================================================================
// POST /api/email/send
// Sendet eine E-Mail über den verknüpften Provider
// =============================================================================

export async function POST(request: Request) {
  try {
    // 1. User authentifizieren
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // 2. Request-Body parsen
    const body = await request.json();
    const {
      to,
      cc,
      bcc,
      subject,
      message,
      replyToMessageId,
    } = body as {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      message: string;
      replyToMessageId?: string;
    };

    if (!to?.length || !subject || !message) {
      return NextResponse.json(
        { error: 'Empfänger, Betreff und Nachricht sind erforderlich' },
        { status: 400 }
      );
    }

    // 3. Account + Verbindung laden
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
      .select('id, provider')
      .eq('account_id', account.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!connection) {
      return NextResponse.json({ error: 'Keine E-Mail-Verbindung' }, { status: 404 });
    }

    // 4. Access Token holen
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken(connection.id);
    } catch {
      return NextResponse.json(
        { error: 'Token abgelaufen. Bitte erneut verbinden.' },
        { status: 401 }
      );
    }

    // 5. E-Mail senden
    await sendOutlookEmail(accessToken, {
      to: to.map((addr) => ({ address: addr })),
      cc: cc?.map((addr) => ({ address: addr })),
      bcc: bcc?.map((addr) => ({ address: addr })),
      subject,
      body: message,
      replyToMessageId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    log('error', 'Email Send', 'Fehler', err);
    const errorMessage = err instanceof Error ? err.message : 'Senden fehlgeschlagen';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
