'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  GripVertical,
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
import { mockListings, manufacturers, categories, conditions, countries } from '@/data/mock-data';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  sold: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
};

const statusLabels = {
  draft: 'Entwurf',
  pending_review: 'In Prüfung',
  active: 'Aktiv',
  sold: 'Verkauft',
  archived: 'Archiviert',
};

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [listing, setListing] = useState<any>(null);

  // Load listing data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const found = mockListings.find((l) => l.id === listingId);
      if (found) {
        setListing(found);
      }
      setIsLoading(false);
    }, 500);
  }, [listingId]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handlePublish = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setListing({ ...listing, status: 'pending_review' });
    setIsSaving(false);
  };

  const handleArchive = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setListing({ ...listing, status: 'archived' });
    setIsSaving(false);
  };

  const handleMarkSold = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setListing({ ...listing, status: 'sold' });
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Inserat nicht gefunden</h1>
        <p className="text-muted-foreground mb-6">
          Das angeforderte Inserat existiert nicht oder wurde gelöscht.
        </p>
        <Button asChild>
          <Link href="/seller/inserate">Zurück zu Inseraten</Link>
        </Button>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">Inserat bearbeiten</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[listing.status as keyof typeof statusColors]}>
                {statusLabels[listing.status as keyof typeof statusLabels]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ID: {listing.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/maschinen/${listing.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Vorschau
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Stammdaten</TabsTrigger>
          <TabsTrigger value="technical">Technische Daten</TabsTrigger>
          <TabsTrigger value="media">Bilder & Dokumente</TabsTrigger>
          <TabsTrigger value="description">Beschreibung</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Stammdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Hersteller *</Label>
                  <Select defaultValue={listing.manufacturerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hersteller wählen" />
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
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    defaultValue={listing.title}
                    placeholder="z.B. Zeiss Contura 10/12/6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Baujahr *</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    defaultValue={listing.yearBuilt}
                    placeholder="2020"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Zustand *</Label>
                  <Select defaultValue={listing.condition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Zustand wählen" />
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
                  <Label htmlFor="price">Preis (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    defaultValue={listing.price / 100}
                    placeholder="45000"
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="priceNegotiable"
                      defaultChecked={listing.priceNegotiable}
                    />
                    <Label htmlFor="priceNegotiable" className="cursor-pointer">
                      Preis verhandelbar (VB)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Standort</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">Land *</Label>
                    <Select defaultValue={listing.locationCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Land wählen" />
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
                    <Label htmlFor="city">Stadt *</Label>
                    <Input
                      id="city"
                      defaultValue={listing.locationCity}
                      placeholder="München"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">PLZ</Label>
                    <Input
                      id="postalCode"
                      defaultValue={listing.locationPostalCode}
                      placeholder="80331"
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
              <CardTitle>Technische Daten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rangeX">Messbereich X (mm) *</Label>
                  <Input
                    id="rangeX"
                    type="number"
                    defaultValue={listing.measuringRangeX}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rangeY">Messbereich Y (mm) *</Label>
                  <Input
                    id="rangeY"
                    type="number"
                    defaultValue={listing.measuringRangeY}
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rangeZ">Messbereich Z (mm) *</Label>
                  <Input
                    id="rangeZ"
                    type="number"
                    defaultValue={listing.measuringRangeZ}
                    placeholder="600"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="accuracy">Genauigkeit</Label>
                  <Input
                    id="accuracy"
                    defaultValue={listing.accuracyUm}
                    placeholder="1.8 + L/350"
                  />
                  <p className="text-xs text-muted-foreground">
                    MPEE in µm (z.B. 1.8 + L/350)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="software">Software</Label>
                  <Input
                    id="software"
                    defaultValue={listing.software}
                    placeholder="Calypso 6.8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="controller">Steuerung</Label>
                  <Input
                    id="controller"
                    defaultValue={listing.controller}
                    placeholder="C99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probeSystem">Tastsystem</Label>
                  <Input
                    id="probeSystem"
                    defaultValue={listing.probeSystem}
                    placeholder="VAST XXT"
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
              <CardTitle>Bilder & Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Images */}
                <div>
                  <Label className="mb-3 block">Bilder</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {listing.media
                      .filter((m: any) => m.type === 'image')
                      .map((image: any, index: number) => (
                        <div
                          key={image.id}
                          className="relative group aspect-[4/3] bg-muted rounded-lg overflow-hidden"
                        >
                          <img
                            src={image.url}
                            alt={`Bild ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="icon" variant="secondary" className="h-8 w-8">
                              <GripVertical className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="destructive" className="h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {index === 0 && (
                            <Badge className="absolute top-2 left-2 text-xs">
                              Hauptbild
                            </Badge>
                          )}
                        </div>
                      ))}
                    <button className="aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-sm">Bild hinzufügen</span>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ziehen Sie Bilder zum Sortieren. Das erste Bild ist das Hauptbild.
                  </p>
                </div>

                {/* Documents */}
                <div className="border-t pt-6">
                  <Label className="mb-3 block">Dokumente</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Datenblatt.pdf</span>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <button className="w-full p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground transition-colors text-sm">
                      + Dokument hinzufügen (PDF, max. 25MB)
                    </button>
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
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  rows={10}
                  defaultValue={listing.description}
                  placeholder="Beschreiben Sie den Zustand, Besonderheiten und Lieferumfang der Maschine..."
                />
                <p className="text-xs text-muted-foreground">
                  Tipp: Beschreiben Sie Zustand, Wartungshistorie und was im Lieferumfang enthalten ist.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Aktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {listing.status === 'draft' && (
              <Button onClick={handlePublish} disabled={isSaving}>
                <Send className="mr-2 h-4 w-4" />
                Zur Prüfung einreichen
              </Button>
            )}
            {listing.status === 'active' && (
              <>
                <Button onClick={handleMarkSold} variant="outline" disabled={isSaving}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Als verkauft markieren
                </Button>
                <Button onClick={handleArchive} variant="outline" disabled={isSaving}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archivieren
                </Button>
              </>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Inserat löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion kann nicht rückgängig gemacht werden. Das Inserat 
                    und alle zugehörigen Bilder werden unwiderruflich gelöscht.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => router.push('/seller/inserate')}
                  >
                    Ja, löschen
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
