import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

/**
 * Authentication utility functions for testing API endpoints that require authentication
 */

interface TestUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

/**
 * Creates authentication headers with a valid JWT token
 * @param jwtService The NestJS JWT service
 * @param user The user data to include in the token
 * @returns Object containing the Authorization header with Bearer token
 */
export function getAuthHeaders(jwtService: JwtService, user: TestUser) {
  const token = jwtService.sign({
    sub: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  });

  return { Authorization: `Bearer ${token}` };
}

/**
 * Performs a login and returns the authentication token
 * @param app The NestJS application
 * @param username User's username/email
 * @param password User's password
 * @returns The JWT token if login is successful
 */
export async function loginUser(
  app: INestApplication,
  username: string,
  password: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/users/login')
    .send({ username, password })
    .expect(200);

  // Extract JWT token from response (assuming it's in the response body or headers)
  // The actual location may vary based on your authentication implementation
  const token = response.body.token || response.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Failed to retrieve authentication token');
  }

  return token;
}

/**
 * Creates a test admin user
 * @returns Test admin user data
 */
export function createTestAdminUser(): TestUser {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@example.com',
    roles: ['admin'],
  };
}

/**
 * Creates a test regular user
 * @returns Test regular user data
 */
export function createTestRegularUser(): TestUser {
  return {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'user',
    email: 'user@example.com',
    roles: ['user'],
  };
}
