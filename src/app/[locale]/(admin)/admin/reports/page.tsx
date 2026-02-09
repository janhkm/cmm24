'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Clock,
  Flag,
  MessageSquare,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock reports data
interface Report {
  id: string;
  type: 'listing' | 'inquiry' | 'account';
  reason: string;
  description: string;
  reportedItemId: string;
  reportedItemTitle: string;
  reporterEmail: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
}

const initialReports: Report[] = [
  {
    id: '1',
    type: 'listing',
    reason: 'Verdächtiger Preis',
    description: 'Der Preis erscheint unrealistisch niedrig für diese Maschine.',
    reportedItemId: '1',
    reportedItemTitle: 'Zeiss Contura 10/12/6',
    reporterEmail: 'max@example.com',
    status: 'pending',
    createdAt: '2026-01-22T14:30:00Z',
  },
  {
    id: '2',
    type: 'listing',
    reason: 'Falsche Angaben',
    description: 'Die Bilder zeigen eine andere Maschine als beschrieben.',
    reportedItemId: '2',
    reportedItemTitle: 'Hexagon Global S 9.15.9',
    reporterEmail: 'anna@example.com',
    status: 'pending',
    createdAt: '2026-01-21T10:15:00Z',
  },
  {
    id: '3',
    type: 'inquiry',
    reason: 'Spam',
    description: 'Wiederholte Spam-Anfragen vom gleichen Absender.',
    reportedItemId: 'inq-1',
    reportedItemTitle: 'Anfrage von spam@example.com',
    reporterEmail: 'seller@cmm-trade.de',
    status: 'resolved',
    createdAt: '2026-01-20T09:00:00Z',
    resolvedAt: '2026-01-20T11:30:00Z',
    adminNote: 'E-Mail-Adresse zur Blacklist hinzugefügt.',
  },
  {
    id: '4',
    type: 'listing',
    reason: 'Duplikat',
    description: 'Dieses Inserat wurde bereits von einem anderen Verkäufer eingestellt.',
    reportedItemId: '3',
    reportedItemTitle: 'Wenzel LH 87',
    reporterEmail: 'peter@example.com',
    status: 'dismissed',
    createdAt: '2026-01-19T16:45:00Z',
    resolvedAt: '2026-01-19T18:00:00Z',
    adminNote: 'Kein Duplikat - unterschiedliche Seriennummern.',
  },
];

const reasonLabels: Record<string, string> = {
  'Verdächtiger Preis': 'bg-amber-100 text-amber-800',
  'Falsche Angaben': 'bg-red-100 text-red-800',
  'Spam': 'bg-purple-100 text-purple-800',
  'Duplikat': 'bg-blue-100 text-blue-800',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const dismissedReports = reports.filter((r) => r.status === 'dismissed');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'vor wenigen Minuten';
    if (diffHours < 24) return `vor ${diffHours} Std`;
    return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  };

  const openDialog = (report: Report) => {
    setSelectedReport(report);
    setAdminNote(report.adminNote || '');
    setIsDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedReport) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? {
                ...r,
                status: 'resolved' as const,
                resolvedAt: new Date().toISOString(),
                adminNote,
              }
            : r
        )
      );
      toast.success('Report als erledigt markiert');
      setIsDialogOpen(false);
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedReport) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? {
                ...r,
                status: 'dismissed' as const,
                resolvedAt: new Date().toISOString(),
                adminNote,
              }
            : r
        )
      );
      toast.success('Report abgewiesen');
      setIsDialogOpen(false);
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  const ReportRow = ({ report }: { report: Report }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            report.type === 'listing' ? 'bg-blue-100' : 
            report.type === 'inquiry' ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            {report.type === 'listing' ? (
              <FileText className="h-5 w-5 text-blue-600" />
            ) : report.type === 'inquiry' ? (
              <MessageSquare className="h-5 w-5 text-purple-600" />
            ) : (
              <Flag className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div>
            <p className="font-medium">{report.reportedItemTitle}</p>
            <p className="text-sm text-muted-foreground">
              Gemeldet von: {report.reporterEmail}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={reasonLabels[report.reason] || 'bg-gray-100 text-gray-800'}>
          {report.reason}
        </Badge>
      </TableCell>
      <TableCell>
        <p className="text-sm max-w-xs truncate">{report.description}</p>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {getTimeAgo(report.createdAt)}
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
            <DropdownMenuItem onClick={() => openDialog(report)}>
              <Eye className="h-4 w-4 mr-2" />
              Details ansehen
            </DropdownMenuItem>
            {report.type === 'listing' && (
              <DropdownMenuItem asChild>
                <Link href={`/admin/moderation/${report.reportedItemId}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Inserat prüfen
                </Link>
              </DropdownMenuItem>
            )}
            {report.status === 'pending' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={() => {
                    setSelectedReport(report);
                    handleResolve();
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Als erledigt markieren
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-muted-foreground"
                  onClick={() => {
                    setSelectedReport(report);
                    handleDismiss();
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Abweisen
                </DropdownMenuItem>
              </>
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
        <h1 className="text-2xl font-bold">Reports & Meldungen</h1>
        <p className="text-muted-foreground">
          Prüfen Sie gemeldete Inserate und Anfragen
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReports.length}</p>
                <p className="text-sm text-muted-foreground">Offen</p>
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
                <p className="text-2xl font-bold">{resolvedReports.length}</p>
                <p className="text-sm text-muted-foreground">Erledigt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dismissedReports.length}</p>
                <p className="text-sm text-muted-foreground">Abgewiesen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Offen
            {pendingReports.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingReports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Erledigt</TabsTrigger>
          <TabsTrigger value="dismissed">Abgewiesen</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingReports.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gemeldetes Element</TableHead>
                    <TableHead>Grund</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Gemeldet</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReports.map((report) => (
                    <ReportRow key={report.id} report={report} />
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="font-semibold text-lg">Keine offenen Reports</h3>
                <p className="text-muted-foreground mt-1">
                  Alle Meldungen wurden bearbeitet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gemeldetes Element</TableHead>
                  <TableHead>Grund</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Gemeldet</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedReports.map((report) => (
                  <ReportRow key={report.id} report={report} />
                ))}
                {resolvedReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Keine erledigten Reports
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="dismissed" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gemeldetes Element</TableHead>
                  <TableHead>Grund</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Gemeldet</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dismissedReports.map((report) => (
                  <ReportRow key={report.id} report={report} />
                ))}
                {dismissedReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Keine abgewiesenen Reports
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Gemeldet am {selectedReport && formatDate(selectedReport.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Gemeldetes Element</Label>
                <p className="font-medium">{selectedReport.reportedItemTitle}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Grund</Label>
                <p>
                  <Badge className={reasonLabels[selectedReport.reason] || 'bg-gray-100'}>
                    {selectedReport.reason}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Beschreibung</Label>
                <p className="text-sm">{selectedReport.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Gemeldet von</Label>
                <p className="text-sm">{selectedReport.reporterEmail}</p>
              </div>
              {selectedReport.status === 'pending' && (
                <div>
                  <Label htmlFor="adminNote">Admin-Notiz</Label>
                  <Textarea
                    id="adminNote"
                    placeholder="Notiz zur Bearbeitung..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              )}
              {selectedReport.adminNote && selectedReport.status !== 'pending' && (
                <div>
                  <Label className="text-muted-foreground">Admin-Notiz</Label>
                  <p className="text-sm">{selectedReport.adminNote}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedReport?.status === 'pending' ? (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button variant="outline" onClick={handleDismiss} disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Abweisen
                </Button>
                <Button onClick={handleResolve} disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Erledigt
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsDialogOpen(false)}>Schließen</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
