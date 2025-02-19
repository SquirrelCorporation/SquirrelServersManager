import Device from '../../../data/database/model/Device';
import PinoLogger from '../../../logger';
import DeviceUseCases from '../../../services/DeviceUseCases';
import RemoteSystemInformationWatcher from '../watchers/RemoteSystemInformationWatcher';
import Component from './Component';
import { RemoteSystemInformationConfigurationSchema } from './types';

const logger = PinoLogger.child(
  { module: 'RemoteSystemInformationEngine' },
  { msgPrefix: '[REMOTE_SYSTEM_INFORMATION_ENGINE] - ' },
);

type stateType = {
  watcher: RemoteSystemInformationWatcher[];
};

const state: stateType = {
  watcher: [],
};

function getStates() {
  return state;
}

/**
 * Register a component.
 *
 * @param _id
 * @param {*} provider
 * @param {*} name
 * @param {*} configuration
 */
async function registerComponent(
  _id: string,
  provider: string,
  name: string,
  configuration: RemoteSystemInformationConfigurationSchema,
) {
  const providerLowercase = provider.toLowerCase();
  const nameLowercase = name.toLowerCase();
  try {
    logger.info(`Registering "${provider}/${name}" component...`);
    const component = new RemoteSystemInformationWatcher();
    const componentRegistered = await component.register(_id, nameLowercase, configuration);
    state.watcher[componentRegistered.getId()] = componentRegistered;
    return componentRegistered;
  } catch (e: any) {
    logger.error(e);
    logger.error(
      `Error when registering component ${providerLowercase}/${nameLowercase} (${e.message})`,
    );
  }
}

async function registerWatcher(device: Device): Promise<any> {
  return await registerComponent(
    device._id,
    'Watcher',
    `remote-system-information-${device.uuid}`,
    {
      cpu: {
        watch: !!device.configuration?.systemInformation?.cpu?.watch,
        cron: device.configuration?.systemInformation?.cpu?.cron || '0 0 * * *',
      },
      cpuStats: {
        watch: !!device.configuration?.systemInformation?.cpuStats?.watch,
        cron: device.configuration?.systemInformation?.cpuStats?.cron || '0 0 * * *',
      },
      mem: {
        watch: !!device.configuration?.systemInformation?.mem?.watch,
        cron: device.configuration?.systemInformation?.mem?.cron || '0 0 * * *',
      },
      memStats: {
        watch: !!device.configuration?.systemInformation?.memStats?.watch,
        cron: device.configuration?.systemInformation?.memStats?.cron || '0 0 * * *',
      },
      fileSystem: {
        watch: !!device.configuration?.systemInformation?.fileSystems?.watch,
        cron: device.configuration?.systemInformation?.fileSystems?.cron || '0 0 * * *',
      },
      fileSystemStats: {
        watch: !!device.configuration?.systemInformation?.fileSystemsStats?.watch,
        cron: device.configuration?.systemInformation?.fileSystemsStats?.cron || '0 0 * * *',
      },
      system: {
        watch: !!device.configuration?.systemInformation?.system?.watch,
        cron: device.configuration?.systemInformation?.system?.cron || '0 0 * * *',
      },
      os: {
        watch: !!device.configuration?.systemInformation?.os?.watch,
        cron: device.configuration?.systemInformation?.os?.cron || '0 0 * * *',
      },
      wifi: {
        watch: !!device.configuration?.systemInformation?.wifi?.watch,
        cron: device.configuration?.systemInformation?.wifi?.cron || '0 0 * * *',
      },
      usb: {
        watch: !!device.configuration?.systemInformation?.usb?.watch,
        cron: device.configuration?.systemInformation?.usb?.cron || '0 0 * * *',
      },
      graphics: {
        watch: !!device.configuration?.systemInformation?.graphics?.watch,
        cron: device.configuration?.systemInformation?.graphics?.cron || '0 0 * * *',
      },
      bluetooth: {
        watch: !!device.configuration?.systemInformation?.bluetooth?.watch,
        cron: device.configuration?.systemInformation?.bluetooth?.cron || '0 0 * * *',
      },
      networkInterfaces: {
        watch: !!device.configuration?.systemInformation?.networkInterfaces?.watch,
        cron: device.configuration?.systemInformation?.networkInterfaces?.cron || '0 0 * * *',
      },
      versions: {
        watch: !!device.configuration?.systemInformation?.versions?.watch,
        cron: device.configuration?.systemInformation?.versions?.cron || '0 0 * * *',
      },
      host: device.ip,
      deviceUuid: device.uuid,
    },
  );
}

/**
 * Register watchers from database.
 * @returns {Promise}
 */
async function registerWatchers(): Promise<any> {
  const dockerDevicesToWatch = await DeviceUseCases.getRemoteSysInfoDevicesToWatch();

  try {
    const watchersToRegister: any = [];
    dockerDevicesToWatch?.map((device) => {
      watchersToRegister.push(registerWatcher(device));
    });
    await Promise.all(watchersToRegister);
  } catch (e: any) {
    logger.warn(`Some watchers failed to register (${e.message})`);
    logger.debug(e);
  }
}

/**
 * Deregister a component.
 * @param component
 * @returns {Promise}
 */
async function deregisterComponent(component: Component): Promise<any> {
  try {
    await component.deregister();
  } catch (e: any) {
    throw new Error(
      `Error when de-registering component ${component.getId()} (error: ${e.message})`,
    );
  } finally {
    let components: RemoteSystemInformationWatcher[] | undefined = undefined;
    components = getStates().watcher;
    if (components) {
      delete components[component.getId() as keyof typeof components];
    }
  }
}

/**
 * Deregister all components of kind.
 * @param components
 * @returns {Promise}
 */
async function deregisterComponents(components: Component[]): Promise<any> {
  const deregisterPromises = components.map(async (component) => deregisterComponent(component));
  return Promise.all(deregisterPromises);
}

async function deregisterWatchers(): Promise<any> {
  return deregisterComponents(Object.values(getStates().watcher));
}
/**
 * Deregister all components.
 * @returns {Promise}
 */
async function deregisterAll(): Promise<any> {
  logger.warn('All registered providers will be deregistered.');
  try {
    await deregisterWatchers();
  } catch (e: any) {
    throw new Error(`Error when trying to deregister ${e.message}`);
  }
}

async function init() {
  // Register Watchers
  await registerWatchers();
  // Gracefully exit when possible
  process.on('SIGINT', deregisterAll);
  process.on('SIGTERM', deregisterAll);
}

export default {
  init,
  deregisterAll,
  registerWatcher,
  registerComponent,
  registerWatchers,
  deregisterComponent,
  getStates,
};
