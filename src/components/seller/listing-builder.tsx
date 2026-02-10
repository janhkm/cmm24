'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeft,
  Check,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Loader2,
  AlertCircle,
  Star,
  Save,
  Send,
  Trash2,
  Archive,
  CheckCircle,
  Eye,
  Info,
  Package,
  MapPin,
  Settings2,
  AlignLeft,
  ImagePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { conditions, countries } from '@/data/constants';
import {
  createListing,
  updateListing,
  uploadListingMedia,
  deleteListingMedia,
  submitListingForReview,
  setPrimaryImage,
  getManufacturers,
  deleteListing,
  archiveListing,
  markListingAsSold,
} from '@/lib/actions/listings';

// ============================================================================
// Typen
// ============================================================================

interface Manufacturer {
  id: string;
  name: string;
  slug: string;
}

interface UploadedMedia {
  id: string;
  url: string;
  filename: string;
  is_primary: boolean;
  type?: string | null;
  thumbnail_url?: string | null;
}

interface ExistingListing {
  id: string;
  title: string;
  slug: string;
  status: string | null;
  manufacturer_id: string | null;
  model_name_custom?: string | null;
  year_built: number | null;
  condition: string | null;
  machine_type: string | null;
  price: number | null;
  price_negotiable: boolean | null;
  measuring_range_x: number | null;
  measuring_range_y: number | null;
  measuring_range_z: number | null;
  accuracy_um: string | null;
  software: string | null;
  controller: string | null;
  probe_system: string | null;
  weight_kg: number | null;
  dimension_length_mm: number | null;
  dimension_width_mm: number | null;
  dimension_height_mm: number | null;
  mpn: string | null;
  gtin: string | null;
  serial_number: string | null;
  location_country: string | null;
  location_city: string | null;
  location_postal_code: string | null;
  description: string | null;
  media: Array<{
    id: string;
    url: string;
    thumbnail_url: string | null;
    is_primary: boolean | null;
    type: string | null;
    filename: string | null;
  }>;
  manufacturer: { id: string; name: string } | null;
}

interface ListingBuilderProps {
  /** Bestehendes Inserat zum Bearbeiten (wenn leer = Neuerstellung) */
  listing?: ExistingListing;
}

// ============================================================================
// Validierungsschema
// ============================================================================

const listingFormSchema = z.object({
  manufacturerId: z.string().min(1, 'Bitte wählen Sie einen Hersteller'),
  modelNameCustom: z.string().max(100, 'Max. 100 Zeichen').optional(),
  title: z.string().min(1, 'Titel wird automatisch generiert').max(150, 'Max. 150 Zeichen'),
  yearBuilt: z.string().refine((val) => {
    if (!val) return false;
    const year = parseInt(val);
    return year >= 1950 && year <= new Date().getFullYear() + 1;
  }, 'Ungültiges Baujahr'),
  condition: z.string().min(1, 'Bitte wählen Sie einen Zustand'),
  machineType: z.string().optional(),
  price: z.string(),
  priceNegotiable: z.boolean(),
  noPrice: z.boolean(),
  measuringRangeX: z.string().optional(),
  measuringRangeY: z.string().optional(),
  measuringRangeZ: z.string().optional(),
  accuracyUm: z.string().max(50, 'Max. 50 Zeichen').optional(),
  software: z.string().max(100, 'Max. 100 Zeichen').optional(),
  controller: z.string().max(100, 'Max. 100 Zeichen').optional(),
  probeSystem: z.string().max(100, 'Max. 100 Zeichen').optional(),
  weightKg: z.string().optional(),
  dimensionLengthMm: z.string().optional(),
  dimensionWidthMm: z.string().optional(),
  dimensionHeightMm: z.string().optional(),
  mpn: z.string().max(70, 'Max. 70 Zeichen').optional(),
  gtin: z.string().max(14, 'Max. 14 Zeichen').optional(),
  serialNumber: z.string().max(100, 'Max. 100 Zeichen').optional(),
  locationCountry: z.string().min(1, 'Bitte wählen Sie ein Land'),
  locationCity: z.string().min(2, 'Mind. 2 Zeichen').max(100, 'Max. 100 Zeichen'),
  locationPostalCode: z.string().min(3, 'Mind. 3 Zeichen').max(10, 'Max. 10 Zeichen'),
  description: z.string().min(1, 'Bitte geben Sie eine Beschreibung ein').refine((val) => {
    const textOnly = val.replace(/<[^>]*>/g, '').trim();
    return textOnly.length >= 50;
  }, 'Beschreibung muss mind. 50 Zeichen haben'),
});

type FormData = z.infer<typeof listingFormSchema>;

// ============================================================================
// Status-Farben
// ============================================================================

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  sold: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
};

// ============================================================================
// Komponente
// ============================================================================

export default function ListingBuilder({ listing }: ListingBuilderProps) {
  const t = useTranslations('sellerListings');
  const locale = useLocale();
  const router = useRouter();
  const isEditMode = !!listing;

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [listingId, setListingId] = useState<string | null>(listing?.id ?? null);
  const [listingStatus, setListingStatus] = useState<string>(listing?.status ?? 'draft');
  const [listingSlug, setListingSlug] = useState<string>(listing?.slug ?? '');
  const [uploadedImages, setUploadedImages] = useState<UploadedMedia[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedMedia[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  // Kein Plan-Limit mehr aktiv
  // showAdditionalSpecs entfernt – alle Felder immer sichtbar
  const [isSaved, setIsSaved] = useState(isEditMode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Bestehende Medien aufteilen
  useEffect(() => {
    if (listing?.media) {
      const images = listing.media
        .filter((m) => m.type === 'image')
        .map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename || 'Bild',
          is_primary: m.is_primary ?? false,
          type: m.type,
          thumbnail_url: m.thumbnail_url,
        }));
      const docs = listing.media
        .filter((m) => m.type === 'document')
        .map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename || 'Dokument',
          is_primary: false,
          type: m.type,
          thumbnail_url: m.thumbnail_url,
        }));
      setUploadedImages(images);
      setUploadedDocs(docs);
    }
  }, [listing?.media]);

  // Alle Felder sind immer sichtbar – kein Toggle mehr noetig

  // Initiale Daten laden (Hersteller)
  useEffect(() => {
    const loadInitialData = async () => {
      const result = await getManufacturers();
      if (result.success && result.data) {
        setManufacturers(result.data);
      }
      setIsLoadingInitial(false);
    };
    loadInitialData();
  }, []);

  // ============================================================================
  // Formular
  // ============================================================================

  const form = useForm<FormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      manufacturerId: listing?.manufacturer_id || '',
      modelNameCustom: listing?.model_name_custom || '',
      title: listing?.title || '',
      yearBuilt: listing?.year_built?.toString() || '',
      condition: listing?.condition || '',
      machineType: listing?.machine_type || '',
      price: listing?.price
        ? listing.price === 0
          ? ''
          : (listing.price / 100).toString()
        : '',
      priceNegotiable: listing?.price_negotiable ?? false,
      noPrice: listing?.price === 0 || listing?.price === null ? (isEditMode ? (listing?.price_negotiable ?? false) : false) : false,
      measuringRangeX: listing?.measuring_range_x?.toString() || '',
      measuringRangeY: listing?.measuring_range_y?.toString() || '',
      measuringRangeZ: listing?.measuring_range_z?.toString() || '',
      accuracyUm: listing?.accuracy_um || '',
      software: listing?.software || '',
      controller: listing?.controller || '',
      probeSystem: listing?.probe_system || '',
      weightKg: listing?.weight_kg?.toString() || '',
      dimensionLengthMm: listing?.dimension_length_mm?.toString() || '',
      dimensionWidthMm: listing?.dimension_width_mm?.toString() || '',
      dimensionHeightMm: listing?.dimension_height_mm?.toString() || '',
      mpn: listing?.mpn || '',
      gtin: listing?.gtin || '',
      serialNumber: listing?.serial_number || '',
      locationCountry: listing?.location_country || '',
      locationCity: listing?.location_city || '',
      locationPostalCode: listing?.location_postal_code || '',
      description: listing?.description || '',
    },
    mode: 'onChange',
  });

  // Titel automatisch zusammensetzen
  const watchManufacturerId = form.watch('manufacturerId');
  const watchModel = form.watch('modelNameCustom');

  useEffect(() => {
    // Nur automatisch setzen wenn nicht im Edit-Modus oder wenn Hersteller/Modell geaendert
    const manufacturerName = manufacturers.find((m) => m.id === watchManufacturerId)?.name || '';
    const model = (watchModel || '').trim();
    const autoTitle = [manufacturerName, model].filter(Boolean).join(' ');
    if (autoTitle) {
      form.setValue('title', autoTitle, { shouldValidate: true });
    }
  }, [watchManufacturerId, watchModel, manufacturers, form]);

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat(locale).format(num);
  };

  // ============================================================================
  // Speichern (Create oder Update)
  // ============================================================================

  const saveListing = async (): Promise<string | null> => {
    const values = form.getValues();

    // Preis parsen
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
      machineType: values.machineType || undefined,
      price: priceInCents,
      priceNegotiable: values.noPrice ? true : values.priceNegotiable,
      measuringRangeX: values.measuringRangeX ? parseInt(values.measuringRangeX) : undefined,
      measuringRangeY: values.measuringRangeY ? parseInt(values.measuringRangeY) : undefined,
      measuringRangeZ: values.measuringRangeZ ? parseInt(values.measuringRangeZ) : undefined,
      accuracyUm: values.accuracyUm || undefined,
      software: values.software || undefined,
      controller: values.controller || undefined,
      probeSystem: values.probeSystem || undefined,
      weightKg: values.weightKg ? parseFloat(values.weightKg) : undefined,
      dimensionLengthMm: values.dimensionLengthMm ? parseInt(values.dimensionLengthMm) : undefined,
      dimensionWidthMm: values.dimensionWidthMm ? parseInt(values.dimensionWidthMm) : undefined,
      dimensionHeightMm: values.dimensionHeightMm ? parseInt(values.dimensionHeightMm) : undefined,
      mpn: values.mpn || undefined,
      gtin: values.gtin || undefined,
      serialNumber: values.serialNumber || undefined,
      locationCountry: values.locationCountry,
      locationCity: values.locationCity,
      locationPostalCode: values.locationPostalCode,
      description: values.description,
    };

    if (listingId) {
      const result = await updateListing(listingId, listingData);
      if (!result.success) {
        toast.error(t('errorSaving'), { description: result.error });
        return null;
      }
      return listingId;
    } else {
      const result = await createListing(listingData);
      if (!result.success) {
        toast.error(t('errorCreating'), { description: result.error });
        return null;
      }
      setListingId(result.data!.id);
      setIsSaved(true);
      return result.data!.id;
    }
  };

  // Speichern-Button
  const handleSave = async () => {
    // Validierung der Pflichtfelder
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error(t('correctErrors'), { description: t('correctErrorsDesc') });
      return;
    }

    setIsSubmitting(true);
    try {
      const savedId = await saveListing();
      if (savedId) {
        setIsSaved(true);
        toast.success(isEditMode ? t('listingSaved') : t('draftSaved'), {
          description: isEditMode ? undefined : t('draftSavedDesc'),
        });
        // Bei Neuerstellung: URL aktualisieren damit man die Seite nicht verliert
        if (!isEditMode) {
          router.replace(`/seller/inserate/${savedId}`);
        }
      }
    } catch {
      toast.error(t('errorSaving'), { description: t('errorSavingRetry') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Zur Pruefung einreichen
  const handleSubmitForReview = async () => {
    // Erst validieren
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error(t('formIncomplete'), { description: t('formIncompleteDesc') });
      return;
    }
    if (uploadedImages.length === 0) {
      toast.error(t('imagesMissing'), { description: t('imagesMissingDesc') });
      return;
    }

    setIsSubmitting(true);
    try {
      // Erst speichern
      const savedId = await saveListing();
      if (!savedId) {
        setIsSubmitting(false);
        return;
      }

      // Dann einreichen
      const result = await submitListingForReview(savedId);
      if (!result.success) {
        toast.error(t('errorSubmitting'), { description: result.error });
        setIsSubmitting(false);
        return;
      }

      setListingStatus('pending_review');
      toast.success(t('listingSubmitted'), { description: t('listingSubmittedDesc') });
      router.push('/seller/inserate');
    } catch {
      toast.error(t('errorSaving'), { description: t('errorSavingRetry') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // Aktionen (nur Bearbeitungsmodus)
  // ============================================================================

  const handleArchive = async () => {
    if (!listingId) return;
    setIsSubmitting(true);
    try {
      const result = await archiveListing(listingId);
      if (result.success) {
        setListingStatus('archived');
        toast.success(t('listingArchivedToast'));
      } else {
        toast.error(result.error || t('errorArchivingListing'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkSold = async () => {
    if (!listingId) return;
    setIsSubmitting(true);
    try {
      const result = await markListingAsSold(listingId);
      if (result.success) {
        setListingStatus('sold');
        toast.success(t('markedAsSold'));
      } else {
        toast.error(result.error || t('errorMarking'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!listingId) return;
    try {
      const result = await deleteListing(listingId);
      if (result.success) {
        toast.success(t('listingDeletedEdit'));
        router.push('/seller/inserate');
      } else {
        toast.error(result.error || t('errorDeletingListing'));
      }
    } catch {
      toast.error(t('errorDeletingListing'));
    }
  };

  // ============================================================================
  // Medien-Upload
  // ============================================================================

  const ensureListingId = async (): Promise<string | null> => {
    if (listingId) return listingId;
    // Erst Pflichtfelder pruefen
    const fieldsOk = await form.trigger([
      'manufacturerId',
      'title',
      'yearBuilt',
      'condition',
      'locationCountry',
      'locationCity',
      'locationPostalCode',
      'description',
    ]);
    if (!fieldsOk) {
      toast.error(t('correctErrors'), {
        description: 'Bitte füllen Sie alle Pflichtfelder aus, bevor Sie Medien hochladen.',
      });
      return null;
    }
    setIsSubmitting(true);
    const savedId = await saveListing();
    setIsSubmitting(false);
    if (savedId) {
      toast.success(t('dataSaved'), { description: t('dataSavedDesc') });
    }
    return savedId;
  };

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const currentId = listingId || (await ensureListingId());
      if (!currentId) return;

      const files = Array.from(e.target.files || []);
      const validFiles = files.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(t('fileTooLarge', { name: file.name }), { description: t('maxImageSize') });
          return false;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(t('invalidFormat', { name: file.name }), {
            description: t('onlyJpgPngWebp'),
          });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setIsUploading(true);
      let successCount = 0;

      for (const file of validFiles) {
        const result = await uploadListingMedia(currentId, file, 'image');
        if (result.success && result.data) {
          setUploadedImages((prev) => [
            ...prev,
            {
              id: result.data!.id,
              url: result.data!.url,
              filename: result.data!.filename ?? file.name,
              is_primary: result.data!.is_primary ?? false,
            },
          ]);
          successCount++;
        } else {
          toast.error(t('uploadError', { name: file.name }), { description: result.error });
        }
      }

      setIsUploading(false);
      if (successCount > 0) {
        toast.success(t('imagesUploadedCount', { count: successCount }));
      }
      // Input zuruecksetzen
      e.target.value = '';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listingId, t]
  );

  const removeImage = async (mediaId: string) => {
    const result = await deleteListingMedia(mediaId);
    if (result.success) {
      setUploadedImages((prev) => prev.filter((img) => img.id !== mediaId));
      toast.info(t('imageRemoved'));
    } else {
      toast.error(t('errorRemoving'), { description: result.error });
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    const result = await setPrimaryImage(mediaId);
    if (result.success) {
      setUploadedImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === mediaId }))
      );
      toast.success(t('primaryImageSet'));
    } else {
      toast.error(t('errorGeneric'), { description: result.error });
    }
  };

  const handleDocUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const currentId = listingId || (await ensureListingId());
      if (!currentId) return;

      const files = Array.from(e.target.files || []);
      const validFiles = files.filter((file) => {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(t('fileTooLarge', { name: file.name }), {
            description: t('maxDocSizeError'),
          });
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
        const result = await uploadListingMedia(currentId, file, 'document');
        if (result.success && result.data) {
          setUploadedDocs((prev) => [
            ...prev,
            {
              id: result.data!.id,
              url: result.data!.url,
              filename: result.data!.filename ?? file.name,
              is_primary: false,
            },
          ]);
          successCount++;
        } else {
          toast.error(t('uploadError', { name: file.name }), { description: result.error });
        }
      }

      setIsUploading(false);
      if (successCount > 0) {
        toast.success(t('docsUploadedCount', { count: successCount }));
      }
      e.target.value = '';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listingId, t]
  );

  const removeDoc = async (mediaId: string) => {
    const result = await deleteListingMedia(mediaId);
    if (result.success) {
      setUploadedDocs((prev) => prev.filter((doc) => doc.id !== mediaId));
      toast.info(t('docRemoved'));
    } else {
      toast.error(t('errorRemoving'), { description: result.error });
    }
  };

  // ============================================================================
  // Ladezustand
  // ============================================================================

  if (isLoadingInitial) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    draft: t('statusDraft'),
    pending_review: t('statusPendingReview'),
    active: t('statusActive'),
    sold: t('statusSold'),
    archived: t('statusArchived'),
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="p-4 sm:p-6 pb-32">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/seller/inserate">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              {isEditMode ? t('editListing') : t('createNewListing')}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {isEditMode && (
                <Badge className={statusColors[listingStatus]}>
                  {statusLabels[listingStatus]}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-11 sm:ml-0">
          {isEditMode && listingStatus === 'active' && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/maschinen/${listingSlug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                {t('view')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ===== Formular ===== */}
      <Form {...form}>
        <div className="max-w-3xl mx-auto space-y-8">
          {/* ───────────── Abschnitt 1: Stammdaten ───────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('stepBasicData')}</CardTitle>
                  <CardDescription>{t('basicInfo')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hersteller + Modell */}
              <div className="grid gap-5 sm:grid-cols-2">
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

              {/* Titel (automatisch) */}
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
                    <FormDescription>{t('titleAutoGenerated')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Baujahr + Zustand */}
              <div className="grid gap-5 sm:grid-cols-2">
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

              {/* Maschinentyp */}
              <FormField
                control={form.control}
                name="machineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('machineType')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('machineTypePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cmm">{t('machineTypeCmm')}</SelectItem>
                        <SelectItem value="optical">{t('machineTypeOptical')}</SelectItem>
                        <SelectItem value="other">{t('machineTypeOther')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preis */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('priceEur').replace(' *', '')} {!form.watch('noPrice') && '*'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={
                            form.watch('noPrice')
                              ? t('noPrice')
                              : t('pricePlaceholder')
                          }
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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

          {/* ───────────── Abschnitt 2: Standort ───────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('stepLocation')}</CardTitle>
                  <CardDescription>{t('locationQuestion')}</CardDescription>
                </div>
              </div>
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

              <div className="grid gap-5 sm:grid-cols-2">
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

              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                {t('locationPrivacy')}
              </p>
            </CardContent>
          </Card>

          {/* ───────────── Abschnitt 3: Technische Daten ───────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('stepTechnicalData')}</CardTitle>
                  <CardDescription>{t('technicalSpecs')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Messbereich */}
              <div className="space-y-3">
                <Label>{t('measuringRange')}</Label>
                <div className="grid gap-5 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="measuringRangeX"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-xs text-muted-foreground">X (mm)</Label>
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
                        <Label className="text-xs text-muted-foreground">Y (mm)</Label>
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
                        <Label className="text-xs text-muted-foreground">Z (mm)</Label>
                        <FormControl>
                          <Input type="number" placeholder="600" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Genauigkeit */}
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

              {/* Software + Steuerung */}
              <div className="grid gap-5 sm:grid-cols-2">
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

              {/* Tastsystem */}
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

              {/* Gewicht */}
              <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('weightKg')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('weightKgPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Aufstellmaße */}
              <div className="space-y-3">
                <Label>{t('machineDimensions')}</Label>
                <div className="grid gap-5 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="dimensionLengthMm"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-xs text-muted-foreground">
                          {t('dimensionLength')} (mm)
                        </Label>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('dimensionPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dimensionWidthMm"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-xs text-muted-foreground">
                          {t('dimensionWidth')} (mm)
                        </Label>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('dimensionPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dimensionHeightMm"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-xs text-muted-foreground">
                          {t('dimensionHeight')} (mm)
                        </Label>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('dimensionPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Seriennummer */}
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('serialNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('serialNumberPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MPN + GTIN */}
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="mpn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mpn')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('mpnPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gtin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('gtin')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('gtinPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ───────────── Abschnitt 4: Beschreibung ───────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlignLeft className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('stepDescription')}</CardTitle>
                  <CardDescription>{t('descriptionInstructions')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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

          {/* ───────────── Abschnitt 5: Medien ───────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('stepMedia')}</CardTitle>
                  <CardDescription>{t('uploadInfo')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bilder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>
                    {t('imagesLabel')} {t('imagesCount', { count: uploadedImages.length })}
                  </Label>
                  {uploadedImages.length === 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {t('required')}
                    </Badge>
                  )}
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">{t('dragImages')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('clickToSelect')}</p>
                  <p className="text-xs text-muted-foreground mt-3">{t('imageFormats')}</p>
                </label>
              </div>

              {/* Dokumente */}
              <div className="space-y-4 border-t pt-6">
                <Label>
                  {t('documents')} {t('docsCount', { count: uploadedDocs.length })}
                </Label>

                {uploadedDocs.length > 0 && (
                  <div className="space-y-2">
                    {uploadedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">{doc.filename}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(doc.id)}
                          className="ml-2 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors block">
                  <input
                    ref={docInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('docTypes')}</p>
                  <p className="text-sm font-medium text-primary mt-2">{t('uploadPdf')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('maxDocSize')}</p>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* ───────────── Aktionen (nur Bearbeitungsmodus) ───────────── */}
          {isEditMode && (
            <Card>
              <CardHeader>
                <CardTitle>{t('actions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {listingStatus === 'active' && (
                    <>
                      <Button
                        onClick={handleMarkSold}
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('markAsSold')}
                      </Button>
                      <Button
                        onClick={handleArchive}
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {t('archive')}
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('deleteBulk')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteListingTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteListingDesc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleDelete}
                        >
                          {t('confirmDelete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Form>

      {/* ===== Sticky Footer mit Speichern/Einreichen ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground hidden sm:block">
            {form.formState.errors &&
            Object.keys(form.formState.errors).length > 0 ? (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {Object.keys(form.formState.errors).length} Fehler im Formular
              </span>
            ) : uploadedImages.length === 0 ? (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Mindestens 1 Bild erforderlich
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                Bereit zum Einreichen
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t('save')}
            </Button>

            {(listingStatus === 'draft' || !isEditMode) && (
              <Button
                onClick={handleSubmitForReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {t('submitForReview')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
