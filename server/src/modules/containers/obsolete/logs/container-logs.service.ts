/**
 * @deprecated This service is deprecated and will be removed in a future version.
 * Please use the new ContainerLogsService in application/services/container-logs.service.ts
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ContainerRepository } from '../repositories/container.repository';
import { Kind } from '../core/Component';
import { WATCHERS } from '../core/conf';
import Docker from '../watchers/providers/docker/Docker';
import { WatcherEngineService } from './watcher-engine.service';
import { IContainerLogsService, CONTAINER_LOGS_SERVICE } from '../application/interfaces/container-logs-service.interface';

@Injectable()
export class ContainerLogsService {
  private readonly logger = new Logger(ContainerLogsService.name);

  constructor(
    private readonly containerRepository: ContainerRepository,
    private readonly watcherEngineService: WatcherEngineService,
    @Inject(CONTAINER_LOGS_SERVICE)
    private readonly newContainerLogsService: IContainerLogsService,
  ) {}

  /**
   * Find a container by ID
   * @param id Container ID
   * @returns Container or null if not found
   * @deprecated Use the new ContainerLogsService
   */
  async findContainerById(id: string) {
    this.logger.warn(`Method findContainerById is deprecated. Please use the new ContainerLogsService.`);
    try {
      return this.newContainerLogsService.findContainerById(id);
    } catch (error) {
      this.logger.error(`Error finding container by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find a registered Docker component for a watcher
   * @param watcher Watcher name
   * @returns Docker component or undefined if not found
   * @deprecated Use the new ContainerLogsService
   */
  async findRegisteredComponent(watcher: string): Promise<Docker | undefined> {
    this.logger.warn(`Method findRegisteredComponent is deprecated. Please use the new ContainerLogsService.`);
    try {
      return this.newContainerLogsService.findRegisteredComponent(watcher);
    } catch (error) {
      this.logger.error(`Error finding registered component for watcher: ${watcher}`, error);
      throw error;
    }
  }
}