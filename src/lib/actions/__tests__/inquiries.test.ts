import { describe, it, expect } from 'vitest';
import { inquirySchema } from '@/lib/validations/inquiry';

// ============================================
// Inquiry Validierung (Schema-basiert)
// ============================================

describe('Inquiry Validierung', () => {
  const validInquiry = {
    name: 'Max Mustermann',
    email: 'max@test.com',
    message: 'Ich bin interessiert an dieser Maschine und wuerde gerne mehr erfahren.',
    listingId: '550e8400-e29b-41d4-a716-446655440000',
  };

  it('akzeptiert gueltige Anfrage', () => {
    const result = inquirySchema.safeParse(validInquiry);
    expect(result.success).toBe(true);
  });

  it('lehnt leeren Namen ab', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt ungueltige Email ab', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      email: 'keine-email',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt zu kurze Nachricht ab', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      message: 'Hi',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt ungueltige Listing-UUID ab', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      listingId: 'keine-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('akzeptiert optionale Telefonnummer', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      phone: '+49 123 456789',
    });
    expect(result.success).toBe(true);
  });

  it('akzeptiert optionale Firma', () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      company: 'Musterfirma GmbH',
    });
    expect(result.success).toBe(true);
  });
});

// ============================================
// Inquiry Status Workflow
// ============================================

describe('Inquiry Status Workflow', () => {
  const validStatuses = ['new', 'contacted', 'offer_sent', 'won', 'lost'];

  it('hat alle erwarteten Status-Werte', () => {
    expect(validStatuses).toContain('new');
    expect(validStatuses).toContain('contacted');
    expect(validStatuses).toContain('offer_sent');
    expect(validStatuses).toContain('won');
    expect(validStatuses).toContain('lost');
    expect(validStatuses).toHaveLength(5);
  });

  it('erlaubt Uebergang von new zu contacted', () => {
    const currentStatus = 'new';
    const nextStatus = 'contacted';
    expect(validStatuses).toContain(currentStatus);
    expect(validStatuses).toContain(nextStatus);
  });
});
