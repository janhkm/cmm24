import { test, expect } from '@playwright/test';

test.describe('REST API', () => {

  test('API ohne Auth gibt 401 zurueck', async ({ request }) => {
    const response = await request.get('/api/v1/listings');
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body.error.code).toBe('unauthorized');
  });

  test('API mit ungueltigem Key gibt 401 zurueck', async ({ request }) => {
    const response = await request.get('/api/v1/listings', {
      headers: { 'Authorization': 'Bearer invalid_key_123' },
    });
    expect(response.status()).toBe(401);
  });

  test('API Stats ohne Auth gibt 401 zurueck', async ({ request }) => {
    const response = await request.get('/api/v1/stats');
    expect(response.status()).toBe(401);
  });

  test('API Inquiries ohne Auth gibt 401 zurueck', async ({ request }) => {
    const response = await request.get('/api/v1/inquiries');
    expect(response.status()).toBe(401);
  });

  test('Stripe Webhook ohne Signatur gibt 400 zurueck', async ({ request }) => {
    const response = await request.post('/api/stripe/webhook', {
      data: { type: 'test' },
    });
    expect(response.status()).toBe(400);
  });
});
