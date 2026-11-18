import { test, expect } from '@playwright/test';

const AUTH_URL = 'http://localhost:3001';
const BLOG_URL = 'http://localhost:3000';
const ANALYTICS_URL = 'http://localhost:3002';

test.describe('Health Checks', () => {
  test('Auth service is healthy', async ({ request }) => {
    const res = await request.get(`${AUTH_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('Blog service is healthy', async ({ request }) => {
    const res = await request.get(`${BLOG_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('Analytics service is healthy', async ({ request }) => {
    const res = await request.get(`${ANALYTICS_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});

