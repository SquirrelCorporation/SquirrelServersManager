import { SsmContainer } from 'ssm-shared-lib';
import Container from '../data/database/model/Container';
import ProxmoxContainer from '../data/database/model/ProxmoxContainer';
import ContainerRepo from '../data/database/repository/ContainerRepo';
import { Kind } from '../modules/containers/core/Component';
import { WATCHERS } from '../modules/containers/core/conf';
import WatcherEngine from '../modules/containers/core/WatcherEngine';
import Docker from '../modules/containers/watchers/providers/docker/Docker';
import Proxmox from '../modules/containers/watchers/providers/proxmox/Proxmox';

async function updateCustomName(customName: string, container: Container): Promise<void> {
  container.customName = customName;
  await ContainerRepo.updateContainer(container);
}

async function performDockerAction(
  container: Container,
  action: SsmContainer.Actions,
): Promise<void> {
  const registeredComponent = WatcherEngine.getStates().watcher[
    WatcherEngine.buildId(Kind.WATCHER, WATCHERS.DOCKER, container.watcher)
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

async function performProxmoxAction(
  container: ProxmoxContainer,
  action: SsmContainer.Actions,
): Promise<string> {
  const registeredComponent = WatcherEngine.getStates().watcher[
    WatcherEngine.buildId(Kind.WATCHER, WATCHERS.PROXMOX, container.watcher)
  ] as Proxmox;
  if (!registeredComponent) {
    throw new Error('Watcher is not registered');
  }
  return await registeredComponent.changeContainerStatus(container, action);
}

export default {
  updateCustomName,
  performDockerAction,
  performProxmoxAction,
};
