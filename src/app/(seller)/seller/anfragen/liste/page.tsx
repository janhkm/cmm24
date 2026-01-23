'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Mail,
  Phone,
  Building2,
  Clock,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Kanban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockInquiries } from '@/data/mock-data';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'vor wenigen Minuten';
  if (hours < 24) return `vor ${hours} Stunden`;
  if (days === 1) return 'gestern';
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'new':
      return { label: 'Neu', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
    case 'contacted':
      return { label: 'Kontaktiert', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
    case 'offer_sent':
      return { label: 'Angebot gesendet', color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' };
    case 'won':
      return { label: 'Gewonnen', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
    case 'lost':
      return { label: 'Verloren', color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
  }
};

export default function AnfragenListePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInquiries = mockInquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.contactCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.listing?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const newCount = mockInquiries.filter((i) => i.status === 'new').length;
  const contactedCount = mockInquiries.filter((i) => i.status === 'contacted').length;
  const offerSentCount = mockInquiries.filter((i) => i.status === 'offer_sent').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Anfragen</h1>
          <p className="text-muted-foreground text-sm">
            Listenansicht aller Anfragen
          </p>
        </div>
        
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/anfragen">
            <Kanban className="mr-2 h-4 w-4" />
            Pipeline-Ansicht
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Neue</p>
                <p className="text-xl sm:text-2xl font-bold">{newCount}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">In Bearb.</p>
                <p className="text-xl sm:text-2xl font-bold">{contactedCount}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Angebot</p>
                <p className="text-xl sm:text-2xl font-bold">{offerSentCount}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Anfragen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="new">Neu</SelectItem>
            <SelectItem value="contacted">Kontaktiert</SelectItem>
            <SelectItem value="offer_sent">Angebot gesendet</SelectItem>
            <SelectItem value="won">Gewonnen</SelectItem>
            <SelectItem value="lost">Verloren</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const statusConfig = getStatusConfig(inquiry.status);
            return (
              <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                    {/* Left: Contact Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot}`} />
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(inquiry.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-lg">
                        {inquiry.contactName}
                      </h3>

                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {inquiry.contactCompany && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {inquiry.contactCompany}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${inquiry.contactEmail}`}
                            className="hover:text-foreground truncate"
                          >
                            {inquiry.contactEmail}
                          </a>
                        </div>
                        {inquiry.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <a
                              href={`tel:${inquiry.contactPhone}`}
                              className="hover:text-foreground"
                            >
                              {inquiry.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Message Preview */}
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        &quot;{inquiry.message}&quot;
                      </p>

                      {/* Notes */}
                      {inquiry.notes && (
                        <div className="mt-3 p-3 rounded-lg bg-muted text-sm">
                          <span className="font-medium">Notiz:</span> {inquiry.notes}
                        </div>
                      )}
                    </div>

                    {/* Right: Listing Info */}
                    {inquiry.listing && (
                      <div className="lg:w-64 shrink-0">
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Bezüglich
                          </p>
                          <Link
                            href={`/maschinen/${inquiry.listing.slug}`}
                            className="font-medium hover:text-primary line-clamp-1"
                          >
                            {inquiry.listing.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                              minimumFractionDigits: 0,
                            }).format(inquiry.listing.price / 100)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex flex-col gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/seller/anfragen/${inquiry.id}`}>
                              Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${inquiry.contactEmail}`}>
                              <Mail className="mr-2 h-4 w-4" />
                              E-Mail
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">Keine Anfragen gefunden</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Versuchen Sie, Ihre Filter anzupassen.'
                : 'Sobald Interessenten Ihre Maschinen anfragen, erscheinen diese hier.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
