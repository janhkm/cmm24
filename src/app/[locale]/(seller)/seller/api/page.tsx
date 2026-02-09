'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  Loader2,
  AlertCircle,
  Clock,
  Activity,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeatureGate } from '@/components/features/feature-gate';
import { FeatureLocked } from '@/components/features/feature-locked';
import { toast } from 'sonner';
import {
  getApiKeys,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  getApiKeyUsageStats,
  type ApiKey,
  type ApiKeyUsageStats,
} from '@/lib/actions/api-keys';

export default function ApiPage() {
  const t = useTranslations('sellerApi');
  const locale = useLocale();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<ApiKeyUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpires, setNewKeyExpires] = useState<'never' | '30d' | '90d' | '1y'>('never');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [isCreating, setIsCreating] = useState(false);
  
  // Secret key dialog (shown once after creation)
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  const [newSecretKey, setNewSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    const [keysResult, statsResult] = await Promise.all([
      getApiKeys(),
      getApiKeyUsageStats(),
    ]);
    
    if (keysResult.success && keysResult.data) {
      setKeys(keysResult.data);
    } else {
      setError(keysResult.error || t('errorLoading'));
    }
    
    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data);
    }
    
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!newKeyName) return;
    
    setIsCreating(true);
    
    const result = await createApiKey({
      name: newKeyName,
      permissions: newKeyPermissions,
      expiresIn: newKeyExpires,
    });
    
    if (result.success && result.data) {
      setNewSecretKey(result.data.secretKey);
      setShowSecretDialog(true);
      setIsCreateDialogOpen(false);
      setNewKeyName('');
      setNewKeyPermissions(['read']);
      setNewKeyExpires('never');
      loadData();
    } else {
      toast.error(result.error || t('createError'));
    }
    
    setIsCreating(false);
  };

  const handleRevoke = async (keyId: string, keyName: string) => {
    if (!confirm(t('confirmRevoke', { name: keyName }))) {
      return;
    }
    
    const result = await revokeApiKey(keyId);
    
    if (result.success) {
      toast.success(t('keyRevoked'));
      loadData();
    } else {
      toast.error(result.error || t('error'));
    }
  };

  const handleDelete = async (keyId: string, keyName: string) => {
    if (!confirm(t('confirmDelete', { name: keyName }))) {
      return;
    }
    
    const result = await deleteApiKey(keyId);
    
    if (result.success) {
      toast.success(t('keyDeleted'));
      loadData();
    } else {
      toast.error(result.error || t('error'));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copiedToClipboard'));
  };

  const togglePermission = (permission: string) => {
    setNewKeyPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <FeatureGate feature="api_access" fallback={<ApiLockedContent />}>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('newApiKey')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('createDialogTitle')}</DialogTitle>
                <DialogDescription>
                  {t('createDialogDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('nameLabel')}</Label>
                  <Input
                    id="name"
                    placeholder={t('namePlaceholder')}
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('permissions')}</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="read"
                        checked={newKeyPermissions.includes('read')}
                        onCheckedChange={() => togglePermission('read')}
                      />
                      <label htmlFor="read" className="text-sm">
                        {t('permRead')}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="write"
                        checked={newKeyPermissions.includes('write')}
                        onCheckedChange={() => togglePermission('write')}
                      />
                      <label htmlFor="write" className="text-sm">
                        {t('permWrite')}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delete"
                        checked={newKeyPermissions.includes('delete')}
                        onCheckedChange={() => togglePermission('delete')}
                      />
                      <label htmlFor="delete" className="text-sm">
                        {t('permDelete')}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">{t('validity')}</Label>
                  <Select value={newKeyExpires} onValueChange={(v) => setNewKeyExpires(v as typeof newKeyExpires)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">{t('noExpiry')}</SelectItem>
                      <SelectItem value="30d">{t('days30')}</SelectItem>
                      <SelectItem value="90d">{t('days90')}</SelectItem>
                      <SelectItem value="1y">{t('year1')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleCreate} disabled={isCreating || !newKeyName || newKeyPermissions.length === 0}>
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="mr-2 h-4 w-4" />
                  )}
                  {t('create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('requestsToday')}</CardDescription>
                <CardTitle className="text-2xl">{stats.requestsToday}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('requestsMonth')}</CardDescription>
                <CardTitle className="text-2xl">{stats.requestsThisMonth}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('avgResponseTime')}</CardDescription>
                <CardTitle className="text-2xl">{stats.avgResponseTime}ms</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t('apiKeys')}
            </CardTitle>
            <CardDescription>
              {t('keyCount', { count: keys.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {keys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">{t('noKeys')}</h3>
                <p className="text-muted-foreground">
                  {t('noKeysDesc')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className={`p-4 rounded-lg border ${!key.isActive ? 'bg-muted/50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{key.name}</span>
                          {!key.isActive && (
                            <Badge variant="secondary" className="text-red-600">
                              <Ban className="mr-1 h-3 w-3" />
                              {t('revoked')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {key.keyPrefix}...
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(key.keyPrefix)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            {key.permissions.join(', ')}
                          </div>
                          {key.expiresAt && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {t('expiresOn')}: {new Date(key.expiresAt).toLocaleDateString(locale)}
                            </div>
                          )}
                          {key.lastUsedAt && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4" />
                              {t('lastUsed')}: {new Date(key.lastUsedAt).toLocaleDateString(locale)}
                            </div>
                          )}
                        </div>
                      </div>
                      {key.isActive && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevoke(key.id, key.name)}
                          >
                            {t('revoke')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(key.id, key.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentation Link */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('docsTitle')}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('docsDesc')}
                </p>
                <Badge variant="outline">{t('comingSoon')}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secret Key Dialog */}
      <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              {t('keyCreated')}
            </DialogTitle>
            <DialogDescription>
              {t('keyCreatedDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {t('keyWarning')}
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex items-center gap-2">
              <Input
                type={showSecret ? 'text' : 'password'}
                value={newSecretKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(newSecretKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowSecretDialog(false);
              setNewSecretKey('');
            }}>
              {t('understood')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FeatureGate>
  );
}

function ApiLockedContent() {
  const t = useTranslations('sellerApi');
  return (
    <FeatureLocked
      featureName={t('featureLockedName')}
      icon={Key}
      headline={t('featureLockedHeadline')}
      description={t('featureLockedDesc')}
      targetAudience={t('featureLockedAudience')}
      benefits={[
        { title: t('lockedBenefit1Title'), description: t('lockedBenefit1Desc') },
        { title: t('lockedBenefit2Title'), description: t('lockedBenefit2Desc') },
        { title: t('lockedBenefit3Title'), description: t('lockedBenefit3Desc') },
        { title: t('lockedBenefit4Title'), description: t('lockedBenefit4Desc') },
      ]}
      requiredPlan="business"
    />
  );
}
