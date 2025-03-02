import { SsmAnsible } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AnsibleTaskRepo from '../../../../data/database/repository/AnsibleTaskRepo';
import DeviceAuthRepo from '../../../../data/database/repository/DeviceAuthRepo';
import ansibleCmd from '../../../../modules/ansible/AnsibleCmd';
import AnsibleGalaxyCmd from '../../../../modules/ansible/AnsibleGalaxyCmd';
import Inventory from '../../../../modules/ansible/utils/InventoryTransformer';
import { AnsibleCommandService } from '../../services/ansible-command.service';
import { ShellWrapperService } from '../../services/shell-wrapper.service';
import { SshKeyService } from '../../services/ssh-key.service';

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

vi.mock('../../../../data/database/repository/AnsibleTaskRepo', () => ({
  default: {
    create: vi.fn().mockResolvedValue({ id: 1 }),
  },
}));

vi.mock('../../../../data/database/repository/DeviceAuthRepo', () => ({
  default: {
    findManyByDevicesUuid: vi.fn(),
  },
}));

vi.mock('../../../../modules/ansible/utils/InventoryTransformer', () => ({
  default: {
    inventoryBuilderForTarget: vi.fn(),
  },
}));

describe('AnsibleCommandService', () => {
  let service: AnsibleCommandService;
  let shellWrapperService: ShellWrapperService;
  let sshKeyService: SshKeyService;

  const mockExecResult = {
    stdout: 'stdout content',
    stderr: 'stderr content',
    code: 0,
    toString: () => 'stdout content',
  };

  const mockChildProcess = {
    stdout: {
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('mock-exec-id');
        }
        return mockChildProcess.stdout;
      }),
    },
    on: vi.fn().mockImplementation((event, callback) => {
      if (event === 'exit') {
        // Don't call the callback to simulate process still running
      }
      return mockChildProcess;
    }),
  };

  beforeEach(async () => {
    shellWrapperService = {
      exec: vi.fn().mockReturnValue(mockExecResult),
      cd: vi.fn(),
      rm: vi.fn(),
    } as unknown as ShellWrapperService;

    sshKeyService = {
      removeAnsibleTemporaryPrivateKey: vi.fn(),
      removeAllAnsibleExecTemporaryPrivateKeys: vi.fn(),
    } as unknown as SshKeyService;

    service = new AnsibleCommandService(shellWrapperService, sshKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeCommand', () => {
    it('should execute a command and return stdout and stderr', () => {
      const result = service.executeCommand('test command');
      expect(shellWrapperService.exec).toHaveBeenCalledWith('test command');
      expect(result).toEqual({
        stdout: 'stdout content',
        stderr: 'stderr content',
      });
    });

    it('should throw an error if command execution fails', () => {
      vi.spyOn(shellWrapperService, 'exec').mockImplementation(() => {
        throw new Error('Command failed');
      });

      expect(() => service.executeCommand('test command')).toThrow('Command failed');
    });
  });

  describe('executeAnsibleCommand', () => {
    it('should execute an ansible command and return stdout, stderr, and exit code', () => {
      const result = service.executeAnsibleCommand('ansible test command');
      expect(shellWrapperService.exec).toHaveBeenCalledWith('ansible test command');
      expect(result).toEqual({
        stdout: 'stdout content',
        stderr: 'stderr content',
        exitCode: 0,
      });
    });

    it('should throw an error if ansible command execution fails', () => {
      vi.spyOn(shellWrapperService, 'exec').mockImplementation(() => {
        throw new Error('Ansible command failed');
      });

      expect(() => service.executeAnsibleCommand('ansible test command')).toThrow(
        'Ansible command failed',
      );
    });
  });

  describe('executePlaybookSimple', () => {
    it('should execute a playbook command', () => {
      const result = service.executePlaybookSimple('playbook command');
      expect(shellWrapperService.exec).toHaveBeenCalledWith('playbook command');
      expect(result).toEqual(mockExecResult);
    });

    it('should throw an error if playbook execution fails', () => {
      vi.spyOn(shellWrapperService, 'exec').mockImplementation(() => {
        throw new Error('Playbook execution failed');
      });

      expect(() => service.executePlaybookSimple('playbook command')).toThrow(
        'Playbook execution failed',
      );
    });
  });

  describe('executePlaybookOnInventory', () => {
    it('should execute a playbook on a specific inventory', async () => {
      // Mock the executePlaybookOnInventoryFull method
      vi.spyOn(service, 'executePlaybookOnInventoryFull').mockResolvedValue('mock-exec-id');

      const mockUser = { id: 1 } as any;
      const mockInventoryTargets = { _meta: { hostvars: {}, all: {} } };

      const result = await service.executePlaybookOnInventory(
        'playbook.yml',
        mockUser,
        mockInventoryTargets,
      );

      expect(service.executePlaybookOnInventoryFull).toHaveBeenCalledWith(
        'playbook.yml',
        mockUser,
        mockInventoryTargets,
        undefined,
        SsmAnsible.ExecutionMode.APPLY,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual('mock-exec-id');
    });

    it('should throw an error if playbook execution on inventory fails', async () => {
      // Mock the executePlaybookOnInventoryFull method to throw an error
      vi.spyOn(service, 'executePlaybookOnInventoryFull').mockImplementation(() => {
        throw new Error('Playbook execution on inventory failed');
      });

      const mockUser = { id: 1 } as any;

      await expect(service.executePlaybookOnInventory('playbook.yml', mockUser)).rejects.toThrow(
        'Playbook execution on inventory failed',
      );
    });
  });

  describe('getAnsibleVersion', () => {
    it('should return the ansible version', async () => {
      const result = await service.getAnsibleVersion();
      expect(shellWrapperService.exec).toHaveBeenCalledWith('ansible --version');
      expect(result).toEqual('stdout content');
    });

    it('should throw an error if getting ansible version fails', async () => {
      vi.spyOn(shellWrapperService, 'exec').mockImplementation(() => {
        throw new Error('Get ansible version failed');
      });

      await expect(service.getAnsibleVersion()).rejects.toThrow('Get ansible version failed');
    });
  });

  describe('getAnsibleRunnerVersion', () => {
    it('should return the ansible runner version', async () => {
      const result = await service.getAnsibleRunnerVersion();
      expect(shellWrapperService.exec).toHaveBeenCalledWith('ansible-runner --version');
      expect(result).toEqual('stdout content');
    });

    it('should throw an error if getting ansible runner version fails', async () => {
      vi.spyOn(shellWrapperService, 'exec').mockImplementation(() => {
        throw new Error('Get ansible runner version failed');
      });

      await expect(service.getAnsibleRunnerVersion()).rejects.toThrow(
        'Get ansible runner version failed',
      );
    });
  });

  describe('installAnsibleGalaxyCollection', () => {
    beforeEach(() => {
      vi.spyOn(AnsibleCommandService, 'timeout').mockResolvedValue(undefined);

      // Mock the sequence of calls for the installation process
      vi.spyOn(shellWrapperService, 'exec')
        .mockReturnValueOnce({ ...mockExecResult, code: 0 }) // First call - install command
        .mockReturnValueOnce(mockExecResult) // Second call - list command
        .mockReturnValueOnce({ ...mockExecResult, stdout: 'namespace.name' }); // Third call - cat command

      vi.spyOn(AnsibleGalaxyCmd, 'getInstallCollectionCmd').mockReturnValue(
        'ansible-galaxy collection install namespace.name',
      );
      vi.spyOn(AnsibleGalaxyCmd, 'getListCollectionsCmd').mockReturnValue(
        'ansible-galaxy collection list namespace.name',
      );
    });

    it('should install an ansible galaxy collection', async () => {
      await service.installAnsibleGalaxyCollection('name', 'namespace');

      expect(AnsibleGalaxyCmd.getInstallCollectionCmd).toHaveBeenCalledWith('name', 'namespace');
      expect(AnsibleGalaxyCmd.getListCollectionsCmd).toHaveBeenCalledWith('name', 'namespace');
      expect(shellWrapperService.exec).toHaveBeenCalledWith(
        'ansible-galaxy collection install namespace.name',
      );
    });

    it('should throw an error if installation fails', async () => {
      vi.spyOn(shellWrapperService, 'exec').mockReturnValueOnce({ ...mockExecResult, code: 1 }); // Failed installation

      await expect(service.installAnsibleGalaxyCollection('name', 'namespace')).rejects.toThrow(
        'installAnsibleGalaxyCollection has failed',
      );
    });

    it('should throw an error if collection verification fails', async () => {
      vi.spyOn(shellWrapperService, 'exec')
        .mockReturnValueOnce({ ...mockExecResult, code: 0 }) // Successful installation
        .mockReturnValueOnce(mockExecResult) // Second call - list command
        .mockReturnValueOnce({ ...mockExecResult, stdout: 'different.collection' }); // Failed verification

      await expect(service.installAnsibleGalaxyCollection('name', 'namespace')).rejects.toThrow(
        'installAnsibleGalaxyCollection has failed',
      );
    });
  });

  describe('executeAnsiblePlaybook', () => {
    const mockUser = { id: 1 } as any;
    const mockTarget = ['device-uuid'];
    const mockExtraVars = { var1: 'value1' };
    const mockInventoryTargets = { _meta: { hostvars: {}, all: {} } };

    beforeEach(() => {
      DeviceAuthRepo.findManyByDevicesUuid = vi
        .fn()
        .mockResolvedValue([{ getDevice: () => ({ uuid: 'device-uuid' }) }]);
      Inventory.inventoryBuilderForTarget = vi.fn().mockResolvedValue(mockInventoryTargets);

      // Mock the executePlaybookFull method
      vi.spyOn(service, 'executePlaybookFull').mockResolvedValue('execution-result');
    });

    it('should execute an ansible playbook with target devices', async () => {
      const result = await service.executeAnsiblePlaybook(
        'playbook.yml',
        mockUser,
        mockTarget,
        mockExtraVars,
        SsmAnsible.ExecutionMode.APPLY,
        'exec-uuid',
      );

      expect(DeviceAuthRepo.findManyByDevicesUuid).toHaveBeenCalledWith(mockTarget);
      expect(service.executePlaybookFull).toHaveBeenCalledWith(
        'playbook.yml',
        mockUser,
        mockTarget,
        mockExtraVars,
        SsmAnsible.ExecutionMode.APPLY,
        'exec-uuid',
        undefined,
      );
      expect(result).toEqual('execution-result');
    });

    it('should throw an error if device authentication is not found', async () => {
      DeviceAuthRepo.findManyByDevicesUuid = vi.fn().mockResolvedValue([]);

      await expect(
        service.executeAnsiblePlaybook('playbook.yml', mockUser, mockTarget),
      ).rejects.toThrow(/Device Authentication not found/);
    });

    it('should generate a UUID if not provided', async () => {
      const result = await service.executeAnsiblePlaybook('playbook.yml', mockUser, mockTarget);

      expect(service.executePlaybookFull).toHaveBeenCalledWith(
        'playbook.yml',
        mockUser,
        mockTarget,
        undefined,
        SsmAnsible.ExecutionMode.APPLY,
        expect.any(String),
        undefined,
      );
      expect(result).toEqual('execution-result');
    });

    it('should execute without device authentication check if no target is provided', async () => {
      const result = await service.executeAnsiblePlaybook('playbook.yml', mockUser);

      expect(DeviceAuthRepo.findManyByDevicesUuid).not.toHaveBeenCalled();
      expect(service.executePlaybookFull).toHaveBeenCalledWith(
        'playbook.yml',
        mockUser,
        undefined,
        undefined,
        SsmAnsible.ExecutionMode.APPLY,
        expect.any(String),
        undefined,
      );
      expect(result).toEqual('execution-result');
    });
  });

  describe('executePlaybookOnInventoryFull', () => {
    const mockUser = { id: 1 } as any;
    const mockInventoryTargets = { _meta: { hostvars: {}, all: {} } };
    const mockExtraVars = { var1: 'value1' };
    const mockTarget = ['device-uuid'];

    beforeEach(() => {
      vi.spyOn(ansibleCmd, 'buildAnsibleCmd').mockReturnValue('ansible-playbook command');
      vi.spyOn(shellWrapperService, 'exec').mockReturnValueOnce(mockChildProcess as any);
      vi.spyOn(AnsibleTaskRepo, 'create').mockResolvedValue({ id: 1 });
    });

    it('should execute a playbook on inventory and return execution id', async () => {
      const result = await service.executePlaybookOnInventoryFull(
        'playbook.yml',
        mockUser,
        mockInventoryTargets,
        mockExtraVars,
        SsmAnsible.ExecutionMode.APPLY,
        mockTarget,
        'exec-uuid',
      );

      expect(shellWrapperService.cd).toHaveBeenCalled();
      expect(shellWrapperService.rm).toHaveBeenCalledTimes(2);
      expect(ansibleCmd.buildAnsibleCmd).toHaveBeenCalledWith(
        'playbook.yml',
        'exec-uuid',
        mockInventoryTargets,
        mockUser,
        mockExtraVars,
        SsmAnsible.ExecutionMode.APPLY,
        undefined,
      );
      expect(shellWrapperService.exec).toHaveBeenCalledWith('ansible-playbook command', {
        async: true,
      });
      expect(AnsibleTaskRepo.create).toHaveBeenCalledWith({
        ident: 'exec-uuid',
        status: 'created',
        cmd: 'playbook playbook.yml',
        target: mockTarget,
      });
      expect(result).toEqual('mock-exec-id');
    });

    it('should throw an error and clean up if execution fails', async () => {
      vi.spyOn(shellWrapperService, 'exec').mockImplementation(() => {
        throw new Error('Execution failed');
      });

      await expect(
        service.executePlaybookOnInventoryFull(
          'playbook.yml',
          mockUser,
          mockInventoryTargets,
          mockExtraVars,
          SsmAnsible.ExecutionMode.APPLY,
          mockTarget,
          'exec-uuid',
        ),
      ).rejects.toThrow('Execution failed');

      expect(sshKeyService.removeAnsibleTemporaryPrivateKey).toHaveBeenCalled();
    });

    it('should throw an error if result is null', async () => {
      // Mock child process to resolve with null
      const mockNullChildProcess = {
        stdout: {
          on: vi.fn().mockImplementation((event, callback) => {
            return mockNullChildProcess.stdout;
          }),
        },
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === 'exit') {
            callback();
          }
          return mockNullChildProcess;
        }),
      };

      vi.spyOn(shellWrapperService, 'exec').mockReturnValueOnce(mockNullChildProcess as any);

      await expect(
        service.executePlaybookOnInventoryFull('playbook.yml', mockUser, mockInventoryTargets),
      ).rejects.toThrow('Exec failed');
    });
  });
});
