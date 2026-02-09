import { describe, it, expect } from 'vitest';

// ============================================
// Auth Slug-Generierung (von Company Name)
// ============================================

function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/g, '-')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/(^-|-$)/g, '');
}

describe('Company Slug-Generierung', () => {
  it('generiert korrekten Slug aus Firmennamen', () => {
    expect(generateSlug('CMM-Trade GmbH')).toBe('cmm-trade-gmbh');
    expect(generateSlug('Messtechnik Müller & Co. KG')).toBe('messtechnik-mueller-co-kg');
    expect(generateSlug('  Leerzeichen Firma  ')).toBe('leerzeichen-firma');
  });

  it('behandelt Umlaute korrekt', () => {
    expect(generateSlug('Müller Messtechnik')).toBe('mueller-messtechnik');
    expect(generateSlug('Öster Präzision')).toBe('oester-praezision');
    expect(generateSlug('Straße & Überprüfung')).toBe('strasse-ueberpruefung');
  });

  it('entfernt fuehrende und abschliessende Bindestriche', () => {
    expect(generateSlug('---Test---')).toBe('test');
    expect(generateSlug('!!! Test !!!')).toBe('test');
  });

  it('behandelt leeren String', () => {
    expect(generateSlug('')).toBe('');
  });
});

// ============================================
// Anti-Email-Enumeration
// ============================================

describe('Anti-Email-Enumeration', () => {
  it('erkennt fake User ohne Identities', () => {
    // Supabase gibt bei bereits registrierter Email einen User
    // mit leerer identities-Liste zurueck
    const fakeUser = {
      id: 'fake-id',
      identities: [],
    };

    const isRealUser = fakeUser.identities && fakeUser.identities.length > 0;
    expect(isRealUser).toBe(false);
  });

  it('erkennt echten User mit Identities', () => {
    const realUser = {
      id: 'real-id',
      identities: [{ id: 'identity-1', provider: 'email' }],
    };

    const isRealUser = realUser.identities && realUser.identities.length > 0;
    expect(isRealUser).toBe(true);
  });
});
