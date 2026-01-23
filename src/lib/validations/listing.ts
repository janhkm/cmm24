import { z } from 'zod';

export const listingBasicsSchema = z.object({
  manufacturerId: z.string().uuid('Bitte wählen Sie einen Hersteller'),
  modelId: z.string().uuid().optional(),
  modelNameCustom: z
    .string()
    .max(100, 'Modellname darf maximal 100 Zeichen lang sein')
    .optional(),
  title: z
    .string()
    .min(10, 'Titel muss mindestens 10 Zeichen lang sein')
    .max(150, 'Titel darf maximal 150 Zeichen lang sein'),
  yearBuilt: z
    .number()
    .min(1950, 'Baujahr muss nach 1950 liegen')
    .max(new Date().getFullYear() + 1, 'Baujahr kann nicht in der Zukunft liegen'),
  price: z
    .number()
    .min(100, 'Preis muss mindestens 1€ betragen')
    .max(100000000, 'Preis darf maximal 1.000.000€ betragen'),
  priceNegotiable: z.boolean().default(false),
  condition: z.enum(['new', 'like_new', 'good', 'fair'], {
    message: 'Bitte wählen Sie einen Zustand',
  }),
});

export const listingTechnicalSchema = z.object({
  measuringRangeX: z
    .number()
    .min(1, 'Messbereich X muss größer als 0 sein')
    .max(10000, 'Messbereich X darf maximal 10.000mm sein'),
  measuringRangeY: z
    .number()
    .min(1, 'Messbereich Y muss größer als 0 sein')
    .max(10000, 'Messbereich Y darf maximal 10.000mm sein'),
  measuringRangeZ: z
    .number()
    .min(1, 'Messbereich Z muss größer als 0 sein')
    .max(10000, 'Messbereich Z darf maximal 10.000mm sein'),
  accuracyUm: z
    .string()
    .max(50, 'Genauigkeit darf maximal 50 Zeichen lang sein')
    .optional(),
  software: z
    .string()
    .max(100, 'Software darf maximal 100 Zeichen lang sein')
    .optional(),
  controller: z
    .string()
    .max(100, 'Steuerung darf maximal 100 Zeichen lang sein')
    .optional(),
  probeSystem: z
    .string()
    .max(100, 'Tastsystem darf maximal 100 Zeichen lang sein')
    .optional(),
});

export const listingLocationSchema = z.object({
  locationCountry: z
    .string()
    .min(1, 'Bitte wählen Sie ein Land'),
  locationCity: z
    .string()
    .min(2, 'Stadt muss mindestens 2 Zeichen lang sein')
    .max(100, 'Stadt darf maximal 100 Zeichen lang sein'),
  locationPostalCode: z
    .string()
    .min(3, 'PLZ muss mindestens 3 Zeichen lang sein')
    .max(10, 'PLZ darf maximal 10 Zeichen lang sein'),
});

export const listingDescriptionSchema = z.object({
  description: z
    .string()
    .min(50, 'Beschreibung muss mindestens 50 Zeichen lang sein')
    .max(5000, 'Beschreibung darf maximal 5000 Zeichen lang sein'),
});

// Combined full listing schema
export const listingSchema = listingBasicsSchema
  .merge(listingTechnicalSchema)
  .merge(listingLocationSchema)
  .merge(listingDescriptionSchema);

export type ListingBasicsData = z.infer<typeof listingBasicsSchema>;
export type ListingTechnicalData = z.infer<typeof listingTechnicalSchema>;
export type ListingLocationData = z.infer<typeof listingLocationSchema>;
export type ListingDescriptionData = z.infer<typeof listingDescriptionSchema>;
export type ListingFormData = z.infer<typeof listingSchema>;
