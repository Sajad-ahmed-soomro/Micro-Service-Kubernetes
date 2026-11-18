import { test, expect } from '@playwright/test';

const AUTH_URL = 'http://localhost:3001';
const BLOG_URL = 'http://localhost:3000';
const ANALYTICS_URL = 'http://localhost:3002';

test.describe('Analytics Service', () => {
  const uniqueId = Date.now().toString();

  test('GET /health returns ok', async ({ request }) => {
    const res = await request.get(`${ANALYTICS_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('POST /log stores a view event and GET /logs retrieves it', async ({ request }) => {
    // 1. Register and login a user
    const user = {
      username: `analytics_user_${uniqueId}`,
      password: 'AnalyticsPass123!',
    };
    await request.post(`${AUTH_URL}/register`, { data: user });
    const loginRes = await request.post(`${AUTH_URL}/login`, { data: user });
    const token = (await loginRes.json()).token;

    // 2. Create a blog post
    const postRes = await request.post(`${BLOG_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: `Analytics Test Post ${uniqueId}`,
        content: `Content for analytics testing ${uniqueId}`,
      },
    });
    expect(postRes.status()).toBe(201);
    const post = await postRes.json();
    const postId = post._id;

    // 3. Simulate reading the post (GET)
    const readRes = await request.get(`${BLOG_URL}/posts/${postId}`);
    expect(readRes.status()).toBe(200);

    // 4. Log the view event to analytics
    const logRes = await request.post(`${ANALYTICS_URL}/log`, {
      data: {
        event: 'view',
        postId: postId,
        username: user.username,
        timestamp: new Date().toISOString(),
      },
    });
    expect(logRes.status()).toBe(201);
    const logBody = await logRes.json();
    expect(logBody.message).toBe('Log stored');

    // 5. Verify the event appears in /logs
    const logsRes = await request.get(`${ANALYTICS_URL}/logs`);
    expect(logsRes.status()).toBe(200);
    const logs = await logsRes.json();
    expect(Array.isArray(logs)).toBe(true);

    const viewEvent = logs.find(
      (l: any) => l.log && l.log.event === 'view' && l.log.postId === postId
    );
    expect(viewEvent).toBeDefined();
    expect(viewEvent.log.username).toBe(user.username);
  });
});

