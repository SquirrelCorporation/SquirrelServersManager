import { Injectable, Logger } from '@nestjs/common';
import { ContainerRepository } from '../repositories/container.repository';
import { Kind } from '../core/Component';
import { WATCHERS } from '../core/conf';
import Docker from '../watchers/providers/docker/Docker';
import { WatcherEngineService } from './watcher-engine.service';

@Injectable()
export class ContainerLogsService {
  private readonly logger = new Logger(ContainerLogsService.name);

  constructor(
    private readonly containerRepository: ContainerRepository,
    private readonly watcherEngineService: WatcherEngineService,
  ) {}

  /**
   * Find a container by ID
   * @param id Container ID
   * @returns Container or null if not found
   */
  async findContainerById(id: string) {
    try {
      return this.containerRepository.findContainerById(id);
    } catch (error) {
      this.logger.error(`Error finding container by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find a registered Docker component for a watcher
   * @param watcher Watcher name
   * @returns Docker component or undefined if not found
   */
  async findRegisteredComponent(watcher: string): Promise<Docker | undefined> {
    try {
      const states = this.watcherEngineService.getStates();
      const componentId = this.watcherEngineService.buildId(Kind.WATCHER, WATCHERS.DOCKER, watcher);
      return states.watcher[componentId] as Docker;
    } catch (error) {
      this.logger.error(`Error finding registered component for watcher: ${watcher}`, error);
      throw error;
    }
  }
}