'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  Plus,
  MoreHorizontal,
  Crown,
  ShieldCheck,
  User,
  Trash2,
  Mail,
  Loader2,
  AlertCircle,
  Clock,
  X,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { FeatureGate } from '@/components/features/feature-gate';
import { FeatureLocked } from '@/components/features/feature-locked';
import { toast } from 'sonner';
import {
  getTeamMembers,
  getTeamInvitations,
  inviteTeamMember,
  cancelInvitation,
  removeTeamMember,
  updateTeamMemberRole,
  type TeamMember,
  type TeamInvitation,
} from '@/lib/actions/team';

function useRoleLabels() {
  const t = useTranslations('sellerTeam');
  return {
    owner: { label: t('roleOwner'), icon: Crown, color: 'bg-amber-100 text-amber-800' },
    admin: { label: t('roleAdmin'), icon: ShieldCheck, color: 'bg-blue-100 text-blue-800' },
    editor: { label: t('roleEditor'), icon: User, color: 'bg-green-100 text-green-800' },
    viewer: { label: t('roleViewer'), icon: User, color: 'bg-gray-100 text-gray-800' },
  } as Record<string, { label: string; icon: typeof Crown; color: string }>;
}

export default function TeamPage() {
  const t = useTranslations('sellerTeam');
  const roleLabels = useRoleLabels();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Invite dialog state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    const [membersResult, invitationsResult] = await Promise.all([
      getTeamMembers(),
      getTeamInvitations(),
    ]);
    
    if (membersResult.success && membersResult.data) {
      setMembers(membersResult.data);
    } else {
      setError(membersResult.error || t('errorLoading'));
    }
    
    if (invitationsResult.success && invitationsResult.data) {
      setInvitations(invitationsResult.data.filter(i => !i.acceptedAt));
    }
    
    setIsLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    setIsInviting(true);
    
    const result = await inviteTeamMember({
      email: inviteEmail,
      role: inviteRole,
    });
    
    if (result.success) {
      toast.success(t('invitationSent'));
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('viewer');
      loadData();
    } else {
      toast.error(result.error || t('inviteError'));
    }
    
    setIsInviting(false);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const result = await cancelInvitation(invitationId);
    
    if (result.success) {
      toast.success(t('invitationCancelled'));
      loadData();
    } else {
      toast.error(result.error || t('error'));
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string | null) => {
    if (!confirm(t('confirmRemoveMember', { name: memberName || t('thisMember') }))) {
      return;
    }
    
    const result = await removeTeamMember(memberId);
    
    if (result.success) {
      toast.success(t('memberRemoved'));
      loadData();
    } else {
      toast.error(result.error || t('error'));
    }
  };

  const handleChangeRole = async (memberId: string, role: 'admin' | 'editor' | 'viewer') => {
    const result = await updateTeamMemberRole(memberId, role);
    
    if (result.success) {
      toast.success(t('roleChanged'));
      loadData();
    } else {
      toast.error(result.error || t('error'));
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
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
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <FeatureGate feature="team_management" fallback={<TeamLockedContent />}>
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('invite')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('inviteDialogTitle')}</DialogTitle>
                <DialogDescription>
                  {t('inviteDialogDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t('roleLabel')}</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'editor' | 'viewer')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t('roleViewer')}
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t('roleEditor')}
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          {t('roleAdmin')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t('adminPermissionsNote')}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                  {isInviting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {t('invite')}
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

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('pendingInvitations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{invitation.email}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {t('invitedAs', { role: roleLabels[invitation.role]?.label || invitation.role })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <Badge variant="outline" className="text-amber-600 text-xs hidden sm:inline-flex">
                        {t('pending')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCancelInvitation(invitation.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('teamMembers')}
            </CardTitle>
            <CardDescription>
              {t('memberCount', { count: members.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => {
                const roleInfo = roleLabels[member.role];
                const RoleIcon = roleInfo.icon;
                
                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                        <AvatarImage src={member.avatarUrl || undefined} />
                        <AvatarFallback>
                          {getInitials(member.fullName, member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">
                          {member.fullName || member.email.split('@')[0]}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 ml-13 sm:ml-0">
                      <Badge className={`${roleInfo.color} text-xs`}>
                        <RoleIcon className="mr-1 h-3 w-3" />
                        {roleInfo.label}
                      </Badge>
                      {member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(
                                member.id,
                                member.role === 'admin' ? 'editor' : 'admin'
                              )}
                            >
                              {member.role === 'admin' ? (
                                <>
                                  <User className="mr-2 h-4 w-4" />
                                  {t('changeToEditor')}
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  {t('changeToAdmin')}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveMember(member.id, member.fullName)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('removeFromTeam')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
}

function TeamLockedContent() {
  const t = useTranslations('sellerTeam');
  return (
    <FeatureLocked
      featureName={t('featureLockedName')}
      icon={Users}
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
