import { z } from 'zod';

export const inquirySchema = z.object({
  name: z
    .string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  email: z
    .string()
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@firma.de)'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s()-]{6,20}$/.test(val),
      'Bitte geben Sie eine gültige Telefonnummer ein'
    ),
  company: z
    .string()
    .max(100, 'Firmenname darf maximal 100 Zeichen lang sein')
    .optional(),
  message: z
    .string()
    .min(10, 'Nachricht muss mindestens 10 Zeichen lang sein')
    .max(2000, 'Nachricht darf maximal 2000 Zeichen lang sein'),
  listingId: z.string().uuid('Ungültige Inserat-ID'),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;
