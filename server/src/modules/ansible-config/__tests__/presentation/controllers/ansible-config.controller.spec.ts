import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleConfigController } from '../../../presentation/controllers/ansible-config.controller';
import { AnsibleConfigService } from '../../../application/services/ansible-config.service';

describe('AnsibleConfigController', () => {
  let controller: AnsibleConfigController;
  let service: AnsibleConfigService;

  const mockConfig = {
    defaults: {
      host_key_checking: {
        value: 'False',
        deactivated: false,
        description: 'Host key checking setting',
      },
    },
  };

  beforeEach(() => {
    service = {
      readConfig: vi.fn().mockReturnValue(mockConfig),
      createConfigEntry: vi.fn(),
      updateConfigEntry: vi.fn(),
      deleteConfigEntry: vi.fn(),
    } as unknown as AnsibleConfigService;

    controller = new AnsibleConfigController(service);
  });

  describe('getConfiguration', () => {
    it('should return the Ansible configuration', () => {
      controller.getConfiguration();

      expect(service.readConfig).toHaveBeenCalled();
    });
  });

  describe('createConfigEntry', () => {
    it('should create a new configuration entry', () => {
      const configDto = {
        section: 'defaults',
        key: 'new_key',
        value: 'new_value',
        deactivated: false,
        description: 'New description',
      };

      controller.createConfigEntry(configDto);

      expect(service.createConfigEntry).toHaveBeenCalledWith(
        'defaults',
        'new_key',
        'new_value',
        false,
        'New description',
      );
    });
  });

  describe('updateConfigEntry', () => {
    it('should update an existing configuration entry', () => {
      const configDto = {
        section: 'defaults',
        key: 'host_key_checking',
        value: 'True',
        deactivated: true,
        description: 'Updated description',
      };

      controller.updateConfigEntry(configDto);

      expect(service.updateConfigEntry).toHaveBeenCalledWith(
        'defaults',
        'host_key_checking',
        'True',
        true,
        'Updated description',
      );
    });
  });

  describe('deleteConfigEntry', () => {
    it('should delete a configuration entry', () => {
      const deleteDto = {
        section: 'defaults',
        key: 'host_key_checking',
      };

      controller.deleteConfigEntry(deleteDto);

      expect(service.deleteConfigEntry).toHaveBeenCalledWith('defaults', 'host_key_checking');
    });
  });
});
