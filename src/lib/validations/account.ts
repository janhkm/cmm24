import { z } from 'zod';

/**
 * Schema for updating account (company) data
 */
export const updateAccountSchema = z.object({
  company_name: z
    .string()
    .min(2, 'Firmenname muss mindestens 2 Zeichen lang sein')
    .max(100, 'Firmenname darf maximal 100 Zeichen lang sein'),
  legal_form: z
    .string()
    .max(50, 'Rechtsform darf maximal 50 Zeichen lang sein')
    .optional()
    .nullable(),
  description: z
    .string()
    .max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein')
    .optional()
    .nullable(),
  website: z
    .string()
    .url('Bitte geben Sie eine gültige URL ein')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z
    .string()
    .max(30, 'Telefonnummer darf maximal 30 Zeichen lang sein')
    .optional()
    .nullable(),
  address_street: z
    .string()
    .max(100, 'Straße darf maximal 100 Zeichen lang sein')
    .optional()
    .nullable(),
  address_city: z
    .string()
    .max(100, 'Stadt darf maximal 100 Zeichen lang sein')
    .optional()
    .nullable(),
  address_postal_code: z
    .string()
    .max(20, 'PLZ darf maximal 20 Zeichen lang sein')
    .optional()
    .nullable(),
  address_country: z
    .string()
    .max(100, 'Land darf maximal 100 Zeichen lang sein')
    .optional()
    .nullable(),
  vat_id: z
    .string()
    .max(50, 'USt-IdNr. darf maximal 50 Zeichen lang sein')
    .optional()
    .nullable(),
  email_signature: z
    .string()
    .max(500, 'E-Mail-Signatur darf maximal 500 Zeichen lang sein')
    .optional()
    .nullable(),
});

export type UpdateAccountData = z.infer<typeof updateAccountSchema>;

/**
 * Schema for auto-reply settings
 */
export const autoReplySettingsSchema = z.object({
  auto_reply_enabled: z.boolean(),
  auto_reply_message: z
    .string()
    .max(2000, 'Auto-Reply-Nachricht darf maximal 2000 Zeichen lang sein')
    .optional()
    .nullable(),
  auto_reply_delay_minutes: z
    .number()
    .min(0, 'Verzögerung muss mindestens 0 Minuten sein')
    .max(1440, 'Verzögerung darf maximal 24 Stunden (1440 Minuten) sein')
    .optional()
    .nullable(),
});

export type AutoReplySettingsData = z.infer<typeof autoReplySettingsSchema>;

/**
 * Schema for password change
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Aktuelles Passwort ist erforderlich'),
  newPassword: z
    .string()
    .min(8, 'Neues Passwort muss mindestens 8 Zeichen lang sein')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Passwort muss mindestens einen Kleinbuchstaben, einen Großbuchstaben und eine Zahl enthalten'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
