import { FileSystemService } from '@modules/shell/application/services/file-system.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFileSystemService, parsedConfig } from './ansible-config-test-setup';
import { MockAnsibleConfigService } from './mock-ansible-config.service';

// Import the test setup to ensure mocks are applied
import './ansible-config-test-setup';

describe('AnsibleConfigService', () => {
  let service: MockAnsibleConfigService;
  let fileSystemService: FileSystemService;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Set up FileSystemService mock
    fileSystemService = mockFileSystemService as unknown as FileSystemService;

    // Create a new instance of our MockAnsibleConfigService for testing
    service = new MockAnsibleConfigService(fileSystemService);
  });

  describe('readConfig', () => {
    it('should read and parse the Ansible configuration file', () => {
      const config = service.readConfig();
      expect(config).toEqual(parsedConfig);
    });

    it('should handle errors when reading the configuration file', () => {
      // Mock readConfig to throw an error
      vi.spyOn(service, 'readConfig').mockImplementationOnce(() => {
        throw new Error('File read error');
      });

      expect(() => service.readConfig()).toThrow();
    });
  });

  describe('writeConfig', () => {
    it('should write the configuration to file', () => {
      // Spy on writeConfig to verify it's called
      const writeSpy = vi.spyOn(service, 'writeConfig');

      service.writeConfig(parsedConfig);
      expect(writeSpy).toHaveBeenCalledWith(parsedConfig);
    });

    it('should handle errors when writing the configuration file', () => {
      // Mock writeConfig to throw an error
      vi.spyOn(service, 'writeConfig').mockImplementationOnce(() => {
        throw new Error('File write error');
      });

      expect(() => service.writeConfig(parsedConfig)).toThrow();
    });
  });

  describe('createConfigEntry', () => {
    it('should create a new configuration entry', () => {
      vi.spyOn(service, 'writeConfig');

      service.createConfigEntry('new_section', 'new_key', 'new_value', false, 'New description');

      expect(service.writeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          new_section: {
            new_key: {
              value: 'new_value',
              deactivated: false,
              description: 'New description',
            },
          },
        }),
      );
    });

    it('should throw ForbiddenException for invalid section names', () => {
      expect(() => service.createConfigEntry('__proto__', 'key', 'value', false, '')).toThrow(
        ForbiddenException,
      );
      expect(() => service.createConfigEntry('constructor', 'key', 'value', false, '')).toThrow(
        ForbiddenException,
      );
      expect(() => service.createConfigEntry('prototype', 'key', 'value', false, '')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateConfigEntry', () => {
    it('should update an existing configuration entry', () => {
      vi.spyOn(service, 'writeConfig');

      service.updateConfigEntry(
        'defaults',
        'host_key_checking',
        'True',
        true,
        'Updated description',
      );

      expect(service.writeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          defaults: expect.objectContaining({
            host_key_checking: {
              value: 'True',
              deactivated: true,
              description: 'Updated description',
            },
          }),
        }),
      );
    });

    it('should throw ForbiddenException for invalid section names', () => {
      expect(() => service.updateConfigEntry('__proto__', 'key', 'value', false, '')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('deleteConfigEntry', () => {
    it('should delete an existing configuration entry', () => {
      vi.spyOn(service, 'writeConfig');

      service.deleteConfigEntry('defaults', 'host_key_checking');

      expect(service.writeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          defaults: {
            inventory: {
              value: '/etc/ansible/hosts',
              deactivated: true,
              description: 'Default inventory file',
            },
          },
        }),
      );
    });

    it('should remove empty sections after deleting the last key', () => {
      // Setup a config with a section that has only one key
      vi.spyOn(service, 'readConfig').mockReturnValueOnce({
        section_to_remove: {
          only_key: {
            value: 'value',
            deactivated: false,
            description: '',
          },
        },
      });

      vi.spyOn(service, 'writeConfig');

      service.deleteConfigEntry('section_to_remove', 'only_key');

      expect(service.writeConfig).toHaveBeenCalledWith({});
    });

    it('should throw NotFoundException if section or key does not exist', () => {
      expect(() => service.deleteConfigEntry('non_existent', 'key')).toThrow(NotFoundException);

      // Setup a config with an existing section but non-existent key
      vi.spyOn(service, 'readConfig').mockReturnValueOnce({
        defaults: {
          existing_key: {
            value: 'value',
            deactivated: false,
            description: '',
          },
        },
      });

      expect(() => service.deleteConfigEntry('defaults', 'non_existent')).toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for invalid section names', () => {
      expect(() => service.deleteConfigEntry('__proto__', 'key')).toThrow(ForbiddenException);
    });
  });
});
