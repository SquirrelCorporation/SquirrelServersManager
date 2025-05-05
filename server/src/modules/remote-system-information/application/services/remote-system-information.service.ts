import { SSHCredentialsAdapter } from '@infrastructure/index';
import {
  DEVICES_SERVICE,
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
  IDevicesService,
} from '@modules/devices';
import { SSHExecutor } from '@modules/remote-system-information/application/services/remote-ssh-executor.service';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VAULT_CRYPTO_SERVICE } from '@modules/ansible-vaults';
import { IVaultCryptoService } from '@modules/ansible-vaults/domain/interfaces/vault-crypto-service.interface';
import { DEFAULT_VAULT_ID } from '@modules/ansible-vaults';
import { SsmStatus } from 'ssm-shared-lib';
import { IRemoteSystemInformationService } from '../../domain/interfaces/remote-system-information-service.interface';
import { IDevice } from '../../../devices/domain/entities/device.entity';
import { PreCheckRemoteSystemInformationDto } from '../../presentation/dtos/pre-check-remote-system-information.dto';
import { RemoteSystemInformationEngineService } from './engine/remote-system-information-engine.service';

/**
 * Service for remote system information collection and management
 */
@Injectable()
export class RemoteSystemInformationService implements IRemoteSystemInformationService {
  private readonly logger = new Logger(RemoteSystemInformationService.name);

  constructor(
    private readonly engineService: RemoteSystemInformationEngineService,
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
    @Inject(DEVICE_AUTH_SERVICE)
    private readonly deviceAuthService: IDeviceAuthService,
    @Inject(VAULT_CRYPTO_SERVICE)
    private readonly vaultCryptoService: IVaultCryptoService,
  ) {}

  /**
   * Initialize the system when the module is loaded
   */
  async onModuleInit(): Promise<void> {
    await this.init();
  }

  /**
   * Initialize the system information service
   * This will start all watchers for devices that should be monitored
   */
  async init(): Promise<void> {
    this.logger.log('Initializing RemoteSystemInformationService...');
    try {
      void this.engineService.init();
      this.logger.log('RemoteSystemInformationService initialized');
    } catch (error) {
      this.logger.error(error, 'Failed to initialize RemoteSystemInformationService:');
      throw error;
    }
  }

  /**
   * Register a watcher for a specific device
   * @param device The device to register a watcher for
   */
  async registerWatcher(device: IDevice): Promise<any> {
    try {
      this.logger.debug(`Registering watcher for device: ${device.uuid}`);
      return await this.engineService.registerWatcher(device);
    } catch (error) {
      this.logger.error(error, `Failed to register watcher for device ${device.uuid}:`);
      throw error;
    }
  }

  /**
   * Register all watchers based on devices in the database
   */
  async registerWatchers(): Promise<any> {
    try {
      this.logger.debug('Registering watchers for all devices...');
      return await this.engineService.registerWatchers();
    } catch (error) {
      this.logger.error(error, 'Failed to register watchers:');
      throw error;
    }
  }

  /**
   * Deregister all components
   */
  async deregisterAll(): Promise<any> {
    try {
      this.logger.debug('Deregistering all components...');
      return await this.engineService.deregisterAll();
    } catch (error) {
      this.logger.error(error, 'Failed to deregister all components:');
      throw error;
    }
  }

  async testConnection(uuid: string): Promise<any> {
    const sshHelper = new SSHCredentialsAdapter();
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new NotFoundException(`Device with UUID ${uuid} not found`);
      }
      const deviceAuth = await this.deviceAuthService.findDeviceAuthByDevice(device);
      if (!deviceAuth) {
        throw new NotFoundException(`Device auth with UUID ${uuid} not found`);
      }
      const connection = await sshHelper.getSShConnection(device, deviceAuth);
      await SSHExecutor.testConnection(connection);
      return {
        connectionStatus: 'successful',
      };
    } catch (error: any) {
      this.logger.error(error);
      return {
        connectionStatus: 'failed',
        errorMessage: error.message,
      };
    }
  }

  async preCheckRemoteSystemInformationConnection(preCheckDto: PreCheckRemoteSystemInformationDto) {
    const { ip, authType, sshKey, sshUser, sshPwd, sshPort, becomeMethod, becomePass, sshKeyPass } =
      preCheckDto;

    const sshHelper = new SSHCredentialsAdapter();
    try {
      const mockedDeviceAuth = {
        device: {
          _id: 'tmp',
          ip,
          uuid: 'tmp',
          status: SsmStatus.DeviceStatus.REGISTERING,
          capabilities: { containers: {} },
          systemInformation: {},
          configuration: { containers: {}, systemInformation: {} },
        },
        authType,
        sshKey: sshKey
          ? await this.vaultCryptoService.encrypt(sshKey, DEFAULT_VAULT_ID)
          : undefined,
        sshUser,
        sshPwd: sshPwd
          ? await this.vaultCryptoService.encrypt(sshPwd, DEFAULT_VAULT_ID)
          : undefined,
        sshPort: sshPort || 22,
        becomeMethod,
        becomePass: becomePass
          ? await this.vaultCryptoService.encrypt(becomePass, DEFAULT_VAULT_ID)
          : undefined,
        sshKeyPass: sshKeyPass
          ? await this.vaultCryptoService.encrypt(sshKeyPass, DEFAULT_VAULT_ID)
          : undefined,
      };
      await SSHExecutor.testConnection(
        await sshHelper.getSShConnection(mockedDeviceAuth.device, mockedDeviceAuth),
      );

      return {
        status: 'successful',
      };
    } catch (error: any) {
      return {
        status: 'failed',
        message: error.message,
      };
    }
  }
}
