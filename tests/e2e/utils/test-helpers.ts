import { ApiClient } from './api-client';

/**
 * User data type for testing
 */
export interface TestUser {
  username: string;
  password: string;
  email: string;
}

/**
 * Generate a random test user
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    username: `test-user-${timestamp}`,
    password: 'TestPassword123!',
    email: `test-${timestamp}@example.com`
  };
}

/**
 * Create a test user in the system
 */
export async function createTestUser(apiClient: ApiClient): Promise<TestUser> {
  const userData = generateTestUser();
  
  try {
    await apiClient.post('/users', userData);
    return userData;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Log in a test user and return the auth token
 */
export async function loginTestUser(apiClient: ApiClient, userData: TestUser): Promise<string> {
  try {
    const response = await apiClient.post('/auth/login', {
      username: userData.username,
      password: userData.password
    });
    
    const token = response.data.token;
    apiClient.setToken(token);
    return token;
  } catch (error) {
    console.error('Failed to login test user:', error);
    throw error;
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  maxAttempts = 10,
  intervalMs = 1000
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

/**
 * Clean up by removing the test user
 */
export async function cleanupTestUser(apiClient: ApiClient, userId: string): Promise<void> {
  try {
    await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    console.error('Failed to clean up test user:', error);
  }
}