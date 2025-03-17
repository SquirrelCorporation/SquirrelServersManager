import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Dockerode from 'dockerode';
import DockerModem from 'docker-modem';
import debounce from 'debounce';
import { v4 as uuidv4 } from 'uuid';
import { CronJob } from 'cron';
import * as Joi from 'joi';
import parse from 'parse-docker-image-name';
import { SsmStatus } from 'ssm-shared-lib';
import { getCustomAgent } from '../../../../../core/CustomAgent';
import { Label } from '../../../../../utils/label';
import tag from '../../../../../utils/tag';
import {
  getContainerName,
  getRegistry,
  getRepoDigest,
  getTagCandidates,
  hasResultChanged,
  isContainerToWatch,
  isDigestToWatch,
  normalizeContainer,
  pruneOldContainers,
} from '../../../../../utils/utils';
import { ContainerServiceInterface } from '../../../../../../application/interfaces/container-service.interface';
import { ContainerStatsServiceInterface } from '../../../../../../application/interfaces/container-stats-service.interface';
import { IContainerLogsService } from '../../../../../../application/interfaces/container-logs-service.interface';
import { ContainerImagesServiceInterface } from '../../../../../../application/interfaces/container-images-service.interface';
import { ContainerVolumesServiceInterface } from '../../../../../../application/interfaces/container-volumes-service.interface';
import { ContainerNetworksServiceInterface } from '../../../../../../application/interfaces/container-networks-service.interface';
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
  watchCron!: CronJob | undefined;
  watchCronStat!: CronJob | undefined;
  watchCronTimeout: any;
  watchCronDebounced: any = undefined;
  listenDockerEventsTimeout: any;
  dockerApi: Dockerode | any = undefined;

  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly containerService: ContainerServiceInterface,
    protected readonly containerStatsService: ContainerStatsServiceInterface,
    protected readonly containerLogsService: IContainerLogsService,
    protected readonly containerImagesService: ContainerImagesServiceInterface,
    protected readonly containerVolumesService: ContainerVolumesServiceInterface,
    protected readonly containerNetworksService: ContainerNetworksServiceInterface
  ) {
    super(eventEmitter, containerService, containerStatsService, containerLogsService, 
          containerImagesService, containerVolumesService, containerNetworksService);
  }

  /**
   * Initialize the Docker watcher component
   */
  async init(): Promise<void> {
    try {
      this.childLogger.info(`Setting up Docker watcher for ${this.name}`);

      await this.initWatcher();
      await this.dockerApi.info().then(async (e) => {
        // In the NestJS version, we use the containerService instead of DeviceUseCases
        await this.containerService.updateDeviceDockerInfo(this.configuration.deviceUuid, e.ID, e.ServerVersion);
      });

      this.childLogger.info(
        `Cron scheduled (cron: "${this.configuration.cron}", device: ${this.configuration.host})`
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
          START_WATCHER_DELAY_MS
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
      // In NestJS version, we use containerService instead of direct repository access
      const device = await this.containerService.getDeviceByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(
          `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`
        );
      }

      const deviceAuth = await this.containerService.getDeviceAuth(device.uuid);
      if (!deviceAuth) {
        throw new Error(
          `DeviceAuth not found for deviceID ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`
        );
      }

      const options = await this.getDockerConnectionOptions(device, deviceAuth);
      this.dockerApi = new Dockerode(options);
    } catch (error: any) {
      this.childLogger.error(`Failed to initialize watcher: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Docker connection options
   */
  async getDockerConnectionOptions(device: any, deviceAuth: any): Promise<any> {
    try {
      // In NestJS version, we use containerService to get connection options
      const options = await this.containerService.getDockerSshConnectionOptions(device, deviceAuth);
      this.childLogger.debug(options);

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
      deviceUuid: this.joi.string().required()
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
      password: this.maskValue(this.configuration.password)
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
   * Start container watch jobs
   */
  private startWatchJobs(): void {
    const { cron, watchstats, cronstats, watchevents } = this.configuration;

    // Container watcher job
    if (cron) {
      this.childLogger.info(`Starting container watcher cron job with schedule: ${cron}`);
      this.cronJob = new CronJob(cron, () => {
        this.watchContainersFromCron().catch(error => {
          this.childLogger.error(`Failed to sync containers: ${error.message}`);
        });

        this.watchNetworksFromCron().catch(error => {
          this.childLogger.error(`Failed to sync networks: ${error.message}`);
        });

        this.watchVolumesFromCron().catch(error => {
          this.childLogger.error(`Failed to sync volumes: ${error.message}`);
        });

        this.watchImagesFromCron().catch(error => {
          this.childLogger.error(`Failed to sync images: ${error.message}`);
        });
      });

      this.cronJob.start();
    }

    // Container stats job
    if (watchstats && cronstats) {
      this.childLogger.info(`Starting container stats cron job with schedule: ${cronstats}`);
      this.statsJob = new CronJob(cronstats, () => {
        this.watchContainerStats().catch(error => {
          this.childLogger.error(`Failed to sync container stats: ${error.message}`);
        });
      });

      this.statsJob.start();
    }

    // Delayed first run
    this.watchCronTimeout = setTimeout(() => {
      this.watchContainersFromCron().catch(error => {
        this.childLogger.error(`Failed to sync containers: ${error.message}`);
      });

      this.watchNetworksFromCron().catch(error => {
        this.childLogger.error(`Failed to sync networks: ${error.message}`);
      });

      this.watchVolumesFromCron().catch(error => {
        this.childLogger.error(`Failed to sync volumes: ${error.message}`);
      });

      this.watchImagesFromCron().catch(error => {
        this.childLogger.error(`Failed to sync images: ${error.message}`);
      });

      if (watchstats) {
        this.watchContainerStats().catch(error => {
          this.childLogger.error(`Failed to sync container stats: ${error.message}`);
        });
      }
    }, 1000);

    // Set up debounced watch
    this.watchCronDebounced = this.debouncedWatch.bind(this);

    // Listen to docker events
    if (watchevents) {
      this.listenDockerEventsTimeout = setTimeout(
        () => this.listenDockerEvents(),
        1000
      );
    }
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
      `watchContainersFromCron - Cron started (cron: "${this.configuration.cron}", deviceID: ${this.configuration.deviceUuid})`
    );

    // Get container reports
    const containerReports = await this.watch();

    // Count container reports
    const containerReportsCount = containerReports.length;

    // Count container available updates
    const containerUpdatesCount = containerReports.filter(
      (containerReport) => containerReport.container.updateAvailable
    ).length;

    // Count container errors
    const containerErrorsCount = containerReports.filter(
      (containerReport) => containerReport.container.error !== undefined
    ).length;

    const stats = `${containerReportsCount} containers watched, ${containerErrorsCount} errors, ${containerUpdatesCount} available updates`;
    this.childLogger.info(
      `watchContainersFromCron - Cron finished: ${stats} (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
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
        `Error when trying to get the list of the containers to watch (${e.message})`
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
    this.childLogger.debug('Start watching');

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
          `listContainers - error: ${e.message} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
        );
        // In NestJS version, use containerService to update status
        await this.containerService.updateContainerStatusByWatcher(this.name, SsmStatus.ContainerStatus.UNREACHABLE);
        return [];
      }

      // Filter on containers to watch
      const filteredContainers = containers.filter((container) =>
        isContainerToWatch(container.Labels[Label.wudWatch], this.configuration.watchbydefault)
      );

      this.childLogger.debug(
        `getContainers - filteredContainers: ${JSON.stringify(filteredContainers)}`
      );

      this.childLogger.info(
        `getContainers - getImageDetails for ${filteredContainers?.length} containers... (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
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
        )
      );

      const containersWithImage = await Promise.all(containerPromises);

      this.childLogger.info(
        `getContainers - getImageDetails - ended - (deviceIP: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
      );

      // Return containers to process
      const containersToReturn = containersWithImage.filter(
        (imagePromise) => imagePromise !== undefined
      );

      // Prune old containers from the store
      try {
        // In NestJS version, use containerService to find containers
        const containersFromTheStore = await this.containerService.getContainersByWatcher(this.name);
        pruneOldContainers(containersToReturn, containersFromTheStore);
      } catch (e: any) {
        this.childLogger.warn(
          `Error when trying to prune the old containers (message: ${e.message}, deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
        );
      }

      return containersToReturn;
    } catch (error: any) {
      this.childLogger.error(
        `getContainers - error: ${error.message} (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
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
      const registryProvider = getRegistry(container.image.registry.name);
      const result: { tag: string; digest?: string; created?: string } = {
        tag: container.image.tag.value,
      };

      if (!registryProvider) {
        this.childLogger.error(
          `findNewVersion - Unsupported registry: ${container.image.registry.name} (image: ${container.image.name})`
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
      // In NestJS version, use containerService
      const containerInStore = await this.containerService.getContainerById(containerId);

      if (
        containerInStore !== undefined &&
        containerInStore !== null &&
        containerInStore.error === undefined
      ) {
        this.childLogger.debug(
          `addImageDetailsToContainer - Container "${container.Image}" already in store - (containerId: ${containerInStore.id})`
        );
        return { ...containerInStore, status: container.State, labels: container?.Labels };
      }

      this.childLogger.info(
        `addImageDetailsToContainer - getImage: ${container.Image} - (containerId: ${containerId})`
      );

      const img = this.dockerApi.getImage(container.Image);

      // Get container image details
      this.childLogger.info(
        `addImageDetailsToContainer - inspect: ${container.Image} - (containerId: ${containerId})`
      );

      const image = await img.inspect();

      this.childLogger.info(
        `addImageDetailsToContainer - distribution: ${container.Image} - (containerId: ${containerId})`
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
            `addImageDetailsToContainer - Cannot get a reliable tag for this image [${imageNameToParse}] - (containerId: ${containerId})`
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
          `addImageDetailsToContainer - Image "${imageNameToParse}" is not a semver and digest watching is disabled so wud won't report any update. Please review the configuration to enable digest watching for this container or exclude this container from being watched`
        );
      }

      return normalizeContainer({
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
        `addImageDetailsToContainer - Error during normalizing image ${container.Image}`
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

    // In NestJS version, use containerService to get device
    const device = await this.containerService.getDeviceByUuid(this.configuration.deviceUuid);
    if (!device) {
      throw new Error(
        `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`
      );
    }

    // Find container in db & compare
    // In NestJS version, use containerService
    const containerInDb = await this.containerService.getContainerById(containerWithResult.id);

    // Not found in DB? => Save it
    if (!containerInDb) {
      this.childLogger.debug('Container watched for the first time');
      // In NestJS version, use containerService
      containerReport.container = await this.containerService.createContainer(
        this.configuration.deviceUuid,
        containerWithResult
      );
      containerReport.changed = true;

      // Found in DB? => update it
    } else {
      // In NestJS version, use containerService
      containerReport.container = await this.containerService.updateContainer(
        containerInDb.uuid,
        containerWithResult
      );
      containerReport.changed = !!(
        hasResultChanged(containerInDb, containerReport.container) &&
        containerWithResult.updateAvailable
      );
    }

    return containerReport;
  }

  /**
   * Format container information
   */
  private formatContainerInfo(containerInfo: any): any {
    return {
      id: containerInfo.Id,
      name: containerInfo.Name.replace(/^\//, ''), // Remove leading slash
      image: containerInfo.Config.Image,
      command: containerInfo.Config.Cmd ? containerInfo.Config.Cmd.join(' ') : '',
      state: containerInfo.State.Status,
      status: containerInfo.State.Status,
      createdAt: new Date(containerInfo.Created),
      ports: this.formatPorts(containerInfo.NetworkSettings.Ports),
      labels: containerInfo.Config.Labels || {},
      env: containerInfo.Config.Env || [],
      networks: containerInfo.NetworkSettings.Networks || {},
      mounts: containerInfo.Mounts || [],
      restart: containerInfo.HostConfig.RestartPolicy.Name,
      oomKilled: containerInfo.State.OOMKilled
    };
  }

  /**
   * Format ports mapping
   */
  private formatPorts(ports: any): any {
    const formattedPorts: any = {};

    if (!ports) {
      return formattedPorts;
    }

    Object.entries(ports).forEach(([portProto, bindings]: [string, any]) => {
      formattedPorts[portProto] = {
        bindings: bindings || [],
      };
    });

    return formattedPorts;
  }

  /**
   * Track container stats
   */
  async watchContainerStats(): Promise<void> {
    this.childLogger.info(
      `watchContainerStats ${this.name} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
    );

    try {
      const containers = await this.containerService.getContainersByWatcher(this.name);

      if (!containers || containers.length === 0) {
        this.childLogger.warn(
          `watchContainerStats - No container to watch - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
        );
        return;
      }

      this.childLogger.info(
        `watchContainerStats - Found ${containers.length} container(s) to watch... (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
      );

      for (const container of containers) {
        this.childLogger.info(
          `watchContainerStats ${container.id} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
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
            `[CRON] - Error retrieving stats for ${container.name}/${container.id}} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
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
   * Mask configuration (hide sensitive data)
   */
  maskConfiguration(): any {
    return {
      ...this.configuration,
      cafile: this.maskValue(this.configuration.cafile),
      certfile: this.maskValue(this.configuration.certfile),
      keyfile: this.maskValue(this.configuration.keyfile),
      password: this.maskValue(this.configuration.password)
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
   * Container action methods - matching original implementation
   */
  async pauseContainer(container: any): Promise<any> {
    try {
      return await this.dockerApi.getContainer(container.id).pause();
    } catch (error: any) {
      this.childLogger.error(`Failed to pause container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async stopContainer(container: any): Promise<any> {
    try {
      return await this.dockerApi.getContainer(container.id).stop();
    } catch (error: any) {
      this.childLogger.error(`Failed to stop container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async startContainer(container: any): Promise<any> {
    try {
      return await this.dockerApi.getContainer(container.id).start();
    } catch (error: any) {
      this.childLogger.error(`Failed to start container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async restartContainer(container: any): Promise<any> {
    try {
      return await this.dockerApi.getContainer(container.id).restart();
    } catch (error: any) {
      this.childLogger.error(`Failed to restart container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  async killContainer(container: any): Promise<any> {
    this.childLogger.warn(
      `killContainer "${container.id}" (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
    );
    try {
      return await this.dockerApi.getContainer(container.id).kill();
    } catch (error: any) {
      this.childLogger.error(`Failed to kill container ${container.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * NestJS utility methods that help with container management
   */
  async createContainer(containerConfig: any): Promise<any> {
    try {
      this.childLogger.info(`Creating container ${containerConfig.name}`);

      // Prepare Docker configuration
      const dockerConfig: Dockerode.ContainerCreateOptions = {
        Image: containerConfig.image,
        name: containerConfig.name,
        Env: this.prepareEnvironmentVariables(containerConfig.env),
        HostConfig: {
          PortBindings: this.preparePortBindings(containerConfig.ports),
          Binds: this.prepareVolumeBindings(containerConfig.volumes),
          RestartPolicy: {
            Name: containerConfig.restart || 'no'
          },
          Privileged: containerConfig.privileged || false
        },
        Labels: containerConfig.labels || {}
      };

      if (containerConfig.command) {
        dockerConfig.Cmd = containerConfig.command.split(' ');
      }

      // Create the container
      const container = await this.dockerApi.createContainer(dockerConfig);

      // Start the container if it was created successfully
      await container.start();

      // Inspect the container to get full details
      const details = await container.inspect();

      // Add UUID and format for our system
      const formattedContainer = this.formatContainerInfo(details);
      const containerUuid = uuidv4();

      // Add container to database
      const containerEntity = {
        ...formattedContainer,
        uuid: containerUuid,
        deviceUuid: this.configuration.deviceUuid,
        watchers: [this.name],
        isManaged: true,
        isWatched: true
      };

      await this.containerService.createContainer(this.configuration.deviceUuid, containerEntity);

      return { ...formattedContainer, uuid: containerUuid };
    } catch (error: any) {
      this.childLogger.error(`Failed to create container: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format container information
   */
  private formatContainerInfo(containerInfo: any): any {
    return {
      id: containerInfo.Id,
      name: containerInfo.Name.replace(/^\//, ''), // Remove leading slash
      image: containerInfo.Config.Image,
      command: containerInfo.Config.Cmd ? containerInfo.Config.Cmd.join(' ') : '',
      state: containerInfo.State.Status,
      status: containerInfo.State.Status,
      createdAt: new Date(containerInfo.Created),
      ports: this.formatPorts(containerInfo.NetworkSettings.Ports),
      labels: containerInfo.Config.Labels || {},
      env: containerInfo.Config.Env || [],
      networks: containerInfo.NetworkSettings.Networks || {},
      mounts: containerInfo.Mounts || [],
      restart: containerInfo.HostConfig.RestartPolicy.Name,
      oomKilled: containerInfo.State.OOMKilled
    };
  }

  /**
   * Format ports mapping
   */
  private formatPorts(ports: any): any {
    const formattedPorts: any = {};

    if (!ports) {
      return formattedPorts;
    }

    Object.entries(ports).forEach(([portProto, bindings]: [string, any]) => {
      formattedPorts[portProto] = {
        bindings: bindings || [],
      };
    });

    return formattedPorts;
  }

  /**
   * Prepare environment variables
   */
  private prepareEnvironmentVariables(env?: Record<string, string>): string[] {
    if (!env) {
      return [];
    }

    return Object.entries(env).map(([key, value]) => `${key}=${value}`);
  }

  /**
   * Prepare port bindings
   */
  private preparePortBindings(ports?: Record<string, any>): any {
    const portBindings: any = {};

    if (!ports) {
      return portBindings;
    }

    Object.entries(ports).forEach(([portProto, binding]: [string, any]) => {
      portBindings[portProto] = binding.bindings ? binding.bindings.map((b: any) => ({
        HostIp: b.hostIp || '',
        HostPort: b.hostPort || ''
      })) : [];
    });

    return portBindings;
  }

  /**
   * Prepare volume bindings
   */
  private prepareVolumeBindings(volumes?: any[]): string[] {
    if (!volumes) {
      return [];
    }

    return volumes.map(volume => {
      let binding = `${volume.source}:${volume.target}`;
      if (volume.readonly) {
        binding += ':ro';
      }
      return binding;
    });
  }
}