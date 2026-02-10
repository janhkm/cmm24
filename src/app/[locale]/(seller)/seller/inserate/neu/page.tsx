'use client';

import { useState, useCallback, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
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
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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
import { conditions, countries } from '@/data/constants';
import { 
  createListing, 
  updateListing, 
  uploadListingMedia, 
  deleteListingMedia,
  submitListingForReview,
  setPrimaryImage,
  canCreateListing,
  getManufacturers,
} from '@/lib/actions/listings';

// Type for manufacturer from database
interface Manufacturer {
  id: string;
  name: string;
  slug: string;
}

// Step-wise validation schemas
const step1Schema = z.object({
  manufacturerId: z.string().min(1, 'Bitte wählen Sie einen Hersteller'),
  modelNameCustom: z.string().max(100, 'Max. 100 Zeichen').optional(),
  title: z.string().min(1, 'Bitte Hersteller und Modell angeben').max(150, 'Max. 150 Zeichen'),
  yearBuilt: z.string().refine((val) => {
    const year = parseInt(val);
    return year >= 1950 && year <= new Date().getFullYear() + 1;
  }, 'Ungültiges Baujahr'),
  condition: z.string().min(1, 'Bitte wählen Sie einen Zustand'),
  price: z.string(),
  priceNegotiable: z.boolean(),
  noPrice: z.boolean(),
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
  description: z.string().min(1, 'Bitte geben Sie eine Beschreibung ein').refine((val) => {
    // HTML-Tags entfernen fuer Zeichenzaehlung
    const textOnly = val.replace(/<[^>]*>/g, '').trim();
    return textOnly.length >= 50;
  }, 'Beschreibung muss mind. 50 Zeichen haben'),
});

// Combined schema
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);
type FormData = z.infer<typeof fullSchema>;

// Type for uploaded media from database
interface UploadedMedia {
  id: string;
  url: string;
  filename: string;
  is_primary: boolean;
}

export default function NewListingPage() {
  const t = useTranslations('sellerListings');
  const locale = useLocale();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedMedia[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedMedia[]>([]);
  const [canCreate, setCanCreate] = useState<boolean | null>(null);
  const [planLimit, setPlanLimit] = useState<{ current: number; limit: number } | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoadingManufacturers, setIsLoadingManufacturers] = useState(true);

  const steps = [
    { id: 1, name: t('stepBasicData'), description: t('stepBasicDataDesc'), schema: step1Schema },
    { id: 2, name: t('stepTechnicalData'), description: t('stepTechnicalDataDesc'), schema: step2Schema },
    { id: 3, name: t('stepLocation'), description: t('stepLocationDesc'), schema: step3Schema },
    { id: 4, name: t('stepDescription'), description: t('stepDescriptionDesc'), schema: step4Schema },
    { id: 5, name: t('stepMedia'), description: t('stepMediaDesc'), schema: null },
    { id: 6, name: t('stepPreview'), description: t('stepPreviewDesc'), schema: null },
  ];

  // Load initial data (limits and manufacturers)
  useEffect(() => {
    const loadInitialData = async () => {
      const [limitResult, manufacturersResult] = await Promise.all([
        canCreateListing(),
        getManufacturers(),
      ]);
      
      if (limitResult.success && limitResult.data) {
        setCanCreate(limitResult.data.canCreate);
        setPlanLimit({ current: limitResult.data.currentCount, limit: limitResult.data.limit });
      } else {
        console.error('[NewListingPage] canCreateListing failed:', limitResult.error);
        setCanCreate(true);
        setPlanLimit({ current: 0, limit: 1 });
      }
      
      if (manufacturersResult.success && manufacturersResult.data) {
        setManufacturers(manufacturersResult.data);
      } else {
        console.error('[NewListingPage] getManufacturers failed:', manufacturersResult.error);
      }
      
      setIsLoadingManufacturers(false);
    };
    
    loadInitialData();
  }, []);

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
      noPrice: false,
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

  // Titel automatisch aus Hersteller + Modell zusammensetzen
  const watchManufacturerId = form.watch('manufacturerId');
  const watchModel = form.watch('modelNameCustom');

  useEffect(() => {
    const manufacturerName = manufacturers.find((m) => m.id === watchManufacturerId)?.name || '';
    const model = (watchModel || '').trim();
    const autoTitle = [manufacturerName, model].filter(Boolean).join(' ');
    if (autoTitle) {
      form.setValue('title', autoTitle, { shouldValidate: true });
    }
  }, [watchManufacturerId, watchModel, manufacturers, form]);

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
          toast.error(t('minOneImage'), {
            description: t('minOneImageDesc'),
          });
          return false;
        }
        return true;
      default:
        return true;
    }

    const result = await trigger(fieldsToValidate);
    if (!result) {
      toast.error(t('correctErrors'), {
        description: t('correctErrorsDesc'),
      });
    }
    return result;
  };

  const nextStep = async () => {
    // Special handling for step 4 -> 5: auto-save listing
    if (currentStep === 4) {
      await handleNextFromStep4();
      return;
    }

    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      toast.success(t('stepCompleted', { step: currentStep }), {
        description: steps[currentStep].name,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!listingId) {
      toast.error(t('saveBasicDataFirst'));
      return;
    }

    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('fileTooLarge', { name: file.name }), { description: t('maxImageSize') });
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(t('invalidFormat', { name: file.name }), { description: t('onlyJpgPngWebp') });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of validFiles) {
      const result = await uploadListingMedia(listingId, file, 'image');
      if (result.success && result.data) {
        setUploadedImages((prev) => [...prev, {
          id: result.data!.id,
          url: result.data!.url,
          filename: result.data!.filename,
          is_primary: result.data!.is_primary ?? false,
        }]);
        successCount++;
      } else {
        toast.error(t('uploadError', { name: file.name }), { description: result.error });
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      toast.success(t('imagesUploadedCount', { count: successCount }));
    }
  }, [listingId, t]);

  const removeImage = async (mediaId: string) => {
    const result = await deleteListingMedia(mediaId);
    if (result.success) {
      setUploadedImages((prev) => prev.filter((img) => img.id !== mediaId));
      toast.info(t('imageRemoved'));
    } else {
      toast.error(t('errorRemoving'), { description: result.error });
    }
  };

  const handleDocUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!listingId) {
      toast.error(t('saveBasicDataFirst'));
      return;
    }

    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(t('fileTooLarge', { name: file.name }), { description: t('maxDocSizeError') });
        return false;
      }
      if (file.type !== 'application/pdf') {
        toast.error(t('invalidFormat', { name: file.name }), { description: t('onlyPdf') });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of validFiles) {
      const result = await uploadListingMedia(listingId, file, 'document');
      if (result.success && result.data) {
        setUploadedDocs((prev) => [...prev, {
          id: result.data!.id,
          url: result.data!.url,
          filename: result.data!.filename,
          is_primary: false,
        }]);
        successCount++;
      } else {
        toast.error(t('uploadError', { name: file.name }), { description: result.error });
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      toast.success(t('docsUploadedCount', { count: successCount }));
    }

    // Input zurücksetzen
    e.target.value = '';
  }, [listingId, t]);

  const removeDoc = async (mediaId: string) => {
    const result = await deleteListingMedia(mediaId);
    if (result.success) {
      setUploadedDocs((prev) => prev.filter((doc) => doc.id !== mediaId));
      toast.info(t('docRemoved'));
    } else {
      toast.error(t('errorRemoving'), { description: result.error });
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    const result = await setPrimaryImage(mediaId);
    if (result.success) {
      setUploadedImages((prev) => prev.map((img) => ({
        ...img,
        is_primary: img.id === mediaId,
      })));
      toast.success(t('primaryImageSet'));
    } else {
      toast.error(t('errorGeneric'), { description: result.error });
    }
  };

  // Save the listing (create or update)
  const saveListing = async (): Promise<string | null> => {
    const values = getValues();
    
    // Parse price (remove formatting) — 0 wenn "Kein Preis"
    let priceInCents: number = 0;
    if (!values.noPrice && values.price) {
      const priceString = values.price.replace(/\./g, '').replace(/,/g, '');
      priceInCents = parseInt(priceString) * 100;
      if (isNaN(priceInCents)) {
        toast.error(t('invalidPrice'));
        return null;
      }
    }

    const listingData = {
      manufacturerId: values.manufacturerId,
      modelNameCustom: values.modelNameCustom || undefined,
      title: values.title,
      yearBuilt: parseInt(values.yearBuilt),
      condition: values.condition as 'new' | 'like_new' | 'good' | 'fair',
      price: priceInCents,
      priceNegotiable: values.noPrice ? true : values.priceNegotiable,
      measuringRangeX: values.measuringRangeX ? parseInt(values.measuringRangeX) : undefined,
      measuringRangeY: values.measuringRangeY ? parseInt(values.measuringRangeY) : undefined,
      measuringRangeZ: values.measuringRangeZ ? parseInt(values.measuringRangeZ) : undefined,
      accuracyUm: values.accuracyUm || undefined,
      software: values.software || undefined,
      controller: values.controller || undefined,
      probeSystem: values.probeSystem || undefined,
      locationCountry: values.locationCountry,
      locationCity: values.locationCity,
      locationPostalCode: values.locationPostalCode,
      description: values.description,
    };

    if (listingId) {
      // Update existing
      const result = await updateListing(listingId, listingData);
      if (!result.success) {
        toast.error(t('errorSaving'), { description: result.error });
        return null;
      }
      return listingId;
    } else {
      // Create new
      const result = await createListing(listingData);
      if (!result.success) {
        toast.error(t('errorCreating'), { description: result.error });
        return null;
      }
      setListingId(result.data!.id);
      return result.data!.id;
    }
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    if (!asDraft) {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error(t('formIncomplete'), {
          description: t('formIncompleteDesc'),
        });
        return;
      }
      if (uploadedImages.length === 0) {
        toast.error(t('imagesMissing'), {
          description: t('imagesMissingDesc'),
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // First save the listing
      const savedListingId = await saveListing();
      if (!savedListingId) {
        setIsSubmitting(false);
        return;
      }

      if (asDraft) {
        toast.success(t('draftSaved'), {
          description: t('draftSavedDesc'),
        });
        router.push('/seller/inserate');
      } else {
        // Submit for review
        const submitResult = await submitListingForReview(savedListingId);
        if (!submitResult.success) {
          toast.error(t('errorSubmitting'), { description: submitResult.error });
          setIsSubmitting(false);
          return;
        }
        
        toast.success(t('listingSubmitted'), {
          description: t('listingSubmittedDesc'),
        });
        router.push('/seller/inserate');
      }
    } catch {
      toast.error(t('errorSaving'), {
        description: t('errorSavingRetry'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-save when moving from step 4 to step 5 (before media upload)
  const handleNextFromStep4 = async () => {
    const isValid = await validateStep(4);
    if (!isValid) return;

    setIsSubmitting(true);
    const savedListingId = await saveListing();
    setIsSubmitting(false);

    if (savedListingId) {
      setCurrentStep(5);
      toast.success(t('dataSaved'), { description: t('dataSavedDesc') });
    }
  };

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat(locale).format(num);
  };

  const values = getValues();

  // Show loading while checking limits and loading manufacturers
  if (canCreate === null || isLoadingManufacturers) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error if limit reached
  if (canCreate === false) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>{t('limitReached')}</CardTitle>
            <CardDescription>
              {t('limitReachedDesc', { limit: planLimit?.limit ?? 0 })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('currentOfLimit', { current: planLimit?.current ?? 0, limit: planLimit?.limit ?? 0 })}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/seller/inserate">{t('back')}</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/seller/abo/upgrade">{t('upgradePlan')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-lg font-semibold">{t('createNewListing')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('stepOf', { current: currentStep, total: steps.length, name: steps[currentStep - 1].name })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {planLimit && (
                <Badge variant="outline" className="hidden sm:flex">
                  {t('listingsCount', { current: planLimit.current + 1, limit: planLimit.limit })}
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || currentStep < 4}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('saveAsDraft')}
              </Button>
            </div>
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
                  <CardTitle>{t('stepBasicData')}</CardTitle>
                  <CardDescription>
                    {t('basicInfo')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="manufacturerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('manufacturerRequired')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('choosePlaceholder')} />
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
                          <FormLabel>{t('model')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('modelPlaceholder')} {...field} />
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
                        <FormLabel>{t('listingTitle')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('titlePlaceholder')}
                            {...field}
                            readOnly
                            className="bg-muted/50"
                          />
                        </FormControl>
                        <FormDescription>
                          {t('titleAutoGenerated') || 'Wird automatisch aus Hersteller und Modell generiert.'}
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
                          <FormLabel>{t('yearBuilt')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('yearPlaceholder')}
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
                          <FormLabel>{t('condition')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('choosePlaceholder')} />
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
                        <FormLabel>{t('priceEur').replace(' *', '')} {!form.watch('noPrice') && '*'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder={form.watch('noPrice') ? (t('noPrice') || 'Preis auf Anfrage') : t('pricePlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(formatPrice(e.target.value))}
                              className="pr-12"
                              disabled={form.watch('noPrice')}
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

                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="noPrice"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  form.setValue('price', '');
                                  form.setValue('priceNegotiable', true);
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm cursor-pointer !mt-0">
                            {t('noPriceLabel')}
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {!form.watch('noPrice') && (
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
                              {t('priceNegotiable')}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Technical Data */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('stepTechnicalData')}</CardTitle>
                  <CardDescription>
                    {t('technicalSpecs')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t('measuringRange')}</Label>
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
                        <FormLabel>{t('accuracy')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accuracyPlaceholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('accuracyHelp')}</FormDescription>
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
                          <FormLabel>{t('software')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('softwarePlaceholder')} {...field} />
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
                          <FormLabel>{t('controller')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('controllerPlaceholder')} {...field} />
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
                        <FormLabel>{t('probeSystem')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('probePlaceholder')} {...field} />
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
                  <CardTitle>{t('stepLocation')}</CardTitle>
                  <CardDescription>
                    {t('locationQuestion')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="locationCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('country')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('choosePlaceholder')} />
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
                          <FormLabel>{t('postalCode')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('postalCodePlaceholder')} {...field} />
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
                          <FormLabel>{t('city')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('cityPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t('locationPrivacy')}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Description */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('stepDescription')}</CardTitle>
                  <CardDescription>
                    {t('descriptionInstructions')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('descriptionLabel')}</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t('descriptionPlaceholder')}
                            maxLength={5000}
                            minLength={50}
                          />
                        </FormControl>
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
                  <CardTitle>{t('stepMedia')}</CardTitle>
                  <CardDescription>
                    {t('uploadInfo')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t('imagesLabel')} {t('imagesCount', { count: uploadedImages.length })}</Label>
                      {uploadedImages.length === 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {t('required')}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Preview of uploaded images */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {uploadedImages.map((media) => (
                          <div key={media.id} className="relative group">
                            <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                              <img
                                src={media.url}
                                alt={media.filename}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(media.id)}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {!media.is_primary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(media.id)}
                                className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
                                title={t('setAsPrimary')}
                              >
                                <Star className="h-3 w-3" />
                              </button>
                            )}
                            {media.is_primary && (
                              <Badge className="absolute bottom-1 left-1 text-[10px]">
                                {t('primaryImage')}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {isUploading && (
                      <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>{t('uploading')}</span>
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
                      <p className="font-medium">{t('dragImages')}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('clickToSelect')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        {t('imageFormats')}
                      </p>
                    </label>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-4">
                    <Label>{t('documents')} {t('docsCount', { count: uploadedDocs.length })}</Label>

                    {/* Liste hochgeladener Dokumente */}
                    {uploadedDocs.length > 0 && (
                      <div className="space-y-2">
                        {uploadedDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium truncate">{doc.filename}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDoc(doc.id)}
                              className="ml-2 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                              title={t('docRemoved')}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors block">
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handleDocUpload}
                        className="hidden"
                      />
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t('docTypes')}
                      </p>
                      <p className="text-sm font-medium text-primary mt-2">
                        {t('uploadPdf')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('maxDocSize')}
                      </p>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Preview */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('previewAndPublish')}</CardTitle>
                  <CardDescription>
                    {t('previewDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('titleLabel')}</span>
                      <span className="font-medium">{values.title || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('manufacturer')}</span>
                      <span className="font-medium">
                        {manufacturers.find((m) => m.id === values.manufacturerId)?.name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('yearBuiltLabel')}</span>
                      <span className="font-medium">{values.yearBuilt || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('priceLabel')}</span>
                      <span className="font-medium">
                        {values.price ? `${values.price} €` : (values.noPrice ? t('noPrice') : '-')}
                        {values.price && values.priceNegotiable && ' (VB)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('measuringRangeLabel')}</span>
                      <span className="font-medium">
                        {values.measuringRangeX && values.measuringRangeY && values.measuringRangeZ
                          ? `${values.measuringRangeX} × ${values.measuringRangeY} × ${values.measuringRangeZ} mm`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('locationLabel')}</span>
                      <span className="font-medium">
                        {values.locationCity && values.locationCountry
                          ? `${values.locationCity}, ${countries.find((c) => c.code === values.locationCountry)?.name}`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('imagesLabel')}</span>
                      <span className="font-medium">{t('imagesUploaded', { count: uploadedImages.length })}</span>
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      {t('reviewNotice')}
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
                {t('back')}
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  {t('forward')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('submitting')}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t('submitListing')}
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
