import { SsmAnsible } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShellWrapperService, SshKeyService } from '../../../../shell';
import { AnsibleCommandBuilderService } from '../../../application/services/ansible-command-builder.service';
import { AnsibleCommandService } from '../../../application/services/ansible-command.service';
import { AnsibleGalaxyCommandService } from '../../../application/services/ansible-galaxy-command.service';
import { InventoryTransformerService } from '../../../application/services/inventory-transformer.service';
import Inventory from '../../../utils/InventoryTransformer';

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

vi.mock('../../utils/InventoryTransformer', () => ({
  default: {
    inventoryBuilderForTarget: vi.fn().mockImplementation(() => {
      return {
        _meta: { hostvars: {} },
        all: { children: [] },
      };
    }),
  },
}));

describe('AnsibleCommandService', () => {
  let service: AnsibleCommandService;
  let mockShellWrapper: any;
  let mockSshKeyService: any;
  let mockAnsibleCommandBuilder: any;
  let mockAnsibleGalaxyCommand: any;
  let mockInventoryTransformer: any;
  let mockDeviceAuthRepository: any;
  let mockAnsibleTaskRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockShellWrapper = {
      exec: vi.fn().mockReturnValue({
        stdout: 'stdout',
        stderr: 'stderr',
        code: 0,
      }),
      cd: vi.fn(),
      rm: vi.fn(),
    };

    mockSshKeyService = {
      genAnsibleTemporaryPrivateKey: vi.fn().mockResolvedValue('/tmp/key'),
      removeAnsibleTemporaryPrivateKey: vi.fn(),
      removeAllAnsibleExecTemporaryPrivateKeys: vi.fn(),
    };

    mockAnsibleCommandBuilder = {
      buildAnsibleCmd: vi.fn().mockReturnValue('ansible-command'),
    };

    mockAnsibleGalaxyCommand = {
      getInstallCollectionCmd: vi.fn().mockReturnValue('galaxy-install-command'),
      getListCollectionsCmd: vi.fn().mockReturnValue('galaxy-list-command'),
    };

    mockInventoryTransformer = {
      inventoryBuilderForTarget: vi.fn().mockResolvedValue({
        all: {},
        device123: { hosts: '192.168.1.1' },
      }),
    };

    mockDeviceAuthRepository = {
      findManyByDevicesUuid: vi.fn().mockResolvedValue([
        { device: { uuid: 'device-123', ip: '192.168.1.1' } },
      ]),
    };

    mockAnsibleTaskRepository = {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    };

    service = new AnsibleCommandService(
      mockShellWrapper,
      mockSshKeyService,
      mockAnsibleCommandBuilder,
      mockAnsibleGalaxyCommand,
      mockInventoryTransformer,
      mockDeviceAuthRepository,
      mockAnsibleTaskRepository
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeCommand', () => {
    it('should execute a command and return stdout and stderr', () => {
      const result = service.executeCommand('test-command');
      expect(mockShellWrapper.exec).toHaveBeenCalledWith('test-command');
      expect(result).toEqual({ stdout: 'stdout', stderr: 'stderr' });
    });

    it('should throw an error if the command fails', () => {
      mockShellWrapper.exec.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });

      expect(() => service.executeCommand('test-command')).toThrow('Command failed');
    });
  });

  describe('executeAnsibleCommand', () => {
    it('should execute an ansible command and return stdout, stderr, and exit code', () => {
      const result = service.executeAnsibleCommand('test-command');
      expect(mockShellWrapper.exec).toHaveBeenCalledWith('test-command');
      expect(result).toEqual({ stdout: 'stdout', stderr: 'stderr', exitCode: 0 });
    });

    it('should throw an error if the command fails', () => {
      mockShellWrapper.exec.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });

      expect(() => service.executeAnsibleCommand('test-command')).toThrow('Command failed');
    });
  });

  describe('executePlaybookFull', () => {
    it('should execute a playbook with target devices', async () => {
      const user = { apiKey: 'test-api-key' };
      const target = ['device-123'];

      const mockChildProcess = {
        on: vi.fn(),
        stdout: {
          on: vi.fn().mockImplementation((event, callback) => {
            if (event === 'data') {
              callback('Execution started');
            }
          }),
        },
      };

      mockShellWrapper.exec.mockReturnValueOnce(mockChildProcess);

      const result = await service.executePlaybookFull('test-playbook.yml', user, target);

      expect(mockDeviceAuthRepository.findManyByDevicesUuid).toHaveBeenCalledWith(target);
      expect(mockInventoryTransformer.inventoryBuilderForTarget).toHaveBeenCalled();
      expect(mockAnsibleCommandBuilder.buildAnsibleCmd).toHaveBeenCalled();
      expect(mockShellWrapper.exec).toHaveBeenCalled();
      expect(mockAnsibleTaskRepository.create).toHaveBeenCalled();
      expect(result).toBe('Execution started');
    });
  });
});
