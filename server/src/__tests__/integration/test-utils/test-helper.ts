import * as pactum from 'pactum';
import { setupDeviceTests } from './device-test-helper';
import { setupUserTests } from './user-test-helper';

/**
 * TestHelper class for common test functionality
 */
export class TestHelper {
  /**
   * Base URL for the API
   */
  readonly baseUrl: string;

  /**
   * Authentication token for requests
   */
  private authToken: string | null = null;

  /**
   * Constructor
   * @param baseUrl Base URL for the API
   */
  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    pactum.request.setBaseUrl(baseUrl);
  }

  /**
   * Set up all test helpers
   */
  async setup() {
    // Set up authentication
    await this.authenticate();

    // Set up device tests
    await setupDeviceTests(this);

    // Set up user tests
    await setupUserTests(this);
  }

  /**
   * Authenticate using the standard user credentials
   */
  async authenticate() {
    const response = await pactum
      .spec()
      .post('/users/login')
      .withJson({
        username: process.env.TEST_USERNAME || 'admin',
        password: process.env.TEST_PASSWORD || 'admin',
      });

    this.authToken = response.body.token;

    // Set up default headers for all requests
    pactum.request.setDefaultHeaders({
      Authorization: `Bearer ${this.authToken}`,
    });
  }

  /**
   * Create a new API request spec with authentication
   */
  request() {
    return pactum.spec().withHeaders({
      Authorization: `Bearer ${this.authToken}`,
    });
  }

  /**
   * Clean up resources after tests
   */
  async cleanup() {
    // Add cleanup logic here
    this.authToken = null;
  }
}

/**
 * Create and set up a test helper instance
 */
export async function createTestHelper(): Promise<TestHelper> {
  const helper = new TestHelper();
  await helper.setup();
  return helper;
}
