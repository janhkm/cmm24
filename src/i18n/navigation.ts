import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';
import type { ComponentProps, ForwardRefExoticComponent } from 'react';

// Lokalisierte Navigation-Helfer
// Verwende diese statt der normalen next/link und next/navigation Importe
const nav = createNavigation(routing);

// Re-export mit gelockerten Types:
// Das Projekt nutzt viele dynamische Pfade (z.B. `/maschinen/${slug}`)
// die nicht statisch mit next-intl's strikten pathnames typisiert werden koennen.

type OriginalLinkProps = ComponentProps<typeof nav.Link>;
// Akzeptiert sowohl plain strings als auch Objekte { pathname, params }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RelaxedHref = string | { pathname: string; params?: Record<string, any>; query?: Record<string, string> };
type RelaxedLinkProps = Omit<OriginalLinkProps, 'href'> & { href: RelaxedHref };

export const Link = nav.Link as ForwardRefExoticComponent<RelaxedLinkProps>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const redirect = nav.redirect as any as (url: string, ...args: unknown[]) => never;

export const usePathname = nav.usePathname;

export const useRouter = nav.useRouter as () => {
  push: (href: string, options?: Record<string, unknown>) => void;
  replace: (href: string, options?: Record<string, unknown>) => void;
  prefetch: (href: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
};

export const getPathname = nav.getPathname as (args: {
  href: string;
  locale: string;
  forcePrefix?: boolean;
}) => string;
