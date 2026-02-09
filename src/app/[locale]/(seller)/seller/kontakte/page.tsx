'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import {
  Plus,
  Search,
  Filter,
  UserCircle,
  Building2,
  Mail,
  Phone,
  MoreHorizontal,
  ChevronRight,
  Upload,
  Download,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { FeatureLocked } from '@/components/features/feature-locked';
import { 
  getContacts, 
  createContact, 
  deleteContact,
  getContactStats,
  type Contact, 
  type LeadStatus,
  type CreateContactData,
} from '@/lib/actions/contacts';

export default function KontaktePage() {
  const router = useRouter();
  const t = useTranslations('contacts');
  const { plan, isLoading: authLoading } = useSellerAuth();
  
  // Status config - colors only, labels from translations
  const statusColors: Record<LeadStatus, { color: string; bg: string }> = {
    new: { color: 'text-blue-700', bg: 'bg-blue-100' },
    contacted: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
    qualified: { color: 'text-green-700', bg: 'bg-green-100' },
    negotiation: { color: 'text-purple-700', bg: 'bg-purple-100' },
    won: { color: 'text-emerald-700', bg: 'bg-emerald-100' },
    lost: { color: 'text-red-700', bg: 'bg-red-100' },
  };

  const getStatusLabel = (status: LeadStatus) => t(`status.${status}`);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<LeadStatus, number>;
    newThisMonth: number;
    avgLeadScore: number;
  } | null>(null);
  
  // New contact dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newContactData, setNewContactData] = useState<Partial<CreateContactData>>({});
  const [isCreating, setIsCreating] = useState(false);
  
  // Check feature access
  const featureFlags = plan?.feature_flags as { crm_access?: boolean } | null;
  const hasCrmAccess = featureFlags?.crm_access ?? false;
  
  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!hasCrmAccess) return;
      
      setIsLoading(true);
      const [contactsResult, statsResult] = await Promise.all([
        getContacts({
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        getContactStats(),
      ]);
      
      if (contactsResult.success && contactsResult.data) {
        setContacts(contactsResult.data.contacts);
        setTotal(contactsResult.data.total);
      }
      
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
      
      setIsLoading(false);
    };
    
    if (!authLoading) {
      fetchContacts();
    }
  }, [searchQuery, statusFilter, hasCrmAccess, authLoading]);
  
  // Create contact handler
  const handleCreateContact = async () => {
    if (!newContactData.email) {
      toast.error(t('emailRequired'));
      return;
    }
    
    setIsCreating(true);
    const result = await createContact(newContactData as CreateContactData);
    setIsCreating(false);
    
    if (result.success && result.data) {
      toast.success(t('contactCreated'));
      setIsCreateDialogOpen(false);
      setNewContactData({});
      // Refresh list
      const contactsResult = await getContacts({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (contactsResult.success && contactsResult.data) {
        setContacts(contactsResult.data.contacts);
        setTotal(contactsResult.data.total);
      }
    } else {
      toast.error(result.error || t('createError'));
    }
  };
  
  // Delete contact handler
  const handleDeleteContact = async (contactId: string) => {
    const result = await deleteContact(contactId);
    if (result.success) {
      toast.success(t('contactDeleted'));
      setContacts(prev => prev.filter(c => c.id !== contactId));
      setTotal(prev => prev - 1);
    } else {
      toast.error(result.error || t('deleteError'));
    }
  };
  
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('daysAgo', { days: diffDays });
    if (diffDays < 30) return t('weeksAgo', { weeks: Math.floor(diffDays / 7) });
    return formatDate(dateString);
  };
  
  // Loading state
  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }
  
  // Feature locked
  if (!hasCrmAccess) {
    return (
      <FeatureLocked
        featureName={t('featureLocked.name')}
        icon={UserCircle}
        headline={t('featureLocked.headline')}
        description={t('featureLocked.description')}
        targetAudience={t('featureLocked.targetAudience')}
        requiredPlan="business"
        benefits={[
          {
            title: t('featureLocked.benefit1Title'),
            description: t('featureLocked.benefit1Desc'),
          },
          {
            title: t('featureLocked.benefit2Title'),
            description: t('featureLocked.benefit2Desc'),
          },
          {
            title: t('featureLocked.benefit3Title'),
            description: t('featureLocked.benefit3Desc'),
          },
          {
            title: t('featureLocked.benefit4Title'),
            description: t('featureLocked.benefit4Desc'),
          },
        ]}
        testimonial={{
          quote: t('featureLocked.testimonialQuote'),
          author: t('featureLocked.testimonialAuthor'),
          company: t('featureLocked.testimonialCompany'),
        }}
      />
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Upload className="mr-2 h-4 w-4" />
            {t('import')}
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('newContact')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t('createTitle')}</DialogTitle>
                <DialogDescription>
                  {t('createDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('firstName')}</Label>
                    <Input
                      placeholder="Max"
                      value={newContactData.firstName || ''}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('lastName')}</Label>
                    <Input
                      placeholder="Mustermann"
                      value={newContactData.lastName || ''}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('email')} *</Label>
                  <Input
                    type="email"
                    placeholder="max@example.com"
                    value={newContactData.email || ''}
                    onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('company')}</Label>
                  <Input
                    placeholder="Mustermann GmbH"
                    value={newContactData.companyName || ''}
                    onChange={(e) => setNewContactData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('phone')}</Label>
                    <Input
                      placeholder="+49 89 123456"
                      value={newContactData.phone || ''}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('position')}</Label>
                    <Input
                      placeholder="Geschäftsführer"
                      value={newContactData.jobTitle || ''}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('cancel', { ns: 'common' })}
                </Button>
                <Button onClick={handleCreateContact} disabled={isCreating}>
                  {isCreating ? t('creating') : t('createContact')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('totalContacts')}</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('newThisMonth')}</CardDescription>
              <CardTitle className="text-3xl text-blue-600">+{stats.newThisMonth}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('qualified')}</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.byStatus.qualified || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('inNegotiation')}</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{stats.byStatus.negotiation || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
      
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            {(Object.keys(statusColors) as LeadStatus[]).map((key) => (
              <SelectItem key={key} value={key}>
                {getStatusLabel(key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Contacts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('tableContact')}</TableHead>
              <TableHead>{t('tableCompany')}</TableHead>
              <TableHead>{t('tableStatus')}</TableHead>
              <TableHead>{t('tableInquiries')}</TableHead>
              <TableHead>{t('tableLastContact')}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <UserCircle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery || statusFilter !== 'all'
                        ? t('noContactsFound')
                        : t('noContactsYet')}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('createFirst')}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => {
                const colors = statusColors[contact.lead_status];
                const statusLabel = getStatusLabel(contact.lead_status);
                const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email;
                
                return (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/seller/kontakte/${contact.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{fullName}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.company_name ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.company_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(colors.bg, colors.color, 'border-0')}>
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{contact.total_inquiries}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {formatRelativeDate(contact.last_contact_at || contact.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/seller/kontakte/${contact.id}`);
                          }}>
                            {t('showDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${contact.email}`;
                          }}>
                            <Mail className="mr-2 h-4 w-4" />
                            {t('sendEmail')}
                          </DropdownMenuItem>
                          {contact.phone && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${contact.phone}`;
                            }}>
                              <Phone className="mr-2 h-4 w-4" />
                              {t('call')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contact.id);
                            }}
                          >
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        {/* Pagination info */}
        {total > 0 && (
          <div className="border-t px-4 py-3 text-sm text-muted-foreground">
            {t('ofTotal', { count: contacts.length, total })}
          </div>
        )}
      </Card>
    </div>
  );
}
