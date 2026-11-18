import { test, expect } from '@playwright/test';

const AUTH_URL = 'http://localhost:3001';

test.describe('Auth Service', () => {
  const uniqueId = Date.now().toString();
  const testUser = {
    username: `testuser_${uniqueId}`,
    password: 'TestPassword123!',
  };

  test('GET /health returns ok', async ({ request }) => {
    const res = await request.get(`${AUTH_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('POST /register creates a new user', async ({ request }) => {
    const res = await request.post(`${AUTH_URL}/register`, {
      data: testUser,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.username).toBe(testUser.username);
    expect(body._id).toBeDefined();
    // Password should not be returned (or if returned, it's hashed)
    expect(body.password).toBeUndefined();
  });

  test('POST /register rejects duplicate username (409)', async ({ request }) => {
    // First register
    await request.post(`${AUTH_URL}/register`, {
      data: {
        username: `dupuser_${uniqueId}`,
        password: 'Password123!',
      },
    });
    // Second register with same username
    const res = await request.post(`${AUTH_URL}/register`, {
      data: {
        username: `dupuser_${uniqueId}`,
        password: 'DifferentPassword!',
      },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error).toBe('User already exists');
  });

  test('POST /register rejects missing fields (400)', async ({ request }) => {
    const res = await request.post(`${AUTH_URL}/register`, {
      data: { username: 'onlyusername' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Username and password are required');
  });

  test('POST /login succeeds with correct credentials', async ({ request }) => {
    // Register first
    const regUser = {
      username: `loginuser_${uniqueId}`,
      password: 'LoginPass123!',
    };
    await request.post(`${AUTH_URL}/register`, { data: regUser });

    // Login
    const res = await request.post(`${AUTH_URL}/login`, { data: regUser });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe('string');
  });

  test('POST /login rejects wrong password (401)', async ({ request }) => {
    // Register first
    const regUser = {
      username: `wrongpw_${uniqueId}`,
      password: 'CorrectPass123!',
    };
    await request.post(`${AUTH_URL}/register`, { data: regUser });

    // Login with wrong password
    const res = await request.post(`${AUTH_URL}/login`, {
      data: { username: regUser.username, password: 'WrongPassword!' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid credentials');
  });

  test('POST /login rejects non-existent user (401)', async ({ request }) => {
    const res = await request.post(`${AUTH_URL}/login`, {
      data: { username: 'nonexistent_user_xyz', password: 'whatever' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid credentials');
  });

  test('tampered JWT is rejected by blog service (401)', async ({ request }) => {
    const BLOG_URL = 'http://localhost:3000';
    const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhhY2tlciIsImlhdCI6MTcwMDAwMDAwMH0.invalid_signature_here';

    const res = await request.post(`${BLOG_URL}/posts`, {
      headers: { Authorization: `Bearer ${tamperedToken}` },
      data: { title: 'Hacked', content: 'Should not work' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });
});

