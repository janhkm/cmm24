/**
 * Unified response type for all Server Actions
 * Provides consistent error handling across the application
 * 
 * Note: This file contains types and helpers, NOT Server Actions.
 * Do NOT add 'use server' directive here.
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: ErrorCode;
}

export type ErrorCode = 
  | 'UNAUTHORIZED'      // User not logged in
  | 'FORBIDDEN'         // User lacks permissions
  | 'NOT_FOUND'         // Resource not found
  | 'VALIDATION_ERROR'  // Input validation failed
  | 'CONFLICT'          // Resource already exists
  | 'RATE_LIMITED'      // Too many requests
  | 'SERVER_ERROR';     // Internal server error

/**
 * Helper to create success responses
 */
export function success<T>(data?: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Helper to create error responses
 */
export function error(message: string, code?: ErrorCode): ActionResult<never> {
  return { success: false, error: message, code };
}

/**
 * Common error messages in German
 */
export const ErrorMessages = {
  UNAUTHORIZED: 'Nicht angemeldet',
  FORBIDDEN: 'Keine Berechtigung',
  NOT_FOUND: 'Nicht gefunden',
  VALIDATION_ERROR: 'Ungültige Eingabe',
  SERVER_ERROR: 'Ein Fehler ist aufgetreten',
  ACCOUNT_NOT_FOUND: 'Kein Account gefunden',
  LISTING_NOT_FOUND: 'Inserat nicht gefunden',
  INQUIRY_NOT_FOUND: 'Anfrage nicht gefunden',
  PLAN_LIMIT_REACHED: 'Inserat-Limit erreicht',
  FILE_TOO_LARGE: 'Datei zu groß',
  INVALID_FILE_TYPE: 'Ungültiger Dateityp',
  EMAIL_NOT_VERIFIED: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse',
} as const;

/**
 * Prueft ob der aktuelle User eine verifizierte E-Mail hat.
 * Gibt null zurueck wenn verifiziert, sonst eine Fehlermeldung.
 *
 * Verwendung in Server Actions:
 *   const verifyError = await requireVerifiedEmail();
 *   if (verifyError) return { success: false, error: verifyError };
 */
export async function requireVerifiedEmail(): Promise<string | null> {
  // Dynamischer Import um zirkulaere Abhaengigkeiten zu vermeiden
  const { createActionClient } = await import('@/lib/supabase/server');
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return ErrorMessages.UNAUTHORIZED;

  const { data: profile } = await supabase
    .from('profiles')
    .select('email_verified_at')
    .eq('id', user.id)
    .single();

  if (!profile?.email_verified_at) {
    return ErrorMessages.EMAIL_NOT_VERIFIED;
  }

  return null;
}
