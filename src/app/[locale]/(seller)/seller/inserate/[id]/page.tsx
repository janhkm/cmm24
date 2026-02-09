'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Trash2,
  Archive,
  CheckCircle,
  Loader2,
  ImagePlus,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ListingEditSkeleton } from '@/components/ui/skeletons';
import { toast } from 'sonner';
import {
  getListingForEdit,
  getManufacturers,
  updateListing,
  deleteListing,
  archiveListing,
  markListingAsSold,
  submitListingForReview,
  uploadListingMedia,
  deleteListingMedia,
  setPrimaryImage,
} from '@/lib/actions/listings';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  sold: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
};

interface Listing {
  id: string;
  title: string;
  slug: string;
  status: string | null;
  manufacturer_id: string | null;
  year_built: number | null;
  condition: string | null;
  price: number | null;
  price_negotiable: boolean | null;
  measuring_range_x: number | null;
  measuring_range_y: number | null;
  measuring_range_z: number | null;
  accuracy_um: string | null;
  software: string | null;
  controller: string | null;
  probe_system: string | null;
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

interface Manufacturer {
  id: string;
  name: string;
  slug: string;
}

export default function EditListingPage() {
  const t = useTranslations('sellerListings');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

  const statusLabels: Record<string, string> = {
    draft: t('statusDraft'),
    pending_review: t('statusPendingReview'),
    active: t('statusActive'),
    sold: t('statusSold'),
    archived: t('statusArchived'),
  };

  const conditions = [
    { value: 'new', label: t('conditionNew') },
    { value: 'like_new', label: t('conditionLikeNew') },
    { value: 'good', label: t('conditionGood') },
    { value: 'fair', label: t('conditionFair') },
  ];

  const countries = [
    { code: 'DE', name: t('countryDE') },
    { code: 'AT', name: t('countryAT') },
    { code: 'CH', name: t('countryCH') },
    { code: 'NL', name: t('countryNL') },
    { code: 'BE', name: t('countryBE') },
    { code: 'FR', name: t('countryFR') },
    { code: 'IT', name: t('countryIT') },
    { code: 'PL', name: t('countryPL') },
    { code: 'CZ', name: t('countryCZ') },
    { code: 'GB', name: t('countryGB') },
  ];
  
  // Form state
  const [formData, setFormData] = useState({
    manufacturer_id: '',
    title: '',
    year_built: '',
    condition: '',
    price: '',
    price_negotiable: false,
    measuring_range_x: '',
    measuring_range_y: '',
    measuring_range_z: '',
    accuracy_um: '',
    software: '',
    controller: '',
    probe_system: '',
    location_country: '',
    location_city: '',
    location_postal_code: '',
    description: '',
  });

  // Load listing and manufacturers
  useEffect(() => {
    const loadData = async () => {
      try {
        const [listingResult, manufacturersResult] = await Promise.all([
          getListingForEdit(listingId),
          getManufacturers(),
        ]);
        
        if (manufacturersResult.success && manufacturersResult.data) {
          setManufacturers(manufacturersResult.data);
        }
        
        if (listingResult.success && listingResult.data) {
          const l = listingResult.data;
          setListing(l as Listing);
          setFormData({
            manufacturer_id: l.manufacturer_id || '',
            title: l.title || '',
            year_built: l.year_built?.toString() || '',
            condition: l.condition || '',
            price: l.price?.toString() || '',
            price_negotiable: l.price_negotiable || false,
            measuring_range_x: l.measuring_range_x?.toString() || '',
            measuring_range_y: l.measuring_range_y?.toString() || '',
            measuring_range_z: l.measuring_range_z?.toString() || '',
            accuracy_um: l.accuracy_um || '',
            software: l.software || '',
            controller: l.controller || '',
            probe_system: l.probe_system || '',
            location_country: l.location_country || '',
            location_city: l.location_city || '',
            location_postal_code: l.location_postal_code || '',
            description: l.description || '',
          });
        } else {
          toast.error(listingResult.error || t('listingNotFound'));
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        toast.error(t('loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [listingId, t]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateListing(listingId, {
        manufacturerId: formData.manufacturer_id,
        title: formData.title,
        yearBuilt: formData.year_built ? parseInt(formData.year_built) : undefined,
        condition: formData.condition as 'new' | 'like_new' | 'good' | 'fair',
        price: formData.price ? parseInt(formData.price) : undefined,
        priceNegotiable: formData.price_negotiable,
        measuringRangeX: formData.measuring_range_x ? parseInt(formData.measuring_range_x) : undefined,
        measuringRangeY: formData.measuring_range_y ? parseInt(formData.measuring_range_y) : undefined,
        measuringRangeZ: formData.measuring_range_z ? parseInt(formData.measuring_range_z) : undefined,
        accuracyUm: formData.accuracy_um || undefined,
        software: formData.software || undefined,
        controller: formData.controller || undefined,
        probeSystem: formData.probe_system || undefined,
        locationCountry: formData.location_country,
        locationCity: formData.location_city,
        locationPostalCode: formData.location_postal_code,
        description: formData.description,
      });
      
      if (result.success) {
        toast.success(t('listingSaved'));
      } else {
        toast.error(result.error || t('errorSavingListing'));
      }
    } catch (error) {
      toast.error(t('errorSavingListing'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const result = await submitListingForReview(listingId);
      if (result.success) {
        setListing(prev => prev ? { ...prev, status: 'pending_review' } : null);
        toast.success(t('submittedForReview'));
      } else {
        toast.error(result.error || t('errorSubmittingReview'));
      }
    } catch (error) {
      toast.error(t('errorSubmittingReview'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    setIsSaving(true);
    try {
      const result = await archiveListing(listingId);
      if (result.success) {
        setListing(prev => prev ? { ...prev, status: 'archived' } : null);
        toast.success(t('listingArchivedToast'));
      } else {
        toast.error(result.error || t('errorArchivingListing'));
      }
    } catch (error) {
      toast.error(t('errorArchivingListing'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkSold = async () => {
    setIsSaving(true);
    try {
      const result = await markListingAsSold(listingId);
      if (result.success) {
        setListing(prev => prev ? { ...prev, status: 'sold' } : null);
        toast.success(t('markedAsSold'));
      } else {
        toast.error(result.error || t('errorMarking'));
      }
    } catch (error) {
      toast.error(t('errorMarking'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteListing(listingId);
      if (result.success) {
        toast.success(t('listingDeletedEdit'));
        router.push('/seller/inserate');
      } else {
        toast.error(result.error || t('errorDeletingListing'));
      }
    } catch (error) {
      toast.error(t('errorDeletingListing'));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadListingMedia(listingId, file, 'image');
        if (result.success && result.data) {
          const newMedia = result.data;
          setListing(prev => {
            if (!prev) return null;
            return {
              ...prev,
              media: [...prev.media, newMedia],
            };
          });
        } else {
          toast.error(result.error || t('errorUploading'));
        }
      }
      toast.success(t('imagesUploadedToast'));
    } catch (error) {
      toast.error(t('errorUploading'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDocUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
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
    try {
      for (const file of validFiles) {
        const result = await uploadListingMedia(listingId, file, 'document');
        if (result.success && result.data) {
          const newMedia = result.data;
          setListing(prev => {
            if (!prev) return null;
            return {
              ...prev,
              media: [...prev.media, newMedia],
            };
          });
        } else {
          toast.error(result.error || t('errorUploading'));
        }
      }
      toast.success(t('docsUploadedToast'));
    } catch (error) {
      toast.error(t('errorUploading'));
    } finally {
      setIsUploading(false);
      if (docInputRef.current) {
        docInputRef.current.value = '';
      }
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const result = await deleteListingMedia(mediaId);
      if (result.success) {
        setListing(prev => {
          if (!prev) return null;
          return {
            ...prev,
            media: prev.media.filter(m => m.id !== mediaId),
          };
        });
        toast.success(t('imageDeletedToast'));
      } else {
        toast.error(result.error || t('errorDeletingListing'));
      }
    } catch (error) {
      toast.error(t('errorDeletingListing'));
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    try {
      const result = await setPrimaryImage(mediaId);
      if (result.success) {
        setListing(prev => {
          if (!prev) return null;
          return {
            ...prev,
            media: prev.media.map(m => ({
              ...m,
              is_primary: m.id === mediaId,
            })),
          };
        });
        toast.success(t('primaryImageSet'));
      } else {
        toast.error(result.error || t('errorGeneric'));
      }
    } catch (error) {
      toast.error(t('errorGeneric'));
    }
  };

  if (isLoading) {
    return <ListingEditSkeleton />;
  }

  if (!listing) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('listingNotFound')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('listingNotFoundDesc')}
        </p>
        <Button asChild>
          <Link href="/seller/inserate">{t('backToListings')}</Link>
        </Button>
      </div>
    );
  }

  const images = listing.media.filter(m => m.type === 'image');
  const documents = listing.media.filter(m => m.type === 'document');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/seller/inserate">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('editListing')}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[listing.status || 'draft']}>
                {statusLabels[listing.status || 'draft']}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ID: {listing.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {listing.status === 'active' && (
            <Button variant="outline" asChild>
              <Link href={`/maschinen/${listing.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                {t('view')}
              </Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('save')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">{t('tabBasicData')}</TabsTrigger>
          <TabsTrigger value="technical">{t('tabTechnicalData')}</TabsTrigger>
          <TabsTrigger value="media">{t('tabMedia')}</TabsTrigger>
          <TabsTrigger value="description">{t('tabDescription')}</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabBasicData')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">{t('manufacturerRequired')}</Label>
                  <Select 
                    value={formData.manufacturer_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, manufacturer_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectManufacturer')} />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">{t('titleRequired')}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('titleEditPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">{t('yearBuiltRequired')}</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    value={formData.year_built}
                    onChange={(e) => setFormData(prev => ({ ...prev, year_built: e.target.value }))}
                    placeholder="2020"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">{t('conditionRequired')}</Label>
                  <Select 
                    value={formData.condition}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCondition')} />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">{t('priceRequired')}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="45000"
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="priceNegotiable"
                      checked={formData.price_negotiable}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, price_negotiable: !!checked }))}
                    />
                    <Label htmlFor="priceNegotiable" className="cursor-pointer">
                      {t('priceNegotiable')}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">{t('locationSection')}</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">{t('countryRequired')}</Label>
                    <Select 
                      value={formData.location_country}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, location_country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectCountry')} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('cityRequired')}</Label>
                    <Input
                      id="city"
                      value={formData.location_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                      placeholder={t('cityPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t('postalCodeLabel')}</Label>
                    <Input
                      id="postalCode"
                      value={formData.location_postal_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_postal_code: e.target.value }))}
                      placeholder={t('postalCodePlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Data Tab */}
        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabTechnicalData')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rangeX">{t('measuringRangeX')}</Label>
                  <Input
                    id="rangeX"
                    type="number"
                    value={formData.measuring_range_x}
                    onChange={(e) => setFormData(prev => ({ ...prev, measuring_range_x: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rangeY">{t('measuringRangeY')}</Label>
                  <Input
                    id="rangeY"
                    type="number"
                    value={formData.measuring_range_y}
                    onChange={(e) => setFormData(prev => ({ ...prev, measuring_range_y: e.target.value }))}
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rangeZ">{t('measuringRangeZ')}</Label>
                  <Input
                    id="rangeZ"
                    type="number"
                    value={formData.measuring_range_z}
                    onChange={(e) => setFormData(prev => ({ ...prev, measuring_range_z: e.target.value }))}
                    placeholder="600"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="accuracy">{t('accuracyLabel')}</Label>
                  <Input
                    id="accuracy"
                    value={formData.accuracy_um}
                    onChange={(e) => setFormData(prev => ({ ...prev, accuracy_um: e.target.value }))}
                    placeholder="1.8 + L/350"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('accuracyHint')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="software">{t('software')}</Label>
                  <Input
                    id="software"
                    value={formData.software}
                    onChange={(e) => setFormData(prev => ({ ...prev, software: e.target.value }))}
                    placeholder={t('softwarePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="controller">{t('controller')}</Label>
                  <Input
                    id="controller"
                    value={formData.controller}
                    onChange={(e) => setFormData(prev => ({ ...prev, controller: e.target.value }))}
                    placeholder={t('controllerPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probeSystem">{t('probeSystem')}</Label>
                  <Input
                    id="probeSystem"
                    value={formData.probe_system}
                    onChange={(e) => setFormData(prev => ({ ...prev, probe_system: e.target.value }))}
                    placeholder={t('probePlaceholder')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabMedia')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Images */}
                <div>
                  <Label className="mb-3 block">{t('imagesLabel')}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group aspect-[4/3] bg-muted rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={t('imageLabel', { index: index + 1 })}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="h-8 w-8"
                            onClick={() => handleSetPrimary(image.id)}
                            title={t('setAsPrimary')}
                          >
                            <Star className={`h-4 w-4 ${image.is_primary ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="destructive" 
                            className="h-8 w-8"
                            onClick={() => handleDeleteMedia(image.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {image.is_primary && (
                          <Badge className="absolute top-2 left-2 text-xs">
                            {t('primaryImage')}
                          </Badge>
                        )}
                      </div>
                    ))}
                    <button 
                      className="aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <>
                          <ImagePlus className="h-8 w-8" />
                          <span className="text-sm">{t('addImage')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('imageFormatsEdit')}
                  </p>
                </div>

                {/* Documents */}
                <div className="border-t pt-6">
                  <Label className="mb-3 block">{t('documentsLabel')}</Label>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">{doc.filename || t('document')}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive"
                          onClick={() => handleDeleteMedia(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <button 
                      className="w-full p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground transition-colors text-sm disabled:opacity-50"
                      onClick={() => docInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? t('uploadingDots') : t('addDoc')}
                    </button>
                    <input
                      ref={docInputRef}
                      type="file"
                      accept="application/pdf"
                      multiple
                      className="hidden"
                      onChange={handleDocUpload}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Description Tab */}
        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabDescription')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">{t('descriptionRequired')}</Label>
                <Textarea
                  id="description"
                  rows={10}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('descriptionEditPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('descriptionTip')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('actions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {listing.status === 'draft' && (
              <Button onClick={handlePublish} disabled={isSaving}>
                <Send className="mr-2 h-4 w-4" />
                {t('submitForReview')}
              </Button>
            )}
            {listing.status === 'active' && (
              <>
                <Button onClick={handleMarkSold} variant="outline" disabled={isSaving}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('markAsSold')}
                </Button>
                <Button onClick={handleArchive} variant="outline" disabled={isSaving}>
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
    </div>
  );
}
