import { test, expect } from '@playwright/test';

test.describe('Seller-Flow', () => {

  test('Inserate-Seite ist fuer nicht-eingeloggte User nicht erreichbar', async ({ page }) => {
    await page.goto('/seller/inserate');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Neues-Inserat-Seite leitet zu Login weiter', async ({ page }) => {
    await page.goto('/seller/inserate/neu');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Dashboard leitet zu Login weiter ohne Auth', async ({ page }) => {
    await page.goto('/seller/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Anfragen-Seite leitet zu Login weiter', async ({ page }) => {
    await page.goto('/seller/anfragen');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Abo-Seite leitet zu Login weiter', async ({ page }) => {
    await page.goto('/seller/abo');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Team-Seite leitet zu Login weiter', async ({ page }) => {
    await page.goto('/seller/team');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Statistiken-Seite leitet zu Login weiter', async ({ page }) => {
    await page.goto('/seller/statistiken');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Konto-Seite leitet zu Login weiter', async ({ page }) => {
    await page.goto('/seller/konto');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Seller-Registrierung ist ohne Login erreichbar', async ({ page }) => {
    await page.goto('/seller/registrieren');
    // Sollte NICHT zu Login weiterleiten (Sonderregel)
    await expect(page).not.toHaveURL(/\/login/);
  });
});

test.describe('Maschinen oeffentliche Seiten', () => {

  test('Maschinen-Seite laedt korrekt', async ({ page }) => {
    await page.goto('/maschinen');
    await expect(page).toHaveURL('/maschinen');
    // Mindestens die Ueberschrift sollte sichtbar sein
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Hersteller-Seite laedt korrekt', async ({ page }) => {
    await page.goto('/hersteller');
    await expect(page).toHaveURL('/hersteller');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Vergleichsseite ist erreichbar', async ({ page }) => {
    await page.goto('/vergleich');
    await expect(page).toHaveURL('/vergleich');
  });
});
