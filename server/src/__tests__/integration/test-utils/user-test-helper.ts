import { TestHelper } from './test-helper';

/**
 * User data interface
 */
export interface TestUser {
  id: string;
  username: string;
  email?: string;
  roles: string[];
}

/**
 * Set up user test helpers
 * @param helper TestHelper instance
 */
export async function setupUserTests(helper: TestHelper) {
  // Add user test setup logic here
}

/**
 * Get current user profile
 * @param helper TestHelper instance
 * @returns Current user data
 */
export async function getCurrentUser(helper: TestHelper): Promise<TestUser> {
  const response = await helper.request().get('/users/me');

  return response.body;
}

/**
 * Login a user
 * @param helper TestHelper instance
 * @param username Username
 * @param password Password
 * @returns Authentication token and user data
 */
export async function loginUser(
  helper: TestHelper,
  username: string,
  password: string,
): Promise<{ token: string; user: TestUser }> {
  const response = await helper.request().post('/users/login').withJson({ username, password });

  return response.body;
}
