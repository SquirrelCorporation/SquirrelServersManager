import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ContainersService {
  constructor(
    private readonly containerRepository: ContainerRepository,
    private readonly proxmoxContainerRepository: ProxmoxContainerRepository,
    private readonly watcherEngineService: WatcherEngineService,
    private readonly proxmoxService: ProxmoxService,

  ) {}

  /**
   * Update the custom name of a container
   * @param customName New custom name
   * @param container Container to update
   */
  async updateCustomName(customName: string, container: ContainerDocument): Promise<void> {
    container.customName = customName;
    await this.containerRepository.updateContainer(container);
  }

  /**
   * Perform an action on a Docker container
   * @param container Docker container
   * @param action Action to perform
   */
  async performDockerAction(
    container: ContainerDocument,
    action: SsmContainer.Actions,
  ): Promise<void> {
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

  /**
   * Perform an action on a Proxmox container
   * @param container Proxmox container
   * @param action Action to perform
   * @returns Result message
   */
  async performProxmoxAction(
    container: ProxmoxContainerDocument,
    action: SsmContainer.Actions,
  ): Promise<string> {
    const registeredComponent = this.watcherEngineService.getStates().watcher[
      this.watcherEngineService.buildId(Kind.WATCHER, WATCHERS.PROXMOX, container.watcher)
    ] as ProxmoxService;

    if (!registeredComponent) {
      throw new Error('Watcher is not registered');
    }

    return await registeredComponent.changeContainerStatus(container, action);
  }
}
