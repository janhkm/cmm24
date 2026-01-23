'use client';

import { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Eye,
  Star,
  Archive,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'listing_created' | 'listing_edited' | 'listing_featured' | 'listing_archived' | 'inquiry_received' | 'inquiry_replied' | 'inquiry_won' | 'inquiry_lost' | 'view_milestone';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
}

const activityIcons = {
  listing_created: Plus,
  listing_edited: Edit,
  listing_featured: Star,
  listing_archived: Archive,
  inquiry_received: MessageSquare,
  inquiry_replied: MessageSquare,
  inquiry_won: CheckCircle,
  inquiry_lost: XCircle,
  view_milestone: Eye,
};

const activityColors = {
  listing_created: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  listing_edited: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  listing_featured: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  listing_archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  inquiry_received: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  inquiry_replied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  inquiry_won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inquiry_lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  view_milestone: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
};

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'inquiry_received',
    title: 'Neue Anfrage erhalten',
    description: 'Max Mustermann interessiert sich für Zeiss ACCURA II',
    timestamp: '2026-01-22T10:30:00Z',
  },
  {
    id: '2',
    type: 'view_milestone',
    title: '1.000 Aufrufe erreicht',
    description: 'Zeiss Contura 10/12/6 hat 1.000 Aufrufe erreicht',
    timestamp: '2026-01-22T09:15:00Z',
  },
  {
    id: '3',
    type: 'listing_featured',
    title: 'Inserat hervorgehoben',
    description: 'Mitutoyo CRYSTA-Apex wurde als Featured markiert',
    timestamp: '2026-01-21T16:45:00Z',
  },
  {
    id: '4',
    type: 'inquiry_won',
    title: 'Anfrage gewonnen',
    description: 'Deal mit Präzision AG abgeschlossen',
    timestamp: '2026-01-21T14:20:00Z',
    metadata: { value: 45000 },
  },
  {
    id: '5',
    type: 'listing_created',
    title: 'Neues Inserat erstellt',
    description: 'Hexagon Global S 9.15.9 wurde veröffentlicht',
    timestamp: '2026-01-20T11:00:00Z',
  },
  {
    id: '6',
    type: 'inquiry_replied',
    title: 'Anfrage beantwortet',
    description: 'Antwort an TechCorp GmbH gesendet',
    timestamp: '2026-01-20T09:30:00Z',
  },
  {
    id: '7',
    type: 'listing_edited',
    title: 'Inserat bearbeitet',
    description: 'Preis von Wenzel LH 87 aktualisiert',
    timestamp: '2026-01-19T15:45:00Z',
  },
  {
    id: '8',
    type: 'listing_archived',
    title: 'Inserat archiviert',
    description: 'Zeiss Prismo wurde archiviert (verkauft)',
    timestamp: '2026-01-18T12:00:00Z',
  },
];

interface ActivityLogProps {
  limit?: number;
  showFilter?: boolean;
  className?: string;
}

export function ActivityLog({ limit, showFilter = true, className }: ActivityLogProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredActivities = mockActivities
    .filter((activity) => {
      if (filter === 'all') return true;
      if (filter === 'listings') return activity.type.startsWith('listing_');
      if (filter === 'inquiries') return activity.type.startsWith('inquiry_');
      return true;
    })
    .slice(0, limit);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Gerade eben';
    if (hours < 24) return `vor ${hours}h`;
    if (days === 1) return 'Gestern';
    if (days < 7) return `vor ${days} Tagen`;
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const groupByDate = (activities: ActivityItem[]) => {
    const groups: Record<string, ActivityItem[]> = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Heute';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Gestern';
      } else {
        key = date.toLocaleDateString('de-DE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(activity);
    });

    return groups;
  };

  const groupedActivities = groupByDate(filteredActivities);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Aktivitäten
        </CardTitle>
        {showFilter && (
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="listings">Inserate</SelectItem>
              <SelectItem value="inquiries">Anfragen</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {Object.keys(groupedActivities).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  {date}
                </p>
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const Icon = activityIcons[activity.type];
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            activityColors[activity.type]
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {activity.description}
                            </p>
                          )}
                          {activity.metadata?.value && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(activity.metadata.value as number)}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Keine Aktivitäten gefunden</p>
          </div>
        )}

        {!limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Alle Aktivitäten laden
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
