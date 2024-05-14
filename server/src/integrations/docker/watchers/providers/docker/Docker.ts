import debounce from 'debounce';
import DockerModem from 'docker-modem';
import Dockerode, { ContainerInfo } from 'dockerode';
import CronJob from 'node-cron';
import parse from 'parse-docker-image-name';
import { ConnectConfig } from 'ssh2';
import { SSHType } from 'ssm-shared-lib/distribution/enums/ansible';
import Container from '../../../../../data/database/model/Container';
import ContainerRepo from '../../../../../data/database/repository/ContainerRepo';
import ContainerStatsRepo from '../../../../../data/database/repository/ContainerStatsRepo';
import DeviceAuthRepo from '../../../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../../../data/database/repository/DeviceRepo';
import logger from '../../../../../logger';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../../../../ansible-vault/vault';
import Component from '../../../core/Component';
import { getCustomAgent } from '../../../core/CustomAgent';
import EventHandler from '../../../event/EventHandler';
import { SSMServicesTypes } from '../../../typings';
import { Label } from '../../../utils/label';
import tag from '../../../utils/tag';
import {
  fullName,
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
import ConfigurationWatcherSchema = SSMServicesTypes.ConfigurationWatcherSchema;

// The delay before starting the watcher when the app is started
const START_WATCHER_DELAY_MS = 1000;

// Debounce delay used when performing a watch after a docker event has been received
const DEBOUNCED_WATCH_CRON_MS = 5000;

export default class Docker extends Component<ConfigurationWatcherSchema> {
  public watchCron: any;
  public watchCronStat: any;
  public watchCronTimeout: any;
  public watchCronDebounced: any;
  public listenDockerEventsTimeout: any;
  // @ts-expect-error Initialized in init
  public dockerApi: Dockerode;

  getConfigurationSchema() {
    return this.joi.object().keys({
      socket: this.joi.string().default('/var/run/docker.sock'),
      host: this.joi.string(),
      port: this.joi.number().port().default(2375),
      username: this.joi.string(),
      password: this.joi.string(),
      cafile: this.joi.string(),
      certfile: this.joi.string(),
      keyfile: this.joi.string(),
      cron: this.joi.string().default('0 * * * *'),
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
      await this.dockerApi.ping();

      if (this.configuration.watchdigest !== undefined) {
        this.childLogger.warn(
          "WUD_WATCHER_{watcher_name}_WATCHDIGEST environment variable is deprecated and won't be supported in upcoming versions",
        );
      }
      this.childLogger.info(`[DOCKER][WATCHER] - Cron scheduled (${this.configuration.cron})`);
      this.watchCron = CronJob.schedule(this.configuration.cron, () => {
        this.watchFromCron();
      });
      this.watchCronStat = CronJob.schedule('*/1 * * * *', () => {
        this.watchContainerStats();
      });

      // watch at startup (after all components have been registered)
      this.watchCronTimeout = setTimeout(() => this.watchFromCron(), START_WATCHER_DELAY_MS);

      this.watchCronDebounced = debounce(() => {
        this.watchFromCron();
      }, DEBOUNCED_WATCH_CRON_MS);
      // listen to docker events
      if (this.configuration.watchevents) {
        this.listenDockerEventsTimeout = setTimeout(
          () => this.listenDockerEvents(),
          START_WATCHER_DELAY_MS,
        );
      }

      this.watchCron.start();
      this.watchCronStat.start();
    } catch (error: any) {
      this.childLogger.warn(error);
    }
  }

  async initWatcher() {
    const device = await DeviceRepo.findOneByUuid(this.configuration.deviceUuid);
    if (!device) {
      throw new Error(`[DOCKER][WATCHER] - Device not found: ${this.configuration.deviceUuid}`);
    }
    const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
    if (!deviceAuth) {
      throw new Error(`[DOCKER][WATCHER] - DeviceAuth not found: ${this.configuration.deviceUuid}`);
    }
    const options: Dockerode.DockerOptions & { modem?: any; _deviceUuid?: string } = {};
    options._deviceUuid = this.configuration.deviceUuid;
    options.protocol = 'ssh';
    options.port = deviceAuth.sshPort;
    options.username = deviceAuth.sshUser;
    //TODO: If device change ip, reset watchers
    options.host = device.ip;
    const basedSshOptions = {
      tryKeyboard: deviceAuth.customDockerTryKeyboard,
      forceIPv4: deviceAuth.customDockerForcev4,
      forceIPv6: deviceAuth.customDockerForcev6,
      host: device.ip,
      port: deviceAuth.sshPort,
      debug: (message) => {
        logger.debug(message);
      },
    };
    let sshOptions: ConnectConfig = {};
    //sshOptions.agent = getCustomAgent(options);
    if (deviceAuth.customDockerSSH) {
      if (deviceAuth.dockerCustomAuthType === SSHType.KeyBased) {
        sshOptions = {
          username: deviceAuth.dockerCustomSshUser,
          privateKey: await vaultDecrypt(deviceAuth.dockerCustomSshKey as string, DEFAULT_VAULT_ID),
          passphrase: deviceAuth.dockerCustomSshKeyPass
            ? await vaultDecrypt(deviceAuth.dockerCustomSshKeyPass as string, DEFAULT_VAULT_ID)
            : undefined,
        } as ConnectConfig;
      } else if (deviceAuth.dockerCustomAuthType === SSHType.UserPassword) {
        sshOptions = {
          username: deviceAuth.dockerCustomSshUser,
          password: await vaultDecrypt(deviceAuth.dockerCustomSshPwd as string, DEFAULT_VAULT_ID),
        } as ConnectConfig;
      }
    } else {
      if (deviceAuth.authType === SSHType.KeyBased) {
        sshOptions = {
          username: deviceAuth.sshUser,
          privateKey: await vaultDecrypt(deviceAuth.sshKey as string, DEFAULT_VAULT_ID),
          passphrase: deviceAuth.sshKeyPass
            ? await vaultDecrypt(deviceAuth.sshKeyPass as string, DEFAULT_VAULT_ID)
            : undefined,
        } as ConnectConfig;
      } else if (deviceAuth.authType === SSHType.UserPassword) {
        sshOptions = {
          username: deviceAuth.sshUser,
          password: await vaultDecrypt(deviceAuth.sshPwd as string, DEFAULT_VAULT_ID),
        } as ConnectConfig;
      }
    }
    options.sshOptions = { ...basedSshOptions, ...sshOptions };
    sshOptions.keepaliveInterval;
    logger.debug(options);
    try {
      options.modem = new DockerModem({
        agent: getCustomAgent({
          port: options.port,
          host: options.host,
          ...sshOptions,
        }),
      });
      this.dockerApi = new Dockerode(options);
    } catch (error: any) {
      logger.error(error);
      throw new Error(error.message);
    }
  }

  /**
   * Deregister the component.
   * @returns {Promise<void>}
   */
  async deregisterComponent(): Promise<void> {
    this.childLogger.info('[DOCKER][WATCHER] - deregisterComponent');
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
      delete this.watchCronDebounced;
    }
  }

  /**
   * Listen and react to docker events.
   * @return {Promise<void>}
   */
  async listenDockerEvents(): Promise<void> {
    this.childLogger.info('[DOCKER][WATCHER] - Listening to docker events');
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
      this.dockerApi.getEvents(options, (err, stream) => {
        if (err) {
          this.childLogger.warn(
            `[DOCKER][WATCHER] - Unable to listen to Docker events [${err.message}]`,
          );
          this.childLogger.debug(err);
        } else {
          stream?.on('data', (chunk) => this.onDockerEvent(chunk));
        }
      });
    } catch (error: any) {
      logger.error(error);
    }
  }

  /**
   * Process a docker event.
   * @param dockerEventChunk
   * @return {Promise<void>}
   */
  async onDockerEvent(dockerEventChunk: any): Promise<void> {
    logger.info('[DOCKER][WATCHER] - onDockerEvent');
    const dockerEvent = JSON.parse(dockerEventChunk.toString());
    const action = dockerEvent.Action;
    const containerId = dockerEvent.id;
    logger.info('[DOCKER][WATCHER] - onDockerEvent - action: ' + action);

    // If the container was created or destroyed => perform a watch
    if (action === 'destroy' || action === 'create') {
      await this.watchCronDebounced();
    } else {
      // Update container state in db if so
      try {
        const container = this.dockerApi.getContainer(containerId);
        const containerInspect = await container.inspect();
        const newStatus = containerInspect.State.Status;
        const containerFound = await ContainerRepo.findContainerById(containerId);
        if (containerFound) {
          logger.error(JSON.stringify(containerInspect));
          // Child logger for the container to process
          const oldStatus = containerFound.status;
          containerFound.status = newStatus;
          if (oldStatus !== newStatus) {
            await ContainerRepo.updateContainer(containerFound);
            this.childLogger.info(
              `[DOCKER][${fullName(containerFound)}] Status changed from ${oldStatus} to ${newStatus}`,
            );
          }
        }
      } catch (e) {
        this.childLogger.debug(
          `[DOCKER][WATCHER] - Unable to get container details for container id=[${containerId}]`,
        );
      }
    }
  }

  /**
   * Watch containers (called by cron scheduled tasks).
   * @returns {Promise<*[]>}
   */
  async watchFromCron(): Promise<any[]> {
    logger.info(`[DOCKER][WATCHER] - Cron started (${this.configuration.cron})`);

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
    this.childLogger.info(`[DOCKER][WATCHER] - Cron finished (${stats})`);
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
        `[DOCKER][WATCHER] - Error when trying to get the list of the containers to watch (${e.message})`,
      );
    }
    try {
      const containerReports = await Promise.all(
        containers.map((container) => this.watchContainer(container)),
      );
      EventHandler.emitContainerReports(containerReports);
      return containerReports;
    } catch (e: any) {
      logger.error(e);
      this.childLogger.warn(
        `[DOCKER][WATCHER] - Error when processing some containers (${e.message})`,
      );
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
      this.childLogger.warn(`[DOCKER][WATCHER] - Error when processing (${e.message})`);
      this.childLogger.debug(e);
      containerWithResult.error = {
        message: e.message,
      };
    }
    const containerReport = this.mapContainerToContainerReport(containerWithResult);
    EventHandler.emitContainerReport(containerReport);
    return containerReport;
  }

  /**
   * Get all containers to watch.
   * @returns {Promise<unknown[]>}
   */
  async getContainers(): Promise<unknown[]> {
    try {
      this.childLogger.debug('[DOCKER][WATCHER] - getContainers');
      const listContainersOptions = { all: false };
      if (this.configuration.watchall) {
        listContainersOptions.all = true;
      }
      this.childLogger.info('[DOCKER][WATCHER] - getContainers - dockerApi.listContainers');
      const containers = await this.dockerApi.listContainers(listContainersOptions);
      // Filter on containers to watch
      const filteredContainers = containers.filter((container) =>
        isContainerToWatch(container.Labels[Label.wudWatch], this.configuration.watchbydefault),
      );
      this.childLogger.debug(
        `[DOCKER][WATCHER] - filteredContainers: ${JSON.stringify(filteredContainers)}`,
      );
      this.childLogger.info('[DOCKER][WATCHER] - getContainers - getImageDetails');
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
      // Return containers to process
      const containersToReturn = containersWithImage.filter(
        (imagePromise) => imagePromise !== undefined,
      );

      // Prune old containers from the store
      try {
        const containersFromTheStore = await ContainerRepo.findContainersByWatcher(this.name);
        pruneOldContainers(containersToReturn, containersFromTheStore);
      } catch (e: any) {
        this.childLogger.warn(`Error when trying to prune the old containers (${e.message})`);
      }
      return containersToReturn;
    } catch (error: any) {
      this.childLogger.error(error);
      return [];
    }
  }

  /**
   * Find new version for a Container.
   */
  /* eslint-disable-next-line */
  async findNewVersion(container: Container) {
    try {
      const registryProvider = getRegistry(container.image.registry.name);
      const result: { tag: string; digest?: string; created?: string } = {
        tag: container.image.tag.value,
      };
      if (!registryProvider) {
        this.childLogger.error(
          `[DOCKER] - findNewVersion - Unsupported registry (${container.image.registry.name})`,
        );
      } else {
        // Must watch digest? => Find local/remote digests on registries
        if (container.image.digest.watch && container.image.digest.repo) {
          const remoteDigest = await registryProvider.getImageManifestDigest(container.image);
          result.digest = remoteDigest.digest;
          result.created = remoteDigest.created;

          if (remoteDigest.version === 2) {
            // Regular v2 manifest => Get manifest digest
            /*  eslint-disable no-param-reassign */
            const digestV2 = await registryProvider.getImageManifestDigest(
              container.image,
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
        this.childLogger.debug(`[DOCKER] findNewVersion - getTags`);
        const tags = await registryProvider.getTags(container.image);
        this.childLogger.debug(`[DOCKER] findNewVersion - tags: ${tags}`);
        // Get candidates (based on tag name)
        const tagsCandidates = getTagCandidates(container, tags);

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
    displayName: string,
    displayIcon: string,
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
        this.childLogger.info(
          `[DOCKER] addImageDetailsToContainer - Container ${container.Image} already in store`,
        );
        return containerInStore;
      }
      this.childLogger.info(`[DOCKER] addImageDetailsToContainer - getImage: ${container.Image}`);
      const img = this.dockerApi.getImage(container.Image);
      // Get container image details
      this.childLogger.info(`[DOCKER] addImageDetailsToContainer - inspect: ${container.Image}`);
      const image = await img.inspect();
      this.childLogger.info(
        `[DOCKER] addImageDetailsToContainer - distribution: ${container.Image}`,
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
            `[DOCKER] addImageDetailsToContainer - Cannot get a reliable tag for this image [${imageNameToParse}]`,
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
          "[DOCKER] addImageDetailsToContainer - Image is not a semver and digest watching is disabled so wud won't report any update. Please review the configuration to enable digest watching for this container or exclude this container from being watched",
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
      });
    } catch (error: any) {
      logger.error(
        `[DOCKER] addImageDetailsToContainer - Error during normalizing image ${container.Image}`,
      );
      logger.error(error);
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
      throw new Error(`[DOCKER][WATCHER] - Device not found: ${this.configuration.deviceUuid}`);
    }
    // Find container in db & compare
    const containerInDb = await ContainerRepo.findContainerById(containerWithResult.id);

    // Not found in DB? => Save it
    if (!containerInDb) {
      this.childLogger.debug('[DOCKER][WATCHER] - Container watched for the first time');
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
    this.childLogger.info('[DOCKER][WATCHER]  - cron - watchContainerStats');
    try {
      const containers = await ContainerRepo.findContainersByWatcher(this.name);
      if (!containers) {
        return;
      }
      for (const container of containers) {
        this.childLogger.info(`[DOCKER][WATCHER]  - cron - watchContainerStats ${container.id}`);
        try {
          const dockerContainer = this.dockerApi.getContainer(container.id);
          const dockerStats = await dockerContainer.stats({ stream: false });
          await ContainerStatsRepo.create(container, dockerStats);
        } catch (error: any) {
          this.childLogger.error(
            `[DOCKER][WATCHER] - cron - Error retrieving start for ${container.id}}`,
          );
        }
      }
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }
}
