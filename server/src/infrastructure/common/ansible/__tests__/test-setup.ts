import * as fs from 'fs';
import { vi } from 'vitest';

// Create directories in memory for testing
const directories = {
  '/data': { isDirectory: true, isFile: false },
  '/data/config': { isDirectory: true, isFile: false },
};

// Mock fs module
vi.mock('fs', () => {
  return {
    readFileSync: vi.fn().mockReturnValue(`
[section1]
key1=value1
;key2=value2
# Description for key3
key3=value3

[section2]
;key4=value4
    `),
    writeFileSync: vi.fn(),
    existsSync: vi.fn().mockImplementation((path) => {
      return !!directories[path];
    }),
    mkdirSync: vi.fn().mockImplementation((path, options) => {
      directories[path] = { isDirectory: true, isFile: false };
      return true;
    }),
  };
});

// Mock config.ts to return expected paths
vi.mock('../../../../config', () => ({
  SSM_DATA_PATH: '/data',
  SSM_CONFIG_PATH: '/data/config',
  SSM_ANSIBLE_CONFIG_FILE: '/data/config/ansible.cfg',
}));

// Ensure the directories exist in our mocked structure
directories['/data'] = { isDirectory: true, isFile: false };
directories['/data/config'] = { isDirectory: true, isFile: false };
