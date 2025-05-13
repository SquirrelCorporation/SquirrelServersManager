/**
 * Test suite entry point for SquirrelServersManager E2E Tests
 * 
 * This file exports all test-related utilities and setup functions.
 */

export * from './setup';
export * from './test-utils';

// Re-export key constants
export const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
export const API_URL = process.env.API_URL || 'http://localhost:3000';
export const TEST_USERNAME = process.env.TEST_USERNAME || 'test@example.com';
export const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin';