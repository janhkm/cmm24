import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// =============================================================================
// Token-Verschlüsselung für E-Mail-Provider (AES-256-GCM)
// =============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.EMAIL_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      '[Email Crypto] EMAIL_TOKEN_ENCRYPTION_KEY ist nicht gesetzt. ' +
      'Generiere einen Key mit: openssl rand -hex 32'
    );
  }
  return Buffer.from(key, 'hex');
}

/**
 * Verschlüsselt einen Token-String mit AES-256-GCM.
 * Gibt Base64-String zurück: iv:authTag:ciphertext
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (alles Base64)
  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted,
  ].join(':');
}

/**
 * Entschlüsselt einen mit encryptToken() verschlüsselten String.
 */
export function decryptToken(encryptedValue: string): string {
  const key = getEncryptionKey();
  const parts = encryptedValue.split(':');

  if (parts.length !== 3) {
    throw new Error('[Email Crypto] Ungültiges verschlüsseltes Token-Format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const ciphertext = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
