import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IDevice } from '../../../devices/domain/entities/device.entity';
import { IRemoteSystemInformationService } from '../interfaces/remote-system-information-service.interface';
import { RemoteSystemInformationEngineService } from './engine/remote-system-information-engine.service';

/**
 * Service for remote system information collection and management
 */
@Injectable()
export class RemoteSystemInformationService
  implements IRemoteSystemInformationService, OnModuleInit {
  private readonly logger = new Logger(RemoteSystemInformationService.name);

  constructor(private readonly engineService: RemoteSystemInformationEngineService) {}

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
}
