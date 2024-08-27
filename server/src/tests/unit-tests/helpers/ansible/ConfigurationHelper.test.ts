import fs from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readConfig, writeConfig } from '../../../../helpers/ansible/AnsibleConfigurationHelper'; // Update the path

vi.mock('fs');

const CONFIG_FILE = '/config/ansible/ansible.cfg';

const mockFsReadFileSync = vi.spyOn(fs, 'readFileSync');
const mockFsWriteFileSync = vi.spyOn(fs, 'writeFileSync');

describe('Configuration Utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('readConfig', () => {
    it('should read configuration correctly', () => {
      const mockFileContent = `
        [section1]
        key1=value1
        ;key2=value2
        # Description for key3
        key3=value3

        [section2]
        ;key4=value4
      `;
      mockFsReadFileSync.mockReturnValue(mockFileContent);

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

      expect(mockFsReadFileSync).toHaveBeenCalledWith(CONFIG_FILE, 'utf-8');
    });

    it('should handle empty configuration file', () => {
      const mockFileContent = '';
      mockFsReadFileSync.mockReturnValue(mockFileContent);

      const config = readConfig();

      expect(config).toEqual({});
      expect(mockFsReadFileSync).toHaveBeenCalledWith(CONFIG_FILE, 'utf-8');
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

      const expectedFileContent = `[section1]
key1=value1
;key2=value2
# Description for key3
key3=value3

[section2]
;key4=value4
`;

      expect(mockFsWriteFileSync).toHaveBeenCalledWith(CONFIG_FILE, expectedFileContent, 'utf-8');
    });

    it('should handle empty configuration', () => {
      const mockConfig = {};

      writeConfig(mockConfig);

      expect(mockFsWriteFileSync).toHaveBeenCalledWith(CONFIG_FILE, '', 'utf-8');
    });
  });
});
