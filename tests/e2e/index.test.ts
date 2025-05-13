/**
 * Main test entry point
 * This file imports all the test files to ensure they're executed in the correct order
 */

// Import setup first to ensure test context is initialized
import './setup';

// Import test files in order
import './tests/auth.test';
import './tests/devices.test';

// Note: Add additional test files here as they are created