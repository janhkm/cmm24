'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  MoreHorizontal,
  Mail,
  Shield,
  Trash2,
  Crown,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { plans } from '@/data/mock-data';

// Mock current plan
const currentPlan = plans.find((p) => p.slug === 'business')!;

// Mock team members
const teamMembers = [
  {
    id: '1',
    fullName: 'Sandra Becker',
    email: 'sandra@beispiel-gmbh.de',
    role: 'owner',
    status: 'active',
    avatarUrl: null,
    lastActive: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    fullName: 'Thomas Müller',
    email: 'thomas@beispiel-gmbh.de',
    role: 'admin',
    status: 'active',
    avatarUrl: null,
    lastActive: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    fullName: 'Anna Schmidt',
    email: 'anna@beispiel-gmbh.de',
    role: 'member',
    status: 'pending',
    avatarUrl: null,
    lastActive: null,
  },
];

const roles = {
  owner: { label: 'Inhaber', description: 'Volle Kontrolle, kann Abo verwalten', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Admin', description: 'Kann Inserate und Team verwalten', color: 'bg-blue-100 text-blue-800' },
  member: { label: 'Mitglied', description: 'Kann Inserate erstellen und bearbeiten', color: 'bg-gray-100 text-gray-800' },
};

export default function TeamPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  const maxTeamMembers = currentPlan.featureFlags.maxTeamMembers;
  const currentMemberCount = teamMembers.length;
  const canInvite = currentMemberCount < maxTeamMembers;

  const handleInvite = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsInviteOpen(false);
    setInviteEmail('');
    // In real app: show success toast
  };

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return 'Noch nie';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Gerade aktiv';
    if (hours < 24) return `vor ${hours}h`;
    if (days < 7) return `vor ${days}d`;
    return date.toLocaleDateString('de-DE');
  };

  if (!currentPlan.featureFlags.maxTeamMembers || currentPlan.featureFlags.maxTeamMembers <= 1) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Teammitglieder und deren Berechtigungen.
          </p>
        </div>

        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Team-Verwaltung ist ein Business-Feature</h3>
                <p className="text-muted-foreground mt-1">
                  Upgraden Sie auf den Business-Plan, um bis zu 5 Teammitglieder hinzuzufügen.
                </p>
              </div>
              <Button asChild>
                <Link href="/seller/abo/upgrade">Jetzt upgraden</Link>
              </Button>
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
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Teammitglieder und deren Berechtigungen.
          </p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canInvite}>
              <Plus className="mr-2 h-4 w-4" />
              Mitglied einladen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Teammitglied einladen</DialogTitle>
              <DialogDescription>
                Senden Sie eine Einladung per E-Mail.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="kollege@firma.de"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'member')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Admin</span>
                        <span className="text-xs text-muted-foreground">
                          Kann Inserate und Team verwalten
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="member">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Mitglied</span>
                        <span className="text-xs text-muted-foreground">
                          Kann Inserate erstellen und bearbeiten
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Einladung senden
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Usage Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {currentMemberCount} von {maxTeamMembers} Plätzen belegt
                </p>
                <p className="text-sm text-muted-foreground">
                  {canInvite
                    ? `Sie können noch ${maxTeamMembers - currentMemberCount} Mitglieder einladen`
                    : 'Maximale Teamgröße erreicht'}
                </p>
              </div>
            </div>
            {!canInvite && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/kontakt">Mehr Plätze anfragen</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teammitglieder</CardTitle>
          <CardDescription>
            Alle Personen mit Zugriff auf Ihren Account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitglied</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zuletzt aktiv</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.fullName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(roles[member.role as keyof typeof roles].color)}
                    >
                      {roles[member.role as keyof typeof roles].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.status === 'active' ? (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Aktiv</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Ausstehend</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatLastActive(member.lastActive)}
                  </TableCell>
                  <TableCell>
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Rolle ändern
                          </DropdownMenuItem>
                          {member.status === 'pending' && (
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Erneut einladen
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Entfernen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Berechtigungen</CardTitle>
          <CardDescription>
            Übersicht der Berechtigungen pro Rolle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Berechtigung</TableHead>
                <TableHead className="text-center">Inhaber</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Mitglied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Inserate erstellen & bearbeiten</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Anfragen bearbeiten</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Statistiken einsehen</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Inserate löschen</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-muted-foreground">—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Team verwalten</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-muted-foreground">—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Abo & Abrechnung verwalten</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-muted-foreground">—</TableCell>
                <TableCell className="text-center text-muted-foreground">—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Konto löschen</TableCell>
                <TableCell className="text-center text-green-600">✓</TableCell>
                <TableCell className="text-center text-muted-foreground">—</TableCell>
                <TableCell className="text-center text-muted-foreground">—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
