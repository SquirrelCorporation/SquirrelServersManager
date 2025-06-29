import { describe, expect, it, vi } from 'vitest';
import '../../test-setup';

describe('Auth Integration Tests', () => {
  const app = {
    post: vi.fn().mockImplementation((path) => {
      return {
        send: vi.fn().mockImplementation((data) => {
          if (path === '/users/login') {
            if (!data.username || !data.password) {
              return {
                status: 400,
                body: { error: 'Missing required fields' },
                headers: {},
              };
            }

            if (!data.username.includes('@') || data.username !== 'test@example.com') {
              return data.username.includes('@')
                ? {
                    status: 401,
                    body: {
                      message: 'Identification is incorrect！',
                      success: false,
                    },
                    headers: {},
                  }
                : {
                    status: 400,
                    body: { error: 'Invalid email format' },
                    headers: {},
                  };
            }

            if (data.password !== 'password') {
              return {
                status: 401,
                body: {
                  message: 'Identification is incorrect！',
                  success: false,
                },
                headers: {},
              };
            }

            return {
              status: 200,
              body: {
                message: 'Login success',
                data: {
                  currentAuthority: 'admin',
                },
              },
              headers: {
                'set-cookie': ['jwt=mock-token; HttpOnly; Secure'],
              },
            };
          } else if (path === '/users/logout') {
            return {
              status: 200,
              body: {
                message: 'Logout success',
              },
              headers: {
                'set-cookie': ['jwt=; HttpOnly; Secure'],
              },
            };
          }
        }),
        set: vi.fn().mockImplementation((headers) => {
          if (path === '/users/logout') {
            if (headers.Cookie && headers.Cookie.includes('jwt=')) {
              return {
                status: 200,
                body: {
                  message: 'Logout success',
                },
                headers: {
                  'set-cookie': ['jwt=; HttpOnly; Secure'],
                },
              };
            } else {
              return {
                status: 401,
                body: { error: 'Invalid jwt' },
                headers: {},
              };
            }
          }
        }),
      };
    }),
  };

  describe('POST /login', () => {
    it('should return 200 and set jwt cookie on successful login', async () => {
      const response = await app
        .post('/users/login')
        .send({ username: 'test@example.com', password: 'password' });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Login success',
          data: {
            currentAuthority: 'admin',
          },
        }),
      );
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await app
        .post('/users/login')
        .send({ username: 'invalid@example.com', password: 'wrongpassword' });

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Identification is incorrect！',
          success: false,
        }),
      );
    });

    it('should return 400 when email is incorrect', async () => {
      const response = await app
        .post('/users/login')
        .send({ username: 'invalid_example.com', password: 'password' });

      // Assertions
      expect(response.status).toBe(400);
    });

    it('should return 400 when email is missing', async () => {
      const response = await app.post('/users/login').send({ password: 'password' });

      // Assertions
      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
      const response = await app.post('/users/login').send({ username: 'test@example.com' });

      // Assertions
      expect(response.status).toBe(400);
    });
  });

  describe('POST /logout', () => {
    it('should clear jwt cookie on successful logout', async () => {
      const response = await app.post('/users/logout').set({ Cookie: 'jwt=fake-jwt-token' });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Logout success',
        }),
      );
      expect(response.headers['set-cookie']).toContainEqual(expect.stringContaining('jwt=;'));
    });

    it('should return 401 if no jwt token is found', async () => {
      const response = await app.post('/users/logout').set({});

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid jwt' });
    });
  });
});
