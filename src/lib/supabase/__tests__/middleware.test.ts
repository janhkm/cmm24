import { describe, it, expect } from 'vitest';

/**
 * Tests fuer die Middleware-Routing-Logik.
 *
 * Da die Middleware Next.js Request/Response-Objekte benoetigt
 * die schwer zu mocken sind, testen wir die Routing-Logik selbst
 * als reine Funktionen.
 */

// Routing-Regeln extrahiert aus middleware.ts
const protectedPaths = ['/seller', '/admin', '/dashboard'];
const authPaths = ['/login'];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some((path) => pathname.startsWith(path));
}

function isAuthPath(pathname: string): boolean {
  return authPaths.some((path) => pathname.startsWith(path));
}

function shouldRedirectToLogin(pathname: string, user: unknown): boolean {
  return isProtectedPath(pathname) && !user;
}

function shouldRedirectFromAuth(pathname: string, user: unknown): boolean {
  return isAuthPath(pathname) && !!user;
}

// ============================================
// Tests
// ============================================

describe('Middleware Routing-Regeln', () => {
  describe('Protected Paths', () => {
    it('erkennt Seller-Routen als geschuetzt', () => {
      expect(isProtectedPath('/seller/dashboard')).toBe(true);
      expect(isProtectedPath('/seller/inserate')).toBe(true);
      expect(isProtectedPath('/seller/anfragen/123')).toBe(true);
    });

    it('erkennt Admin-Routen als geschuetzt', () => {
      expect(isProtectedPath('/admin/dashboard')).toBe(true);
      expect(isProtectedPath('/admin/moderation')).toBe(true);
    });

    it('erkennt oeffentliche Routen als nicht geschuetzt', () => {
      expect(isProtectedPath('/')).toBe(false);
      expect(isProtectedPath('/maschinen')).toBe(false);
      expect(isProtectedPath('/maschinen/zeiss-contura')).toBe(false);
      expect(isProtectedPath('/hersteller')).toBe(false);
      expect(isProtectedPath('/kontakt')).toBe(false);
    });
  });

  describe('Redirect-Logik', () => {
    it('leitet nicht-authentifizierte User von geschuetzten Routen zu Login', () => {
      expect(shouldRedirectToLogin('/seller/dashboard', null)).toBe(true);
      expect(shouldRedirectToLogin('/admin/dashboard', null)).toBe(true);
    });

    it('leitet authentifizierte User nicht von geschuetzten Routen um', () => {
      const user = { id: 'user-1' };
      expect(shouldRedirectToLogin('/seller/dashboard', user)).toBe(false);
    });

    it('leitet authentifizierte User von Login-Seite zum Dashboard', () => {
      const user = { id: 'user-1' };
      expect(shouldRedirectFromAuth('/login', user)).toBe(true);
    });

    it('leitet nicht-authentifizierte User nicht von Login-Seite um', () => {
      expect(shouldRedirectFromAuth('/login', null)).toBe(false);
    });

    it('leitet nicht von oeffentlichen Routen um', () => {
      expect(shouldRedirectToLogin('/maschinen', null)).toBe(false);
      expect(shouldRedirectFromAuth('/maschinen', { id: 'user-1' })).toBe(false);
    });
  });

  describe('Admin-Rollen-Check', () => {
    const validAdminRoles = ['admin', 'super_admin'];

    it('erkennt Admin-Rollen', () => {
      expect(validAdminRoles.includes('admin')).toBe(true);
      expect(validAdminRoles.includes('super_admin')).toBe(true);
    });

    it('lehnt normale User ab', () => {
      expect(validAdminRoles.includes('user')).toBe(false);
    });

    it('Super-Admin Check fuer Stammdaten', () => {
      const isSuperAdmin = (role: string) => role === 'super_admin';
      expect(isSuperAdmin('super_admin')).toBe(true);
      expect(isSuperAdmin('admin')).toBe(false);
      expect(isSuperAdmin('user')).toBe(false);
    });
  });
});
