/**
 * Datei-Validierung mit Magic Bytes Pruefung.
 * Stellt sicher, dass der tatsaechliche Dateiinhalt mit dem MIME-Typ uebereinstimmt.
 */

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25MB

// Magic Byte Signaturen
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
}

/**
 * Validiert eine Bilddatei (MIME + Magic Bytes + Groesse)
 */
export async function validateImageFile(file: File): Promise<ValidationResult> {
  // 1. Groessen-Check
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Datei zu gross (max. ${MAX_IMAGE_SIZE / 1024 / 1024}MB)` };
  }

  // 2. MIME-Type Check
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Ungueltiges Format. Erlaubt: JPG, PNG, WebP' };
  }

  // 3. Magic Bytes Check
  const magicResult = await checkMagicBytes(file, file.type);
  if (!magicResult.valid) {
    return { valid: false, error: 'Dateiinhalt stimmt nicht mit dem Dateityp ueberein' };
  }

  // 4. Dateiname sanitizen
  const sanitizedName = sanitizeFilename(file.name);

  return { valid: true, sanitizedName };
}

/**
 * Validiert eine Dokumentdatei (PDF)
 */
export async function validateDocumentFile(file: File): Promise<ValidationResult> {
  if (file.size > MAX_DOC_SIZE) {
    return { valid: false, error: `Datei zu gross (max. ${MAX_DOC_SIZE / 1024 / 1024}MB)` };
  }

  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    return { valid: false, error: 'Ungueltiges Format. Erlaubt: PDF' };
  }

  const magicResult = await checkMagicBytes(file, file.type);
  if (!magicResult.valid) {
    return { valid: false, error: 'Dateiinhalt stimmt nicht mit dem Dateityp ueberein' };
  }

  const sanitizedName = sanitizeFilename(file.name);
  return { valid: true, sanitizedName };
}

/**
 * Prueft Magic Bytes einer Datei
 */
async function checkMagicBytes(file: File, mimeType: string): Promise<{ valid: boolean }> {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) {
    return { valid: false };
  }

  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const isValid = signatures.some((sig) =>
      sig.every((byte, i) => bytes[i] === byte)
    );

    return { valid: isValid };
  } catch {
    return { valid: false };
  }
}

/**
 * Sanitized einen Dateinamen (entfernt Sonderzeichen, begrenzt Laenge)
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
}
