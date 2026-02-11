'use client';

import { useState, useEffect } from 'react';
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
import { getAdminReports, reviewReport, type AdminReport } from '@/lib/actions/reports';

// Reason -> Badge-Farbe
const reasonColors: Record<string, string> = {
  spam: 'bg-purple-100 text-purple-800',
  fake: 'bg-red-100 text-red-800',
  inappropriate: 'bg-amber-100 text-amber-800',
  duplicate: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800',
};

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  fake: 'Falsche Angaben',
  inappropriate: 'Unangemessen',
  duplicate: 'Duplikat',
  other: 'Sonstiges',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reports aus der Datenbank laden
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoadingReports(true);
    const result = await getAdminReports();
    if (result.success && result.data) {
      setReports(result.data);
    } else {
      toast.error(result.error || 'Fehler beim Laden der Reports');
    }
    setIsLoadingReports(false);
  };

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

  const openDialog = (report: AdminReport) => {
    setSelectedReport(report);
    setAdminNote(report.admin_notes || '');
    setIsDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedReport) return;

    setIsLoading(true);
    try {
      const result = await reviewReport(selectedReport.id, 'resolved', adminNote);
      if (result.success) {
        // Report-Liste aktualisieren
        setReports((prev) =>
          prev.map((r) =>
            r.id === selectedReport.id
              ? {
                  ...r,
                  status: 'resolved',
                  reviewed_at: new Date().toISOString(),
                  admin_notes: adminNote || null,
                }
              : r
          )
        );
        toast.success('Report als erledigt markiert');
        setIsDialogOpen(false);
      } else {
        toast.error(result.error || 'Fehler beim Speichern');
      }
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
      const result = await reviewReport(selectedReport.id, 'dismissed', adminNote);
      if (result.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === selectedReport.id
              ? {
                  ...r,
                  status: 'dismissed',
                  reviewed_at: new Date().toISOString(),
                  admin_notes: adminNote || null,
                }
              : r
          )
        );
        toast.success('Report abgewiesen');
        setIsDialogOpen(false);
      } else {
        toast.error(result.error || 'Fehler beim Speichern');
      }
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  const ReportRow = ({ report }: { report: AdminReport }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{report.listing_title}</p>
            <p className="text-sm text-muted-foreground">
              Gemeldet von: {report.reporter_email}
            </p>
            {report.seller_name && report.seller_name !== 'Unbekannt' && (
              <p className="text-xs text-muted-foreground">
                Verkäufer: {report.seller_name}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={reasonColors[report.reason] || 'bg-gray-100 text-gray-800'}>
          {reasonLabels[report.reason] || report.reason}
        </Badge>
      </TableCell>
      <TableCell>
        <p className="text-sm max-w-xs truncate">{report.description || '—'}</p>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {getTimeAgo(report.created_at)}
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
            {report.listing_slug && (
              <DropdownMenuItem asChild>
                <Link href={`/maschinen/${report.listing_slug}`} target="_blank">
                  <FileText className="h-4 w-4 mr-2" />
                  Inserat ansehen
                </Link>
              </DropdownMenuItem>
            )}
            {report.status === 'pending' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={() => openDialog(report)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  // Lade-Zustand
  if (isLoadingReports) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                    <TableHead>Gemeldetes Inserat</TableHead>
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
                  <TableHead>Gemeldetes Inserat</TableHead>
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
                  <TableHead>Gemeldetes Inserat</TableHead>
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
              Gemeldet am {selectedReport && formatDate(selectedReport.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Gemeldetes Inserat</Label>
                <p className="font-medium">{selectedReport.listing_title}</p>
                {selectedReport.seller_name && selectedReport.seller_name !== 'Unbekannt' && (
                  <p className="text-sm text-muted-foreground">Verkäufer: {selectedReport.seller_name}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Grund</Label>
                <p>
                  <Badge className={reasonColors[selectedReport.reason] || 'bg-gray-100'}>
                    {reasonLabels[selectedReport.reason] || selectedReport.reason}
                  </Badge>
                </p>
              </div>
              {selectedReport.description && (
                <div>
                  <Label className="text-muted-foreground">Beschreibung</Label>
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Gemeldet von</Label>
                <p className="text-sm">{selectedReport.reporter_email}</p>
              </div>
              {selectedReport.listing_slug && (
                <div>
                  <Link
                    href={`/maschinen/${selectedReport.listing_slug}`}
                    target="_blank"
                    className="text-sm text-primary hover:underline"
                  >
                    Inserat ansehen →
                  </Link>
                </div>
              )}
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
              {selectedReport.admin_notes && selectedReport.status !== 'pending' && (
                <div>
                  <Label className="text-muted-foreground">Admin-Notiz</Label>
                  <p className="text-sm">{selectedReport.admin_notes}</p>
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
