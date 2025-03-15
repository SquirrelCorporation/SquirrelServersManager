/**
 * @deprecated This service is deprecated and will be removed in a future version.
 * Please use the new ContainerService in application/services/container.service.ts
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import { SsmContainer } from 'ssm-shared-lib';
import { ContainerRepository } from '../repositories/container.repository';
import { ProxmoxContainerRepository } from '../repositories/proxmox-container.repository';
import { ContainerDocument } from '../schemas/container.schema';
import { ProxmoxContainerDocument } from '../schemas/proxmox-container.schema';
import { Kind } from '../core/Component';
import { WATCHERS } from '../core/conf';
import Docker from '../watchers/providers/docker/Docker';
import { ProxmoxService } from '../watchers/providers/proxmox/proxmox.service';
import { WatcherEngineService } from './watcher-engine.service';
import { CONTAINER_SERVICE } from '../application/interfaces/container-service.interface';
import { ContainerServiceInterface } from '../application/interfaces/container-service.interface';

@Injectable()
export class ContainersService {
  private readonly logger = new Logger(ContainersService.name);

  constructor(
    private readonly containerRepository: ContainerRepository,
    private readonly proxmoxContainerRepository: ProxmoxContainerRepository,
    private readonly watcherEngineService: WatcherEngineService,
    private readonly proxmoxService: ProxmoxService,
    @Inject(CONTAINER_SERVICE)
    private readonly newContainerService: ContainerServiceInterface
  ) {}

  /**
   * Update the custom name of a container
   * @param customName New custom name
   * @param container Container to update
   * @deprecated Use the new ContainerService
   */
  async updateCustomName(customName: string, container: ContainerDocument): Promise<void> {
    this.logger.warn('Method updateCustomName is deprecated. Please use the new ContainerService.');
    try {
      await this.newContainerService.updateContainer(container.uuid || container._id.toString(), {
        customName
      });
    } catch (error) {
      // Fallback to the original implementation if needed
      container.customName = customName;
      await this.containerRepository.updateContainer(container);
    }
  }

  /**
   * Perform an action on a Docker container
   * @param container Docker container
   * @param action Action to perform
   * @deprecated Use the new ContainerService
   */
  async performDockerAction(
    container: ContainerDocument,
    action: SsmContainer.Actions,
  ): Promise<void> {
    this.logger.warn('Method performDockerAction is deprecated. Please use the new ContainerService.');
    
    try {
      const containerUuid = container.uuid || container._id.toString();
      
      switch (action) {
        case SsmContainer.Actions.KILL:
          await this.newContainerService.killContainer(containerUuid);
          break;
        case SsmContainer.Actions.PAUSE:
          await this.newContainerService.pauseContainer(containerUuid);
          break;
        case SsmContainer.Actions.RESTART:
          await this.newContainerService.restartContainer(containerUuid);
          break;
        case SsmContainer.Actions.STOP:
          await this.newContainerService.stopContainer(containerUuid);
          break;
        case SsmContainer.Actions.START:
          await this.newContainerService.startContainer(containerUuid);
          break;
        default:
          throw new Error(`Unknown action type ${action}`);
      }
    } catch (error) {
      // Fallback to the original implementation
      const registeredComponent = this.watcherEngineService.getStates().watcher[
        this.watcherEngineService.buildId(Kind.WATCHER, WATCHERS.DOCKER, container.watcher)
      ] as Docker;

      if (!registeredComponent) {
        throw new Error('Watcher is not registered');
      }

      switch (action) {
        case SsmContainer.Actions.KILL:
          return await registeredComponent.killContainer(container);
        case SsmContainer.Actions.PAUSE:
          return await registeredComponent.pauseContainer(container);
        case SsmContainer.Actions.RESTART:
          return await registeredComponent.restartContainer(container);
        case SsmContainer.Actions.STOP:
          return await registeredComponent.stopContainer(container);
        case SsmContainer.Actions.START:
          return await registeredComponent.startContainer(container);
        default:
          throw new Error(`Unknown action type ${action}`);
      }
    }
  }

  /**
   * Perform an action on a Proxmox container
   * @param container Proxmox container
   * @param action Action to perform
   * @returns Result message
   * @deprecated Use the new ContainerService
   */
  async performProxmoxAction(
    container: ProxmoxContainerDocument,
    action: SsmContainer.Actions,
  ): Promise<string> {
    this.logger.warn('Method performProxmoxAction is deprecated. Please use the new ContainerService.');
    
    // For now, use the original implementation as Proxmox integration isn't fully implemented in the new service
    const registeredComponent = this.watcherEngineService.getStates().watcher[
      this.watcherEngineService.buildId(Kind.WATCHER, WATCHERS.PROXMOX, container.watcher)
    ] as ProxmoxService;

    if (!registeredComponent) {
      throw new Error('Watcher is not registered');
    }

    return await registeredComponent.changeContainerStatus(container, action);
  }
}
