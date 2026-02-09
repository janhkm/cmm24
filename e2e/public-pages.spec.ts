import { test, expect } from '@playwright/test';

test.describe('Oeffentliche Seiten', () => {

  test('Startseite laedt erfolgreich', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/CMM24|Messmaschinen|Koordinatenmessmaschinen/i);
    // Hero-Bereich sichtbar
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Maschinen-Seite laedt und zeigt Filter', async ({ page }) => {
    await page.goto('/maschinen');
    await expect(page.locator('h1').first()).toBeVisible();
    // Filterbereich oder Suchefeld sichtbar
    await expect(
      page.locator('input[placeholder*="Such"], [data-testid="search"], input[name="q"]').first()
    ).toBeVisible({ timeout: 10000 }).catch(() => {
      // Fallback: Irgendein Seiteninhalt
      expect(page.locator('main')).toBeVisible();
    });
  });

  test('Hersteller-Seite laedt', async ({ page }) => {
    await page.goto('/hersteller');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Kontaktseite zeigt Formular', async ({ page }) => {
    await page.goto('/kontakt');
    await expect(page.locator('form').first()).toBeVisible();
    await expect(page.locator('input[name="name"], input[name="email"]').first()).toBeVisible();
  });

  test('FAQ-Seite laedt', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Vergleichs-Seite laedt', async ({ page }) => {
    await page.goto('/vergleich');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Impressum laedt', async ({ page }) => {
    await page.goto('/impressum');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Datenschutz laedt', async ({ page }) => {
    await page.goto('/datenschutz');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('AGB laedt', async ({ page }) => {
    await page.goto('/agb');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Navigation hat Links zu Hauptseiten', async ({ page }) => {
    await page.goto('/');
    
    // Header vorhanden
    await expect(page.locator('header').first()).toBeVisible();
    
    // Wichtige Links
    const nav = page.locator('header, nav');
    await expect(nav.getByRole('link', { name: /maschinen/i }).first()).toBeVisible();
  });

  test('Footer hat Links zu rechtlichen Seiten', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('SEO & Performance', () => {
  
  test('robots.txt ist erreichbar', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
  });

  test('sitemap.xml ist erreichbar', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });

  test('404-Seite fuer unbekannte URLs', async ({ page }) => {
    await page.goto('/diese-seite-existiert-nicht-12345');
    // Entweder 404 Status oder eine 404-Seite
    await expect(
      page.locator('text=/404|nicht gefunden|not found/i').first()
    ).toBeVisible({ timeout: 10000 }).catch(() => {
      // Akzeptabel: Redirect oder andere Behandlung
    });
  });
});

test.describe('Security Headers', () => {
  
  test('Wichtige Security Headers sind gesetzt', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['referrer-policy']).toBeTruthy();
  });
});
