import { RemoteSystemInformationService } from '@modules/remote-system-information/application/services/remote-system-information.service';
import { RemoteSystemInformationEngineService } from '@modules/remote-system-information/application/services/engine/remote-system-information-engine.service';
import { IDeviceAuthService, IDevicesService } from '@modules/devices';
import { DEFAULT_VAULT_ID, IVaultCryptoService } from '@modules/ansible-vaults';
import { Logger, NotFoundException } from '@nestjs/common';
import { Mock, vi } from 'vitest';
import { SSHCredentialsAdapter } from '@infrastructure/adapters/ssh/ssh-credentials.adapter';
import { IDevice } from '@modules/devices/domain/entities/device.entity';
import { SSHExecutor } from '@modules/remote-system-information/application/services/remote-ssh-executor.service';
import { PreCheckRemoteSystemInformationDto } from '@modules/remote-system-information/presentation/dtos/pre-check-remote-system-information.dto';
import { SsmAnsible } from 'ssm-shared-lib';

// --- Define Enums Locally as Workaround ---
export enum SSHType {
  PASSWORD = 'password',
  KEY_FILE = 'key_file',
}

export enum AnsibleBecomeMethod {
  SUDO = 'sudo',
  SU = 'su',
  PFEXEC = 'pfexec',
  DOAS = 'doas',
  DZDO = 'dzdo',
  PMSET = 'pmset',
  RUNAS = 'runas',
  ENABLE = 'enable',
  MACHINECTL = 'machinectl',
}
// --- End Local Enum Definitions ---

// Hoisted mock for static method
const hoistedMocks = vi.hoisted(() => {
  return {
    mockStaticTestConnection: vi.fn(),
  };
});

// Mock SSHCredentialsAdapter using the ALIAS path
vi.mock('@infrastructure/adapters/ssh/ssh-credentials.adapter', () => ({
  SSHCredentialsAdapter: vi.fn(() => ({
    getSShConnection: vi.fn(),
  })),
}));

// Mock SSHExecutor
vi.mock(
  '@modules/remote-system-information/application/services/remote-ssh-executor.service',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@modules/remote-system-information/application/services/remote-ssh-executor.service')
      >();
    actual.SSHExecutor.testConnection = hoistedMocks.mockStaticTestConnection;
    return { ...actual };
  },
);

describe('RemoteSystemInformationService', () => {
  let service: RemoteSystemInformationService;
  let mockEngineService: Partial<RemoteSystemInformationEngineService>;
  let mockDevicesService: Partial<IDevicesService>;
  let mockDeviceAuthService: Partial<IDeviceAuthService>;
  let mockVaultCryptoService: Partial<IVaultCryptoService>;
  let mockSshCredentialsAdapterInstance: Partial<SSHCredentialsAdapter>;

  beforeEach(() => {
    vi.clearAllMocks();
    hoistedMocks.mockStaticTestConnection.mockClear();

    mockEngineService = {
      init: vi.fn(),
      registerWatcher: vi.fn(),
      registerWatchers: vi.fn(),
      deregisterAll: vi.fn(),
    };

    mockDevicesService = {
      findOneByUuid: vi.fn(),
    };

    mockDeviceAuthService = {
      findDeviceAuthByDevice: vi.fn(),
    };

    mockVaultCryptoService = {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    };

    mockSshCredentialsAdapterInstance = {
      getSShConnection: vi.fn(),
    };

    vi.mocked(SSHCredentialsAdapter).mockImplementation(
      () => mockSshCredentialsAdapterInstance as SSHCredentialsAdapter,
    );

    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    service = new RemoteSystemInformationService(
      mockEngineService as RemoteSystemInformationEngineService,
      mockDevicesService as IDevicesService,
      mockDeviceAuthService as IDeviceAuthService,
      mockVaultCryptoService as IVaultCryptoService,
    );

    (mockEngineService.init as Mock).mockResolvedValue(undefined);
    (mockDevicesService.findOneByUuid as Mock).mockResolvedValue(null);
    (mockDeviceAuthService.findDeviceAuthByDevice as Mock).mockResolvedValue(null);
    (mockSshCredentialsAdapterInstance.getSShConnection as Mock).mockResolvedValue({} as any);
    hoistedMocks.mockStaticTestConnection.mockResolvedValue(undefined);
    (mockVaultCryptoService.encrypt as Mock).mockImplementation(
      async (data) => `encrypted-${data}`,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit and init', () => {
    it('should call engineService.init on module initialization', async () => {
      (mockEngineService.init as Mock).mockClear();
      (mockEngineService.init as Mock).mockResolvedValue(undefined);
      await service.onModuleInit();
      expect(mockEngineService.init).toHaveBeenCalledTimes(1);
    });

    it('should call engineService.init when init is called directly', async () => {
      (mockEngineService.init as Mock).mockClear();
      (mockEngineService.init as Mock).mockResolvedValue(undefined);
      await service.init();
      expect(mockEngineService.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerWatcher', () => {
    it('should call engineService.registerWatcher with the device', async () => {
      const mockDevice = { uuid: 'test-uuid' } as IDevice;
      (mockEngineService.registerWatcher as Mock).mockClear();
      await service.registerWatcher(mockDevice);
      expect(mockEngineService.registerWatcher).toHaveBeenCalledTimes(1);
      expect(mockEngineService.registerWatcher).toHaveBeenCalledWith(mockDevice);
    });

    it('should log and rethrow error if engineService.registerWatcher fails', async () => {
      const mockDevice = { uuid: 'test-uuid' } as IDevice;
      const error = new Error('Register failed');
      (mockEngineService.registerWatcher as Mock).mockRejectedValueOnce(error);
      await expect(service.registerWatcher(mockDevice)).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        error,
        `Failed to register watcher for device ${mockDevice.uuid}:`,
      );
    });
  });

  describe('deregisterAll', () => {
    it('should call engineService.deregisterAll', async () => {
      (mockEngineService.deregisterAll as Mock).mockClear();
      await service.deregisterAll();
      expect(mockEngineService.deregisterAll).toHaveBeenCalledTimes(1);
    });

    it('should log and rethrow error if engineService.deregisterAll fails', async () => {
      const error = new Error('Deregister failed');
      (mockEngineService.deregisterAll as Mock).mockRejectedValueOnce(error);
      await expect(service.deregisterAll()).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        error,
        'Failed to deregister all components:',
      );
    });
  });

  describe('testConnection', () => {
    const uuid = 'test-uuid';
    const mockDevice = { uuid } as IDevice;
    const mockDeviceAuth = { authType: 'sshKey' };
    const mockConnectionDetails = { host: '1.2.3.4' };

    it('should return successful status if connection works', async () => {
      (mockDevicesService.findOneByUuid as Mock).mockResolvedValue(mockDevice);
      (mockDeviceAuthService.findDeviceAuthByDevice as Mock).mockResolvedValue(mockDeviceAuth);
      (mockSshCredentialsAdapterInstance.getSShConnection as Mock).mockResolvedValue(
        mockConnectionDetails,
      );
      hoistedMocks.mockStaticTestConnection.mockResolvedValue(undefined);

      const result = await service.testConnection(uuid);

      expect(mockDevicesService.findOneByUuid).toHaveBeenCalledWith(uuid);
      expect(mockDeviceAuthService.findDeviceAuthByDevice).toHaveBeenCalledWith(mockDevice);
      expect(mockSshCredentialsAdapterInstance.getSShConnection).toHaveBeenCalledWith(
        mockDevice,
        mockDeviceAuth,
      );
      expect(SSHExecutor.testConnection).toHaveBeenCalledWith(mockConnectionDetails);
      expect(result).toEqual({ connectionStatus: 'successful' });
    });

    it('should return failed status if device not found', async () => {
      (mockDevicesService.findOneByUuid as Mock).mockResolvedValue(null);

      const result = await service.testConnection(uuid);

      expect(result).toEqual({
        connectionStatus: 'failed',
        errorMessage: `Device with UUID ${uuid} not found`,
      });
      expect(mockDeviceAuthService.findDeviceAuthByDevice).not.toHaveBeenCalled();
      expect(mockSshCredentialsAdapterInstance.getSShConnection).not.toHaveBeenCalled();
      expect(SSHExecutor.testConnection).not.toHaveBeenCalled();
      expect(Logger.prototype.error).toHaveBeenCalledWith(expect.any(NotFoundException));
    });

    it('should return failed status if device auth not found', async () => {
      (mockDevicesService.findOneByUuid as Mock).mockResolvedValue(mockDevice);
      (mockDeviceAuthService.findDeviceAuthByDevice as Mock).mockResolvedValue(null);

      const result = await service.testConnection(uuid);

      expect(result).toEqual({
        connectionStatus: 'failed',
        errorMessage: `Device auth with UUID ${uuid} not found`,
      });
      expect(mockSshCredentialsAdapterInstance.getSShConnection).not.toHaveBeenCalled();
      expect(SSHExecutor.testConnection).not.toHaveBeenCalled();
      expect(Logger.prototype.error).toHaveBeenCalledWith(expect.any(NotFoundException));
    });

    it('should return failed status if getSShConnection throws', async () => {
      const error = new Error('SSH connection failed');
      (mockDevicesService.findOneByUuid as Mock).mockResolvedValue(mockDevice);
      (mockDeviceAuthService.findDeviceAuthByDevice as Mock).mockResolvedValue(mockDeviceAuth);
      (mockSshCredentialsAdapterInstance.getSShConnection as Mock).mockRejectedValue(error);

      const result = await service.testConnection(uuid);

      expect(SSHExecutor.testConnection).not.toHaveBeenCalled();
      expect(result).toEqual({ connectionStatus: 'failed', errorMessage: error.message });
      expect(Logger.prototype.error).toHaveBeenCalledWith(error);
    });

    it('should return failed status if SSHExecutor.testConnection throws', async () => {
      const error = new Error('Static test failed');
      (mockDevicesService.findOneByUuid as Mock).mockResolvedValue(mockDevice);
      (mockDeviceAuthService.findDeviceAuthByDevice as Mock).mockResolvedValue(mockDeviceAuth);
      (mockSshCredentialsAdapterInstance.getSShConnection as Mock).mockResolvedValue(
        mockConnectionDetails,
      );
      hoistedMocks.mockStaticTestConnection.mockRejectedValue(error);

      const result = await service.testConnection(uuid);

      expect(SSHExecutor.testConnection).toHaveBeenCalledWith(mockConnectionDetails);
      expect(result).toEqual({ connectionStatus: 'failed', errorMessage: error.message });
      expect(Logger.prototype.error).toHaveBeenCalledWith(error);
    });
  });

  describe('preCheckRemoteSystemInformationConnection', () => {
    const preCheckDto: PreCheckRemoteSystemInformationDto = {
      ip: '1.2.3.4',
      authType: SsmAnsible.SSHType.UserPassword,
      sshUser: 'testuser',
      sshPwd: 'password123',
      sshPort: 22,
    };
    const mockConnectionDetails = { host: '1.2.3.4' };

    it('should return successful status if connection works with password auth', async () => {
      (mockSshCredentialsAdapterInstance.getSShConnection as Mock).mockResolvedValue(
        mockConnectionDetails,
      );
      hoistedMocks.mockStaticTestConnection.mockResolvedValue(undefined);

      const result = await service.preCheckRemoteSystemInformationConnection(preCheckDto);

      expect(mockVaultCryptoService.encrypt).toHaveBeenCalledTimes(1);
      expect(mockVaultCryptoService.encrypt).toHaveBeenCalledWith(
        preCheckDto.sshPwd,
        DEFAULT_VAULT_ID,
      );
      expect(mockSshCredentialsAdapterInstance.getSShConnection).toHaveBeenCalled();
      expect(SSHExecutor.testConnection).toHaveBeenCalledWith(mockConnectionDetails);
      expect(result).toEqual({ status: 'successful' });
    });

    it('should call encrypt for relevant fields with SSH key auth', async () => {
      const keyDto: PreCheckRemoteSystemInformationDto = {
        ...preCheckDto,
        authType: SsmAnsible.SSHType.KeyBased,
        sshKey: 'private-key-content',
        sshKeyPass: 'key-passphrase',
        sshPwd: undefined,
        becomeMethod: SsmAnsible.AnsibleBecomeMethod.SUDO,
        becomePass: 'sudo-pass',
      };
      (mockSshCredentialsAdapterInstance.getSShConnection as Mock).mockResolvedValue(
        mockConnectionDetails,
      );
      hoistedMocks.mockStaticTestConnection.mockResolvedValue(undefined);

      await service.preCheckRemoteSystemInformationConnection(keyDto);

      expect(mockVaultCryptoService.encrypt).toHaveBeenCalledTimes(3);
      expect(mockVaultCryptoService.encrypt).toHaveBeenCalledWith(keyDto.sshKey, DEFAULT_VAULT_ID);
      expect(mockVaultCryptoService.encrypt).toHaveBeenCalledWith(
        keyDto.sshKeyPass,
        DEFAULT_VAULT_ID,
      );
      expect(mockVaultCryptoService.encrypt).toHaveBeenCalledWith(
        keyDto.becomePass,
        DEFAULT_VAULT_ID,
      );
      expect(SSHExecutor.testConnection).toHaveBeenCalled();
    });

    it('should return failed status if getSShConnection throws', async () => {
      const error = new Error('SSH precheck connection failed');
      (mockSshCredentialsAdapterInstance.getSShConnection as Mock).mockRejectedValue(error);

      const result = await service.preCheckRemoteSystemInformationConnection(preCheckDto);

      expect(SSHExecutor.testConnection).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'failed', message: error.message });
    });

    it('should return failed status if SSHExecutor.testConnection throws', async () => {
      const error = new Error('Static precheck test failed');
      (mockSshCredentialsAdapterInstance.getSShConnection as Mock).mockResolvedValue(
        mockConnectionDetails,
      );
      hoistedMocks.mockStaticTestConnection.mockRejectedValue(error);

      const result = await service.preCheckRemoteSystemInformationConnection(preCheckDto);

      expect(SSHExecutor.testConnection).toHaveBeenCalledWith(mockConnectionDetails);
      expect(result).toEqual({ status: 'failed', message: error.message });
    });

    it('should return failed status if vaultCryptoService.encrypt throws', async () => {
      const error = new Error('Encryption failed');
      (mockVaultCryptoService.encrypt as Mock).mockRejectedValue(error);

      const result = await service.preCheckRemoteSystemInformationConnection(preCheckDto);

      expect(mockSshCredentialsAdapterInstance.getSShConnection).not.toHaveBeenCalled();
      expect(SSHExecutor.testConnection).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'failed', message: error.message });
    });
  });
});
