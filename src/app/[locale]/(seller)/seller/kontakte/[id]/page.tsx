'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  MessageSquare,
  PhoneCall,
  FileText,
  Clock,
  Tag,
  Target,
  TrendingUp,
  MoreHorizontal,
  Plus,
  Send,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import {
  getContact,
  updateContact,
  deleteContact,
  addActivity,
  deleteActivity,
  getContactInquiries,
  type ContactWithActivities,
  type ContactActivity,
  type LeadStatus,
  type ActivityType,
} from '@/lib/actions/contacts';

export default function KontaktDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('contacts');
  const td = useTranslations('contacts.detail');
  const contactId = params.id as string;
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

  // Activity type config
  const activityTypeConfig: Record<ActivityType, { icon: typeof MessageSquare; color: string }> = {
    note: { icon: FileText, color: 'text-gray-600 bg-gray-100' },
    call: { icon: PhoneCall, color: 'text-blue-600 bg-blue-100' },
    email_sent: { icon: Send, color: 'text-green-600 bg-green-100' },
    email_received: { icon: Mail, color: 'text-purple-600 bg-purple-100' },
    meeting: { icon: Calendar, color: 'text-orange-600 bg-orange-100' },
    inquiry: { icon: MessageSquare, color: 'text-indigo-600 bg-indigo-100' },
    status_change: { icon: TrendingUp, color: 'text-yellow-600 bg-yellow-100' },
  };

  const activityTypeLabels: Record<ActivityType, string> = {
    note: td('activityTypes.note'),
    call: td('activityTypes.call'),
    email_sent: td('activityTypes.emailSent'),
    email_received: td('activityTypes.emailReceived'),
    meeting: td('activityTypes.meeting'),
    inquiry: td('activityTypes.inquiry'),
    status_change: td('activityTypes.statusChange'),
  };
  
  const [contact, setContact] = useState<ContactWithActivities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ContactWithActivities>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Activity dialog
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('note');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  
  // Related inquiries
  const [inquiries, setInquiries] = useState<unknown[]>([]);
  
  // Fetch contact data
  useEffect(() => {
    const fetchContact = async () => {
      setIsLoading(true);
      const [contactResult, inquiriesResult] = await Promise.all([
        getContact(contactId),
        getContactInquiries(contactId),
      ]);
      
      if (contactResult.success && contactResult.data) {
        setContact(contactResult.data);
        setEditData(contactResult.data);
      } else {
        toast.error(contactResult.error || td('contactNotFound'));
        router.push('/seller/kontakte');
      }
      
      if (inquiriesResult.success && inquiriesResult.data) {
        setInquiries(inquiriesResult.data);
      }
      
      setIsLoading(false);
    };
    
    if (!authLoading && contactId) {
      fetchContact();
    }
  }, [contactId, authLoading, router, td]);
  
  // Save contact changes
  const handleSave = async () => {
    if (!contact) return;
    
    setIsSaving(true);
    const result = await updateContact(contact.id, {
      firstName: editData.first_name || undefined,
      lastName: editData.last_name || undefined,
      email: editData.email,
      phone: editData.phone || undefined,
      mobile: editData.mobile || undefined,
      companyName: editData.company_name || undefined,
      jobTitle: editData.job_title || undefined,
      addressStreet: editData.address_street || undefined,
      addressCity: editData.address_city || undefined,
      addressPostalCode: editData.address_postal_code || undefined,
      addressCountry: editData.address_country || undefined,
      leadStatus: editData.lead_status,
      leadScore: editData.lead_score,
      notes: editData.notes || undefined,
    });
    setIsSaving(false);
    
    if (result.success && result.data) {
      setContact(prev => prev ? { ...prev, ...result.data } : null);
      setIsEditing(false);
      toast.success(td('changesSaved'));
    } else {
      toast.error(result.error || td('saveError'));
    }
  };
  
  // Add activity
  const handleAddActivity = async () => {
    if (!contact) return;
    
    setIsAddingActivity(true);
    const result = await addActivity({
      contactId: contact.id,
      activityType,
      title: activityTitle || undefined,
      description: activityDescription || undefined,
    });
    setIsAddingActivity(false);
    
    if (result.success && result.data) {
      setContact(prev => prev ? {
        ...prev,
        activities: [result.data!, ...prev.activities],
        last_contact_at: new Date().toISOString(),
      } : null);
      setIsActivityDialogOpen(false);
      setActivityTitle('');
      setActivityDescription('');
      toast.success(td('activityAdded'));
    } else {
      toast.error(result.error || td('activityAddError'));
    }
  };
  
  // Delete contact
  const handleDelete = async () => {
    if (!contact) return;
    
    const result = await deleteContact(contact.id);
    if (result.success) {
      toast.success(t('contactDeleted'));
      router.push('/seller/kontakte');
    } else {
      toast.error(result.error || t('deleteError'));
    }
  };
  
  // Format helpers
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return td('minutesAgo', { minutes: diffMins });
    if (diffHours < 24) return td('hoursAgo', { hours: diffHours });
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('daysAgo', { days: diffDays });
    return formatDate(dateString);
  };
  
  // Loading skeleton
  if (isLoading || authLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  
  if (!contact) {
    return (
      <div className="p-6">
        <p>{td('contactNotFound')}</p>
      </div>
    );
  }
  
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email;
  const colors = statusColors[contact.lead_status];
  const statusLabel = getStatusLabel(contact.lead_status);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/seller/kontakte">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
            {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <Badge variant="secondary" className={cn(colors.bg, colors.color, 'border-0')}>
                {statusLabel}
              </Badge>
            </div>
            {contact.job_title && contact.company_name && (
              <p className="text-muted-foreground">
                {contact.job_title} {td('atCompany')} {contact.company_name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                {t('cancel', { ns: 'common' })}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? td('saving') : td('save')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                {td('editContact')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = `mailto:${contact.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {t('sendEmail')}
                  </DropdownMenuItem>
                  {contact.phone && (
                    <DropdownMenuItem onClick={() => window.location.href = `tel:${contact.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {t('call')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {td('deleteContact')}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{td('deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {td('deleteConfirmDesc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel', { ns: 'common' })}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                          {t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>{td('contactData')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('firstName')}</Label>
                      <Input
                        value={editData.first_name || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('lastName')}</Label>
                      <Input
                        value={editData.last_name || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('email')}</Label>
                    <Input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('phone')}</Label>
                      <Input
                        value={editData.phone || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('mobile')}</Label>
                      <Input
                        value={editData.mobile || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, mobile: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('company')}</Label>
                      <Input
                        value={editData.company_name || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, company_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('position')}</Label>
                      <Input
                        value={editData.job_title || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, job_title: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>{td('street')}</Label>
                    <Input
                      value={editData.address_street || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, address_street: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{td('postalCode')}</Label>
                      <Input
                        value={editData.address_postal_code || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, address_postal_code: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>{td('city')}</Label>
                      <Input
                        value={editData.address_city || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, address_city: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{td('status')}</Label>
                      <Select
                        value={editData.lead_status}
                        onValueChange={(v) => setEditData(prev => ({ ...prev, lead_status: v as LeadStatus }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(statusColors) as LeadStatus[]).map((key) => (
                            <SelectItem key={key} value={key}>{getStatusLabel(key)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{td('leadScore')}</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={editData.lead_score || 0}
                        onChange={(e) => setEditData(prev => ({ ...prev, lead_score: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{td('internalNotes')}</Label>
                    <Textarea
                      value={editData.notes || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('email')}</p>
                      <a href={`mailto:${contact.email}`} className="font-medium hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('phone')}</p>
                        <a href={`tel:${contact.phone}`} className="font-medium hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contact.company_name && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('company')}</p>
                        <p className="font-medium">{contact.company_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {(contact.address_city || contact.address_country) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{td('location')}</p>
                        <p className="font-medium">
                          {[contact.address_postal_code, contact.address_city, contact.address_country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Notes (when not editing) */}
              {!isEditing && contact.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{td('internalNotes')}</p>
                    <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Activity Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{td('activities')}</CardTitle>
                <CardDescription>{td('activityHistory')}</CardDescription>
              </div>
              <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
                <Button onClick={() => setIsActivityDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {td('addActivity')}
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{td('addActivityTitle')}</DialogTitle>
                    <DialogDescription>
                      {td('addActivityDesc', { name: fullName })}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{td('activityType')}</Label>
                      <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="note">{activityTypeLabels.note}</SelectItem>
                          <SelectItem value="call">{activityTypeLabels.call}</SelectItem>
                          <SelectItem value="email_sent">{activityTypeLabels.email_sent}</SelectItem>
                          <SelectItem value="email_received">{activityTypeLabels.email_received}</SelectItem>
                          <SelectItem value="meeting">{activityTypeLabels.meeting}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{td('activityTitleLabel')}</Label>
                      <Input
                        placeholder={td('activityTitlePlaceholder')}
                        value={activityTitle}
                        onChange={(e) => setActivityTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{td('activityDescLabel')}</Label>
                      <Textarea
                        placeholder={td('activityDescPlaceholder')}
                        rows={4}
                        value={activityDescription}
                        onChange={(e) => setActivityDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsActivityDialogOpen(false)}>
                      {t('cancel', { ns: 'common' })}
                    </Button>
                    <Button onClick={handleAddActivity} disabled={isAddingActivity}>
                      {isAddingActivity ? td('adding') : td('add')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {contact.activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">{td('noActivities')}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsActivityDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {td('addFirstActivity')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contact.activities.map((activity, index) => {
                    const config = activityTypeConfig[activity.activity_type];
                    const Icon = config.icon;
                    
                    return (
                      <div key={activity.id} className="flex gap-4">
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {activity.title || activityTypeLabels[activity.activity_type]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatRelativeDate(activity.created_at)}
                            </p>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{td('overview')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lead Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        contact.lead_score >= 70 ? 'bg-green-500' :
                        contact.lead_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${contact.lead_score}%` }}
                    />
                  </div>
                  <span className="font-medium">{contact.lead_score}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{td('inquiries')}</span>
                <span className="font-medium">{contact.total_inquiries}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{td('totalValue')}</span>
                <span className="font-medium">
                  {contact.total_value > 0
                    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(contact.total_value / 100)
                    : '-'
                  }
                </span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{td('created')}</span>
                <span className="text-sm">{formatDate(contact.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{td('source')}</span>
                <Badge variant="outline">{contact.source || t('status.new', { ns: 'common' })}</Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{td('tags')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Related Inquiries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{td('inquiries')} ({inquiries.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="text-center py-4">
                  <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {td('noInquiries')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {td('manualContact')}
                  </p>
                </div>
              ) : (
                <>
                  {inquiries.slice(0, 5).map((inquiry: any) => (
                    <Link
                      key={inquiry.id}
                      href={`/seller/anfragen/${inquiry.id}`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <p className="font-medium text-sm truncate">
                        {inquiry.listings?.title || td('inquiry')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(inquiry.created_at)}
                      </p>
                    </Link>
                  ))}
                  {inquiries.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href={`/seller/anfragen?contact=${contact.id}`}>
                        {td('showAllInquiries', { count: inquiries.length })}
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
