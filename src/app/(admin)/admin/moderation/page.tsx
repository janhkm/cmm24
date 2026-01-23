'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Calendar,
  Building,
  MapPin,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockListings } from '@/data/mock-data';
import type { ListingStatus } from '@/types';

// Add some pending_review listings for demo
const allListings = [
  ...mockListings,
  {
    ...mockListings[0],
    id: 'pending-1',
    title: 'Zeiss ACCURA II 12/18/10',
    status: 'pending_review' as ListingStatus,
    createdAt: '2026-01-22T10:30:00Z',
  },
  {
    ...mockListings[1],
    id: 'pending-2',
    title: 'Hexagon Optiv 443',
    status: 'pending_review' as ListingStatus,
    createdAt: '2026-01-22T09:15:00Z',
  },
  {
    ...mockListings[2],
    id: 'pending-3',
    title: 'Wenzel XOrbit 55',
    status: 'pending_review' as ListingStatus,
    createdAt: '2026-01-21T14:45:00Z',
  },
];

const pendingListings = allListings.filter((l) => l.status === 'pending_review');
const approvedListings = allListings.filter((l) => l.status === 'active');
const rejectedListings = allListings.filter((l) => l.status === 'archived');

export default function ModerationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'vor wenigen Minuten';
    if (diffHours < 24) return `vor ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
    return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  };

  const ListingRow = ({ listing, showActions = true }: { listing: typeof allListings[0]; showActions?: boolean }) => (
    <TableRow>
      <TableCell>
        <Link
          href={`/admin/moderation/${listing.id}`}
          className="flex items-center gap-3"
        >
          <div className="h-12 w-16 rounded-lg bg-muted overflow-hidden relative">
            {listing.media[0] ? (
              <Image
                src={listing.media[0].url}
                alt={listing.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                Kein Bild
              </div>
            )}
          </div>
          <div>
            <p className="font-medium hover:text-primary">{listing.title}</p>
            <p className="text-sm text-muted-foreground">
              {listing.manufacturer.name}
            </p>
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{listing.seller?.companyName || '-'}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium">{formatPrice(listing.price)}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{listing.locationCity}, {listing.locationCountry}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {getTimeAgo(listing.createdAt)}
        </div>
      </TableCell>
      {showActions && (
        <TableCell>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/admin/moderation/${listing.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                Prüfen
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Schnell freigeben
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="h-4 w-4 mr-2" />
                  Ablehnen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Moderation</h1>
          <p className="text-muted-foreground">
            Prüfen und verwalten Sie eingereichte Inserate
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {pendingListings.length} ausstehend
          </Badge>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Inserat oder Verkäufer suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Neueste zuerst</SelectItem>
            <SelectItem value="date_asc">Älteste zuerst</SelectItem>
            <SelectItem value="price_desc">Preis (hoch-niedrig)</SelectItem>
            <SelectItem value="price_asc">Preis (niedrig-hoch)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Ausstehend
            <Badge variant="secondary" className="ml-1">
              {pendingListings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Freigegeben</TabsTrigger>
          <TabsTrigger value="rejected">Abgelehnt</TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="mt-6">
          {pendingListings.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inserat</TableHead>
                    <TableHead>Verkäufer</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead>Eingereicht</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingListings.map((listing) => (
                    <ListingRow key={listing.id} listing={listing} />
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="font-semibold text-lg">Alles erledigt!</h3>
                <p className="text-muted-foreground mt-1">
                  Keine Inserate zur Prüfung ausstehend.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Approved */}
        <TabsContent value="approved" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inserat</TableHead>
                  <TableHead>Verkäufer</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Eingereicht</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedListings.slice(0, 10).map((listing) => (
                  <ListingRow key={listing.id} listing={listing} showActions={false} />
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Rejected */}
        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">Keine abgelehnten Inserate</h3>
              <p className="text-muted-foreground mt-1">
                Abgelehnte Inserate werden hier angezeigt.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Moderation Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Prüfkriterien</CardTitle>
          <CardDescription>
            Folgende Punkte sollten bei der Moderation geprüft werden:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Mindestens 1 Bild vorhanden
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Bilder zeigen die tatsächliche Maschine
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Beschreibung ist plausibel und vollständig
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Technische Daten sind realistisch
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Keine Kontaktdaten im Freitext
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Kein Duplikat eines bestehenden Inserats
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
