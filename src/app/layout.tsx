// Root Layout – Passthrough
// Die eigentliche Layout-Logik (html, body, Fonts, Providers) befindet sich
// in src/app/[locale]/layout.tsx, damit das lang-Attribut dynamisch gesetzt werden kann.
// Next.js erfordert einen Root-Layout, aber html/body werden im [locale]-Layout gerendert.

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  // Passthrough: [locale]/layout.tsx rendert <html> und <body>
  return children as React.JSX.Element;
}
