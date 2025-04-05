import { getCustomAgent } from '@infrastructure/adapters/ssh/custom-agent.adapter';
import { SSHCredentialsAdapter } from '@infrastructure/adapters/ssh/ssh-credentials.adapter';
import { IContainerEntity } from '@modules/containers/domain/entities/container.entity';
import { DEVICES_SERVICE, IDevice, IDeviceAuth, IDevicesService } from '@modules/devices';
import {
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
} from '@modules/devices/domain/services/device-auth-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import debounce from 'debounce';
import DockerModem from 'docker-modem';
import Dockerode from 'dockerode';
import * as Joi from 'joi';
import CronJob from 'node-cron';
import parse from 'parse-docker-image-name';
import { SsmStatus } from 'ssm-shared-lib';
import {
  CONTAINER_IMAGES_SERVICE,
  IContainerImagesService,
} from '../../../../../../applicati../../domain/interfaces/container-images-service.interface';
import {
  CONTAINER_LOGS_SERVICE,
  IContainerLogsService,
} from '../../../../../../applicati../../domain/interfaces/container-logs-service.interface';
import {
  CONTAINER_NETWORKS_SERVICE,
  IContainerNetworksService,
} from '../../../../../../applicati../../domain/interfaces/container-networks-service.interface';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../../../../../applicati../../domain/interfaces/container-service.interface';
import {
  CONTAINER_STATS_SERVICE,
  IContainerStatsService,
} from '../../../../../../applicati../../domain/interfaces/container-stats-service.interface';
import {
  CONTAINER_VOLUMES_SERVICE,
  IContainerVolumesService,
} from '../../../../../../applicati../../domain/interfaces/container-volumes-service.interface';
import { Label } from '../../../../../../utils/label';
import tag from '../../../../../../utils/tag';
import {
  getContainerName,
  getOldContainers,
  getRepoDigest,
  getTagCandidates,
  hasResultChanged,
  isContainerToWatch,
  isDigestToWatch,
} from '../../../../../../utils/utils';
import { AbstractDockerLogsComponent } from './abstract-docker-logs.component';

// The delay before starting the watcher when the app is started
const START_WATCHER_DELAY_MS = 1000;

// Debounce delay used when performing a watch after a docker event has been received
const DEBOUNCED_WATCH_CRON_MS = 5000;

/**
 * Docker watcher component that implements all Docker monitoring capabilities
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export class DockerWatcherComponent extends AbstractDockerLogsComponent {
  watchCron!: CronJob.ScheduledTask | undefined;
  watchCronStat!: CronJob.ScheduledTask | undefined;
  watchCronTimeout: any;
  watchCronDebounced: any = undefined;
  listenDockerEventsTimeout: any;
  dockerApi: Dockerode | any = undefined;

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
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
    @Inject(DEVICE_AUTH_SERVICE)
    private readonly deviceAuthService: IDeviceAuthService,
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
   * Initialize the Docker watcher component
   */
  async init(): Promise<void> {
    try {
      this.childLogger.info(`Setting up Docker watcher for ${this.name}`);

      await this.initWatcher();
      await this.dockerApi.info().then(async (e) => {
        const device = await this.devicesService.findOneByUuid(this.configuration.deviceUuid);
        if (!device) {
          this.childLogger.error(
            `Device ${this.configuration.deviceUuid} not found during docker info update`,
          );
          return;
        }
        device.dockerId = e.ID;
        device.dockerVersion = e.ServerVersion;
        device.updatedAt = new Date();
        await this.devicesService.update(device);
      });

      this.childLogger.info(
        `Cron scheduled (cron: "${this.configuration.cron}", device: ${this.configuration.host})`,
      );
      this.childLogger.info(this.configuration);

      this.watchCron = CronJob.schedule(this.configuration.cron, () => {
        this.watchContainersFromCron();
        this.watchNetworksFromCron();
        this.watchVolumesFromCron();
        this.watchImagesFromCron();
      });
      if (this.configuration.watchstats) {
        this.watchCronStat = CronJob.schedule(this.configuration.cronstats, () => {
          this.watchContainerStats();
        });
      }
      // watch at startup (after all components have been registered)
      this.watchCronTimeout = setTimeout(() => {
        this.watchContainersFromCron();
        this.watchNetworksFromCron();
        this.watchVolumesFromCron();
        this.watchImagesFromCron();
        if (this.configuration.watchstats) {
          this.watchContainerStats();
        }
      }, START_WATCHER_DELAY_MS);

      this.watchCronDebounced = debounce(() => {
        this.watchContainersFromCron();
        this.watchNetworksFromCron();
        this.watchVolumesFromCron();
        this.watchImagesFromCron();
      }, DEBOUNCED_WATCH_CRON_MS);
      // listen to docker events
      if (this.configuration.watchevents) {
        this.listenDockerEventsTimeout = setTimeout(
          () => this.listenDockerEvents(),
          START_WATCHER_DELAY_MS,
        );
      }

      this.watchCron.start();
      this.watchCronStat?.start();
    } catch (error: any) {
      this.childLogger.error(`Failed to set up Docker watcher ${this.name}: ${error.message}`);
      this.childLogger.warn(error);
    }
  }

  /**
   * Initialize the Docker client
   */
  async initWatcher(): Promise<void> {
    try {
      const device = await this.devicesService.findOneByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(
          `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }

      const deviceAuth = await this.deviceAuthService.findDeviceAuthByDeviceUuid(device.uuid);
      if (!deviceAuth || !deviceAuth[0]) {
        throw new Error(
          `DeviceAuth not found for deviceID ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const options = await this.getDockerConnectionOptions(device, deviceAuth[0]);
      this.dockerApi = new Dockerode(options);
    } catch (error: any) {
      this.childLogger.error(`Failed to initialize watcher: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Docker connection options
   */
  async getDockerConnectionOptions(device: IDevice, deviceAuth: IDeviceAuth): Promise<any> {
    try {
      const sshHelper = new SSHCredentialsAdapter();
      const options = await sshHelper.getDockerSshConnectionOptions(device, deviceAuth);

      const agent = getCustomAgent(this.childLogger, {
        debug: (message: any) => {
          this.childLogger.debug(message);
        },
        ...options.sshOptions,
        timeout: 60000,
      });

      try {
        options.modem = new DockerModem({
          agent: agent,
        });
      } catch (error: any) {
        this.childLogger.error(error);
        throw new Error(error.message);
      }

      return options;
    } catch (error: any) {
      this.childLogger.error(`Failed to get Docker connection options: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up the component
   */
  async deregisterComponent(): Promise<void> {
    this.childLogger.info('deregisterComponent');

    if (this.watchCron) {
      this.watchCron.stop();
      delete this.watchCron;
    }

    if (this.watchCronStat) {
      this.watchCronStat.stop();
      delete this.watchCronStat;
    }

    if (this.watchCronTimeout) {
      clearTimeout(this.watchCronTimeout);
    }

    if (this.listenDockerEventsTimeout) {
      clearTimeout(this.listenDockerEventsTimeout);
      delete this.listenDockerEventsTimeout;
    }

    this.childLogger.info(`Docker watcher ${this.name} cleaned up`);
  }

  /**
   * Get configuration schema
   */
  getConfigurationSchema(): Joi.ObjectSchema<any> {
    return this.joi.object().keys({
      socket: this.joi.string().default('/var/run/docker.sock'),
      host: this.joi.string().required(),
      port: this.joi.number().port().default(2375),
      username: this.joi.string(),
      password: this.joi.string(),
      cafile: this.joi.string(),
      certfile: this.joi.string(),
      keyfile: this.joi.string(),
      cron: this.joi.string().default('0 * * * *'),
      watchstats: this.joi.boolean().default(true),
      cronstats: this.joi.string().default('*/1 * * * *'),
      watchbydefault: this.joi.boolean().default(true),
      watchall: this.joi.boolean().default(true),
      watchevents: this.joi.boolean().default(true),
      deviceUuid: this.joi.string().required(),
    });
  }

  /**
   * Mask sensitive data
   */
  maskConfiguration(): any {
    return {
      ...this.configuration,
      cafile: this.maskValue(this.configuration.cafile),
      certfile: this.maskValue(this.configuration.certfile),
      keyfile: this.maskValue(this.configuration.keyfile),
    };
  }

  /**
   * Helper to mask sensitive values
   */
  private maskValue(value: any): string {
    if (!value) {
      return '';
    }

    if (typeof value !== 'string') {
      return '******';
    }

    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }

    return value.substring(0, 3) + '*'.repeat(value.length - 6) + value.substring(value.length - 3);
  }

  /**
   * Debounced watch handler
   */
  private async debouncedWatch(): Promise<void> {
    this.childLogger.info('Running debounced container watch');

    try {
      await this.watchContainersFromCron();
      await this.watchNetworksFromCron();
      await this.watchVolumesFromCron();
      await this.watchImagesFromCron();
    } catch (error: any) {
      this.childLogger.error(`Error in debounced watch: ${error.message}`);
    }
  }

  /**
   * Watch containers from cron
   */
  async watchContainersFromCron(): Promise<any[]> {
    this.childLogger.info(
      `watchContainersFromCron - Cron started (cron: "${this.configuration.cron}", deviceID: ${this.configuration.deviceUuid})`,
    );

    // Get container reports
    const containerReports = await this.watch();

    // Count container reports
    const containerReportsCount = containerReports.length;

    // Count container available updates
    const containerUpdatesCount = containerReports.filter(
      (containerReport) => containerReport.container.updateAvailable,
    ).length;

    // Count container errors
    const containerErrorsCount = containerReports.filter(
      (containerReport) => containerReport.container.error !== undefined,
    ).length;

    const stats = `${containerReportsCount} containers watched, ${containerErrorsCount} errors, ${containerUpdatesCount} available updates`;
    this.childLogger.info(
      `watchContainersFromCron - Cron finished: ${stats} (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );

    // In NestJS, use EventEmitter2 instead of direct emit
    this.eventEmitter.emit('container.updated', 'Updated containers');

    return containerReports;
  }

  /**
   * Watch main method.
   */
  async watch(): Promise<any[]> {
    let containers: any[] = [];

    // List images to watch
    try {
      containers = await this.getContainers();
    } catch (e: any) {
      this.childLogger.error(e);
      this.childLogger.warn(
        `Error when trying to get the list of the containers to watch (${e.message})`,
      );
    }

    try {
      return await Promise.all(containers.map((container) => this.watchContainer(container)));
    } catch (e: any) {
      this.childLogger.error(e);
      this.childLogger.warn(`Error when processing some containers (${e.message})`);
      return [];
    }
  }

  /**
   * Watch a Container.
   */
  async watchContainer(container: any): Promise<any> {
    const containerWithResult = container;

    // Reset previous results if so
    delete containerWithResult.result;
    delete containerWithResult.error;
    this.childLogger.info('Start watching');

    try {
      containerWithResult.result = await this.findNewVersion(container);
    } catch (e: any) {
      this.childLogger.warn(`Error when processing (${e.message})`);
      this.childLogger.debug(e);
      containerWithResult.error = {
        message: e.message,
      };
    }

    return this.mapContainerToContainerReport(containerWithResult);
  }

  /**
   * Get all containers to watch.
   */
  async getContainers(): Promise<any[]> {
    try {
      this.childLogger.debug('getContainers');
      const listContainersOptions = { all: false };

      if (this.configuration.watchall) {
        listContainersOptions.all = true;
      }

      this.childLogger.debug('getContainers - dockerApi.listContainers');
      let containers: any[];

      try {
        containers = await this.dockerApi.listContainers(listContainersOptions);
      } catch (e: any) {
        this.childLogger.error(
          `listContainers - error: ${e.message} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
        );
        // Update the status of containers as unreachable
        // Note: containerService.updateContainerStatusByWatcher doesn't exist in the interface
        // Instead, find all containers by device and update their status
        await this.containerService.updateContainerStatusByWatcher(
          this.name,
          SsmStatus.ContainerStatus.UNREACHABLE,
        );

        return [];
      }

      // Filter on containers to watch
      const filteredContainers = containers.filter((container) =>
        isContainerToWatch(container.Labels[Label.wudWatch], this.configuration.watchbydefault),
      );

      this.childLogger.debug(
        `getContainers - filteredContainers: ${JSON.stringify(filteredContainers)}`,
      );

      this.childLogger.info(
        `getContainers - getImageDetails for ${filteredContainers?.length} containers... (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
      );

      const containerPromises = filteredContainers.map((container: Dockerode.ContainerInfo) =>
        this.addImageDetailsToContainer(
          container,
          container.Labels[Label.wudTagInclude],
          container.Labels[Label.wudTagExclude],
          container.Labels[Label.wudTagTransform],
          container.Labels[Label.wudLinkTemplate],
          container.Labels[Label.wudDisplayName],
          container.Labels[Label.wudDisplayIcon],
        ),
      );

      const containersWithImage = await Promise.all(containerPromises);

      this.childLogger.info(
        `getContainers - getImageDetails - ended - (deviceIP: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
      );

      // Return containers to process
      const containersToReturn = containersWithImage.filter(
        (imagePromise) => imagePromise !== undefined,
      );

      // Prune old containers from the store
      try {
        // Get all containers for this device and filter by watcher
        const containersFromTheStore = await this.containerService.getContainersByWatcher(
          this.name,
        );
        this.pruneOldContainers(containersToReturn, containersFromTheStore);
      } catch (e: any) {
        this.childLogger.warn(
          `Error when trying to prune the old containers (message: ${e.message}, deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
        );
      }

      return containersToReturn;
    } catch (error: any) {
      this.childLogger.error(
        `getContainers - error: ${error.message} (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
      );
      this.childLogger.error(error);
      return [];
    }
  }

  /**
   * Find new version for a Container.
   */
  async findNewVersion(container: any) {
    try {
      const registryProvider = await this.containerService.getRegistryByName(
        container.image.registry.name,
      );
      const result: { tag: string; digest?: string; created?: string } = {
        tag: container.image.tag.value,
      };

      if (!registryProvider) {
        this.childLogger.warn(
          `findNewVersion - Unsupported registry: ${container.image.registry.name} (image: ${container.image.name})`,
        );
      } else {
        // Get all available tags
        const tags = await registryProvider.getTags(container.image);
        this.childLogger.debug(`findNewVersion - tags: ${tags}`);

        // Get candidates (based on tag name)
        const tagsCandidates = getTagCandidates(container, tags);

        // Must watch digest? => Find local/remote digests on registries
        if (container.image.digest.watch && container.image.digest.repo) {
          // If we have a tag candidate BUT we also watch digest
          // (case where local=`mongo:8` and remote=`mongo:8.0.0`),
          // Then get the digest of the tag candidate
          // Else get the digest of the same tag as the local one
          const imageToGetDigestFrom = JSON.parse(JSON.stringify(container.image));
          if (tagsCandidates.length > 0) {
            [imageToGetDigestFrom.tag.value] = tagsCandidates;
          }

          const remoteDigest = await registryProvider.getImageManifestDigest(imageToGetDigestFrom);
          result.digest = remoteDigest.digest;
          result.created = remoteDigest.created;

          if (remoteDigest.version === 2) {
            // Regular v2 manifest => Get manifest digest
            const digestV2 = await registryProvider.getImageManifestDigest(
              imageToGetDigestFrom,
              container.image.digest.repo,
            );
            container.image.digest.value = digestV2.digest;
          } else {
            // Legacy v1 image => take Image digest as reference for comparison
            const image = await this.dockerApi.getImage(container.image.id).inspect();
            container.image.digest.value =
              image.Config.Image === '' ? undefined : image.Config.Image;
          }
        }

        this.childLogger.debug(`findNewVersion - getTags`);

        // The first one in the array is the highest
        if (tagsCandidates && tagsCandidates.length > 0) {
          result.tag = tagsCandidates[0];
        }

        return result;
      }
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }

  /**
   * Add image detail to Container.
   */
  async addImageDetailsToContainer(
    container: Dockerode.ContainerInfo,
    includeTags: string,
    excludeTags: string,
    transformTags: string,
    linkTemplate: string,
    displayName?: string,
    displayIcon?: string,
  ): Promise<any> {
    try {
      const containerId = container.Id;
      // Is container already in store? just return it :)
      // Find the container by ID in all containers for this device
      const containersInDevice = await this.containerService.getContainersByDeviceUuid(
        this.configuration.deviceUuid,
      );
      const containerInStore = containersInDevice.find((c) => c.id === containerId);

      if (
        containerInStore !== undefined &&
        containerInStore !== null &&
        containerInStore.error === undefined
      ) {
        this.childLogger.info(
          `addImageDetailsToContainer - Container "${container.Image}" already in store - (containerId: ${containerInStore.id})`,
        );
        return { ...containerInStore, status: container.State, labels: container?.Labels };
      }

      this.childLogger.info(
        `addImageDetailsToContainer - getImage: ${container.Image} - (containerId: ${containerId})`,
      );

      const img = this.dockerApi.getImage(container.Image);

      // Get container image details
      this.childLogger.info(
        `addImageDetailsToContainer - inspect: ${container.Image} - (containerId: ${containerId})`,
      );

      const image = await img.inspect();

      this.childLogger.info(
        `addImageDetailsToContainer - distribution: ${container.Image} - (containerId: ${containerId})`,
      );

      const distribution = await img.distribution();

      // Get useful properties
      const containerName = getContainerName(container);
      const status = container.State;
      const architecture = image.Architecture;
      const os = image.Os;
      const variant = distribution.Platforms.map((e) => e.variant);
      const created = image.Created;
      const repoDigest = getRepoDigest(image);
      const imageId = image.Id;

      // Parse image to get registries, organization...
      let imageNameToParse = container.Image;
      if (imageNameToParse.includes('sha256:')) {
        if (!image.RepoTags || image.RepoTags.length === 0) {
          this.childLogger.warn(
            `addImageDetailsToContainer - Cannot get a reliable tag for this image [${imageNameToParse}] - (containerId: ${containerId})`,
          );
          return undefined;
        }
        // Get the first repo tag (better than nothing ;)
        [imageNameToParse] = image.RepoTags;
      }

      const parsedImage = parse(imageNameToParse);
      const tagName = parsedImage.tag || 'latest';
      const parsedTag = tag.parseSemver(tag.transformTag(transformTags, tagName));
      const isSemver = parsedTag !== null && parsedTag !== undefined;
      const watchDigest = isDigestToWatch(container.Labels[Label.wudWatchDigest], isSemver);

      if (!isSemver && !watchDigest) {
        this.childLogger.warn(
          `addImageDetailsToContainer - Image "${imageNameToParse}" is not a semver and digest watching is disabled so wud won't report any update. Please review the configuration to enable digest watching for this container or exclude this container from being watched`,
        );
      }

      return this.containerService.normalizeContainer({
        id: containerId,
        name: containerName || 'unknown',
        status,
        watcher: this.name,
        includeTags,
        excludeTags,
        transformTags,
        linkTemplate,
        displayName,
        displayIcon,
        image: {
          id: imageId,
          registry: {
            name: 'unknown',
            url: parsedImage.domain,
          },
          name: parsedImage.path,
          tag: {
            value: tagName,
            semver: isSemver,
          },
          digest: {
            watch: watchDigest,
            repo: repoDigest,
          },
          architecture,
          os,
          variant,
          created,
        },
        result: {
          tag: tagName,
        },
        command: container.Command,
        networkSettings: container.NetworkSettings,
        ports: container.Ports,
        mounts: container.Mounts,
        labels: container?.Labels,
      });
    } catch (error: any) {
      this.childLogger.error(
        `addImageDetailsToContainer - Error during normalizing image ${container.Image}`,
      );
      this.childLogger.error(error);
    }
  }

  /**
   * Process a Container with result and map to a containerReport.
   */
  async mapContainerToContainerReport(containerWithResult: any): Promise<any> {
    const containerReport = {
      container: containerWithResult,
      changed: false,
    };

    // Find container in db & compare
    const allContainers = await this.containerService.getContainersByDeviceUuid(
      this.configuration.deviceUuid,
    );
    const containerInDb = allContainers.find((c) => c.id === containerWithResult.id);

    // Not found in DB? => Save it
    if (!containerInDb) {
      const normalizedForCreate = this.containerService.normalizeContainer({
        ...containerWithResult,
        watcher: this.name,
        status: SsmStatus.ContainerStatus.UNREACHABLE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      containerReport.container = await this.containerService.createContainer(
        this.configuration.deviceUuid,
        normalizedForCreate,
      );
      containerReport.changed = true;
    } else {
      const normalizedForUpdate = this.containerService.normalizeContainer({
        ...containerWithResult,
        _id: containerInDb._id,
        id: containerInDb.id,
        watcher: this.name,
        updatedAt: new Date(),
        name: containerWithResult.name || containerInDb.name,
        createdAt: containerInDb.createdAt,
        deviceUuid: containerInDb.deviceUuid,
        status:
          containerWithResult.status ||
          containerInDb.status ||
          SsmStatus.ContainerStatus.UNREACHABLE,
      });

      const changed = hasResultChanged(containerInDb, normalizedForUpdate);
      if (changed) {
        containerReport.container = await this.containerService.updateContainer(
          containerInDb.id,
          normalizedForUpdate,
        );
        containerReport.changed = true;
      } else {
        containerReport.container = containerInDb;
        containerReport.changed = false;
      }
      containerReport.changed = containerReport.changed || !!containerWithResult.updateAvailable;
    }

    return containerReport;
  }

  /**
   * Track container stats
   */
  async watchContainerStats(): Promise<void> {
    this.childLogger.info(
      `watchContainerStats ${this.name} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );

    try {
      const containers = await this.containerService.getContainersByWatcher(this.name);

      if (!containers || containers.length === 0) {
        this.childLogger.warn(
          `watchContainerStats - No container to watch - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
        );
        return;
      }

      this.childLogger.info(
        `watchContainerStats - Found ${containers.length} container(s) to watch... (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
      );

      for (const container of containers) {
        this.childLogger.info(
          `watchContainerStats ${container.id} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
        );

        try {
          const dockerContainer = this.dockerApi.getContainer(container.id);
          this.childLogger.debug(`watchContainerStats getContainer - ${dockerContainer.id}`);
          const dockerStats = await dockerContainer.stats({ stream: false });

          // Use the dedicated stats service
          await this.containerStatsService.createStats(container, dockerStats);
        } catch (error: any) {
          this.childLogger.error(error);
          this.childLogger.error(
            `[CRON] - Error retrieving stats for ${container.name}/${container.id}} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
          );
        }
      }

      // In NestJS, use EventEmitter2
      this.eventEmitter.emit('container.updated', 'Updated containers');
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }

  /**
   * Container action methods - matching original implementation
   */
  async pauseContainer(container: IContainerEntity): Promise<any> {
    try {
      return await this.dockerApi.getContainer(container.id).pause();
    } catch (error: any) {
      this.childLogger.error(`Failed to pause container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async stopContainer(container: IContainerEntity): Promise<any> {
    try {
      return await this.dockerApi.getContainer(container.id).stop();
    } catch (error: any) {
      this.childLogger.error(`Failed to stop container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async startContainer(container: IContainerEntity): Promise<any> {
    try {
      this.childLogger.log(`[CONTAINER] - startContainer - for container: ${container.id}`);
      return await this.dockerApi.getContainer(container.id).start();
    } catch (error: any) {
      this.childLogger.error(`Failed to start container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async restartContainer(container: IContainerEntity): Promise<any> {
    try {
      return await this.dockerApi.getContainer(container.id).restart();
    } catch (error: any) {
      this.childLogger.error(`Failed to restart container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async killContainer(container: IContainerEntity): Promise<any> {
    this.childLogger.warn(
      `killContainer "${container.id}" (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );
    try {
      return await this.dockerApi.getContainer(container.id).kill();
    } catch (error: any) {
      this.childLogger.error(`Failed to kill container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async unpauseContainer(container: IContainerEntity): Promise<any> {
    try {
      return await this.dockerApi.getContainer(container.id).unpause();
    } catch (error: any) {
      this.childLogger.error(`Failed to unpause container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Prune old containers from the store.
   * @param newContainers
   * @param containersFromTheStore
   */
  pruneOldContainers(
    newContainers: (IContainerEntity | undefined)[] | undefined,
    containersFromTheStore: IContainerEntity[] | null,
  ) {
    try {
      const containersToRemove = getOldContainers(newContainers, containersFromTheStore);
      containersToRemove.forEach((containerToRemove) => {
        try {
          void this.containerService.deleteContainer(containerToRemove.id);
          this.childLogger.info(`Container ${containerToRemove.name} pruned`);
        } catch (error: any) {
          this.childLogger.error(
            `Error pruning container ${containerToRemove.name}: ${error.message}`,
          );
        }
      });
    } catch (error: any) {
      this.childLogger.error(error);
      this.childLogger.error(`Failed to prune old containers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get container by ID
   */
  async getContainer(containerId: string): Promise<any> {
    try {
      const container = this.dockerApi.getContainer(containerId);
      return await container.inspect();
    } catch (error: any) {
      this.childLogger.error(`Failed to get container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all containers
   */
  async listContainers(): Promise<any[]> {
    try {
      return await this.dockerApi.listContainers({ all: true });
    } catch (error: any) {
      this.childLogger.error(`Failed to list containers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new container
   */
  async createContainer(containerConfig: any): Promise<any> {
    try {
      return await this.dockerApi.createContainer(containerConfig);
    } catch (error: any) {
      this.childLogger.error(`Failed to create container: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove a container
   */
  async removeContainer(container: any): Promise<void> {
    try {
      const dockerContainer = this.dockerApi.getContainer(container.id);
      await dockerContainer.remove();
    } catch (error: any) {
      this.childLogger.error(`Failed to remove container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(container: any, options?: any): Promise<any> {
    try {
      const dockerContainer = this.dockerApi.getContainer(container.id);
      return await dockerContainer.logs({
        follow: false,
        stdout: true,
        stderr: true,
        ...options,
      });
    } catch (error: any) {
      this.childLogger.error(`Failed to get logs for container ${container.id}: ${error.message}`);
      throw error;
    }
  }
}
