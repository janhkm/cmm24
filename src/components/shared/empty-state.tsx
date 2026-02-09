'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: 'search' | 'inbox' | 'listing' | 'error' | 'success';
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

// SVG Illustrations
function SearchIllustration() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
      <circle cx="100" cy="75" r="60" className="fill-muted" />
      <circle cx="85" cy="65" r="35" className="fill-background stroke-primary" strokeWidth="4" />
      <line x1="110" y1="90" x2="140" y2="120" className="stroke-primary" strokeWidth="8" strokeLinecap="round" />
      <circle cx="75" cy="60" r="8" className="fill-primary/20" />
      <circle cx="95" cy="55" r="4" className="fill-primary/30" />
    </svg>
  );
}

function InboxIllustration() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
      <circle cx="100" cy="75" r="60" className="fill-muted" />
      <rect x="55" y="45" width="90" height="65" rx="8" className="fill-background stroke-primary" strokeWidth="3" />
      <path d="M55 70 L100 95 L145 70" className="stroke-primary" strokeWidth="3" fill="none" />
      <rect x="70" y="55" width="30" height="4" rx="2" className="fill-primary/30" />
      <rect x="70" y="63" width="45" height="3" rx="1.5" className="fill-primary/20" />
    </svg>
  );
}

function ListingIllustration() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
      <circle cx="100" cy="75" r="60" className="fill-muted" />
      <rect x="50" y="35" width="100" height="80" rx="8" className="fill-background stroke-primary" strokeWidth="3" />
      <rect x="60" y="45" width="80" height="35" rx="4" className="fill-primary/10" />
      <circle cx="100" cy="62" r="10" className="fill-primary/30" />
      <rect x="60" y="90" width="50" height="4" rx="2" className="fill-primary/30" />
      <rect x="60" y="98" width="70" height="3" rx="1.5" className="fill-primary/20" />
    </svg>
  );
}

function ErrorIllustration() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
      <circle cx="100" cy="75" r="60" className="fill-destructive/10" />
      <circle cx="100" cy="75" r="40" className="fill-background stroke-destructive" strokeWidth="3" />
      <path d="M85 60 L115 90 M115 60 L85 90" className="stroke-destructive" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function SuccessIllustration() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
      <circle cx="100" cy="75" r="60" className="fill-green-500/10" />
      <circle cx="100" cy="75" r="40" className="fill-background stroke-green-500" strokeWidth="3" />
      <path d="M75 75 L92 92 L125 58" className="stroke-green-500" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const illustrations = {
  search: SearchIllustration,
  inbox: InboxIllustration,
  listing: ListingIllustration,
  error: ErrorIllustration,
  success: SuccessIllustration,
};

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const Illustration = illustration ? illustrations[illustration] : null;

  return (
    <div className={cn('text-center py-12 px-4', className)}>
      {/* Illustration or Icon */}
      {Illustration ? (
        <div className="mx-auto mb-6 h-32 w-40">
          <Illustration />
        </div>
      ) : Icon ? (
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* Description */}
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            action.href ? (
              <Button asChild>
                <a href={action.href}>{action.label}</a>
              </Button>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Preset Empty States
export function NoSearchResults({
  onReset,
}: {
  onReset?: () => void;
}) {
  const t = useTranslations('emptyState');
  return (
    <EmptyState
      illustration="search"
      title={t('noMachinesFound')}
      description={t('noMachinesFoundDesc')}
      action={onReset ? { label: t('resetFilters'), onClick: onReset } : undefined}
    />
  );
}

export function NoListings() {
  const t = useTranslations('emptyState');
  return (
    <EmptyState
      illustration="listing"
      title={t('noListings')}
      description={t('noListingsDesc')}
      action={{ label: t('createListing'), href: '/seller/inserate/neu' }}
    />
  );
}

export function NoInquiries() {
  const t = useTranslations('emptyState');
  return (
    <EmptyState
      illustration="inbox"
      title={t('noInquiries')}
      description={t('noInquiriesDesc')}
    />
  );
}
