import { RegistryAuthConfig } from '@modules/containers/types';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import PinoLogger from '../../../../logger';
import { IContainerRegistryEntity } from '../../domain/entities/container-registry.entity';
import { IContainerRegistriesService } from '../../domain/interfaces/container-registries-service.interface';
import {
  IWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../../domain/interfaces/watcher-engine-service.interface';
import {
  CONTAINER_REGISTRY_REPOSITORY,
  IContainerRegistryRepository,
} from '../../domain/repositories/container-registry-repository.interface';

const logger = PinoLogger.child(
  { module: 'ContainerRegistriesService' },
  { msgPrefix: '[CONTAINER_REGISTRY] - ' },
);

@Injectable()
export class ContainerRegistriesService implements IContainerRegistriesService {
  constructor(
    @Inject(CONTAINER_REGISTRY_REPOSITORY)
    private readonly containerRegistryRepository: IContainerRegistryRepository,
    @Inject(forwardRef(() => WATCHER_ENGINE_SERVICE))
    private readonly watcherEngineService: IWatcherEngineService,
  ) {}

  /**
   * Get all registries
   * @returns List of all registries
   */
  async getAllRegistries(): Promise<IContainerRegistryEntity[]> {
    return this.containerRegistryRepository.findAll();
  }

  /**
   * Get registry by name
   * @param name Registry name
   * @returns Registry or null if not found
   */
  async getRegistryByName(name: string): Promise<IContainerRegistryEntity | null> {
    return this.containerRegistryRepository.findOneByName(name);
  }

  /**
   * Add a registry if it doesn't already exist
   * @param registry Registry configuration
   */
  async addIfNotExists(registry: RegistryAuthConfig): Promise<void> {
    const containerRegistry = await this.containerRegistryRepository.findOneByProvider(
      registry.provider,
    );
    if (!containerRegistry) {
      const savedRegistry = await this.containerRegistryRepository.create({
        name: registry.name,
        fullName: registry.fullName,
        provider: registry.provider,
        authScheme: registry.authScheme,
        authSet: false,
        canAnonymous: registry.config.canAnonymous || false,
        canAuth: registry.authScheme !== undefined,
      });
      logger.info(`Saved registry ${savedRegistry.name}`);
    } else {
      logger.info(`Registry ${registry.name} already exists`);
    }
  }

  /**
   * Update registry authentication
   * @param registry Registry to update
   * @param auth Authentication details
   */
  async updateRegistryAuth(registry: IContainerRegistryEntity, auth: any): Promise<void> {
    if (!registry._id) {
      throw new Error('Registry ID is required');
    }

    await this.containerRegistryRepository.update(registry._id, {
      auth: auth,
      authSet: true,
    });

    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();
  }

  /**
   * Create a custom registry
   * @param name Registry name
   * @param auth Authentication details
   * @param authScheme Authentication scheme
   * @returns The created registry
   */
  async createCustomRegistry(
    name: string,
    auth: any,
    authScheme: any,
  ): Promise<IContainerRegistryEntity> {
    logger.info(`Creating registry: ${name}`);

    const newRegistry = await this.containerRegistryRepository.create({
      name: name,
      auth: auth,
      authSet: true,
      provider: 'custom',
      canAnonymous: false,
      canAuth: true,
      authScheme: authScheme,
    });

    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();

    return newRegistry;
  }

  /**
   * Remove registry authentication
   * @param registry Registry to update
   */
  async removeRegistryAuth(registry: IContainerRegistryEntity): Promise<void> {
    if (!registry._id) {
      throw new Error('Registry ID is required');
    }

    await this.containerRegistryRepository.update(registry._id, {
      auth: undefined,
      authSet: false,
    });

    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();
  }

  /**
   * List all registries with authentication set up
   * @returns List of registries
   */
  async listAllSetupRegistries(): Promise<IContainerRegistryEntity[]> {
    return this.containerRegistryRepository.findMany({ authSet: true });
  }

  /**
   * Delete registry
   * @param registry Registry to delete
   * @returns Success flag
   */
  async deleteRegistry(registry: IContainerRegistryEntity): Promise<boolean> {
    if (!registry._id) {
      throw new Error('Registry ID is required');
    }

    await this.containerRegistryRepository.delete(registry._id);
    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();

    return true;
  }
}
