'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  Boxes,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { manufacturers } from '@/data/mock-data';
import type { Model, MachineCategory } from '@/types';

// Mock models data
const initialModels: Model[] = [
  { id: '1', manufacturerId: '1', name: 'Contura', slug: 'contura', category: 'portal' },
  { id: '2', manufacturerId: '1', name: 'ACCURA', slug: 'accura', category: 'portal' },
  { id: '3', manufacturerId: '1', name: 'PRISMO', slug: 'prismo', category: 'portal' },
  { id: '4', manufacturerId: '1', name: 'O-INSPECT', slug: 'o-inspect', category: 'optical' },
  { id: '5', manufacturerId: '2', name: 'Global S', slug: 'global-s', category: 'portal' },
  { id: '6', manufacturerId: '2', name: 'Optiv', slug: 'optiv', category: 'optical' },
  { id: '7', manufacturerId: '2', name: 'DEA', slug: 'dea', category: 'horizontal_arm' },
  { id: '8', manufacturerId: '3', name: 'LH', slug: 'lh', category: 'portal' },
  { id: '9', manufacturerId: '3', name: 'XOrbit', slug: 'xorbit', category: 'cantilever' },
  { id: '10', manufacturerId: '4', name: 'Crysta-Apex', slug: 'crysta-apex', category: 'portal' },
  { id: '11', manufacturerId: '4', name: 'LEGEX', slug: 'legex', category: 'portal' },
  { id: '12', manufacturerId: '5', name: 'Universal', slug: 'universal', category: 'portal' },
];

const categoryLabels: Record<MachineCategory, string> = {
  portal: 'Portal',
  cantilever: 'Ausleger',
  horizontal_arm: 'Horizontal-Arm',
  gantry: 'Gantry',
  optical: 'Optisch',
  other: 'Sonstige',
};

const categories: MachineCategory[] = ['portal', 'cantilever', 'horizontal_arm', 'gantry', 'optical', 'other'];

export default function ModellePage() {
  const [models, setModels] = useState<Model[]>(initialModels);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    manufacturerId: '',
    category: 'portal' as MachineCategory,
  });

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manufacturers.find((mf) => mf.id === m.manufacturerId)?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesManufacturer =
      filterManufacturer === 'all' || m.manufacturerId === filterManufacturer;
    const matchesCategory =
      filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesManufacturer && matchesCategory;
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenDialog = (model?: Model) => {
    if (model) {
      setEditingModel(model);
      setFormData({
        name: model.name,
        slug: model.slug,
        manufacturerId: model.manufacturerId,
        category: model.category,
      });
    } else {
      setEditingModel(null);
      setFormData({ name: '', slug: '', manufacturerId: '', category: 'portal' });
    }
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingModel ? prev.slug : generateSlug(name),
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
    if (!formData.manufacturerId) {
      toast.error('Hersteller ist erforderlich');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingModel) {
        // Update
        setModels((prev) =>
          prev.map((m) =>
            m.id === editingModel.id
              ? { ...m, ...formData }
              : m
          )
        );
        toast.success('Modell aktualisiert');
      } else {
        // Create
        const newModel: Model = {
          id: Date.now().toString(),
          name: formData.name,
          slug: formData.slug,
          manufacturerId: formData.manufacturerId,
          category: formData.category,
        };
        setModels((prev) => [...prev, newModel]);
        toast.success('Modell erstellt');
      }

      setIsDialogOpen(false);
      setFormData({ name: '', slug: '', manufacturerId: '', category: 'portal' });
      setEditingModel(null);
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setModels((prev) => prev.filter((m) => m.id !== id));
      toast.success('Modell gelöscht');
    } catch {
      toast.error('Fehler beim Löschen');
    } finally {
      setIsLoading(false);
    }
  };

  const getManufacturerName = (manufacturerId: string) => {
    return manufacturers.find((m) => m.id === manufacturerId)?.name || '-';
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Modelle</h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Modell-Stammdaten
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Modell hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingModel ? 'Modell bearbeiten' : 'Neues Modell'}
              </DialogTitle>
              <DialogDescription>
                {editingModel
                  ? 'Bearbeiten Sie die Daten des Modells.'
                  : 'Fügen Sie ein neues Modell hinzu.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Hersteller *</Label>
                <Select
                  value={formData.manufacturerId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, manufacturerId: value }))
                  }
                >
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
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="z.B. Contura"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="z.B. contura"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value as MachineCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingModel ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Modell suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterManufacturer} onValueChange={setFilterManufacturer}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Hersteller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Hersteller</SelectItem>
            {manufacturers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Boxes className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{models.length}</p>
                <p className="text-sm text-muted-foreground">Modelle gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Filter className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredModels.length}</p>
                <p className="text-sm text-muted-foreground">Gefiltert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Boxes className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Kategorien</p>
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
              <TableHead>Modell</TableHead>
              <TableHead>Hersteller</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModels.map((model) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">{model.name}</TableCell>
                <TableCell>{getManufacturerName(model.manufacturerId)}</TableCell>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {model.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{categoryLabels[model.category]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(model)}>
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
                            <AlertDialogTitle>Modell löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie "{model.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(model.id)}
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
            {filteredModels.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Boxes className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Keine Modelle gefunden</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
