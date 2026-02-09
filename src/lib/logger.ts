/**
 * Strukturiertes Logging fuer CMM24.
 *
 * In Production werden nur warn/error-Level ausgegeben.
 * In Development werden alle Level ausgegeben.
 *
 * Verwendung:
 *   import { log } from '@/lib/logger';
 *   log('info', 'Stripe Webhook', 'Event empfangen', { type: event.type });
 *   log('error', 'Stripe Webhook', 'Verarbeitung fehlgeschlagen', error);
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;

type LogLevel = keyof typeof LOG_LEVELS;

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

export function log(level: LogLevel, context: string, message: string, data?: unknown): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LEVEL]) {
    return;
  }

  const prefix = `[${context}]`;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  if (data !== undefined) {
    fn(prefix, message, typeof data === 'object' ? JSON.stringify(data) : data);
  } else {
    fn(prefix, message);
  }
}
