import { TestHelper } from './test-helper';

/**
 * Test device data
 */
export interface TestDevice {
  id: string;
  name: string;
  host: string;
  port: number;
  type: string;
  username?: string;
  password?: string;
}

/**
 * Set up device test helpers
 * @param helper TestHelper instance
 */
export async function setupDeviceTests(helper: TestHelper) {
  // Add device test setup logic here
}

/**
 * Create a test device
 * @param helper TestHelper instance
 * @param deviceData Device data
 * @returns Created device
 */
export async function createTestDevice(
  helper: TestHelper,
  deviceData: Partial<TestDevice> = {}
): Promise<TestDevice> {
  const defaultData = {
    name: `Test Device ${Date.now()}`,
    host: process.env.TEST_SSH_HOST || 'localhost',
    port: parseInt(process.env.TEST_SSH_PORT || '2223'),
    type: 'SSH',
    username: process.env.TEST_SSH_USER || 'testuser',
    password: process.env.TEST_SSH_PASSWORD || 'testpassword'
  };
  
  const data = { ...defaultData, ...deviceData };
  
  const response = await helper.request()
    .post('/devices')
    .withJson(data);
  
  return response.body;
}

/**
 * Delete a test device
 * @param helper TestHelper instance
 * @param deviceId Device ID
 */
export async function deleteTestDevice(helper: TestHelper, deviceId: string): Promise<void> {
  await helper.request()
    .delete(`/devices/${deviceId}`);
}

/**
 * Get a device by ID
 * @param helper TestHelper instance
 * @param deviceId Device ID
 * @returns Device data
 */
export async function getDevice(helper: TestHelper, deviceId: string): Promise<TestDevice> {
  const response = await helper.request()
    .get(`/devices/${deviceId}`);
  
  return response.body;
}

/**
 * List all devices
 * @param helper TestHelper instance
 * @returns Array of devices
 */
export async function listDevices(helper: TestHelper): Promise<TestDevice[]> {
  const response = await helper.request()
    .get('/devices');
  
  return response.body;
}