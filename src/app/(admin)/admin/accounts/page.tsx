'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Search,
  MoreHorizontal,
  Building,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Shield,
  FileText,
  Mail,
  Loader2,
  UserCheck,
  Users,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sellers } from '@/data/mock-data';
import type { Seller } from '@/types';

// Extended account data
interface Account extends Seller {
  email: string;
  plan: 'free' | 'starter' | 'business';
  status: 'active' | 'suspended';
  suspendedReason?: string;
}

const accounts: Account[] = sellers.map((seller, index) => ({
  ...seller,
  email: `kontakt@${seller.slug}.de`,
  plan: index === 0 ? 'business' : index === 1 ? 'starter' : 'free',
  status: 'active' as const,
}));

// Add a suspended account for demo
accounts.push({
  id: '4',
  companyName: 'Spam-Verkäufer AG',
  slug: 'spam-verkaeufer',
  email: 'spam@example.com',
  addressCity: 'Berlin',
  addressCountry: 'Deutschland',
  isVerified: false,
  listingCount: 0,
  memberSince: '2026-01',
  plan: 'free',
  status: 'suspended',
  suspendedReason: 'Mehrfache Verstöße gegen die AGB',
});

const planLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-800' },
  starter: { label: 'Starter', color: 'bg-blue-100 text-blue-800' },
  business: { label: 'Business', color: 'bg-purple-100 text-purple-800' },
};

export default function AccountsPage() {
  const [allAccounts, setAllAccounts] = useState<Account[]>(accounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeAccounts = allAccounts.filter((a) => a.status === 'active');
  const suspendedAccounts = allAccounts.filter((a) => a.status === 'suspended');
  const verifiedAccounts = allAccounts.filter((a) => a.isVerified);

  const filteredAccounts = allAccounts.filter((a) => {
    const matchesSearch =
      a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.addressCity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || a.status === filterStatus;
    const matchesPlan =
      filterPlan === 'all' || a.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleVerify = async (accountId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAllAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, isVerified: true } : a))
      );
      toast.success('Account verifiziert');
    } catch {
      toast.error('Fehler beim Verifizieren');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedAccount || !suspendReason.trim()) {
      toast.error('Bitte geben Sie einen Grund an');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAllAccounts((prev) =>
        prev.map((a) =>
          a.id === selectedAccount.id
            ? { ...a, status: 'suspended' as const, suspendedReason: suspendReason }
            : a
        )
      );
      toast.success('Account gesperrt', {
        description: 'Der Verkäufer wurde per E-Mail informiert.',
      });
      setIsSuspendDialogOpen(false);
      setSuspendReason('');
      setSelectedAccount(null);
    } catch {
      toast.error('Fehler beim Sperren');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async (accountId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAllAccounts((prev) =>
        prev.map((a) =>
          a.id === accountId
            ? { ...a, status: 'active' as const, suspendedReason: undefined }
            : a
        )
      );
      toast.success('Account reaktiviert');
    } catch {
      toast.error('Fehler beim Reaktivieren');
    } finally {
      setIsLoading(false);
    }
  };

  const openSuspendDialog = (account: Account) => {
    setSelectedAccount(account);
    setIsSuspendDialogOpen(true);
  };

  const AccountRow = ({ account }: { account: Account }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{account.companyName}</span>
              {account.isVerified && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{account.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {account.addressCity}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={planLabels[account.plan].color}>
          {planLabels[account.plan].label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{account.listingCount}</Badge>
      </TableCell>
      <TableCell>
        {account.status === 'active' ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Aktiv
          </Badge>
        ) : (
          <Badge variant="destructive">Gesperrt</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {account.memberSince}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/accounts/${account.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Details ansehen
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              E-Mail senden
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!account.isVerified && (
              <DropdownMenuItem onClick={() => handleVerify(account.id)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Verifizieren
              </DropdownMenuItem>
            )}
            {account.status === 'active' ? (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => openSuspendDialog(account)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Sperren
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-green-600"
                onClick={() => handleReactivate(account.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Reaktivieren
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Verkäufer-Accounts</h1>
        <p className="text-muted-foreground">
          Verwalten Sie die registrierten Verkäufer
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allAccounts.length}</p>
                <p className="text-sm text-muted-foreground">Accounts gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAccounts.length}</p>
                <p className="text-sm text-muted-foreground">Aktiv</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedAccounts.length}</p>
                <p className="text-sm text-muted-foreground">Verifiziert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Ban className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suspendedAccounts.length}</p>
                <p className="text-sm text-muted-foreground">Gesperrt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Firma, E-Mail oder Stadt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="suspended">Gesperrt</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Pläne</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Standort</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Inserate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mitglied seit</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
            {filteredAccounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Keine Accounts gefunden</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Suspend Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account sperren</DialogTitle>
            <DialogDescription>
              Der Verkäufer "{selectedAccount?.companyName}" wird gesperrt. Alle Inserate werden deaktiviert.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Grund für die Sperrung *</Label>
            <Textarea
              id="reason"
              placeholder="z.B. Mehrfache Verstöße gegen die AGB..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={isLoading || !suspendReason.trim()}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sperren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
