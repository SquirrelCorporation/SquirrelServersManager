import { IContainerNetworkEntity } from '@modules/containers/domain/entities/container-network.entity';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CONTAINER_IMAGES_SERVICE,
  IContainerImagesService,
} from '../../../../../../domain/interfaces/container-images-service.interface';
import {
  CONTAINER_LOGS_SERVICE,
  IContainerLogsService,
} from '../../../../../../domain/interfaces/container-logs-service.interface';
import {
  CONTAINER_NETWORKS_SERVICE,
  IContainerNetworksService,
} from '../../../../../../domain/interfaces/container-networks-service.interface';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../../../../../domain/interfaces/container-service.interface';
import {
  CONTAINER_STATS_SERVICE,
  IContainerStatsService,
} from '../../../../../../domain/interfaces/container-stats-service.interface';
import {
  CONTAINER_VOLUMES_SERVICE,
  IContainerVolumesService,
} from '../../../../../../domain/interfaces/container-volumes-service.interface';
import { AbstractDockerListenerComponent } from './abstract-docker-listener.component';

/**
 * Abstract Docker networks component for network management
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerNetworksComponent extends AbstractDockerListenerComponent {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    @Inject(CONTAINER_SERVICE)
    protected readonly containerService: IContainerService,
    @Inject(CONTAINER_STATS_SERVICE)
    protected readonly containerStatsService: IContainerStatsService,
    @Inject(CONTAINER_LOGS_SERVICE)
    protected readonly containerLogsService: IContainerLogsService,
    @Inject(CONTAINER_IMAGES_SERVICE)
    protected readonly containerImagesService: IContainerImagesService,
    @Inject(CONTAINER_VOLUMES_SERVICE)
    protected readonly containerVolumesService: IContainerVolumesService,
    @Inject(CONTAINER_NETWORKS_SERVICE)
    protected readonly containerNetworksService: IContainerNetworksService,
  ) {
    super(
      eventEmitter,
      containerService,
      containerStatsService,
      containerLogsService,
      containerImagesService,
      containerVolumesService,
      containerNetworksService,
    );
  }

  /**
   * Watch networks from cron job
   */
  protected async watchNetworksFromCron(): Promise<void> {
    this.childLogger.info(
      `watchNetworksFromCron - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );

    try {
      // Get current networks from Docker
      const rawCurrentNetworks = await this.dockerApi.listNetworks();

      if (!rawCurrentNetworks) {
        return;
      }

      // Transform networks to our format
      const currentNetworks: IContainerNetworkEntity[] = rawCurrentNetworks.map((network) => ({
        id: network.Id,
        name: network.Name,
        watcher: this.name,
        deviceUuid: this.configuration.deviceUuid,
        created: network.Created,
        scope: network.Scope,
        driver: network.Driver,
        enableIPv6: network.EnableIPv6,
        ipam: network.IPAM,
        internal: network.Internal,
        attachable: network.Attachable,
        ingress: network.Ingress,
        configFrom: network.ConfigFrom,
        configOnly: network.ConfigOnly,
        containers: network.Containers,
        options: network.Options,
        labels: network.Labels,
        status: 'unknown',
      }));

      // Get existing networks from our database
      const existingNetworks = await this.containerNetworksService.getNetworksByDeviceUuid(
        this.configuration.deviceUuid,
      );
      this.childLogger.info('existingNetworks: ' + existingNetworks?.length);
      // Insert new networks
      await this.insertNewNetworks(currentNetworks, existingNetworks);

      // Delete networks that no longer exist
      this.deleteOldNetworks(currentNetworks, existingNetworks);
    } catch (error: any) {
      this.childLogger.error(`Error watching networks: ${error.message}`);
    }
  }

  /**
   * Insert new networks that don't exist in the database
   */
  private async insertNewNetworks(
    currentNetworks: IContainerNetworkEntity[],
    networksInDb: IContainerNetworkEntity[],
  ): Promise<void> {
    const networksToInsert = currentNetworks.filter((network) => {
      return !networksInDb.some((dbNetwork) => dbNetwork.id === network.id);
    });

    if (networksToInsert.length > 0) {
      this.childLogger.info(
        `insertNewNetworks - got ${networksToInsert.length} networks to insert (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
      );

      await Promise.all(
        networksToInsert.map(async (network) => {
          await this.containerNetworksService.createNetwork(this.configuration.deviceUuid, network);
        }),
      );
    }
  }

  /**
   * Delete networks that no longer exist in Docker
   */
  private deleteOldNetworks(
    currentNetworks: IContainerNetworkEntity[],
    networksInDb: IContainerNetworkEntity[],
  ): void {
    const networksToRemove = this.getOldNetworks(currentNetworks, networksInDb);

    networksToRemove.forEach((networkToRemove) => {
      this.containerNetworksService.deleteNetwork(networkToRemove.id);
    });
  }

  /**
   * Get networks that exist in database but not in Docker
   */
  private getOldNetworks(
    currentNetworks: IContainerNetworkEntity[],
    networksInDb: IContainerNetworkEntity[],
  ): IContainerNetworkEntity[] {
    if (!networksInDb || !currentNetworks) {
      return [];
    }
    return networksInDb.filter((networkFromDb) => {
      const isStillToWatch = currentNetworks.some(
        (currentNetwork) => currentNetwork.id === networkFromDb.id,
      );
      return isStillToWatch === undefined;
    });
  }
}
