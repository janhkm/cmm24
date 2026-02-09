'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Bot,
  Clock,
  Settings2,
  Save,
  Loader2,
  Mail,
  CalendarDays,
  Sparkles,
  MessageSquareText,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  getAutoReplySettings,
  updateAutoReplySettings,
  getAutoReplyStats,
  type AutoReplySettings,
} from '@/lib/actions/auto-reply';
import { cn } from '@/lib/utils';

interface AutoReplySettingsProps {
  className?: string;
}

export function AutoReplySettingsPanel({ className }: AutoReplySettingsProps) {
  const t = useTranslations('autoReply');
  const tc = useTranslations('common');

  const DAYS_OF_WEEK = [
    { value: 1, label: t('days.mon') },
    { value: 2, label: t('days.tue') },
    { value: 3, label: t('days.wed') },
    { value: 4, label: t('days.thu') },
    { value: 5, label: t('days.fri') },
    { value: 6, label: t('days.sat') },
    { value: 7, label: t('days.sun') },
  ];

  const [settings, setSettings] = useState<AutoReplySettings | null>(null);
  const [stats, setStats] = useState<{
    totalSent: number;
    lastSentAt: string | null;
    pendingCount: number;
    isEnabled: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state
  const [isEnabled, setIsEnabled] = useState(false);
  const [subject, setSubject] = useState(t('defaultSubject'));
  const [message, setMessage] = useState(t('defaultMessage'));
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [respectWorkingHours, setRespectWorkingHours] = useState(false);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]);
  const [includeListingDetails, setIncludeListingDetails] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [signature, setSignature] = useState('');

  // Load settings
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsResult, statsResult] = await Promise.all([
          getAutoReplySettings(),
          getAutoReplyStats(),
        ]);

        if (settingsResult.success && settingsResult.data) {
          const s = settingsResult.data;
          setSettings(s);
          setIsEnabled(s.is_enabled);
          setSubject(s.subject);
          setMessage(s.message);
          setDelayMinutes(s.delay_minutes);
          setRespectWorkingHours(s.respect_working_hours);
          setWorkingHoursStart(s.working_hours_start);
          setWorkingHoursEnd(s.working_hours_end);
          setWorkingDays(s.working_days);
          setIncludeListingDetails(s.include_listing_details);
          setIncludeSignature(s.include_signature);
          setSignature(s.signature || '');
        }

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error('Load auto-reply settings error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateAutoReplySettings({
        is_enabled: isEnabled,
        subject,
        message,
        delay_minutes: delayMinutes,
        respect_working_hours: respectWorkingHours,
        working_hours_start: workingHoursStart,
        working_hours_end: workingHoursEnd,
        working_days: workingDays,
        include_listing_details: includeListingDetails,
        include_signature: includeSignature,
        signature: signature || null,
      });

      if (result.success && result.data) {
        setSettings(result.data);
        toast.success(t('saved'));
      } else if (!result.success) {
        toast.error(result.error || t('saveError'));
      }
    } catch (error) {
      toast.error(t('saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const formatDelay = (minutes: number) => {
    if (minutes === 0) return tc('immediately');
    if (minutes < 60) return t('delayMinutes', { minutes });
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return hours === 1 ? t('delayHour', { hours }) : t('delayHours', { hours });
    return t('delayHoursMinutes', { hours, minutes: remainingMinutes });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {t('title')}
                {isEnabled && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {t('active')}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {t('description')}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            aria-label={t('enable')}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats */}
        {stats && (stats.totalSent > 0 || stats.pendingCount > 0) && (
          <div className="flex gap-4 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>
                <strong>{stats.totalSent}</strong> {t('sent', { count: stats.totalSent }).replace(String(stats.totalSent), '').trim()}
              </span>
            </div>
            {stats.pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>
                  <strong>{stats.pendingCount}</strong> {t('queued', { count: stats.pendingCount }).replace(String(stats.pendingCount), '').trim()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">{t('subject')}</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('defaultSubject')}
            disabled={!isEnabled}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">{t('message')}</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('messagePlaceholder')}
            rows={6}
            disabled={!isEnabled}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {t('messageHint')}
          </p>
        </div>

        {/* Delay */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t('delay')}</Label>
            <span className="text-sm font-medium">{formatDelay(delayMinutes)}</span>
          </div>
          <Slider
            value={[delayMinutes]}
            onValueChange={(v) => setDelayMinutes(v[0])}
            min={0}
            max={60}
            step={5}
            disabled={!isEnabled}
          />
          <p className="text-xs text-muted-foreground">
            {t('delayHint')}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-listing">{t('attachListingDetails')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('attachListingDetailsHint')}
              </p>
            </div>
            <Switch
              id="include-listing"
              checked={includeListingDetails}
              onCheckedChange={setIncludeListingDetails}
              disabled={!isEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-signature">{t('attachSignature')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('attachSignatureHint')}
              </p>
            </div>
            <Switch
              id="include-signature"
              checked={includeSignature}
              onCheckedChange={setIncludeSignature}
              disabled={!isEnabled}
            />
          </div>

          {includeSignature && (
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label htmlFor="signature">{t('signature')}</Label>
              <Textarea
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder={t('defaultSignature')}
                rows={4}
                disabled={!isEnabled}
                className="resize-none text-sm"
              />
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 w-full">
              <Settings2 className="h-4 w-4" />
              {t('advancedSettings')}
              <span className="ml-auto text-xs text-muted-foreground">
                {showAdvanced ? '▲' : '▼'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Working Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="working-hours">{t('businessHoursOnly')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('businessHoursHint')}
                  </p>
                </div>
                <Switch
                  id="working-hours"
                  checked={respectWorkingHours}
                  onCheckedChange={setRespectWorkingHours}
                  disabled={!isEnabled}
                />
              </div>

              {respectWorkingHours && (
                <div className="space-y-3 pl-4 border-l-2 border-muted">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="start-time" className="text-xs">{tc('from')}</Label>
                      <Select
                        value={workingHoursStart}
                        onValueChange={setWorkingHoursStart}
                        disabled={!isEnabled}
                      >
                        <SelectTrigger id="start-time">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const time = `${i.toString().padStart(2, '0')}:00`;
                            return (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="end-time" className="text-xs">{tc('to')}</Label>
                      <Select
                        value={workingHoursEnd}
                        onValueChange={setWorkingHoursEnd}
                        disabled={!isEnabled}
                      >
                        <SelectTrigger id="end-time">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const time = `${i.toString().padStart(2, '0')}:00`;
                            return (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">{t('workDays')}</Label>
                    <div className="flex gap-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleToggleDay(day.value)}
                          disabled={!isEnabled}
                          className={cn(
                            'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
                            workingDays.includes(day.value)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80',
                            !isEnabled && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Info */}
        {isEnabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('autoReplyNote')}
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t('saveSettings')}
        </Button>
      </CardContent>
    </Card>
  );
}
