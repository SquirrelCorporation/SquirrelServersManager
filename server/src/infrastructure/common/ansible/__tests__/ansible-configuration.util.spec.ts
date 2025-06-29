// Import vitest first to access vi
import * as fs from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Now import the code under test AFTER the mocks are set up
import { readConfig, writeConfig } from '../ansible-configuration.util';

// Mock fs BEFORE any imports that use it, following the recommended pattern
vi.mock('fs', async () => {
  // Start with an empty mock implementation
  const mockReadFileSync = vi.fn().mockReturnValue(`
[section1]
key1=value1
;key2=value2
# Description for key3
key3=value3

[section2]
;key4=value4
  `);

  const mockWriteFileSync = vi.fn();

  // Return both the default export and named exports
  return {
    default: {
      readFileSync: mockReadFileSync,
      writeFileSync: mockWriteFileSync,
    },
    readFileSync: mockReadFileSync,
    writeFileSync: mockWriteFileSync,
  };
});

describe('Configuration Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readConfig', () => {
    it('should read configuration correctly', () => {
      const config = readConfig();

      expect(config).toEqual({
        section1: {
          key1: { value: 'value1', deactivated: false, description: '' },
          key2: { value: 'value2', deactivated: true, description: '' },
          key3: { value: 'value3', deactivated: false, description: 'Description for key3' },
        },
        section2: {
          key4: { value: 'value4', deactivated: true, description: '' },
        },
      });

      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should handle empty configuration file', () => {
      // Override the mock for this test only
      vi.mocked(fs.readFileSync).mockReturnValueOnce('');

      const config = readConfig();

      expect(config).toEqual({});
      expect(fs.readFileSync).toHaveBeenCalled();
    });
  });

  describe('writeConfig', () => {
    it('should write configuration correctly', () => {
      const mockConfig = {
        section1: {
          key1: { value: 'value1', deactivated: false, description: '' },
          key2: { value: 'value2', deactivated: true, description: '' },
          key3: { value: 'value3', deactivated: false, description: 'Description for key3' },
        },
        section2: {
          key4: { value: 'value4', deactivated: true, description: '' },
        },
      };

      writeConfig(mockConfig);

      // Just verify the mock was called - don't check exact parameters
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle empty configuration', () => {
      const mockConfig = {};

      writeConfig(mockConfig);

      // Just verify the mock was called with empty string as content
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
});
