'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  Factory,
  Globe,
  FileText,
  Upload,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { manufacturers as initialManufacturers } from '@/data/mock-data';
import type { Manufacturer } from '@/types';

export default function HerstellerPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(initialManufacturers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    country: '',
    logoUrl: '',
  });

  const filteredManufacturers = manufacturers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenDialog = (manufacturer?: Manufacturer) => {
    if (manufacturer) {
      setEditingManufacturer(manufacturer);
      setFormData({
        name: manufacturer.name,
        slug: manufacturer.slug,
        country: manufacturer.country || '',
        logoUrl: manufacturer.logoUrl || '',
      });
    } else {
      setEditingManufacturer(null);
      setFormData({ name: '', slug: '', country: '', logoUrl: '' });
    }
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingManufacturer ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Name ist erforderlich');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug ist erforderlich');
      return;
    }

    // Check for duplicate slug
    const isDuplicate = manufacturers.some(
      (m) => m.slug === formData.slug && m.id !== editingManufacturer?.id
    );
    if (isDuplicate) {
      toast.error('Ein Hersteller mit diesem Slug existiert bereits');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingManufacturer) {
        // Update
        setManufacturers((prev) =>
          prev.map((m) =>
            m.id === editingManufacturer.id
              ? { ...m, ...formData }
              : m
          )
        );
        toast.success('Hersteller aktualisiert');
      } else {
        // Create
        const newManufacturer: Manufacturer = {
          id: Date.now().toString(),
          name: formData.name,
          slug: formData.slug,
          country: formData.country || undefined,
          logoUrl: formData.logoUrl || undefined,
          listingCount: 0,
        };
        setManufacturers((prev) => [...prev, newManufacturer]);
        toast.success('Hersteller erstellt');
      }

      setIsDialogOpen(false);
      setFormData({ name: '', slug: '', country: '', logoUrl: '' });
      setEditingManufacturer(null);
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const manufacturer = manufacturers.find((m) => m.id === id);
    if (manufacturer?.listingCount && manufacturer.listingCount > 0) {
      toast.error('Hersteller kann nicht gelöscht werden', {
        description: `Es gibt noch ${manufacturer.listingCount} Inserate von diesem Hersteller.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setManufacturers((prev) => prev.filter((m) => m.id !== id));
      toast.success('Hersteller gelöscht');
    } catch {
      toast.error('Fehler beim Löschen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hersteller</h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Hersteller-Stammdaten
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Hersteller hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingManufacturer ? 'Hersteller bearbeiten' : 'Neuer Hersteller'}
              </DialogTitle>
              <DialogDescription>
                {editingManufacturer
                  ? 'Bearbeiten Sie die Daten des Herstellers.'
                  : 'Fügen Sie einen neuen Hersteller hinzu.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="z.B. Zeiss"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="z.B. zeiss"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  URL: /hersteller/{formData.slug || 'slug'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Input
                  id="country"
                  placeholder="z.B. Deutschland"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, country: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  placeholder="https://..."
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingManufacturer ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Hersteller suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Factory className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{manufacturers.length}</p>
                <p className="text-sm text-muted-foreground">Hersteller gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {manufacturers.reduce((sum, m) => sum + (m.listingCount || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Inserate gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(manufacturers.map((m) => m.country).filter(Boolean)).size}
                </p>
                <p className="text-sm text-muted-foreground">Länder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hersteller</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Land</TableHead>
              <TableHead>Inserate</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManufacturers.map((manufacturer) => (
              <TableRow key={manufacturer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {manufacturer.logoUrl ? (
                        <Image
                          src={manufacturer.logoUrl}
                          alt={manufacturer.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          {manufacturer.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{manufacturer.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {manufacturer.slug}
                  </code>
                </TableCell>
                <TableCell>
                  {manufacturer.country || (
                    <span className="text-muted-foreground">–</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {manufacturer.listingCount || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(manufacturer)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hersteller löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie "{manufacturer.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                              {manufacturer.listingCount && manufacturer.listingCount > 0 && (
                                <span className="block mt-2 text-destructive font-medium">
                                  Achtung: Es gibt noch {manufacturer.listingCount} Inserate von diesem Hersteller!
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(manufacturer.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredManufacturers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Factory className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Keine Hersteller gefunden</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
