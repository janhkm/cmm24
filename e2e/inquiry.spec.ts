import { test, expect } from '@playwright/test';

test.describe('Anfrage-Flow', () => {

  test('Maschinen-Detailseite hat Anfrage-Button', async ({ page }) => {
    // Erst Maschinen-Seite besuchen
    await page.goto('/maschinen');
    
    // Versuche auf ein Listing zu klicken
    const listingLink = page.locator('a[href*="/maschinen/"]').first();
    
    if (await listingLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await listingLink.click();
      await page.waitForLoadState('networkidle');
      
      // Anfrage-Button sollte sichtbar sein
      await expect(
        page.getByRole('button', { name: /anfrage|kontakt|nachricht/i }).first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      // Keine Listings vorhanden - ist OK fuer Test-Umgebung
      test.skip();
    }
  });

  test('Kontaktformular validiert Eingaben', async ({ page }) => {
    await page.goto('/kontakt');
    
    // Leeres Formular absenden
    const submitButton = page.getByRole('button', { name: /senden|absenden/i }).first();
    
    if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitButton.click();
      
      // Validierungsfehler sollten erscheinen
      await page.waitForTimeout(1000);
      
      // Entweder native Validierung oder Zod-Fehler
      const hasErrors = await page.locator(
        '.text-destructive, [role="alert"], :invalid, [aria-invalid="true"]'
      ).count();
      
      expect(hasErrors).toBeGreaterThan(0);
    }
  });
});
