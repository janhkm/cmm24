import { test, expect } from '@playwright/test';

test.describe('Authentifizierung', () => {
  
  test('Geschuetzte Routen leiten zu Login weiter', async ({ page }) => {
    await page.goto('/seller/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Admin-Routen leiten zu Login weiter ohne Auth', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login-Seite wird korrekt angezeigt', async ({ page }) => {
    await page.goto('/login');
    
    // Formulareingaben pruefen
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /anmelden|login|einloggen/i })).toBeVisible();
  });

  test('Login zeigt Fehler bei ungueltigen Daten', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"], input[type="email"]', 'falsch@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'falschespasswort');
    await page.click('button[type="submit"]');
    
    // Fehlermeldung oder Alert sollte erscheinen
    await expect(
      page.locator('[role="alert"], .text-destructive, [data-error]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Registrierungsseite wird korrekt angezeigt', async ({ page }) => {
    await page.goto('/registrieren');
    
    // Mindestens ein Eingabefeld
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('Passwort vergessen Seite wird angezeigt', async ({ page }) => {
    await page.goto('/passwort-vergessen');
    
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
  });
});
