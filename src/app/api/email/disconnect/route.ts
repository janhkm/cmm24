import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { log } from '@/lib/logger';

// =============================================================================
// POST /api/email/disconnect
// Trennt eine E-Mail-Verbindung (setzt is_active = false, löscht Tokens)
// =============================================================================

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId fehlt' }, { status: 400 });
    }

    // Verbindung deaktivieren und Tokens löschen (RLS stellt sicher, dass nur der Owner zugreifen kann)
    const { error } = await supabase
      .from('email_connections')
      .update({
        is_active: false,
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
      })
      .eq('id', connectionId);

    if (error) {
      log('error', 'Email Disconnect', 'DB-Fehler', error);
      return NextResponse.json({ error: 'Trennung fehlgeschlagen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    log('error', 'Email Disconnect', 'Fehler', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
