import { test, expect } from '@playwright/test';

const AUTH_URL = 'http://localhost:3001';
const BLOG_URL = 'http://localhost:3000';

test.describe('Blog Service', () => {
  const uniqueId = Date.now().toString();
  let userToken: string;
  let createdPostId: string;
  const testUser = {
    username: `blogger_${uniqueId}`,
    password: 'BlogPass123!',
  };

  test.beforeAll(async ({ request }) => {
    // Register and login to get a token
    await request.post(`${AUTH_URL}/register`, { data: testUser });
    const loginRes = await request.post(`${AUTH_URL}/login`, { data: testUser });
    const loginBody = await loginRes.json();
    userToken = loginBody.token;
  });

  test('GET /health returns ok', async ({ request }) => {
    const res = await request.get(`${BLOG_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('POST /posts creates a blog post (201)', async ({ request }) => {
    const res = await request.post(`${BLOG_URL}/posts`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        title: `Test Post ${uniqueId}`,
        content: `This is test content for post ${uniqueId}`,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.title).toBe(`Test Post ${uniqueId}`);
    expect(body.content).toBe(`This is test content for post ${uniqueId}`);
    expect(body.author).toBe(testUser.username);
    expect(body._id).toBeDefined();
    createdPostId = body._id;
  });

  test('GET /posts returns all posts', async ({ request }) => {
    const res = await request.get(`${BLOG_URL}/posts`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    // Should contain our created post
    const found = body.find((p: any) => p._id === createdPostId);
    expect(found).toBeDefined();
  });

  test('GET /posts/:id returns single post', async ({ request }) => {
    const res = await request.get(`${BLOG_URL}/posts/${createdPostId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body._id).toBe(createdPostId);
    expect(body.title).toBe(`Test Post ${uniqueId}`);
  });

  test('PUT /posts/:id updates the post', async ({ request }) => {
    const res = await request.put(`${BLOG_URL}/posts/${createdPostId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        title: `Updated Post ${uniqueId}`,
        content: `Updated content ${uniqueId}`,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe(`Updated Post ${uniqueId}`);
    expect(body.content).toBe(`Updated content ${uniqueId}`);
  });

  test('POST /posts rejects missing fields (400)', async ({ request }) => {
    const res = await request.post(`${BLOG_URL}/posts`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { title: 'Only title, no content' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Title and content are required');
  });

  test('POST /posts rejects request without token (401)', async ({ request }) => {
    const res = await request.post(`${BLOG_URL}/posts`, {
      data: { title: 'No Auth', content: 'Should fail' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('PUT /posts/:id rejects another user (403)', async ({ request }) => {
    // Register & login a second user
    const otherUser = {
      username: `otheruser_${uniqueId}`,
      password: 'OtherPass123!',
    };
    await request.post(`${AUTH_URL}/register`, { data: otherUser });
    const loginRes = await request.post(`${AUTH_URL}/login`, { data: otherUser });
    const otherToken = (await loginRes.json()).token;

    // Try to update the first user's post
    const res = await request.put(`${BLOG_URL}/posts/${createdPostId}`, {
      headers: { Authorization: `Bearer ${otherToken}` },
      data: { title: 'Hijacked', content: 'Should not work' },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  test('DELETE /posts/:id rejects another user (403)', async ({ request }) => {
    // Register & login a third user
    const thirdUser = {
      username: `thirduser_${uniqueId}`,
      password: 'ThirdPass123!',
    };
    await request.post(`${AUTH_URL}/register`, { data: thirdUser });
    const loginRes = await request.post(`${AUTH_URL}/login`, { data: thirdUser });
    const thirdToken = (await loginRes.json()).token;

    const res = await request.delete(`${BLOG_URL}/posts/${createdPostId}`, {
      headers: { Authorization: `Bearer ${thirdToken}` },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  test('GET /posts/:id returns 404 for non-existent post', async ({ request }) => {
    const fakeId = '000000000000000000000000'; // valid ObjectId format, doesn't exist
    const res = await request.get(`${BLOG_URL}/posts/${fakeId}`);
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Post not found');
  });

  test('DELETE /posts/:id deletes the post', async ({ request }) => {
    const res = await request.delete(`${BLOG_URL}/posts/${createdPostId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Post deleted');

    // Verify it's gone
    const getRes = await request.get(`${BLOG_URL}/posts/${createdPostId}`);
    expect(getRes.status()).toBe(404);
  });
});

