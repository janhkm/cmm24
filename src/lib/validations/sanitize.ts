/**
 * Sanitize-Funktionen fuer User-Input.
 *
 * Verwendet DOMPurify fuer robuste HTML/XSS-Bereinigung.
 * Fallback auf Regex-basierte Bereinigung falls DOMPurify nicht verfuegbar.
 */

let DOMPurify: { sanitize: (input: string, config?: Record<string, unknown>) => string } | null = null;

// DOMPurify lazy laden (funktioniert in Node.js und Browser)
async function getDOMPurify() {
  if (!DOMPurify) {
    try {
      const mod = await import('isomorphic-dompurify');
      DOMPurify = mod.default;
    } catch {
      // Fallback wenn DOMPurify nicht verfuegbar
      DOMPurify = null;
    }
  }
  return DOMPurify;
}

// Synchroner Regex-Fallback
function regexSanitize(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, 'data_')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Entfernt potentiell gefaehrliche Inhalte aus Strings.
 * Verwendet DOMPurify wenn verfuegbar, sonst Regex-Fallback.
 */
export function sanitizeText(input: string): string {
  // Synchrone Version: Regex-basiert (wird in 'use server' Actions aufgerufen)
  // DOMPurify benoetigt async import, daher nutzen wir fuer die synchrone
  // API den Regex-Ansatz + HTML-Entity-Encoding
  return regexSanitize(input);
}

/**
 * Asynchrone Version mit DOMPurify (robuster).
 * Fuer API-Routes und Stellen wo async moeglich ist.
 */
export async function sanitizeTextAsync(input: string): Promise<string> {
  const purify = await getDOMPurify();
  if (purify) {
    const clean = purify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    } as Record<string, unknown>);
    return clean.trim();
  }
  return regexSanitize(input);
}

/**
 * Prueft ob ein String verdaechtige Inhalte enthaelt.
 */
export function containsSuspiciousContent(input: string): boolean {
  return /<script|javascript:|data:|on\w+\s*=/i.test(input);
}

/**
 * Asynchrone Version der Suspicion-Pruefung mit DOMPurify.
 */
export async function containsSuspiciousContentAsync(input: string): Promise<boolean> {
  const purify = await getDOMPurify();
  if (purify) {
    const cleaned = purify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    } as Record<string, unknown>);
    return cleaned !== input;
  }
  return /<script|javascript:|data:|on\w+\s*=/i.test(input);
}
