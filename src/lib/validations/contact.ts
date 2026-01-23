import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  email: z
    .string()
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s()-]{6,20}$/.test(val),
      'Bitte geben Sie eine gültige Telefonnummer ein'
    ),
  subject: z
    .string()
    .min(5, 'Betreff muss mindestens 5 Zeichen lang sein')
    .max(150, 'Betreff darf maximal 150 Zeichen lang sein'),
  message: z
    .string()
    .min(20, 'Nachricht muss mindestens 20 Zeichen lang sein')
    .max(3000, 'Nachricht darf maximal 3000 Zeichen lang sein'),
  privacy: z
    .boolean()
    .refine((val) => val === true, 'Sie müssen der Datenschutzerklärung zustimmen'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
