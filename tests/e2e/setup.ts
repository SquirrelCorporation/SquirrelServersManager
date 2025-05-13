import { beforeAll, afterAll } from 'vitest';
import apiClient from './utils/api-client';

// Global variables to store test state
export let testContext: {
  adminUser?: {
    id: string;
    token: string;
  };
  testDevices: string[];
} = {
  testDevices: []
};

// Reset context before all tests
beforeAll(() => {
  testContext = {
    testDevices: []
  };
});

// Clean up after all tests
afterAll(async () => {
  // Clean up any devices created during testing
  for (const deviceId of testContext.testDevices) {
    try {
      await apiClient.delete(`/devices/${deviceId}`);
    } catch (error) {
      console.error(`Failed to clean up device ${deviceId}:`, error);
    }
  }

  // Reset API client state
  apiClient.clearToken();
});