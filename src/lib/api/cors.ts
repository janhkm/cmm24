/**
 * CORS-Helper fuer API-Routen.
 *
 * Erlaubt nur bekannte Origins fuer mutating Requests.
 * GET-Requests sind fuer alle Origins erlaubt (oeffentliche API).
 */

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://cmm24.com',
  'https://www.cmm24.com',
].filter(Boolean) as string[];

/**
 * Erzeugt CORS-Headers basierend auf dem Request-Origin.
 */
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const method = request.method;

  // GET-Requests: oeffentlich zugaenglich
  if (method === 'GET' || method === 'OPTIONS') {
    return {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
  }

  // Mutating Requests: nur erlaubte Origins
  // Fehlender Origin-Header bei mutierenden Requests wird abgelehnt
  if (!origin) {
    return {
      'Access-Control-Allow-Origin': '',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  }

  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * Standard-OPTIONS-Handler fuer Preflight-Requests.
 */
export function handlePreflight(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
