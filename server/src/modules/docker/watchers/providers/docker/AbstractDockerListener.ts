import debounce from 'debounce';
import Dockerode from 'dockerode';
import Events from '../../../../../core/events/events';
import ContainerRepo from '../../../../../data/database/repository/ContainerRepo';
import type { SSMServicesTypes } from '../../../../../types/typings';
import Component from '../../../core/Component';
import { fullName } from '../../../utils/utils';

export default class DockerListener extends Component<SSMServicesTypes.ConfigurationWatcherSchema> {
  dockerApi!: Dockerode | undefined;
  watchCronDebounced!: debounce.DebouncedFunction<() => Promise<void>>;
  /**
   * Listen and react to docker events.
   * @return {Promise<void>}
   */
  async listenDockerEvents(): Promise<void> {
    this.childLogger.info(
      `Listening to docker events - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );
    const options: {
      filters: {
        type?:
          | Array<
              | 'container'
              | 'image'
              | 'volume'
              | 'network'
              | 'daemon'
              | 'plugin'
              | 'service'
              | 'node'
              | 'secret'
              | 'config'
            >
          | undefined;
        event: string[] | undefined;
      };
    } = {
      filters: {
        type: ['container'],
        event: ['create', 'destroy', 'start', 'stop', 'pause', 'unpause', 'die', 'update'],
      },
    };
    try {
      (this.dockerApi as Dockerode).getEvents(options, (err, stream) => {
        if (err) {
          this.childLogger.warn(
            `Unable to listen to Docker events [${err.message}] - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
          );
          this.childLogger.debug(err);
        } else {
          stream?.on('data', (chunk) => this.onDockerEvent(chunk));
        }
      });
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }

  /**
   * Process a docker event.
   * @param dockerEventChunk
   * @return {Promise<void>}
   */
  async onDockerEvent(dockerEventChunk: any): Promise<void> {
    this.childLogger.debug('onDockerEvent');
    const dockerEvent = JSON.parse(dockerEventChunk.toString());
    const action = dockerEvent.Action;
    const containerId = dockerEvent.id;
    this.childLogger.info(
      `onDockerEvent (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}, action received: "${action}", containerId: ${containerId})`,
    );

    // If the container was created or destroyed => perform a watch
    if (action === 'destroy' || action === 'create') {
      if (this.watchCronDebounced && typeof this.watchCronDebounced === 'function') {
        await this.watchCronDebounced();
      }
    } else {
      // Update container state in db if so
      try {
        const container = (this.dockerApi as Dockerode).getContainer(containerId);
        const containerInspect = await container.inspect();
        const newStatus = containerInspect.State.Status;
        const containerFound = await ContainerRepo.findContainerById(containerId);
        if (containerFound) {
          this.childLogger.debug(JSON.stringify(containerInspect));
          // Child logger for the container to process
          const oldStatus = containerFound.status;
          containerFound.status = newStatus;
          if (oldStatus !== newStatus) {
            await ContainerRepo.updateContainer(containerFound);
            this.childLogger.info(
              `[${fullName(containerFound)}] Status changed from ${oldStatus} to ${newStatus} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
            );
            this.emit(Events.UPDATED_CONTAINERS, 'Updated containers');
          }
        }
      } catch {
        this.childLogger.debug(`Unable to get container details for container id=[${containerId}]`);
      }
    }
  }
}
