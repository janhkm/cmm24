/**
 * HTML-Sanitierung fuer die sichere Darstellung von User-generiertem HTML.
 *
 * Verwendet isomorphic-dompurify, um XSS-Angriffe zu verhindern.
 * Erlaubt nur sichere HTML-Tags und Attribute fuer die Anzeige.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Erlaubte Tags fuer Rich-Text-Inhalte (Beschreibungen, Nachrichten etc.)
 */
const ALLOWED_TAGS = [
  // Struktur
  'p', 'br', 'div', 'span',
  // Ueberschriften
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Textformatierung
  'strong', 'b', 'em', 'i', 'u', 'mark', 's', 'del', 'sub', 'sup',
  // Listen
  'ul', 'ol', 'li',
  // Links
  'a',
  // Tabellen
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  // Blockquote
  'blockquote', 'pre', 'code',
  // Sonstiges
  'hr',
];

/**
 * Erlaubte Attribute
 */
const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'class',
  'colspan', 'rowspan',
];

/**
 * Sanitiert HTML fuer die sichere Darstellung.
 * Entfernt alle potentiell gefaehrlichen Tags (script, iframe, etc.)
 * und Attribute (onclick, onerror, etc.).
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    // Links immer mit noopener/noreferrer versehen
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Sanitiert HTML fuer Markdown-gerenderte Inhalte.
 * Etwas striktere Regeln als fuer Rich-Text.
 */
export function sanitizeMarkdownHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i',
      'ul', 'ol', 'li',
      'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'pre', 'code',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  });
}
