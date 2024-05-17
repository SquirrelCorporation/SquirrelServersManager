import logger from '../../../logger';
import ContainerRegistryUseCases from '../../../use-cases/ContainerRegistryUseCases';
import DeviceUseCases from '../../../use-cases/DeviceUseCases';
import Ecr from '../registries/providers/ecr/Ecr';
import Gcr from '../registries/providers/gcr/Gcr';
import Ghcr from '../registries/providers/ghcr/Ghcr';
import Hotio from '../registries/providers/hotio/Hotio';
import Hub from '../registries/providers/hub/Hub';
import Quay from '../registries/providers/quay/Quay';
import Registry from '../registries/Registry';
import { SSMServicesTypes } from '../../../types/typings';
import Docker from '../watchers/providers/docker/Docker';
import Component, { Kind } from './Component';

/**
 * Registry state.
 */
type stateType = {
  registry: Registry[];
  watcher: Docker[];
};

const state: stateType = {
  registry: [],
  watcher: [],
};

function getStates() {
  return state;
}

/**
 * Return all supported registries
 * @returns {*}
 */
export function getRegistries() {
  return getStates().registry;
}

function getComponentClass(
  kind: Kind,
  provider: string,
): Component<SSMServicesTypes.ConfigurationSchema> {
  switch (`${kind}/${provider}`) {
    case 'watcher/docker':
      return new Docker();
    case 'registry/hub':
      // @ts-expect-error alternative type
      return new Hub();
    case 'registry/gcr':
      // @ts-expect-error alternative type
      return new Gcr();
    case 'registry/ghcr':
      // @ts-expect-error alternative type
      return new Ghcr();
    case 'registry/quay':
      // @ts-expect-error alternative type
      return new Quay();
    case 'registry/hotio':
      return new Hotio();
    case 'registry/ecr':
      // @ts-expect-error alternative type
      return new Ecr();
    default:
      throw new Error(`Unknown kind.provider: ${kind}/${provider}`);
  }
}

/**
 * Register a component.
 *
 * @param {*} kind
 * @param {*} provider
 * @param {*} name
 * @param {*} configuration
 */
async function registerComponent(
  kind: Kind,
  provider: string,
  name: string,
  configuration: SSMServicesTypes.ConfigurationSchema,
) {
  const providerLowercase = provider.toLowerCase();
  const nameLowercase = name.toLowerCase();
  try {
    logger.info(`Registering "${provider}/${name}" component`);
    const component = getComponentClass(kind, provider);
    const componentRegistered = await component.register(
      kind,
      providerLowercase,
      nameLowercase,
      configuration,
    );
    switch (kind) {
      case Kind.WATCHER:
        state.watcher[componentRegistered.getId()] = componentRegistered;
        break;
      case Kind.REGISTRY:
        state.registry[componentRegistered.getId()] = componentRegistered;
        await ContainerRegistryUseCases.addIfNotExists(componentRegistered as Registry);
        break;
      default:
        throw new Error(`Unknown registering component: ${componentRegistered.getId()}`);
    }
    return componentRegistered;
  } catch (e: any) {
    throw new Error(`Error when registering component ${providerLowercase} (${e.message})`);
  }
}
/**
 * Register registries.
 * @returns {Promise}
 */
async function registerWatchers() {
  const devicesToWatch = await DeviceUseCases.getDevicesToWatch();
  const configurations = devicesToWatch?.map((device) => {
    return {
      cron: device.dockerWatcherCron as string,
      watchbydefault: true,
      deviceUuid: device.uuid,
    };
  });

  try {
    const watchersToRegister: any = [];
    configurations?.forEach((configuration) => {
      watchersToRegister.push(registerComponent(Kind.WATCHER, 'docker', 'docker', configuration));
    });
    await Promise.all(watchersToRegister);
  } catch (e: any) {
    logger.warn(`Some watchers failed to register (${e.message})`);
    logger.debug(e);
  }
}

/**
 * Register registries.
 * @returns {Promise}
 */
async function registerRegistries() {
  const containerRegistries = await ContainerRegistryUseCases.listAllSetupRegistries();
  const configurations = containerRegistries?.map((registry) => {
    return {
      ...{
        name: registry.name,
        provider: registry.provider,
      },
      ...registry.auth,
    };
  });
  const registriesToRegister: Record<string, any> = {};

  // Default registries
  registriesToRegister['hotio'] = async () =>
    registerComponent(Kind.REGISTRY, 'hotio', 'hotio', {});
  registriesToRegister['ecr'] = async () => registerComponent(Kind.REGISTRY, 'ecr', 'ecr', {});
  registriesToRegister['hub'] = async () => registerComponent(Kind.REGISTRY, 'hub', 'hub', {});
  registriesToRegister['gcr'] = async () => registerComponent(Kind.REGISTRY, 'gcr', 'gcr', {});
  registriesToRegister['ghcr'] = async () => registerComponent(Kind.REGISTRY, 'ghcr', 'ghcr', {});
  registriesToRegister['quay'] = async () => registerComponent(Kind.REGISTRY, 'quay', 'quay', {});
  try {
    configurations?.forEach((configuration, index) => {
      registriesToRegister[configuration.provider] = async () =>
        registerComponent(
          Kind.REGISTRY,
          configuration.provider,
          configuration.provider,
          configurations[index],
        );
    });
    logger.info('[STATES] Configuration registered will be processed...');
    await Promise.all(
      Object.values(registriesToRegister)
        .sort()
        .map((registerFn) => registerFn()),
    );
  } catch (e: any) {
    logger.warn(`[STATES] Some registries failed to register (${e.message})`);
    logger.debug(e);
  }
}

/**
 * Deregister a component.
 * @param component
 * @param kind
 * @returns {Promise}
 */
async function deregisterComponent(
  kind: Kind,
  component: Component<SSMServicesTypes.ConfigurationSchema>,
) {
  try {
    await component.deregister();
  } catch (e) {
    throw new Error(`Error when de-registering component ${component.getId()}`);
  } finally {
    let components: Registry[] | Docker[] | undefined = undefined;

    switch (kind) {
      case Kind.WATCHER:
        components = getStates().watcher;
        break;
      case Kind.REGISTRY:
        components = getStates().registry;
        break;
      default:
        logger.error(`[WATCHER-ENGINE] Unknown kind ${kind}`);
    }
    if (components) {
      delete components[component.getId()];
    }
  }
}

/**
 * Deregister all components of kind.
 * @param components
 * @param kind
 * @returns {Promise}
 */
async function deregisterComponents(
  kind: Kind,
  components: Component<SSMServicesTypes.ConfigurationSchema>[],
) {
  const deregisterPromises = components.map(async (component) =>
    deregisterComponent(kind, component),
  );
  return Promise.all(deregisterPromises);
}

/**
 * Deregister all registries.
 * @returns {Promise}
 */
async function deregisterRegistries() {
  return deregisterComponents(Kind.REGISTRY, Object.values(getStates().registry));
}

/**
 * Deregister all registries.
 * @returns {Promise}
 */
async function deregisterWatchers() {
  return deregisterComponents(Kind.WATCHER, Object.values(getStates().watcher));
}

/**
 * Deregister all components.
 * @returns {Promise}
 */
async function deregisterAll() {
  logger.warn('[WATCHER-ENGINE] All registered providers will be deregistered.');
  try {
    await deregisterRegistries();
    await deregisterWatchers();
  } catch (e: any) {
    throw new Error(`Error when trying to deregister ${e.message}`);
  }
}

async function init() {
  await registerWatchers();
  // Register registries
  await registerRegistries();
  // Gracefully exit when possible
  process.on('SIGINT', deregisterAll);
  process.on('SIGTERM', deregisterAll);
}

export default {
  getStates,
  init,
  deregisterRegistries,
  registerRegistries,
  deregisterWatchers,
  registerWatchers,
  deregisterAll,
};
