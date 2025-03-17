import { Injectable } from '@nestjs/common';
import * as Dockerode from 'dockerode';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { ContainerServiceInterface } from '../../../../../../application/interfaces/container-service.interface';
import { ContainerStatsServiceInterface } from '../../../../../../application/interfaces/container-stats-service.interface';
import { IContainerLogsService } from '../../../../../../application/interfaces/container-logs-service.interface';
import { ContainerImagesServiceInterface } from '../../../../../../application/interfaces/container-images-service.interface';
import { ContainerVolumesServiceInterface } from '../../../../../../application/interfaces/container-volumes-service.interface';
import { ContainerNetworksServiceInterface } from '../../../../../../application/interfaces/container-networks-service.interface';
import { IDockerNetworksComponent } from '../../../../../../../../domain/components/docker-watcher.interface';
import { AbstractDockerListenerComponent } from './abstract-docker-listener.component';

/**
 * Abstract Docker networks component for network management
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerNetworksComponent extends AbstractDockerListenerComponent implements IDockerNetworksComponent {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly containerService: ContainerServiceInterface,
    protected readonly containerStatsService: ContainerStatsServiceInterface,
    protected readonly containerLogsService: IContainerLogsService,
    protected readonly containerImagesService: ContainerImagesServiceInterface,
    protected readonly containerVolumesService: ContainerVolumesServiceInterface,
    protected readonly containerNetworksService: ContainerNetworksServiceInterface
  ) {
    super(
      eventEmitter,
      containerService,
      containerStatsService,
      containerLogsService,
      containerImagesService,
      containerVolumesService,
      containerNetworksService
    );
  }

  /**
   * Watch networks from cron job
   */
  protected async watchNetworksFromCron(): Promise<void> {
    this.childLogger.info(
      `watchNetworksFromCron - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
    );

    try {
      // Get current networks from Docker
      const rawCurrentNetworks = await this.dockerApi.listNetworks();

      if (!rawCurrentNetworks) {
        return;
      }

      // Transform networks to our format
      const currentNetworks = rawCurrentNetworks.map(network => ({
        id: network.Id,
        uuid: uuidv4(),
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
        labels: network.Labels
      }));

      // Get existing networks from our database
      const existingNetworks = await this.containerNetworksService.getNetworksByDeviceUuid(this.configuration.deviceUuid);

      // Insert new networks and update existing ones
      await this.processNetworks(currentNetworks, existingNetworks);

      // Delete networks that no longer exist
      await this.removeDeletedNetworks(currentNetworks, existingNetworks);

    } catch (error: any) {
      this.childLogger.error(`Error watching networks: ${error.message}`);
    }
  }

  /**
   * Process networks - create new ones and update existing
   */
  private async processNetworks(currentNetworks: any[], existingNetworks: any[]): Promise<void> {
    for (const network of currentNetworks) {
      // Check if network exists in our database
      const existingNetwork = existingNetworks.find(n => n.id === network.id);

      if (!existingNetwork) {
        // New network, create it
        this.childLogger.info(`Adding new network ${network.name} (${network.id})`);
        await this.containerNetworksService.createNetwork(this.configuration.deviceUuid, network);
      } else {
        // Existing network, update it if needed
        await this.containerNetworksService.updateNetwork(existingNetwork.uuid, network);
      }
    }
  }

  /**
   * Remove networks that no longer exist in Docker
   */
  private async removeDeletedNetworks(currentNetworks: any[], existingNetworks: any[]): Promise<void> {
    // Find networks that exist in database but not in Docker
    const deletedNetworks = existingNetworks.filter(
      existingNetwork => !currentNetworks.some(current => current.id === existingNetwork.id)
    );

    // Delete networks
    for (const network of deletedNetworks) {
      this.childLogger.info(`Removing deleted network ${network.name} (${network.id})`);
      await this.containerNetworksService.removeNetwork(network.uuid);
    }
  }

  // Only include methods that were part of the original Docker.ts implementation

  // Keep only the core functionality that's used in the original Docker.ts implementation
  // Remove methods that weren't part of the original functionality
}