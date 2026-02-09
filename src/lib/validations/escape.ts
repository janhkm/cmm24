/**
 * Escape-Funktionen fuer Supabase PostgREST Query-Syntax.
 *
 * PostgREST verwendet Kommas zum Trennen von Filter-Ausdruecken
 * und Punkte fuer Operator-Syntax (z.B. `column.eq.value`).
 * User-Input muss diese Zeichen escapen um Query-Manipulation zu verhindern.
 */

/**
 * Entfernt Zeichen die in Supabase PostgREST .or() Queries
 * die Query-Syntax manipulieren koennten.
 *
 * Betroffen: Kommas (Trenner), Punkte (Operator-Syntax),
 * Klammern (verschachtelte Filter), Backticks.
 */
export function escapeFilterValue(value: string): string {
  return value.replace(/[,().`]/g, '');
}

/**
 * Validiert ob ein Wert dem Stripe Price-ID Format entspricht.
 * Format: price_ gefolgt von alphanumerischen Zeichen.
 */
export function isValidStripePriceId(value: string): boolean {
  return /^price_[a-zA-Z0-9]+$/.test(value);
}
