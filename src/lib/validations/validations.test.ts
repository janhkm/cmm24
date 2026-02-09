import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth';
import { inquirySchema } from './inquiry';
import { contactSchema } from './contact';
import { listingBasicsSchema, listingLocationSchema, listingDescriptionSchema } from './listing';
import { sanitizeText, containsSuspiciousContent } from './sanitize';

// ============================================
// Auth Validations
// ============================================

describe('loginSchema', () => {
  it('akzeptiert gueltige Daten', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('lehnt ungueltige Email ab', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt leeres Passwort ab', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validData = {
    companyName: 'Test GmbH',
    fullName: 'Max Mustermann',
    email: 'max@test.com',
    password: 'Test1234',
    confirmPassword: 'Test1234',
    acceptTerms: true,
  };

  it('akzeptiert gueltige Daten', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('lehnt schwaches Passwort ab', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'password',
      confirmPassword: 'password',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt nicht-uebereinstimmende Passwoerter ab', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: 'anders',
    });
    expect(result.success).toBe(false);
  });

  it('erfordert AGB-Akzeptanz', () => {
    const result = registerSchema.safeParse({
      ...validData,
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });
});

// ============================================
// Inquiry Validations
// ============================================

describe('inquirySchema', () => {
  const validInquiry = {
    name: 'Max Mustermann',
    email: 'max@test.com',
    message: 'Ich bin interessiert an dieser Maschine.',
    listingId: '550e8400-e29b-41d4-a716-446655440000',
  };

  it('akzeptiert gueltige Anfrage', () => {
    const result = inquirySchema.safeParse(validInquiry);
    expect(result.success).toBe(true);
  });

  it('lehnt zu kurze Nachricht ab', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      message: 'Hi',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt ungueltige UUID ab', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      listingId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('akzeptiert optionale Felder', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      phone: '+49 123 456789',
      company: 'Musterfirma GmbH',
    });
    expect(result.success).toBe(true);
  });
});

// ============================================
// Listing Validations
// ============================================

describe('listingBasicsSchema', () => {
  it('lehnt zu kurzen Titel ab', () => {
    const result = listingBasicsSchema.safeParse({
      manufacturerId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Kurz',
      yearBuilt: 2020,
      price: 50000,
      condition: 'good',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt negativen Preis ab', () => {
    const result = listingBasicsSchema.safeParse({
      manufacturerId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Zeiss ACCURA CMM Machine',
      yearBuilt: 2020,
      price: -100,
      condition: 'good',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt Baujahr in der Zukunft ab', () => {
    const result = listingBasicsSchema.safeParse({
      manufacturerId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Zeiss ACCURA CMM Machine',
      yearBuilt: 2050,
      price: 50000,
      condition: 'good',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt ungueltigen Zustand ab', () => {
    const result = listingBasicsSchema.safeParse({
      manufacturerId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Zeiss ACCURA CMM Machine',
      yearBuilt: 2020,
      price: 50000,
      condition: 'broken',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================
// Sanitize
// ============================================

describe('sanitizeText', () => {
  it('entfernt Script-Tags inkl. Inhalt', () => {
    expect(sanitizeText('<script>alert("xss")</script>Hallo')).toBe('Hallo');
  });

  it('entfernt HTML-Tags', () => {
    expect(sanitizeText('<b>bold</b> text')).toBe('bold text');
  });

  it('neutralisiert javascript: URLs', () => {
    const result = sanitizeText('javascript:alert(1)');
    expect(result).not.toContain('javascript:');
  });

  it('trimmt Whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });
});

describe('containsSuspiciousContent', () => {
  it('erkennt Script-Tags', () => {
    expect(containsSuspiciousContent('<script>alert(1)</script>')).toBe(true);
  });

  it('erkennt javascript: URLs', () => {
    expect(containsSuspiciousContent('javascript:void(0)')).toBe(true);
  });

  it('erlaubt normalen Text', () => {
    expect(containsSuspiciousContent('Normale Messmaschine in gutem Zustand')).toBe(false);
  });
});
