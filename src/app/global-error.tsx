'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Ein schwerwiegender Fehler ist aufgetreten
            </h1>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Unser Team wurde automatisch benachrichtigt.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
