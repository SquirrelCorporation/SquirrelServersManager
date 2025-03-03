import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { AnsibleConfigService } from '../../services/ansible-config.service';
import { FileSystemService } from '../../../shell/services/file-system.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

describe('AnsibleConfigService', () => {
  let service: AnsibleConfigService;
  let fileSystemService: FileSystemService;

  const mockConfig = {
    defaults: {
      host_key_checking: {
        value: 'False',
        deactivated: false,
        description: 'Host key checking setting',
      },
      inventory: {
        value: '/etc/ansible/hosts',
        deactivated: true,
        description: 'Default inventory file',
      },
    },
    ssh_connection: {
      pipelining: {
        value: 'True',
        deactivated: false,
        description: 'SSH pipelining',
      },
    },
  };

  beforeEach(() => {
    fileSystemService = {
      test: vi.fn().mockReturnValue(true),
      createDirectory: vi.fn(),
      copyFile: vi.fn(),
    } as unknown as FileSystemService;

    (fs.readFileSync as any).mockReturnValue(`[defaults]
# Host key checking setting
host_key_checking=False
# Default inventory file
;inventory=/etc/ansible/hosts

[ssh_connection]
# SSH pipelining
pipelining=True
`);

    service = new AnsibleConfigService(fileSystemService);
  });

  describe('readConfig', () => {
    it('should read and parse the Ansible configuration file', () => {
      const config = service.readConfig();
      expect(config).toEqual(mockConfig);
      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should handle errors when reading the configuration file', () => {
      (fs.readFileSync as any).mockImplementation(() => {
        throw new Error('File read error');
      });

      expect(() => service.readConfig()).toThrow('Error reading Ansible configuration file');
    });
  });

  describe('writeConfig', () => {
    it('should write the configuration to file', () => {
      service.writeConfig(mockConfig);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle errors when writing the configuration file', () => {
      (fs.writeFileSync as any).mockImplementation(() => {
        throw new Error('File write error');
      });

      expect(() => service.writeConfig(mockConfig)).toThrow('Error writing Ansible configuration file');
    });
  });

  describe('createConfigEntry', () => {
    it('should create a new configuration entry', () => {
      vi.spyOn(service, 'readConfig').mockReturnValue({ ...mockConfig });
      vi.spyOn(service, 'writeConfig').mockImplementation(() => {});

      service.createConfigEntry('new_section', 'new_key', 'new_value', false, 'New description');
      
      expect(service.writeConfig).toHaveBeenCalledWith(expect.objectContaining({
        new_section: {
          new_key: {
            value: 'new_value',
            deactivated: false,
            description: 'New description',
          },
        },
      }));
    });

    it('should throw ForbiddenException for invalid section names', () => {
      expect(() => service.createConfigEntry('__proto__', 'key', 'value', false, '')).toThrow(ForbiddenException);
      expect(() => service.createConfigEntry('constructor', 'key', 'value', false, '')).toThrow(ForbiddenException);
      expect(() => service.createConfigEntry('prototype', 'key', 'value', false, '')).toThrow(ForbiddenException);
    });
  });

  describe('updateConfigEntry', () => {
    it('should update an existing configuration entry', () => {
      vi.spyOn(service, 'readConfig').mockReturnValue({ ...mockConfig });
      vi.spyOn(service, 'writeConfig').mockImplementation(() => {});

      service.updateConfigEntry('defaults', 'host_key_checking', 'True', true, 'Updated description');
      
      expect(service.writeConfig).toHaveBeenCalledWith(expect.objectContaining({
        defaults: expect.objectContaining({
          host_key_checking: {
            value: 'True',
            deactivated: true,
            description: 'Updated description',
          },
        }),
      }));
    });

    it('should throw ForbiddenException for invalid section names', () => {
      expect(() => service.updateConfigEntry('__proto__', 'key', 'value', false, '')).toThrow(ForbiddenException);
    });
  });

  describe('deleteConfigEntry', () => {
    it('should delete an existing configuration entry', () => {
      vi.spyOn(service, 'readConfig').mockReturnValue({ ...mockConfig });
      vi.spyOn(service, 'writeConfig').mockImplementation(() => {});

      service.deleteConfigEntry('defaults', 'host_key_checking');
      
      expect(service.writeConfig).toHaveBeenCalledWith(expect.objectContaining({
        defaults: {
          inventory: {
            value: '/etc/ansible/hosts',
            deactivated: true,
            description: 'Default inventory file',
          },
        },
      }));
    });

    it('should remove empty sections after deleting the last key', () => {
      vi.spyOn(service, 'readConfig').mockReturnValue({
        section_to_remove: {
          only_key: {
            value: 'value',
            deactivated: false,
            description: '',
          },
        },
      });
      vi.spyOn(service, 'writeConfig').mockImplementation(() => {});

      service.deleteConfigEntry('section_to_remove', 'only_key');
      
      expect(service.writeConfig).toHaveBeenCalledWith({});
    });

    it('should throw NotFoundException if section or key does not exist', () => {
      vi.spyOn(service, 'readConfig').mockReturnValue({ ...mockConfig });
      
      expect(() => service.deleteConfigEntry('non_existent', 'key')).toThrow(NotFoundException);
      expect(() => service.deleteConfigEntry('defaults', 'non_existent')).toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for invalid section names', () => {
      expect(() => service.deleteConfigEntry('__proto__', 'key')).toThrow(ForbiddenException);
    });
  });
});
