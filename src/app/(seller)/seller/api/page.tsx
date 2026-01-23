'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Crown,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { plans } from '@/data/mock-data';

// Mock current plan
const currentPlan = plans.find((p) => p.slug === 'business')!;

// Mock API keys
const apiKeys = [
  {
    id: '1',
    name: 'Production Key',
    key: 'cmm24_live_sk_a1b2c3d4e5f6g7h8i9j0',
    prefix: 'cmm24_live_sk_',
    lastUsed: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    permissions: ['read:listings', 'read:inquiries'],
  },
  {
    id: '2',
    name: 'Development Key',
    key: 'cmm24_test_sk_z9y8x7w6v5u4t3s2r1q0',
    prefix: 'cmm24_test_sk_',
    lastUsed: '2024-01-10T14:22:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    permissions: ['read:listings'],
  },
];

const availablePermissions = [
  { id: 'read:listings', label: 'Inserate lesen', description: 'Zugriff auf alle Ihre Inserate' },
  { id: 'read:inquiries', label: 'Anfragen lesen', description: 'Zugriff auf alle Anfragen' },
  { id: 'read:statistics', label: 'Statistiken lesen', description: 'Zugriff auf Statistikdaten' },
];

export default function ApiPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read:listings']);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreateKey = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsCreateOpen(false);
    setNewKeyName('');
    setSelectedPermissions(['read:listings']);
    // In real app: show the new key in a modal
  };

  const handleCopyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatLastUsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Gerade eben';
    if (hours < 24) return `vor ${hours}h`;
    if (days < 7) return `vor ${days}d`;
    return formatDate(dateString);
  };

  const maskKey = (key: string) => {
    return key.slice(0, 15) + '••••••••••••••••';
  };

  if (!currentPlan.featureFlags.hasApiAccess) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">API-Zugang</h1>
          <p className="text-muted-foreground">
            Integrieren Sie CMM24 in Ihre bestehenden Systeme.
          </p>
        </div>

        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">API-Zugang ist ein Business-Feature</h3>
                <p className="text-muted-foreground mt-1">
                  Upgraden Sie auf den Business-Plan, um die CMM24 API zu nutzen.
                </p>
              </div>
              <Button asChild>
                <Link href="/seller/abo/upgrade">Jetzt upgraden</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation Preview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Was können Sie mit der API tun?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Inserate synchronisieren</h4>
                <p className="text-sm text-muted-foreground">
                  Synchronisieren Sie Ihre Inserate automatisch mit Ihrem ERP-System.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Anfragen exportieren</h4>
                <p className="text-sm text-muted-foreground">
                  Leiten Sie neue Anfragen direkt in Ihr CRM-System weiter.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Statistiken abrufen</h4>
                <p className="text-sm text-muted-foreground">
                  Integrieren Sie Performance-Daten in Ihre Dashboards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">API-Zugang</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre API-Schlüssel für die Integration.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="https://docs.cmm24.de/api" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Dokumentation
            </Link>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Neuer API-Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen API-Schlüssel erstellen</DialogTitle>
                <DialogDescription>
                  Geben Sie dem Schlüssel einen Namen und wählen Sie die Berechtigungen.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Name</Label>
                  <Input
                    id="keyName"
                    placeholder="z.B. Production, Development, CRM Integration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Berechtigungen</Label>
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start gap-3">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions([...selectedPermissions, permission.id]);
                          } else {
                            setSelectedPermissions(selectedPermissions.filter((p) => p !== permission.id));
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyName || selectedPermissions.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird erstellt...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Schlüssel erstellen
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Warning */}
      <Card className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-400">
                Behandeln Sie API-Schlüssel vertraulich
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                API-Schlüssel gewähren Zugriff auf Ihre Daten. Speichern Sie sie sicher und
                teilen Sie sie niemals öffentlich. Rotieren Sie Schlüssel regelmäßig.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ihre API-Schlüssel</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre aktiven API-Schlüssel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schlüssel</TableHead>
                <TableHead>Berechtigungen</TableHead>
                <TableHead>Zuletzt verwendet</TableHead>
                <TableHead className="w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{apiKey.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Erstellt am {formatDate(apiKey.createdAt)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleShowKey(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyKey(apiKey.key)}
                      >
                        {copiedKey === apiKey.key ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm.split(':')[1]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatLastUsed(apiKey.lastUsed)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>API-Schlüssel löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Der Schlüssel &quot;{apiKey.name}&quot; wird unwiderruflich gelöscht.
                              Alle Integrationen, die diesen Schlüssel verwenden, werden nicht mehr funktionieren.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Schnellstart</CardTitle>
          <CardDescription>
            Beispiel für einen API-Aufruf zum Abrufen Ihrer Inserate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
              <code>{`curl -X GET "https://api.cmm24.de/v1/listings" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
            </pre>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" asChild>
              <Link href="https://docs.cmm24.de/api/listings" target="_blank">
                Inserate-Endpunkte
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://docs.cmm24.de/api/inquiries" target="_blank">
                Anfragen-Endpunkte
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://docs.cmm24.de/api/statistics" target="_blank">
                Statistik-Endpunkte
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>
            Begrenzungen für API-Aufrufe in Ihrem aktuellen Plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <p className="text-2xl font-bold">1.000</p>
              <p className="text-sm text-muted-foreground">Anfragen pro Stunde</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-2xl font-bold">10.000</p>
              <p className="text-sm text-muted-foreground">Anfragen pro Tag</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-2xl font-bold">100 KB</p>
              <p className="text-sm text-muted-foreground">Max. Payload-Größe</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
