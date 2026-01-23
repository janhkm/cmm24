'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { manufacturers, conditions, countries } from '@/data/mock-data';

// Step-wise validation schemas
const step1Schema = z.object({
  manufacturerId: z.string().min(1, 'Bitte wählen Sie einen Hersteller'),
  modelNameCustom: z.string().max(100, 'Max. 100 Zeichen').optional(),
  title: z.string().min(10, 'Titel muss mind. 10 Zeichen haben').max(150, 'Max. 150 Zeichen'),
  yearBuilt: z.string().refine((val) => {
    const year = parseInt(val);
    return year >= 1950 && year <= new Date().getFullYear() + 1;
  }, 'Ungültiges Baujahr'),
  condition: z.string().min(1, 'Bitte wählen Sie einen Zustand'),
  price: z.string().min(1, 'Bitte geben Sie einen Preis ein'),
  priceNegotiable: z.boolean(),
});

const step2Schema = z.object({
  measuringRangeX: z.string().refine((val) => !val || (parseInt(val) > 0 && parseInt(val) <= 10000), 'Ungültiger Wert'),
  measuringRangeY: z.string().refine((val) => !val || (parseInt(val) > 0 && parseInt(val) <= 10000), 'Ungültiger Wert'),
  measuringRangeZ: z.string().refine((val) => !val || (parseInt(val) > 0 && parseInt(val) <= 10000), 'Ungültiger Wert'),
  accuracyUm: z.string().max(50, 'Max. 50 Zeichen').optional(),
  software: z.string().max(100, 'Max. 100 Zeichen').optional(),
  controller: z.string().max(100, 'Max. 100 Zeichen').optional(),
  probeSystem: z.string().max(100, 'Max. 100 Zeichen').optional(),
});

const step3Schema = z.object({
  locationCountry: z.string().min(1, 'Bitte wählen Sie ein Land'),
  locationCity: z.string().min(2, 'Mind. 2 Zeichen').max(100, 'Max. 100 Zeichen'),
  locationPostalCode: z.string().min(3, 'Mind. 3 Zeichen').max(10, 'Max. 10 Zeichen'),
});

const step4Schema = z.object({
  description: z.string().min(50, 'Beschreibung muss mind. 50 Zeichen haben').max(5000, 'Max. 5000 Zeichen'),
});

// Combined schema
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);
type FormData = z.infer<typeof fullSchema>;

const steps = [
  { id: 1, name: 'Stammdaten', description: 'Hersteller, Modell, Preis', schema: step1Schema },
  { id: 2, name: 'Technische Daten', description: 'Messbereich, Genauigkeit', schema: step2Schema },
  { id: 3, name: 'Standort', description: 'Wo steht die Maschine?', schema: step3Schema },
  { id: 4, name: 'Beschreibung', description: 'Details & Lieferumfang', schema: step4Schema },
  { id: 5, name: 'Medien', description: 'Bilder & Dokumente', schema: null },
  { id: 6, name: 'Vorschau', description: 'Prüfen & Veröffentlichen', schema: null },
];

export default function NewListingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      manufacturerId: '',
      modelNameCustom: '',
      title: '',
      yearBuilt: '',
      condition: '',
      price: '',
      priceNegotiable: false,
      measuringRangeX: '',
      measuringRangeY: '',
      measuringRangeZ: '',
      accuracyUm: '',
      software: '',
      controller: '',
      probeSystem: '',
      locationCountry: '',
      locationCity: '',
      locationPostalCode: '',
      description: '',
    },
    mode: 'onChange',
  });

  const { trigger, getValues, formState: { errors } } = form;

  // Validate current step before proceeding
  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate: (keyof FormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate.push('manufacturerId', 'title', 'yearBuilt', 'condition', 'price');
        break;
      case 2:
        // Technical data is optional
        return true;
      case 3:
        fieldsToValidate.push('locationCountry', 'locationCity', 'locationPostalCode');
        break;
      case 4:
        fieldsToValidate.push('description');
        break;
      case 5:
        if (uploadedImages.length === 0) {
          toast.error('Mindestens ein Bild erforderlich', {
            description: 'Bitte laden Sie mindestens ein Bild hoch.',
          });
          return false;
        }
        return true;
      default:
        return true;
    }

    const result = await trigger(fieldsToValidate);
    if (!result) {
      toast.error('Bitte korrigieren Sie die Fehler', {
        description: 'Einige Pflichtfelder sind nicht korrekt ausgefüllt.',
      });
    }
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      toast.success(`Schritt ${currentStep} abgeschlossen`, {
        description: steps[currentStep].name,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} ist zu groß`, { description: 'Max. 10MB pro Bild' });
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} hat ein ungültiges Format`, { description: 'Nur JPG, PNG, WebP' });
        return false;
      }
      return true;
    });

    setUploadedImages((prev) => [...prev, ...validFiles]);
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} Bild(er) hochgeladen`);
    }
  }, []);

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    toast.info('Bild entfernt');
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    if (!asDraft) {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error('Formular unvollständig', {
          description: 'Bitte füllen Sie alle Pflichtfelder aus.',
        });
        return;
      }
      if (uploadedImages.length === 0) {
        toast.error('Bilder fehlen', {
          description: 'Bitte laden Sie mindestens ein Bild hoch.',
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success(
        asDraft ? 'Entwurf gespeichert' : 'Inserat eingereicht!',
        {
          description: asDraft
            ? 'Sie können jederzeit fortfahren.'
            : 'Ihr Inserat wird geprüft und ist in Kürze online.',
        }
      );
      
      router.push('/seller/inserate');
    } catch {
      toast.error('Fehler beim Speichern', {
        description: 'Bitte versuchen Sie es erneut.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const values = getValues();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background">
        <div className="container-page py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/seller/inserate">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Neues Inserat erstellen</h1>
                <p className="text-sm text-muted-foreground">
                  Schritt {currentStep} von {steps.length}: {steps[currentStep - 1].name}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              Als Entwurf speichern
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b bg-background">
        <div className="container-page py-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > step.id
                      ? 'bg-green-100 text-green-800'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/20 text-xs">
                      {step.id}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.name}</span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-px w-8',
                      currentStep > step.id ? 'bg-green-500' : 'bg-border'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container-page py-8">
        <div className="mx-auto max-w-2xl">
          <Form {...form}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Stammdaten</CardTitle>
                  <CardDescription>
                    Geben Sie die grundlegenden Informationen zur Maschine ein.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="manufacturerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hersteller *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {manufacturers.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="modelNameCustom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modell</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Contura 10/12/6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titel des Inserats *</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Zeiss Contura 10/12/6 mit Calypso" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ein aussagekräftiger Titel hilft Käufern, Ihr Inserat zu finden.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="yearBuilt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Baujahr *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="z.B. 2019"
                              min="1950"
                              max={new Date().getFullYear()}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zustand *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditions.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preis (EUR) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="z.B. 45.000"
                              {...field}
                              onChange={(e) => field.onChange(formatPrice(e.target.value))}
                              className="pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              €
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceNegotiable"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm cursor-pointer !mt-0">
                          Preis verhandelbar (VB)
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Technical Data */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Technische Daten</CardTitle>
                  <CardDescription>
                    Geben Sie die technischen Spezifikationen der Maschine ein.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Messbereich (mm)</Label>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="measuringRangeX"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs text-muted-foreground">X</Label>
                            <FormControl>
                              <Input type="number" placeholder="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="measuringRangeY"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs text-muted-foreground">Y</Label>
                            <FormControl>
                              <Input type="number" placeholder="1200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="measuringRangeZ"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs text-muted-foreground">Z</Label>
                            <FormControl>
                              <Input type="number" placeholder="600" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="accuracyUm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genauigkeit (MPEE)</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. 1.8 + L/350" {...field} />
                        </FormControl>
                        <FormDescription>Format: MPEE-Wert in µm</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="software"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Software</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Calypso 6.8" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="controller"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Steuerung</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. C99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="probeSystem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tastsystem</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. VAST XXT" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Standort</CardTitle>
                  <CardDescription>
                    Wo befindet sich die Maschine?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="locationCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Land *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wählen..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="locationPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PLZ *</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. 80331" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locationCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stadt *</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. München" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Die genaue Adresse wird nicht öffentlich angezeigt. Interessenten sehen nur Stadt und Land.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Description */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Beschreibung</CardTitle>
                  <CardDescription>
                    Beschreiben Sie die Maschine im Detail.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschreibung *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Beschreiben Sie den Zustand der Maschine, Besonderheiten, Wartungshistorie, Lieferumfang..."
                            rows={10}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value.length}/5000 Zeichen • Min. 50 Zeichen
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 5: Media */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Medien</CardTitle>
                  <CardDescription>
                    Laden Sie Bilder und Dokumente hoch.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Bilder * ({uploadedImages.length} hochgeladen)</Label>
                      {uploadedImages.length === 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Erforderlich
                        </Badge>
                      )}
                    </div>
                    
                    {/* Preview of uploaded images */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {uploadedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Bild ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <Badge className="absolute bottom-1 left-1 text-[10px]">
                                Hauptbild
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium">Bilder hierher ziehen</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        oder klicken zum Auswählen
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        JPG, PNG oder WebP. Max. 10 MB pro Bild.
                      </p>
                    </label>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-4">
                    <Label>Dokumente (optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Datenblätter, Kalibrierzertifikate, etc.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Upload className="mr-2 h-4 w-4" />
                        PDF hochladen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Preview */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>Vorschau & Veröffentlichen</CardTitle>
                  <CardDescription>
                    Prüfen Sie Ihr Inserat vor der Veröffentlichung.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Titel</span>
                      <span className="font-medium">{values.title || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hersteller</span>
                      <span className="font-medium">
                        {manufacturers.find((m) => m.id === values.manufacturerId)?.name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Baujahr</span>
                      <span className="font-medium">{values.yearBuilt || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preis</span>
                      <span className="font-medium">
                        {values.price ? `${values.price} €` : '-'}
                        {values.priceNegotiable && ' (VB)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Messbereich</span>
                      <span className="font-medium">
                        {values.measuringRangeX && values.measuringRangeY && values.measuringRangeZ
                          ? `${values.measuringRangeX} × ${values.measuringRangeY} × ${values.measuringRangeZ} mm`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Standort</span>
                      <span className="font-medium">
                        {values.locationCity && values.locationCountry
                          ? `${values.locationCity}, ${countries.find((c) => c.code === values.locationCountry)?.name}`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bilder</span>
                      <span className="font-medium">{uploadedImages.length} hochgeladen</span>
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      Nach dem Einreichen wird Ihr Inserat von uns geprüft. 
                      Dies dauert in der Regel weniger als 24 Stunden.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  Weiter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird eingereicht...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Inserat einreichen
                    </>
                  )}
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
