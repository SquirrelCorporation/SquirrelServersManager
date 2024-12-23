import debounce from 'debounce';
import DockerModem from 'docker-modem';
import Dockerode, { ContainerInfo } from 'dockerode';
import CronJob from 'node-cron';
import parse from 'parse-docker-image-name';
import pino from 'pino';
import { SsmStatus } from 'ssm-shared-lib';
import Events from '../../../../../core/events/events';
import Container from '../../../../../data/database/model/Container';
import Device from '../../../../../data/database/model/Device';
import DeviceAuth from '../../../../../data/database/model/DeviceAuth';
import ContainerRepo from '../../../../../data/database/repository/ContainerRepo';
import ContainerStatsRepo from '../../../../../data/database/repository/ContainerStatsRepo';
import DeviceAuthRepo from '../../../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../../../data/database/repository/DeviceRepo';
import SSHCredentialsHelper from '../../../../../helpers/ssh/SSHCredentialsHelper';
import logger from '../../../../../logger';
import DeviceUseCases from '../../../../../services/DeviceUseCases';
import Component from '../../../core/Component';
import { getCustomAgent } from '../../../core/CustomAgent';
import { Label } from '../../../utils/label';
import tag from '../../../utils/tag';
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
} from '../../../utils/utils';
import DockerLogs from './AbstractDockerLogs';

// The delay before starting the watcher when the app is started
const START_WATCHER_DELAY_MS = 1000;

// Debounce delay used when performing a watch after a docker event has been received
const DEBOUNCED_WATCH_CRON_MS = 5000;

export default class Docker extends DockerLogs {
  watchCron!: CronJob.ScheduledTask | undefined;
  watchCronStat!: CronJob.ScheduledTask | undefined;
  watchCronTimeout: any;
  watchCronDebounced: any = undefined;
  listenDockerEventsTimeout: any;
  dockerApi: Dockerode | any = undefined;

  getConfigurationSchema() {
    return this.joi.object().keys({
      // TODO: move the default somewhere else
      socket: this.joi.string().default('/var/run/docker.sock'),
      host: this.joi.string(),
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
      watchall: this.joi.boolean().default(false),
      watchevents: this.joi.boolean().default(true),
      deviceUuid: this.joi.string().required(),
    });
  }
  /**
   * Init the Watcher.
   */
  async init() {
    try {
      await this.initWatcher();
      await this.dockerApi.info().then(async (e) => {
        await DeviceUseCases.updateDockerInfo(this.configuration.deviceUuid, e.ID, e.ServerVersion);
      });

      this.childLogger.info(
        `Cron scheduled (cron: "${this.configuration.cron}", device: ${this.configuration.host})`,
      );
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
      this.childLogger.warn(error);
    }
  }

  static async getDockerConnectionOptions(
    device: Device,
    deviceAuth: DeviceAuth,
    logger: pino.Logger<never>,
  ) {
    const options = await SSHCredentialsHelper.getDockerSshConnectionOptions(device, deviceAuth);
    logger.debug(options);
    const agent = getCustomAgent(logger, {
      debug: (message: any) => {
        logger.debug(message);
      },
      ...options.sshOptions,
      timeout: 60000,
    });
    try {
      options.modem = new DockerModem({
        agent: agent,
      });
    } catch (error: any) {
      logger.error(error);
      throw new Error(error.message);
    }
    return options;
  }

  static async testDockerConnection(device: Device, deviceAuth: DeviceAuth) {
    const options = await Docker.getDockerConnectionOptions(device, deviceAuth, logger);
    const docker = new Dockerode({ ...options, timeout: 60000 });
    await docker.ping();
    await docker.info();
  }

  async initWatcher() {
    const device = await DeviceRepo.findOneByUuid(this.configuration.deviceUuid);
    if (!device) {
      throw new Error(
        `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
      );
    }
    const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
    if (!deviceAuth) {
      throw new Error(
        `DeviceAuth not found for deviceID ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
      );
    }
    const options = await Docker.getDockerConnectionOptions(device, deviceAuth, this.childLogger);
    this.dockerApi = new Dockerode(options);
  }

  /**
   * Deregister the component.
   * @returns {Promise<void>}
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
  }

  /**
   * Watch containers (called by cron scheduled tasks).
   * @returns {Promise<*[]>}
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
    this.emit(Events.UPDATED_CONTAINERS, 'Updated containers');
    return containerReports;
  }

  /**
   * Watch main method.
   * @returns {Promise<*[]>}
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
      logger.error(e);
      this.childLogger.warn(`Error when processing some containers (${e.message})`);
      return [];
    }
  }

  /**
   * Watch a Container.
   * @param container
   * @returns {Promise<*>}
   */
  async watchContainer(container: Container): Promise<any> {
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
   * @returns {Promise<unknown[]>}
   */
  async getContainers(): Promise<unknown[]> {
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
        await ContainerRepo.updateStatusByWatcher(this.name, SsmStatus.ContainerStatus.UNREACHABLE);
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
      const containerPromises = filteredContainers.map((container: ContainerInfo) =>
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
        const containersFromTheStore = await ContainerRepo.findContainersByWatcher(this.name);
        pruneOldContainers(containersToReturn, containersFromTheStore);
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

  async findNewVersion(container: Container) {
    try {
      const registryProvider = getRegistry(container.image.registry.name);
      const result: { tag: string; digest?: string; created?: string } = {
        tag: container.image.tag.value,
      };

      if (!registryProvider) {
        this.childLogger.error(
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
   * @param container
   * @param includeTags
   * @param excludeTags
   * @param transformTags
   * @param linkTemplate
   * @param displayName
   * @param displayIcon
   * @returns {Promise<Container | undefined>}
   */
  async addImageDetailsToContainer(
    container: Dockerode.ContainerInfo,
    includeTags: string,
    excludeTags: string,
    transformTags: string,
    linkTemplate: string,
    displayName?: string,
    displayIcon?: string,
  ): Promise<Container | undefined> {
    try {
      const containerId = container.Id;
      // Is container already in store? just return it :)
      const containerInStore = await ContainerRepo.findContainerById(containerId);
      if (
        containerInStore !== undefined &&
        containerInStore !== null &&
        containerInStore.error === undefined
      ) {
        this.childLogger.debug(
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
        `addImageDetailsToContainer - Error during normalizing image ${container.Image}`,
      );
      this.childLogger.error(error);
    }
  }

  /**
   * Process a Container with result and map to a containerReport.
   * @param containerWithResult
   * @return {*}
   */
  async mapContainerToContainerReport(containerWithResult: Container): Promise<any> {
    const containerReport = {
      container: containerWithResult,
      changed: false,
    };
    const device = await DeviceRepo.findOneByUuid(this.configuration.deviceUuid);
    if (!device) {
      throw new Error(
        `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
      );
    }
    // Find container in db & compare
    const containerInDb = await ContainerRepo.findContainerById(containerWithResult.id);

    // Not found in DB? => Save it
    if (!containerInDb) {
      this.childLogger.debug('Container watched for the first time');
      containerReport.container = await ContainerRepo.createContainer(containerWithResult, device);
      containerReport.changed = true;

      // Found in DB? => update it
    } else {
      containerReport.container = await ContainerRepo.updateContainer(containerWithResult);
      containerReport.changed = !!(
        hasResultChanged(containerInDb, containerReport.container) &&
        containerWithResult.updateAvailable
      );
    }
    return containerReport;
  }

  /**
   * Sanitize sensitive data
   * @returns {*}
   */
  maskConfiguration(): any {
    return {
      ...this.configuration,
      cafile: Component.mask(this.configuration.cafile),
      certfile: Component.mask(this.configuration.certfile),
      keyfile: Component.mask(this.configuration.keyfile),
    };
  }

  async watchContainerStats() {
    this.childLogger.info(
      `watchContainerStats ${this.name} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );
    try {
      const containers = await ContainerRepo.findContainersByWatcher(this.name);
      if (!containers) {
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
          await ContainerStatsRepo.create(container, dockerStats);
        } catch (error: any) {
          this.childLogger.error(error);
          this.childLogger.error(
            `[CRON] - Error retrieving stats for ${container.name}/${container.id}} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
          );
        }
      }
      this.emit(Events.UPDATED_CONTAINERS, 'Updated containers');
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }

  async pauseContainer(container: Container) {
    return await this.dockerApi.getContainer(container.id).pause();
  }

  async stopContainer(container: Container) {
    return await this.dockerApi.getContainer(container.id).stop();
  }

  async startContainer(container: Container) {
    return await this.dockerApi.getContainer(container.id).start();
  }

  async restartContainer(container: Container) {
    return await this.dockerApi.getContainer(container.id).restart();
  }

  async killContainer(container: Container) {
    this.childLogger.warn(
      `killContainer "${container.id}" (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );
    await this.dockerApi.getContainer(container.id).kill();
  }
}
